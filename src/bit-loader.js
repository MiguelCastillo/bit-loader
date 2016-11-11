var logger = require("loggero").disable();  // Disable logging by default.
var types  = require("dis-isa");
var Rule   = require("roolio");
var utils  = require("belty");

var Service      = require("./service");
var Link         = require("./services/link");
var Resolve      = require("./services/resolve");
var Fetch        = require("./services/fetch");
var Transform    = require("./services/transform");
var Dependency   = require("./services/dependency");
var PreCompile   = require("./services/precompile");
var Compile      = require("./services/compile");

var Fetcher    = require("./controllers/fetcher");
var Importer   = require("./controllers/importer");
var Loader     = require("./controllers/loader");
var Registry   = require("./controllers/registry");
var Builder    = require("./controllers/builder");
var Module     = require("./module");
var Plugins    = require("./plugin/registrar");


/**
 * Facade for System module loader and some extras. This provisions you with functionality
 * for loading and processing modules via plugins. Some relevant information is found
 * [here](https://whatwg.github.io/loader/), but semantics are not quite the same.
 * whatwg/loader was more of a model to stay somewhat on track with the spec's affordances.
 *
 * References:
 * https://whatwg.github.io/loader/#sec-properties-of-the-loader-prototype-object
 *
 * @class
 */
function Bitloader(options) {
  options = utils.merge({}, options);
  this.settings = options;
  this.excludes = [];
  this.ignores = [];
  this.providers = {};
  this.cache = {};

  // Services! Components that process modules.
  this.services = utils.merge({},
    Service.create(this, { resolve: Resolve, fetch: Fetch, transform: Transform, dependency: Dependency }, true),
    Service.create(this, { precompile: PreCompile, compile: Compile, link: Link })
  );

  // Controllers!  These guys make use of the services to build pipelines
  // that build modules. Controllers use services, but services only use
  // services, not controllers.
  this.controllers = {
    fetcher  : new Fetcher(this),
    loader   : new Loader(this),
    importer : new Importer(this),
    registry : new Registry(this),
    builder  : new Builder(this)
  };

  this.plugins = new Plugins(this, this.services);
  this.merge(options);
}


/**
 * Creates a new instance of bit-loader using the current settings plus all other extra
 * options passed in.
 *
 * @param { object } options - Optional settings for configuring the new instance
 *  of bit-loader.
 *
 * @param { Plugin[] } plugins - Array of plugin configurations
 *
 * @param { string[] } excludes - Module names to exclude from loading and processing.
 *  When a module being loaded is in this list, it will be simply be cached with an
 *  empty export.
 *
 * @param { object[] } ignores - Array of objects whose key/value pairs are matched against
 *  properties in modules. Those modules that match will skip the processing pipelines.
 *  Common values include `name` and `path`. String and regexp values are both valid.
 *
 * @param { string[] } ignores - Array of module names to exclude from the transform and
 *  the dependency pipelines.
 *
 * @param { string[] } ignores[].services - Array of service names that modules matching
 *  modules will skip. If a value is not specified, then the transform and the dependency
 *  pipelines are skipped. You can specify an array of strings for the name(s) of the services
 *  to be skipped. Possible values are `resolve`, `fetch`, `pretransform`, `transform`,
 *  `dependency`, `precompile`, `compile`, and `link`.  Alternatively, it can be a wild card
 *  to skip *all* the pipelines just listed.
 *
 * @returns {Bitloader} New bit loader instance
 */
Bitloader.prototype.configure = Bitloader.prototype.config = function(options) {
  //
  // TODO: Clone services.
  //

  var bitloader = new Bitloader()
    .merge(utils.pick(this, ["ignores", "excludes"]))
    .merge(this.providers)
    .merge({ plugins: this.plugins.serialize() })
    .merge(options);

  return bitloader;
};


/**
 * Merge in configuration settings into the bit-loader instance. You can merge
 * in plugins, excludes, and ignores. Please see @see {@link configure}
 *
 * @returns { Bitloader } bit-loader instance
 */
Bitloader.prototype.merge = function(options) {
  if (!options) {
    return this;
  }

  // Register any default providers that the services use.
  // These guys run after plugins run.
  var providers = utils.pick(options, Object.keys(this.services));
  for (var provider in providers) {
    this.services[provider].provider(providers[provider]);
    this.providers[provider] = providers[provider];
  }

  // Register plugins
  if (options.plugins) {
    utils
      .toArray(options.plugins)
      .forEach(function(plugin) {
        this.plugin(plugin);
      }.bind(this));
  }

  if (options.excludes) {
    this.exclude(options.excludes);
  }

  if (options.ignores || options.ignore) {
    this.ignore(options.ignores || options.ignore);
  }

  if (options.cache) {
    this.cache = utils.merge({}, options.cache);
  }

  return this;
};


