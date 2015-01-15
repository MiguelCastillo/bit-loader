(function () {
  "use strict";

  var Promise    = require('spromise'),
      Utils      = require('./utils'),
      Logger     = require('./logger'),
      Import     = require('./import'),
      Loader     = require('./loader'),
      Module     = require('./module'),
      Registry   = require('./registry'),
      Middleware = require('./middleware'),
      Fetch      = require('./fetch');

  function Bitloader(options, factories) {
    factories = factories || {};

    this.context   = Registry.getById();
    this.transform = Middleware.factory(this);
    this.plugin    = Middleware.factory(this);

    if (options.transforms) {
      this.transform(options.transforms);
    }

    if (options.plugins) {
      this.plugin(options.plugins);
    }

    // Override any of these constructors if you need specialized implementation
    var providers = {
      fetch  : factories.fetch  ? factories.fetch(this)  : new Bitloader.Fetch(this),
      loader : factories.loader ? factories.loader(this) : new Bitloader.Loader(this),
      import : factories.import ? factories.import(this) : new Bitloader.Import(this)
    };

    // Expose interfaces
    this.providers = providers;
    this.fetch     = providers.fetch.fetch.bind(providers.fetch);
    this.load      = providers.loader.load.bind(providers.loader);
    this.import    = providers.import.import.bind(providers.import);
  }


  Bitloader.prototype.clear = function() {
    return Registry.clearById(this.context._id);
  };


  Bitloader.prototype.hasModuleCode = function(name) {
    return this.context.code.hasOwnProperty(name) || this.providers.loader.isLoaded(name) || this.hasModule(name);
  };


  Bitloader.prototype.getModuleCode = function(name) {
    if (!this.hasModuleCode(name)) {
      throw new TypeError("Module `" + name + "` has not yet been loaded");
    }

    if (this.context.code.hasOwnProperty(name)) {
      return this.context.code[name];
    }
    else {
      return (this.context.code[name] = this.providers.loader.buildModule(name).code);
    }
  };


  Bitloader.prototype.setModuleCode = function(name, code) {
    if (this.hasModuleCode(name)) {
      throw new TypeError("Module code for `" + name + "` already exists");
    }

    return (this.context.code[name] = code);
  };


  Bitloader.prototype.hasModule = function(name) {
    return this.context.modules.hasOwnProperty(name);
  };


  Bitloader.prototype.getModule = function(name) {
    if (!this.hasModule(name)) {
      throw new TypeError("Module `" + name + "` has not yet been loaded");
    }

    return this.context.modules[name];
  };


  Bitloader.prototype.setModule = function(name, mod) {
    if (!(mod instanceof(Module))) {
      throw new TypeError("Module `" + name + "` is not an instance of Module");
    }

    if (this.hasModule(name)) {
      throw new TypeError("Module instance `" + name + "` already exists");
    }

    return (this.context.modules[name] = mod);
  };


  Bitloader.prototype.Promise = Promise;
  Bitloader.prototype.Module  = Module;
  Bitloader.prototype.Utils   = Utils;
  Bitloader.prototype.Logger  = Logger;

  // Expose constructors and utilities
  Bitloader.Promise    = Promise;
  Bitloader.Utils      = Utils;
  Bitloader.Registry   = Registry;
  Bitloader.Loader     = Loader;
  Bitloader.Import     = Import;
  Bitloader.Module     = Module;
  Bitloader.Fetch      = Fetch;
  Bitloader.Middleware = Middleware;
  Bitloader.Logger     = Logger;
  module.exports       = Bitloader;
})();
