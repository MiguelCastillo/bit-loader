//var logger  = require("loggero").create("plugin");
var types   = require("dis-isa");
var Handler = require("./handler");


function Plugin(context) {
  this.context  = context;
  this.handlers = [];
}


Plugin.prototype.configure = function(options) {
  if (!types.isArray(options)) {
    options = [options];
  }

  options
    .filter(Boolean)
    .map(mapHandlerSettings(this))
    .map(createHandler(this))
    .reduce(function(plugin, handler) {
      plugin.handlers.push(handler.id);
      return plugin;
    }, this);

  return this;
};


/**
 * Runs all plugin handlers to process the data.
 */
Plugin.prototype.run = function(data) {
  var plugin    = this;
  var handlers  = this.handlers;
  var cancelled = false;

  function cancel() {
    cancelled = true;
  };

  function canRun(data) {
    if (!cancelled) {
      return data;
    }
  }

  return this.context.loadHandlers()
    .then(function() {
      return handlers
        .map(getHandler(plugin))
        .filter(canExecuteHandler(data))
        .reduce(function(current, handler) {
          return current
            .then(canRun)
            .then(runHandler(handler, cancel));
        }, Promise.resolve(data));
    });
};


function getHandler(plugin) {
  return function(id) {
    return plugin.context.getHandler(id);
  };
}


function mapHandlerSettings() {
  return function(option) {
    if (types.isFunction(option) || types.isString(option)) {
      option = {
        handler: option
      };
    }

    return option;
  };
}


function createHandler(plugin) {
  return function(option) {
    var handler = Handler.create(option.handler, option);
    if (!plugin.context.hasHandler(handler.id)) {
      plugin.context.registerHandler(handler.id, handler);
    }

    return plugin.context.getHandler(handler.id);
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


module.exports   = Plugin;