/**
 * Load modules from storage and processes them with the fetch stage pipelines. The
 * result is not compiled into a module until they are imported.
 *
 * @param {string|string[]} names - Names of modules to fetch.
 *
 * @param {{path: string, name: string}} referrer - Module requesting the module. Usually
 *  needed for processing relative paths.
 *
 * @returns {Promise} That when resolved it returns the loaded module meta objects
 */
Bitloader.prototype.fetch = function(names, referrer) {
  return this.controllers.fetcher.fetch(names, referrer);
};


/**
 * Loads modules from storage. Unlike @see {@link fetch}, modules are only loaded from storage
 * and not processed by any of the fetch pipelines except for resolve, which is needed to
 * calculate the location of the module file.
 *
 * @param {string|string[]} names - Names of modules to fetch.
 *
 * @param {{path: string, name: string}} referrer - Module requesting the module. Usually
 *  needed for processing relative paths.
 *
 * @returns {Promise} That when resolved it returns the loaded module meta objects
 */
Bitloader.prototype.fetchOnly = function(names, referrer) {
  return this.controllers.fetcher.fetchOnly(names, referrer);
};


/**
 * Method for importing modules.
 *
 * @param {string|string[]} names - Names of the modules to import.
 *
 * @param {{path: string, name: string}} referrer - Module requesting the module. Usually
 *  needed for processing relative paths.
 *
 * @returns {Promise} That when resolved it returns the modules' exports.
 */
Bitloader.prototype.import = function(names, referrer) {
  return this.controllers.importer.import(names, referrer);
};


/**
 * Convert module names to a module file paths.
 *
 * @param {string} name - Name of the module to resolve.
 *
 * @param {{path: string, name: string}} referrer - Module requesting the module. Usually
 *  needed for processing relative paths.
 *
 * @returns {Promise} When resolved it returns a module meta object with the file path for
 *  the module.
 */
Bitloader.prototype.resolve = function(name, referrer) {
  return this.services.resolver
    .resolve(new Module(name), referrer)
    .then(function(moduleMeta) {
      return moduleMeta.path;
    });
};


/**
 * Method for importing modules. Unlike @see {@link import}, this method returns the module
 * instance instead of the module's exports.
 *
 * @param {string|string[]} names - Names of the modules to import.
 *
 * @param {{path: string, name: string}} referrer - Module requesting the module. Usually
 *  needed for processing relative paths.
 *
 * @returns {Pormise} When resolved it returns the full module instances.
 */
Bitloader.prototype.load = function(names, referrer) {
  return this.controllers.loader.load(names, referrer);
};


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
 * Register module exports
 *
 * @param {string} name - Name of the module to register exports for.
 *
 * @param {any} exports - Module exports.
 *
 * @returns {Bitloader}
 */
Bitloader.prototype.register = function(name, exports) {
  this.controllers.registry.register(name, exports);
  return this;
};


/**
 * Determines if a module name is registered as an exclusion.
 *
 * @param {string} name - Name of the module to test for exclusion.
 *
 * @returns {boolean}
 */
Bitloader.prototype.isExcluded = function(name) {
  return this.excludes.indexOf(name) !== -1;
};


/**
 * Get the source of modules. If a module isn't loaded, then it is loaded and processed
 * by the fetch stage pipelines. If the module is already loaded then its source gets
 * returned.
 *
 * @param {string|string[]} names - Names of modules to load.
 *
 * @param {{path: string, name: string}} referrer - Module requesting the module. Usually
 *  needed for processing relative paths.
 *
 * @returns {Promise} When resolved it returns the source of the modules
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
 * Helper method to push source string through the default transformation pipeline.
 * If there is no default transform, then the input source is not processed.
 *
 * @param {string} source - Source code to transform.
 *
 * @returns {Promise} When resolved it returns the transformed source code.
 */
Bitloader.prototype.transform = function(source) {
  return this.services.transform.runAsync(new Module({
    name: "@transform",
    source: source
  }))
  .then(function(moduleMeta) {
    return moduleMeta.source;
  });
};


/**
 * Deletes all modules.
 *
 * @returns {Bitloader}
 */
Bitloader.prototype.clear = function() {
  this.controllers.registry.clear();
  return this;
};


/**
 * Checks if a module with the provided ID is cached
 *
 * @param {string} id - Id of the module to check
 *
 * @returns {boolean}
 */
Bitloader.prototype.hasModule = function(id) {
  return this.controllers.registry.hasModule(id);
};


