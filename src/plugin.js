var logger = require("loggero").create("plugin");
var types  = require("dis-isa");
var utils  = require("belty");
var Rule   = require("roolio");


/**
 * Plugin class definition
 */
function Plugin(handler) {
  this.handler = handler;
  this._matches = null;
  this._ignore = null;
}


/**
 * Factory method to create Plugins
 *
 * @handler {string|function} - Plugin handler. Can be a module name to be lodaded,
 *  or a function.
 * @options {object} - Options.
 *
 * @returns {Plugin} New plugin instance
 */
Plugin.create = function(handler, options) {
  var plugin = new Plugin(handler);
  return options ? plugin.configure(options) : plugin;
};


/**
 * Configures plugin with the provided options.
 */
Plugin.prototype.configure = function(options) {
  var prop;

  for (prop in options.match) {
    if (options.match.hasOwnProperty(prop)) {
      this.match(prop, options.match[prop]);
    }
  }

  for (prop in options.ignore) {
    if (options.ignore.hasOwnProperty(prop)) {
      this.ignore(prop, options.ignore[prop]);
    }
  }

  this.options = options;
  return this;
};


/**
 * Method for adding matching rules used for determining if data
 * should be processed by the plugin or not.
 *
 * @prop {string} - Name of the property to test for matches.
 * @matches {array<string>|srting} - Matching rule pattern
 *
 * @returns {Plugin}
 */
Plugin.prototype.match = function(prop, matches) {
  if (!this._matches) {
    this._matches = {};
  }

  if (!this._matches[prop]) {
    this._matches[prop] = new Rule();
  }

  this._matches[prop].addMatcher(matches);
  return this;
};


/**
 * Add ignore rules to prevent certain data from being processed
 * by a plugin.
 */
Plugin.prototype.ignore = function(prop, matches) {
  if (!this._ignore) {
    this._ignore = {};
  }

  if (!this._ignore[prop]) {
    this._ignore[prop] = new Rule();
  }

  this._ignore[prop].addMatcher(matches);
  return this;
};


/**
 * Checks if the plugin can operate on the data passed in.
 */
Plugin.prototype.canExecute = function(data) {
  if (this._ignore && runMatches(this._ignore, data)) {
    return false;
  }

  return runMatches(this._matches, data);
};


/**
 * Plugin Manager is a plugin container that facilitates the execution of
 * plugins.
 */
function Manager(loader) {
  this.loader = loader;
  this._plugins = [];
  this._ignore = null;
}


/**
 * Configure plugin. This is a way to setup matching rules and handlers
 * in a single convenient call.
 *
 * @returns {Plugin}
 */
Manager.prototype.plugin = function(handler, options) {
  options = options || {};
  var plugin = Plugin.create(handler, options);

  if (types.isString(handler)) {
    plugin.ignore("name", handler);
  }

  this._plugins.push(plugin);
  return this;
};


/**
 * Executes all plugins to process the data. This handles plugin
 * handlers that return promises and it also provides a system to cancel
 * the promise sequence.
 */
Manager.prototype.run = function(data) {
  if (this._ignore && runMatches(this._ignore, data)) {
    return Promise.resolve(data);
  }

  return runPlugin(data, this._plugins, this.loader);
};


/**
 * Add ignore rules at the manager level to prevent all plugins
 * from executing.
 */
Manager.prototype.ignore = function(prop, matches) {
  if (!this._ignore) {
    this._ignore = {};
  }

  if (!this._ignore[prop]) {
    this._ignore[prop] = new Rule();
  }

  this._ignore[prop].addMatcher(matches);
  return this;
};


/**
 * Executed a list of plugins feeding data into them for processing.
 */
function runPlugin(data, plugins, loader) {
  var cancelled = false;

  function cancel() {
    cancelled = true;
  };

  return plugins
    .filter(function(plugin) {
      return plugin.canExecute(data);
    })
    .reduce(function(promise, plugin) {
      if (cancelled) {
        return promise;
      }

      return promise
        .then(loadPlugin(loader, plugin), logger.error)
        .then(runPluginHandler(data, cancel), logger.error)
        .then(mergePluginResult(data), logger.error);
    }, Promise.resolve(data));
}


/**
 * Method to load a plugin.
 */
function loadPlugin(loader, plugin) {
  return function loadPluginDelegate() {
    if (types.isString(plugin.handler)) {
      return loader
        .import(plugin.handler, logger.error)
        .then(function(pluginData) {
          if (types.isFunction(pluginData)) {
            plugin.handler = pluginData;
          }
          else {
            plugin.handler = pluginData.handler;
            plugin.configure(pluginData);
          }

          return plugin;
        }, logger.error);
    }

    return Promise.resolve(plugin);
  };
}


/**
 * Method that return a function to be executed with the plugin
 * to be executed.
 */
function runPluginHandler(data, cancel) {
  return function runPluginDelegate(plugin) {
    return plugin.handler(data, plugin.options, cancel);
  };
}


/**
 * Method the returns a function to process the result from a
 * plugin
 */
function mergePluginResult(data) {
  return function mergeModuleResultDelegate(result) {
    return result ? utils.extend(data, result) : data;
  };
}


/**
 * Checks if the handler can process the input data based on whether
 * or not there are matches to be processed and if any of the matches
 * do match.
 */
function runMatches(matches, data) {
  return !matches || Object.keys(matches).some(function(match) {
    return matches[match].match(data[match]);
  });
}


Plugin.Manager = Manager;
module.exports = Plugin;
