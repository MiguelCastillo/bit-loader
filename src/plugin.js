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

  return Promise.resolve(this.handler(data, this.options, cancel));
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
      }

      return option;
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


/**
 * Runs all plugin handlers to process the data.
 */
Plugin.prototype.run = function(data) {
  var handlers = this.handlers;
  var loader = this.loader;
  var cancelled = false;

  function cancel() {
    cancelled = true;
  };

  function canRun(data) {
    if (!cancelled) {
      return data;
    }
  }

  return handlers
    .filter(canExecuteHandler(data))
    .map(loadHandler(loader))
    .reduce(function(current, handler) {
      return current
        .then(canRun)
        .then(runHandler(handler, cancel))
        .then(mergeResult);
    }, Promise.resolve(data));
};


function canExecuteHandler(data) {
  return function(handler) {
    return handler.canExecute(data);
  };
}


/**
 * Method to load a handler.
 */
function loadHandler(loader) {
  return function loadPluginDelegate(handler) {
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
        return {
          data: data,
          result: result
        };
      });
  };
}


/**
 * Method the returns a function to process the result from a plugin
 */
function mergeResult(resultContext) {
  if (resultContext) {
    return resultContext.data.configure(resultContext.result);
  }
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
  // Process match/ignore options.
  Matches.prototype.configure.call(this, settings);

  Object.keys(settings)
    .filter(isPlugabble)
    .map(getPlugin(this))
    .map(configurePlugin(settings))
    .filter(canRegisterPlugin(this))
    .map(registerPlugin(this));

  return this;
};


function isPlugabble(service) {
  return service !== "match" && service !== "ignore" && service !== "name";
}


function getPlugin(manager) {
  return function createPluginDelegate(pluginName) {
    if (!manager._plugins[pluginName]) {
      manager._plugins[pluginName] = new Plugin(pluginName, manager._loader);
    }

    return manager._plugins[pluginName];
  };
}


function configurePlugin(settings) {
  return function configurePluginDelegate(plugin) {
    return plugin.configure(settings[plugin.name]);
  };
}


function canRegisterPlugin(manager) {
  return function canRegisterDelegate(plugin) {
    return !manager._registrations[plugin.name];
  };
}


function registerPlugin(manager) {
  return function pluginRunnerDelegate(plugin) {
    function pluginRunner(data) {
      if (!manager.canExecute(data)) {
        return data;
      }

      return plugin.run(data);
    };

    if (!manager._services) {
      throw TypeError("Unable to register plugin. Services have not been configured");
    }

    if (!manager._services.hasOwnProperty(plugin.name)) {
      throw TypeError("Unable to register plugin. '" + plugin.name + "' service does not exist");
    }

    manager._registrations[plugin.name] = pluginRunner;
    manager._services[plugin.name].use(pluginRunner);
    return pluginRunner;
  };
}


Plugin.Manager = Manager;
Plugin.Handler = Handler;
module.exports = Plugin;