/**
 * Retrived a cached module by its ID. If the module isn't cached, a TypeError exception
 * is thrown.
 *
 * @param {string} id - Module id
 *
 * @return {Module}
 */
Bitloader.prototype.getModule = function(id) {
  return this.controllers.registry.getModule(id);
};


/**
 * Finds all modules that match the criteria provided.
 *
 * @param {object | string} criteria - Pattern (shape) or ID for module matching
 *
 * @return {Module[]} Array of modules that match the criteria
 */
Bitloader.prototype.findModules = function(criteria) {
  return this.controllers.registry.findModules(criteria);
};


/**
 * Finds and returns the first module to match the criteria provided.
 *
 * @param {object | string} criteria - Pattern (shape) or ID for module matching
 *
 * @return {Module} First module that matches the criteria
 */
Bitloader.prototype.findModule = function(criteria) {
  return this.controllers.registry.findModule(criteria);
};


/**
 * Deletes specific cached modules. Use the getModule, findModule, or findModules methods
 * to get a hold of the modules to be deleted.
 *
 * @param { Module } mod - Module instance to delete from the cache.
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
 * Add module names for exclusion. Modules in this list are not loaded from disk and instead
 * become cached entries with empty exports. This is useful when a module to be loaded isn't
 * found in storage or the module just isn't needed and a module with an empty export is
 * sufficient. The names provided will be set as the IDs for the modules.
 *
 * @param {string|string[]} name - Module name (or list of names) to exclude from loading
 *  and processing.
 *
 * @returns {Bitloader}
 */
Bitloader.prototype.exclude = function(name) {
  this.excludes = this.excludes.concat(utils.toArray(name));
  return this;
};


/**
 * Add ignore rules for configuring which modules should not be processed by specific
 * pipelines.
 *
 * @param {object|object[]|string|string[]} rules - Configuration(s) for matching modules
 *  to skip different processing pipelines. rules can be strings, in which case they are
 *  treated as module names. For more fine grained control you can specify an object whose
 *  properties are matched against the modules being processed. Matches will not be
 *  processed by the processing pipelines.
 *
 * @param {object|object[]} rules[].services - Name of pipelines to skip. Possible values
 *  are `resolve`, `fetch`, `transform`, `dependency`, `precompile`, `compile`, and `link`.
 *  Alternatively, it can be a wild card to skip *all* the pipelines just listed.
 *
 * @returns {Bitloader}
 */
Bitloader.prototype.ignore = function(rules) {
  if (!rules) {
    throw new TypeError("Must provide a rule configuration");
  }

  var services = this.services;
  var serviceName = Object.keys(this.services);
  rules = utils.toArray(rules);

  rules
    .map(configureRule)
    .map(configureServices)
    .forEach(registerRule);

  this.ignores = this.ignores.concat(rules);
  return this;


  function configureRule(rule) {
    if (!types.isPlainObject(rule)) {
      rule = { name: rule };
    }

    return rule;
  }

  function configureServices(rule) {
    if (!rule.services) {
      rule.services = ["transform", "dependency"];
    }
    else if (rule.services === "*") {
      rule.services = serviceName;
    }
    else {
      rule.services = utils.toArray(rule.services);
    }

    return rule;
  }

  function registerRule(rule) {
    var i, length, serviceNames = rule.services;
    for (var ruleMatchName in utils.omit(rule, ["services"])) {
      for (i = 0, length = serviceNames.length; i < length; i++) {
        services[serviceNames[i]].ignore(ruleMatchName, rule[ruleMatchName]);
      }
    }
  }
};


/**
 * Registers plugins into the different pipelines. Available pipelines are
 * `resolve`, `fetch`, `pretransfrom`, transform`, `dependency`, and `precompile`.
 *
 * @param {object} settings - Object whose keys are the name of the particular
 *  pipeline they intend to register with. For example, if the plugin is to
 *  register a `transform` and a `dependency` pipeline handler, then the
 *  plugin object will have entries with those names. E.g.
 *
 * @returns {Bitloader}
 *
 * @example
 * bitloader.plugin("js", {
 *   "transform": function(meta) {
 *     console.log(meta);
 *   },
 *   "dependency": function(meta) {
 *     console.log(meta);
 *   }
 * });
 */
Bitloader.prototype.plugin = function(name, settings) {
  if (types.isPlainObject(name) || types.isFunction(name)) {
    settings = name;
    name = settings.name;
  }

  this.plugins.configurePlugin(name, settings);
  return this;
};


// Expose constructors and utilities
Bitloader.Module = Module;
Bitloader.Rule   = Rule;
Bitloader.logger = logger;
module.exports   = Bitloader;
