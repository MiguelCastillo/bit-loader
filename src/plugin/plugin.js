var utils = require("belty");
var types = require("dis-isa");
var Builder = require("./builder");
var Matches = require("../matches");
var inherit = require("../inherit");
var blueprint = require("../blueprint");


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
  var configuration = configurePlugin(options);
  var services = utils.pick(configuration, this.context.getServiceNames());

  var handlers = Object
    .keys(services)
    .map(function(serviceName) {
      return {
        serviceName: serviceName,
        handlers: plugin.handlers[serviceName]
      };
    })
    .reduce(function(result, handlersConfig) {
      var serviceName = handlersConfig.serviceName
      var handlers = handlersConfig.handlers;

      if (!handlers) {
        handlers = [];
        plugin.context.registerPluginWithService(serviceName, plugin.id);
      }

      var handlerIds = utils
        .toArray(services[serviceName])
        .map(function(config) {
          var handler = plugin.context.configureHandler(config.id, configureHandler(config));
          return handler.id;
        });

      result[serviceName] = handlers.concat(handlerIds);
      return result;
    }, {});

  return this
    .merge({ handlers: handlers })
    .merge({ matchers: this.matchers.configure(configuration.matchers || configuration) });
};


/**
 * Runs all plugin handlers to process the data.
 */
Plugin.prototype.run = function(serviceName, data) {
  var plugin = this;
  var handlers = this.handlers[serviceName];
  var cancelled = false;

  if (!types.isString(serviceName)) {
    throw new Error("Service name must be a string");
  }

  if (!handlers) {
    throw new Error("Service '" + serviceName + "' has no registered handlers unknown");
  }

  function cancel() {
    cancelled = true;
  };

  function canRun(data) {
    if (!cancelled) {
      return data;
    }
  }

  return plugin.context.loadHandlers().then(function() {
    return handlers
      .map(function(id) {
        return plugin.context.getHandler(id);
      })
      .filter(function(handler) {
        return handler.canExecute(data);
      })
      .reduce(function(current, handler) {
        return current
          .then(canRun)
          .then(runHandler(handler, cancel));
      }, Promise.resolve(data));
  });
};


Plugin.prototype.serialize = function() {
  var plugin = this;

  var handlers = Object
    .keys(plugin.handlers)
    .map(function(serviceName) {
      return {
        serviceName: serviceName,
        handlers: plugin.handlers[serviceName]
      };
    })
    .reduce(function(result, handlersConfig) {
      result[handlersConfig.serviceName] = handlersConfig.handlers.map(function(handlerId) {
        return plugin.context.getHandler(handlerId).serialize();
      });

      return result;
    }, {});

  return utils.merge(utils.pick(this, ["id"]), handlers);
};


function configurePlugin(options) {
  if (types.isFunction(options)) {
    options = options(new Builder());

    if (options instanceof Builder) {
      options = options.build();
    }
  }

  return options;
}


function configureHandler(options) {
  if (types.isFunction(options) || types.isString(options)) {
    options = {
      handler: options
    };
  }

  return options;
}



/**
 * Method that return a function that executes a plugin handler.
 */
function runHandler(handler, cancel) {
  return function runHandlerDelegate(data) {
    if (!data) {
      return Promise.resolve();
    }

    return Promise
      .resolve(handler)
      .then(function(handler) {
        return handler.run(data, cancel);
      })
      .then(function(result) {
        return data.configure(result);
      });
  };
}


module.exports   = Plugin;
