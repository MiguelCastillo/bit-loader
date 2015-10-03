var logger     = require("loggero").disable();  // Disable logging by default.
var types      = require("dis-isa");
var Rule       = require("roolio");
var fetch      = require("./fetch");
var compile    = require("./compile");
var resolve    = require("./resolve");
var Importer   = require("./importer");
var Loader     = require("./loader");
var Module     = require("./module");
var Plugin     = require("./plugin");
var Registry   = require("./registry");

var defaults = {
  fetch: fetch,
  compile: compile,
  resolve: resolve
};

var getRegistryId = Registry.idGenerator("bitloader");


/**
 * @class
 *
 * Facade for relevant interfaces to register and import modules
 */
function Bitloader(options) {
  options = options || {};

  this.settings = options;
  this.context  = Registry.getById(getRegistryId());
  this.plugins  = {};

  this.pipelines = {
    resolve    : new Plugin.Manager(this),
    fetch      : new Plugin.Manager(this),
    transform  : new Plugin.Manager(this),
    dependency : new Plugin.Manager(this),
    compile    : new Plugin.Manager(this)
  };

  this.providers = {
    loader   : new Loader(this),
    importer : new Importer(this)
  };

  // Register plugins
  for (var plugin in options.plugins) {
    this.plugin(plugin, options.plugins[plugin]);
  }

  var providers = this.providers;

  this.resolve   = options.resolve || defaults.resolve;
  this.fetch     = options.fetch   || defaults.fetch;
  this.compile   = options.compile || defaults.compile;
  this.load      = providers.loader.load.bind(providers.loader);
  this.register  = providers.loader.register.bind(providers.loader);
  this.import    = providers.importer.import.bind(providers.importer);
  this.important = providers.importer.important.bind(providers.importer);
}


/**
 * Method that converts a module name to a path to the module file.
 *
 * @param {string} name - Name of the module to generate a path for
 * @param {{path: string, name: string}} referer - Object with the
 *  location and name of the requesting module.
 *
 * @returns {Promise} Promise that when resolved, will return an object with
 *  a required field `path` where we can load the module file from.
 */
Bitloader.prototype.resolve = function(){};


/**
 * Method to read files from storage. This is to be implemented by the code
 * making use of Bitloader.
 *
 * @param {string} name - Name of the module whose file content needs to be
 *  fetched.
 * @param {{path: string, name: string}} referer - Object with the
 *  location and name of the requesting module.
 *
 * @returns {Promise} Promise that when resolved, a module meta object
 *  with a "source" property is returned. The "source" property is where
 *  the content of the file is stored.
 */
Bitloader.prototype.fetch = function(){};


/**
 * Method for asynchronously loading modules.
 *
 * @returns {Pormise} That when resolved, it returns the full instance of the
 *  module loaded
 */
Bitloader.prototype.load = function(){};


/**
 * Method to asynchronously load modules
 *
 * @param {string|Array.<string>} names - Module or list of modules names to
 *  load. These names map back to the paths settings Bitloader was created
 *  with.
 *
 * @returns {Promise} That when resolved, all the imported modules are passed
 *  back as arguments.
 */
Bitloader.prototype.import = function(){};


/**
 * Method that converts source file to a module code that can be consumed by
 * the host application.
 *
 * @returns {Module} Module instance with code that can be consumed by the host
 *  application.
 */
Bitloader.prototype.compile = function(){};


/**
 * Method to define a module to be asynchronously loaded via the
 * [import]{@link Bitloader#import} method
 *
 * @param {string} name - Name of the module to register
 * @param {Array.<string>} deps - Collection of dependencies to be loaded and
 *  passed into the factory callback method.
 * @param {Function} factory - Function to be called in order to instantiate
 *  (realize) the module
 */
Bitloader.prototype.register = function(){};


/**
 * Clears the context, which means that all cached modules and other pertinent data
 * will be deleted.
 */
Bitloader.prototype.clear = function() {
  this.context.clear();
};


/**
 * Checks if the module instance is in the module registry
 */
Bitloader.prototype.hasModule = function(name) {
  return this.context.hasModule(name) || this.providers.loader.isLoaded(name);
};


/**
 * Returns the module instance if one exists.  If the module instance isn't in the
 * module registry, then a TypeError exception is thrown
 */
Bitloader.prototype.getModule = function(name) {
  if (!this.hasModule(name)) {
    throw new TypeError("Module `" + name + "` has not yet been loaded");
  }

  if (!this.context.hasModule(name)) {
    return this.context.setModule(Module.State.LOADED, name, this.providers.loader.syncBuild(name));
  }

  return this.context.getModule(name);
};


