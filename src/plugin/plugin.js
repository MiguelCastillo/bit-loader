var utils = require("belty");
var types = require("dis-isa");
var Matches = require("../matches");
var inherit = require("../inherit");
var blueprint = require("../blueprint");
var loggerFactory = require("loggero");


var PluginBlueprint = blueprint({
  context: null,
  id: null,
  matchers: new Matches(),
  handlers: {}
});


function Plugin(options) {
  PluginBlueprint.call(this);

  if (!options.context) {
    throw new Error("Must provide a context");
  }

  return this.merge(utils.pick(options, ["id", "context"]));
}


inherit.base(Plugin).extends(PluginBlueprint);


Plugin.prototype.configure = function(options) {
  var plugin = this;
  var services = utils.pick(options, this.context.services);
  var handlers = {};

  Object.keys(services).forEach(function(serviceName) {
    handlers[serviceName] = (plugin.handlers[serviceName] || []).concat(configureHandler(services[serviceName]));
  });

  return this.merge({
    handlers: handlers,
    matchers: this.matchers.configure(options.matchers || options)
  });
};


/**
 * Runs all plugin handlers to process the data.
 */
Plugin.prototype.run = function(serviceName, data) {
  var plugin = this;
  var handlers = this.handlers[serviceName];
  var cancelled = false;

  if (!this.matchers.canExecute(data)) {
    return Promise.resolve(data);
  }

  if (!types.isString(serviceName)) {
    throw new Error("Service name must be a string");
  }

  if (!handlers) {
    throw new Error("Service '" + serviceName + "' has no registered handlers");
  }

  function cancel() {
    cancelled = true;
  };

  function canRun(data) {
    if (!cancelled) {
      return data;
    }
  }

  return handlers.reduce(function(current, handler) {
    return current
      .then(canRun)
      .then(runHandler(plugin, handler, cancel));
  }, Promise.resolve(data));
};


Plugin.prototype.getLogger = function(name) {
  return loggerFactory.create(name || this.id);
};


Plugin.prototype.serialize = function() {
  return utils.merge({id: this.id}, this.handlers);
};


function configureHandler(options) {
  return [].concat(options).map(function(handlerOptions) {
    var settings = types.isFunction(handlerOptions) ? { handler: handlerOptions } : handlerOptions;

    if (!types.isFunction(settings.handler)) {
      throw new TypeError("Plugin handler must be a function");
    }

    return settings;
  });
}


/**
 * Method that return a function that executes a plugin handler.
 */
function runHandler(plugin, handler, cancel) {
  return function runHandlerDelegate(data) {
    if (!data) {
      return Promise.resolve();
    }

    return Promise
      .resolve(handler.handler(data, plugin, cancel))
      .then(function(result) {
        return data.configure(result);
      });
  };
}


module.exports   = Plugin;
