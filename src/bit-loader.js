var logger = require("loggero").disable();  // Disable logging by default.
var types  = require("dis-isa");
var Rule   = require("roolio");
var utils  = require("belty");

var Link       = require("./services/link");
var Resolve    = require("./services/resolve");
var Fetch      = require("./services/fetch");
var Transform  = require("./services/transform");
var Dependency = require("./services/dependency");
var Compile    = require("./services/compile");

var Resolver   = require("./controllers/resolver");
var Fetcher    = require("./controllers/fetcher");
var Importer   = require("./controllers/importer");
var Loader     = require("./controllers/loader");
var Registry   = require("./controllers/registry");
var Builder    = require("./controllers/builder");
var Module     = require("./module");
var Plugin     = require("./plugin");

var pluginManagerCount = 0;


/**
 * Facade for System module loader and some extras. This provisions you with functionality
 * for loading modules and process them via plugins. Some relevant information is
 * found [here](https://whatwg.github.io/loader/), but semantics are not quite the same.
 * whatwg/loader was more of a model to stay somewhat on track with the spec's affordances.
 *
 * @class
 */
function Bitloader(options) {
  options = utils.merge({}, options);

  this.settings = options;
  this.plugins  = {};

  // Services! Components that process modules.
  var services = {
    resolve    : new Resolve(this),
    fetch      : new Fetch(this),
    transform  : new Transform(this),
    dependency : new Dependency(this),
    compile    : new Compile(this),
    link       : new Link(this)
  };

  this.services = services;

  // Register any default user provided providers that the services use.
  // These guys run after plugins run.
  for (var provider in options) {
    if (this.services.hasOwnProperty(provider)) {
      this.services[provider].provider(options[provider]);
    }
  }


  // Controllers!  These guys make use of the services to build pipelines
  // that build modules. Controllers use services, but services only use
  // services, not controllers.
  var controllers = {
    resolver : new Resolver(this),
    fetcher  : new Fetcher(this),
    loader   : new Loader(this),
    importer : new Importer(this),
    registry : new Registry(this),
    builder  : new Builder(this)
  };

  this.controllers = controllers;

  // Three methods as defined by:
  // https://whatwg.github.io/loader/#sec-properties-of-the-loader-prototype-object
  this.import  = controllers.importer.import.bind(controllers.importer);
  this.resolve = controllers.resolver.resolve.bind(controllers.resolver);
  this.load    = controllers.loader.load.bind(controllers.loader);

  this.fetch     = controllers.fetcher.fetch.bind(controllers.fetcher);
  this.important = controllers.importer.important.bind(controllers.importer);

  // Register plugins
  for (var plugin in options.plugins) {
    this.plugin(options.plugins[plugin]);
  }
}


/**
 * Method for asynchronously loading modules. This method returns the module(s)
 * exports.
 *
 * @param {string|Array.<string>} names - Names of modules to import.
 *
 * @returns {Promise} That when resolved, all the imported modules' exports
 *  are returned.
 */
Bitloader.prototype.import = function(/*names*/) {};


/**
 * Method that converts a module name to a module file path which can be used
 * for loading a module from disk.
 *
 * @param {string} name - Name of the module to resolve.
 * @param {{path: string, name: string}} referrer - Module requesting
 *  the module. Essential for processing relative paths.
 *
 * @returns {Promise} When resolved it returns a module meta object with
 *  the file path for the module.
 */
Bitloader.prototype.resolve = function(/*name, referrer*/) {};


/**
 * Method for asynchronously loading modules. This method returns the module
 * instance(s).
 *
 * @param {string|Array.<string>} names - Names of modules to load.
 * @param {{path: string, name: string}} referrer - Module requesting
 *  the module. Essential for processing relative paths.
 *
 * @returns {Pormise} When resolved it returns the full instance of the
 *  module(s) loaded.
 */
Bitloader.prototype.load = function(/*names, referrer*/) {};


