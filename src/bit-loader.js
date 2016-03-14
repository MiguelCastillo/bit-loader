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

var Fetcher    = require("./controllers/fetcher");
var Importer   = require("./controllers/importer");
var Loader     = require("./controllers/loader");
var Registry   = require("./controllers/registry");
var Builder    = require("./controllers/builder");
var Module     = require("./module");
var PluginRegistar = require("./plugin/registrar");


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
  this._exclude = [];

  if (options.exclude) {
    this.exclude(options.exclude);
  }

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
    fetcher  : new Fetcher(this),
    loader   : new Loader(this),
    importer : new Importer(this),
    registry : new Registry(this),
    builder  : new Builder(this)
  };

  this.controllers = controllers;

  // Three methods as defined by:
  // https://whatwg.github.io/loader/#sec-properties-of-the-loader-prototype-object
  this.import = controllers.importer.import.bind(controllers.importer);
  this.load   = controllers.loader.load.bind(controllers.loader);
  this.fetch  = controllers.fetcher.fetch.bind(controllers.fetcher);

  if (options.ignore) {
    this.ignore(options.ignore);
  }

  this.pluginRegistrar = new PluginRegistar(this, this.services);

  // Register plugins
  if (options.plugins) {
    var plugins = types.isArray(options.plugins) ? options.plugins : [options.plugins];

    plugins.forEach(function(plugin) {
      this.plugin(plugin);
    }.bind(this));
  }
}


/**
 * Method the configures a new instance of bit-loader using the settings
 * from the instance calling this method.
 */
Bitloader.prototype.config = function(options) {
  return new Bitloader(utils.merge({}, this.settings, options));
};


/**
 * Method that only loads source from storage.  It does not process the result.
 */
Bitloader.prototype.fetchOnly = function(names, referrer) {
  return this.controllers.fetcher.fetchOnly(names, referrer);
};


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
Bitloader.prototype.resolve = function(name, referrer) {
  return this.services.resolver
    .resolve(new Module.Meta(name), referrer)
    .then(function(moduleMeta) {
      return moduleMeta.path;
    });
};


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
 * Method that determines if a module name is excluded from loading and processing.
 *
 * @param {string} name - Name of the module to test for exclusion.
 *
 * @returns {boolean}
 */
Bitloader.prototype.isExcluded = function(name) {
  return this._exclude.indexOf(name) !== -1;
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
  return this.services.transform.runAsync(new Module.Meta({
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
 * Method to add module names to exclude. Modules in this list will
 * basically add modules with source of empty string. Generally used
 * to exclude external dependencies where module names are not paths
 * that require name resolution. e.g. jquery, react, path...
 *
 * @param {string|Array.<string>} name - Module name (or list of names)
 *  to exclude from loading and processing. This will add a module entry
 *  with the source  of empty string and the ID is the same as the name.
 *
 * @returns {Bitloader}
 */
Bitloader.prototype.exclude = function(name) {
  if (types.isArray(name)) {
    this._exclude = this._exclude.concat(name);
  }
  else {
    this._exclude.push(name);
  }

  return this;
};


/**
 * Add ignore rules for configuring what the different pipelines shoud not process.
 *
 * @param {Object} rule - Rule configuration
 *
 * @returns {Bitloader}
 */
Bitloader.prototype.ignore = function(rules) {
  if (!rules) {
    throw new TypeError("Must provide a rule configuration");
  }

  if (!types.isArray(rules)) {
    rules = [rules];
  }

  var services = this.services;
  var serviceName = Object.keys(this.services);

  rules
    .map(configureRule)
    .map(configureServices)
    .forEach(registerRule);

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
      rule.services = types.isArray(rule.services) ? rule.services : [rule.services];
    }

    return rule;
  }

  function registerRule(rule) {
    var i, length, serviceNames = rule.services;
    for (var ruleMatchName in rule) {
      if (ruleMatchName !== "services") {
        for (i = 0, length = serviceNames.length; i < length; i++) {
          services[serviceNames[i]].ignore(ruleMatchName, rule[ruleMatchName]);
        }
      }
    }
  }
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
  if (types.isPlainObject(name)) {
    settings = name;
    name = settings.name;
  }

  this.pluginRegistrar.configure(name, settings);
  return this;
};


// Expose constructors and utilities
Bitloader.Module = Module;
Bitloader.Rule   = Rule;
Bitloader.logger = logger;
module.exports   = Bitloader;
