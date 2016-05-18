//var logger = require("loggero").create("plugin");
var utils = require("belty");
var types = require("dis-isa");
var inherit = require("../inherit");
var blueprint = require("../blueprint");


var PluginBlueprint = blueprint({
  context: null,
  handlers: {},
  id: null
});


function Plugin(options) {
  PluginBlueprint.call(this);
  return this.merge(utils.pick(options, ["id", "context"]));
}


inherit.base(Plugin).extends(PluginBlueprint);


Plugin.prototype.configure = function(options) {
  if (!types.isArray(options)) {
    options = [options];
  }

  var handlers = options
    .filter(Boolean)
    .map(configureHandler(this))
    .reduce(function(handlers, handler) {
      handlers[handler.id] = true;
      return handlers;
    }, {});

  return this.merge({
    handlers: handlers
  });
};


/**
 * Runs all plugin handlers to process the data.
 */
Plugin.prototype.run = function(data) {
  var plugin = this;
  var handlers = this.handlers;
  var cancelled = false;

  function cancel() {
    cancelled = true;
  };

  function canRun(data) {
    if (!cancelled) {
      return data;
    }
  }

  return loadDynamicHandlers(plugin).then(function() {
    return Object.keys(handlers)
      .map(getHandler(plugin))
      .filter(canExecuteHandler(data))
      .reduce(function(current, handler) {
        return current
          .then(canRun)
          .then(runHandler(handler, cancel));
      }, Promise.resolve(data));
  });
};


Plugin.prototype.serialize = function() {
  var plugin = this;

  return utils.merge({
    handlers: Object.keys(this.handlers).map(function(handlerId) {
      return plugin.context.getHandler(handlerId).serialize();
    })
  }, utils.pick(this, ["id"]));
};


var _handlerId = 1;
Plugin.prototype.getHandlerId = function() {
  return this.id + "-handler-" + _handlerId++;
};


function getHandler(plugin) {
  return function(id) {
    return plugin.context.getHandler(id);
  };
}


function configureHandler(plugin) {
  return function createHandlerDelegate(options) {
    if (types.isFunction(options) || types.isString(options)) {
      options = {
        handler: options
      };
    }

    var handlerId = options.id || plugin.getHandlerId();

    if (!plugin.context.hasHandler(handlerId)) {
      plugin.context.configureHandler(handlerId, options);
    }

    return plugin.context.getHandler(handlerId);
  };
}


function canExecuteHandler(data) {
  return function(handler) {
    return handler.canExecute(data);
  };
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


/**
 * Load dynamic handlers if there are any that need to be loaded for
 * the current plugin
 */
function loadDynamicHandlers(plugin) {
  var dynamicHandlers = Object.keys(plugin.handlers).filter(function(id) {
    return plugin.context.getHandler(id).isDynamic();
  });

  return dynamicHandlers.length ?
    plugin.context.loadHandlers() :
    Promise.resolve();
}


module.exports   = Plugin;
