(function () {
  "use strict";

  var Promise     = require('./promise'),
      Utils       = require('./utils'),
      Logger      = require('./logger'),
      Fetch       = require('./interfaces/fetch'),
      Compiler    = require('./interfaces/compiler'),
      Import      = require('./import'),
      Loader      = require('./loader'),
      Module      = require('./module'),
      Registry    = require('./registry'),
      RuleMatcher = require('./rule-matcher'),
      Middleware  = require('./middleware');

  var getRegistryId = Registry.idGenerator('bitloader');

  var ModuleState = {
    LOADED: "loaded"
  };


  /**
   * @class
   *
   * Facade for relevant interfaces to register and import modules
   */
  function Bitloader(options, factories) {
    options   = options   || {};
    factories = factories || {};

    this.context = Registry.getById(getRegistryId());

    this.rules = {
      ignore: new RuleMatcher()
    };

    this.pipelines = {
      transform  : new Middleware(this),
      dependency : new Middleware(this),
      compiler   : new Middleware(this)
    };

    // Override any of these factories if you need specialized implementation
    this.providers = {
      fetcher  : factories.fetch    ? factories.fetch(this)    : new Bitloader.Fetch(this),
      loader   : factories.loader   ? factories.loader(this)   : new Bitloader.Loader(this),
      importer : factories.import   ? factories.import(this)   : new Bitloader.Import(this),
      compiler : factories.compiler ? factories.compiler(this) : new Bitloader.Compiler(this)
    };

    // Public Interface
    var providers = this.providers;
    this.fetch    = providers.fetcher.fetch.bind(providers.fetcher);
    this.load     = providers.loader.load.bind(providers.loader);
    this.register = providers.loader.register.bind(providers.loader);
    this.import   = providers.importer.import.bind(providers.importer);
    this.compile  = providers.compiler.compile.bind(providers.compiler);


    if (options.transform) {
      this.pipelines.transform.use(options.transform);
    }

    if (options.dependency) {
      this.pipelines.dependency.use(options.dependency);
    }

    if (options.compiler) {
      this.pipelines.compiler.use(options.compiler);
    }
  }


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
      return this.context.setModule(ModuleState.LOADED, name, this.providers.loader.syncBuildModule(name));
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

    if (!name || typeof(name) !== 'string') {
      throw new TypeError("Module must have a name");
    }

    if (this.context.hasModule(name)) {
      throw new TypeError("Module instance `" + name + "` already exists");
    }

    return this.context.setModule(ModuleState.LOADED, name, mod);
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

    var i, length, ruleNames;
    if (!rule.name) {
      ruleNames = Object.keys(this.pipelines);
    }
    else {
      ruleNames = rule.name instanceof(Array) ? rule.name : [rule.name];
    }

    for (i = 0, length = ruleNames.length; i < length; i++) {
      this.rules.ignore.add({
        name: ruleNames[i],
        match: rule.match
      });
    }

    return this;
  };


  Bitloader.prototype.Promise    = Promise;
  Bitloader.prototype.Module     = Module;
  Bitloader.prototype.Utils      = Utils;
  Bitloader.prototype.Logger     = Logger;
  Bitloader.prototype.Middleware = Middleware;

  // Expose constructors and utilities
  Bitloader.Promise    = Promise;
  Bitloader.Utils      = Utils;
  Bitloader.Registry   = Registry;
  Bitloader.Loader     = Loader;
  Bitloader.Import     = Import;
  Bitloader.Module     = Module;
  Bitloader.Fetch      = Fetch;
  Bitloader.Compiler   = Compiler;
  Bitloader.Middleware = Middleware;
  Bitloader.Logger     = Logger;
  module.exports       = Bitloader;
})();