/*
 * Method to define a module to be asynchronously loaded via the
 * [import]{@link Bitloader#import} method
 *
 * @param {string} name - Name of the module to register.
 * @param {Array.<string>} deps - Collection of dependencies to be loaded and
 *  passed into the factory callback method.
 * @param {Function} factory - Function to be called in order to instantiate
 *  (realize) the module.
 */
//Bitloader.prototype.define = function(/*name, deps, factory, referrer*/) {};


/**
 * Method to register module exports
 *
 * @param {string} name - Name of the module to register exports for.
 * @param {any} exports - Module exports.
 *
 * @returns {Bitloader}
 */
Bitloader.prototype.register = function(name, exports) {
  this.controllers.registry.register(name, exports);
  return this;
};


/**
 * Method to get the source of modules.
 *
 * @param {string|Array.<string>} names - Names of modules to load.
 * @param {{path: string, name: string}} referrer - Module requesting
 *  the source. Essential for processing relative paths.
 *
 * @returns {Promise} When resolved it returns the source(s)
 */
Bitloader.prototype.getSource = function(names, referrer) {
  var loader = this;
  return this.controllers.fetcher
    .fetch(names, referrer)
    .then(function(moduleMetas) {
      if (types.isString(names)) {
        return loader.getModule(moduleMetas.id).source;
      }

      return moduleMetas.map(function(moduleMeta) {
        return loader.getModule(moduleMeta.id).source;
      });
    });
};


/**
 * Helper method to push source string through the transformation pipeline
 *
 * @param {string} source - Source code to transform.
 *
 * @returns {Promise} When resolved it returns the transformed source code.
 */
Bitloader.prototype.transform = function(source) {
  return this.services.transform.run(new Module.Meta({
    name: "@transform",
    source: source
  }))
  .then(function(moduleMeta) {
    return moduleMeta.source;
  });
};


/**
 * Clears the registry, which means that all cached modules and other pertinent
 * data will be deleted.
 *
 * @returns {Bitloader}
 */
Bitloader.prototype.clear = function() {
  this.controllers.registry.clear();
  return this;
};


/**
 * Checks if the module instance is in the module registry
 *
 * @param {string} id - Id of the module to check if it's cached
 *
 * @returns {boolean}
 */
Bitloader.prototype.hasModule = function(id) {
  return this.controllers.registry.hasModule(id);
};


/**
 * Returns the module instance if one exists.  If the module instance isn't in the
 * module registry, then a TypeError exception is thrown
 *
 * @param {string} id - Id of the module to get from cache
 *
 * @return {Module} Module instance from cache
 */
Bitloader.prototype.getModule = function(id) {
  return this.controllers.registry.getModule(id);
};


/**
 * Method to delete a module from the registry.
 *
 * @param {string} id - Id of the module to delete
 *
 * @returns {Module} Deleted module
 */
Bitloader.prototype.deleteModule = function(mod) {
  if (!(mod instanceof(Module))) {
    throw new TypeError("Input is not an instance of Module");
  }

  if (!this.controllers.registry.hasModule(mod.id)) {
    throw new TypeError("Module instance `" + mod.name + "` does not exists");
  }

  return this.controllers.registry.deleteModule(mod.id);
};


/**
 * Add ignore rules for configuring what the different pipelines shoud not process.
 *
 * @param {Object} rule - Rule configuration
 *
 * @returns {Bitloader}
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
    this.services[pipelines[i]].ignore("name", rule.match);
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
 * @returns {Bitloader}
 *
 *  @example
 *  bitloader.plugin("js", {
 *    "transform": function(meta) {
 *      console.log(meta);
 *    },
 *    "dependency": function(meta) {
 *      console.log(meta);
 *    }
 *  });
 */
Bitloader.prototype.plugin = function(name, settings) {
  if (!types.isString(name)) {
    settings = name;
    name = pluginManagerCount++;
  }

  if (!this.plugins[name]) {
    this.plugins[name] = new Plugin.Manager(this, this.services);
  }

  this.plugins[name].configure(settings);
  return this;
};


// Expose constructors and utilities
Bitloader.Module = Module;
Bitloader.Rule   = Rule;
Bitloader.logger = logger;
module.exports   = Bitloader;
