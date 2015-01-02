(function () {
  "use strict";

  var Promise  = require('spromise'),
      Utils    = require('./utils'),
      Import   = require('./import'),
      Loader   = require('./loader'),
      Module   = require('./module'),
      Registry = require('./registry'),
      Fetch    = require('./fetch');

  function MLoader() {
    this.middlewares = {};
    this.context     = Registry.getById();

    // Override any of these constructors if you need specialized implementation
    var providers = {
      fetch   : new MLoader.Fetch(this),
      loader  : new MLoader.Loader(this),
      import  : new MLoader.Import(this)
    };

    // Expose interfaces
    this.providers = providers;
    this.fetch     = providers.fetch.fetch.bind(providers.fetch);
    this.load      = providers.loader.load.bind(providers.loader);
    this.import    = providers.import.import.bind(providers.import);
  }

  MLoader.prototype.use = function(name, provider) {
    if (!provider || !provider.handler) {
      throw new TypeError("Must provide a providers with a `handler` interface");
    }

    var middleware = this.middlewares[name] || (this.middlewares[name] = []);

    if (typeof(provider) === "function") {
      provider = {handler: provider};
    }

    middleware.push(provider);
  };

  MLoader.prototype.run = function(name) {
    var middleware = this.middlewares[name],
        data = Array.prototype.slice.call(arguments, 1),
        result, i, length;

    if (!middleware) {
      return;
    }

    for (i = 0, length = middleware.legnth; i < length; i++) {
      result = middleware[i].handler.apply(middleware[i], data);

      if (result !== (void 0)) {
        return result;
      }
    }
  };

  MLoader.prototype.clear = function() {
    return Registry.clearById(this.context._id);
  };


  MLoader.prototype.Promise = Promise;
  MLoader.prototype.Module  = Module;
  MLoader.prototype.Utils   = Utils;

  // Expose constructors and utilities
  MLoader.Promise  = Promise;
  MLoader.Utils    = Utils;
  MLoader.Registry = Registry;
  MLoader.Loader   = Loader;
  MLoader.Import   = Import;
  MLoader.Module   = Module;
  MLoader.Fetch    = Fetch;
  module.exports   = MLoader;
})();