/**
 * Add a module instance to the module registry.  And if the module already exists in
 * the module registry, then a TypeError exception is thrown.
 *
 * @param {Module} mod - Module instance to add to the module registry
 *
 * @returns {Module} Module instance added to the registry
 */
Bitloader.prototype.setModule = function(mod) {
  var name = mod.name;

  if (!(mod instanceof(Module))) {
    throw new TypeError("Module `" + name + "` is not an instance of Module");
  }

  if (!name || !types.isString(name)) {
    throw new TypeError("Module must have a name");
  }

  if (this.context.hasModule(name)) {
    throw new TypeError("Module instance `" + name + "` already exists");
  }

  return this.context.setModule(Module.State.LOADED, name, mod);
};


/**
 * Interface to delete a module from the registry.
 *
 * @param {string} name - Name of the module to delete
 *
 * @returns {Module} Deleted module
 */
Bitloader.prototype.deleteModule = function(name) {
  if (!this.context.hasModule(name)) {
    throw new TypeError("Module instance `" + name + "` does not exists");
  }

  return this.context.deleteModule(name);
};


/**
 * Returns the module code from the module registry. If the module code has not
 * yet been fully compiled, then we defer to the loader to build the module and
 * return the code.
 *
 * @param {string} name - The name of the module code to get from the module registry
 *
 * @return {object} The module code.
 */
Bitloader.prototype.getModuleCode = function(name) {
  if (!this.hasModule(name)) {
    throw new TypeError("Module `" + name + "` has not yet been loaded");
  }

  return this.getModule(name).code;
};


/**
 * Sets module evaluated code directly in the module registry.
 *
 * @param {string} name - The name of the module, which is used by other modules
 *  that need it as a dependency.
 * @param {object} code - The evaluated code to be set
 *
 * @returns {object} The evaluated code.
 */
Bitloader.prototype.setModuleCode = function(name, code) {
  if (this.hasModule(name)) {
    throw new TypeError("Module code for `" + name + "` already exists");
  }

  var mod = new Module({
    name: name,
    code: code
  });

  return this.setModule(mod).code;
};


/**
 * Checks is the module has been fully finalized, which is when the module instance
 * get stored in the module registry
 */
Bitloader.prototype.isModuleCached = function(name) {
  return this.context.hasModule(name);
};


/**
 * Add ignore rules for configuring what the different pipelines shoud not process.
 *
 * @param {Object} rule - Rule configuration
 * @returns {Bitloader} Bitloader instance
 */
Bitloader.prototype.ignore = function(rule) {
  if (!rule) {
    throw new TypeError("Must provide a rule configuration");
  }

  var i, length, pipelines;

  if (types.isArray(rule) || types.isString(rule)) {
    rule = {
      match: rule
    };
  }

  if (!rule.pipelines) {
    pipelines = ["transform", "dependency"];
  }
  else {
    if (rule.pipelines === "*") {
      pipelines = Object.keys(this.pipelines);
    }
    else {
      pipelines = types.isArray(rule.pipelines) ? rule.pipelines : [rule.pipelines];
    }
  }

  for (i = 0, length = pipelines.length; i < length; i++) {
    this.pipelines[pipelines[i]].ignore("name", rule.match);
  }

  return this;
};


/**
 * Registers plugins into the pipeline.
 *
 * @param {object} settings - Object whose keys are the name of the particular
 *  pipeline they intend to register with. For example, if the plugin is to
 *  register a `transform` and a `dependency` pipeline handler, then the
 *  plugin object will have entries with those names. E.g.
 *
 *  ``` javascript
 *  var pluginDefinition = {
 *    "transform": function(meta) {
 *      console.log(meta);
 *    },
 *    "dependency": function(meta) {
 *      console.log(meta);
 *    }
 *  };
 *
 *  bitlaoder.plugin(plugin);
 *  ```
 */
Bitloader.prototype.plugin = function(settings) {
  var loader = this;

  Object.keys(settings).forEach(function(pipeline) {
    var pluginConfig = settings[pipeline];

    if (!types.isArray(pluginConfig)) {
      pluginConfig = [pluginConfig];
    }

    pluginConfig.forEach(function(plugin) {
      if (types.isFunction(plugin)) {
        loader.pipelines[pipeline].plugin(plugin);
      }
      else {
        loader.pipelines[pipeline].plugin(plugin.handler, plugin);
      }
    });
  });

  return this;
};


// Expose constructors and utilities
Bitloader.Registry   = Registry;
Bitloader.Loader     = Loader;
Bitloader.Importer   = Importer;
Bitloader.Module     = Module;
Bitloader.Plugin     = Plugin;
Bitloader.Rule       = Rule;
Bitloader.logger     = logger;
module.exports       = Bitloader;
