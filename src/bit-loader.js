(function () {
  "use strict";

  var Promise    = require('spromise'),
      Utils      = require('./utils'),
      Import     = require('./import'),
      Loader     = require('./loader'),
      Module     = require('./module'),
      Registry   = require('./registry'),
      Middleware = require('./middleware'),
      Fetch      = require('./fetch');

  function Bitloader() {
    this.context   = Registry.getById();
    this.transform = Middleware.factory(this);

    // Override any of these constructors if you need specialized implementation
    var providers = {
      fetch  : new Bitloader.Fetch(this),
      loader : new Bitloader.Loader(this),
      import : new Bitloader.Import(this)
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

  Bitloader.prototype.Promise = Promise;
  Bitloader.prototype.Module  = Module;
  Bitloader.prototype.Utils   = Utils;

  // Expose constructors and utilities
  Bitloader.Promise    = Promise;
  Bitloader.Utils      = Utils;
  Bitloader.Registry   = Registry;
  Bitloader.Loader     = Loader;
  Bitloader.Import     = Import;
  Bitloader.Module     = Module;
  Bitloader.Fetch      = Fetch;
  Bitloader.Middleware = Middleware;
  module.exports   = Bitloader;
})();
