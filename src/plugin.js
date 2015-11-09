//var logger  = require("loggero").create("plugin");
var types   = require("dis-isa");
var utils   = require("belty");
var Matches = require("./matches");


/**
 * Plugin class definition
 */
function Handler(handler) {
  Matches.call(this);

  this.handler = handler;

  if (types.isString(handler)) {
    this.ignore("name", handler);
  }
}


Handler.prototype = Object.create(Matches.prototype);
Handler.prototype.constructor = Handler;


/**
 * Factory method to create Plugins
 *
 * @handler {string|function} - Plugin handler. Can be a module name to be lodaded,
 *  or a function.
 * @options {object} - Options.
 *
 * @returns {Handler} New Handler instance
 */
Handler.create = function(handler, options) {
  handler = new Handler(handler);
  return options ? handler.configure(options) : handler;
};


/**
 * Configures handler with the provided options.
 */
Handler.prototype.configure = function(options) {
  Matches.prototype.configure.call(this, options);

  if (options.hasOwnProperty("handler")) {
    this.handler = options.handler;
  }

  if (options.hasOwnProperty("name")) {
    this.name = options.name;
  }

  this.options = utils.merge({}, this.options, options);
  return this;
};


Handler.prototype.run = function(data, cancel) {
  if (!this.canExecute(data)) {
    return Promise.resolve(data);
  }

  return this.handler(data, this.options, cancel);
};


function Plugin(name, loader) {
  this.loader = loader;
  this.name = name;
  this.handlers = [];
}


Plugin.prototype.configure = function(options) {
  if (!types.isArray(options)) {
    options = [options];
  }

  options
    .map(function(option) {
      if (types.isFunction(option) || types.isString(option)) {
        option = {
          handler: option
        };
        return option;
      }
    })
    .map(function(option) {
      return Handler.create(option.handler, option);
    })
    .reduce(function(plugin, handler) {
      plugin.handlers.push(handler);
      return plugin;
    }, this);

  return this;
};


Plugin.prototype.run = function(data) {
//  if (!this.canExecute(data)) {
//    return Promise.resolve(data);
//  }

  return runHandlers(data, this.handlers, this.loader);
};


/**
 * Executes all plugins to process the data. This handles plugin
 * handlers that return promises and it also provides a system to cancel
 * the promise sequence.
 */
function runHandlers(data, handlers, loader) {
  var cancelled = false;
  function cancel() {
    cancelled = true;
  };

  return handlers
    .filter(function(handler) {
      return handler.canExecute(data);
    })
    .reduce(function(promise, handler) {
      if (cancelled) {
        return promise;
      }

      return promise
        .then(loadHandler(loader, handler))
        .then(runHandler(data, cancel))
        .then(mergeHandlerResult(data));
    }, Promise.resolve());
}


/**
 * Method to load a handler.
 */
function loadHandler(loader, handler) {
  return function loadPluginDelegate() {
    if (!types.isString(handler.handler)) {
      return Promise.resolve(handler);
    }

    return loader
      .import(handler.handler)
      .then(function(settings) {
        if (types.isFunction(settings)) {
          settings = {
            handler: settings
          };
        }

        return handler.configure(settings);
      });
  };
}


/**
 * Method that return a function that executes a plugin handler.
 */
function runHandler(data, cancel) {
  return function runHandlerDelegate(handler) {
    return handler.run(data, cancel);
  };
}


/**
 * Method the returns a function to process the result from a plugin
 */
function mergeHandlerResult(data) {
  return function mergeModuleResultDelegate(result) {
    return data.configure(result);
  };
}


/**
 * Plugin Manager is a plugin container that facilitates the execution of
 * plugins.
 */
function Manager(loader, services) {
  this._loader = loader;
  this._services = services;
  this._plugins = {};
  this._registrations = {};
}


Manager.prototype = Object.create(Matches.prototype);
Manager.prototype.constructor = Manager;


/**
 * Configure plugin. This is a way to setup matching rules and handlers
 * in a single convenient call.
 *
 * @returns {Plugin}
 */
Manager.prototype.configure = function(settings) {
  var manager = this;
  var loader = this._loader;
  var services = this._services;
  var plugins = this._plugins;
  var registrations = this._registrations;

  // Process match/ignore options.
  Matches.prototype.configure.call(this, settings);

  Object.keys(settings)
    .filter(function(service) {
      return service !== "match" || service !== "ignore";
    })
    .map(function(service) {
      return plugins[service] || (plugins[service] = new Plugin(service, loader));
    })
    .map(function(plugin) {
      return plugin.configure(settings[plugin.name]);
    })
    .filter(function(plugin) {
      return !registrations[plugin.name];
    })
    .map(function(plugin) {
      function pluginRunner(data) {
        if (!manager.canExecute(data)) {
          return data;
        }

        return plugin.run(data);
      };

      registrations[plugin.name] = pluginRunner;
      services[plugin.name].use(pluginRunner);
      return pluginRunner;
    });

  return this;
};


Plugin.Manager = Manager;
Plugin.Handler = Handler;
module.exports = Plugin;
