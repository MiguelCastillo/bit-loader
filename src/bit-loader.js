(function () {
  "use strict";

  var Promise  = require('spromise'),
      Utils    = require('./utils'),
      Import   = require('./import'),
      Loader   = require('./loader'),
      Module   = require('./module'),
      Registry = require('./registry'),
      Fetch    = require('./fetch');

  function Bitloader() {
    this.middlewares = {};
    this.context     = Registry.getById();

    // Override any of these constructors if you need specialized implementation
    var providers = {
      fetch   : new Bitloader.Fetch(this),
      loader  : new Bitloader.Loader(this),
      import  : new Bitloader.Import(this)
    };

    // Expose interfaces
    this.providers = providers;
    this.fetch     = providers.fetch.fetch.bind(providers.fetch);
    this.load      = providers.loader.load.bind(providers.loader);
    this.import    = providers.import.import.bind(providers.import);
  }

  Bitloader.prototype.use = function(name, provider) {
    if (!provider || !provider.handler) {
      throw new TypeError("Must provide a providers with a `handler` interface");
    }

    var middleware = this.middlewares[name] || (this.middlewares[name] = []);

    if (typeof(provider) === "function") {
      provider = {handler: provider};
    }

    middleware.push(provider);
  };

  Bitloader.prototype.run = function(name) {
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

  Bitloader.prototype.clear = function() {
    return Registry.clearById(this.context._id);
  };


  Bitloader.prototype.Promise = Promise;
  Bitloader.prototype.Module  = Module;
  Bitloader.prototype.Utils   = Utils;

  // Expose constructors and utilities
  Bitloader.Promise  = Promise;
  Bitloader.Utils    = Utils;
  Bitloader.Registry = Registry;
  Bitloader.Loader   = Loader;
  Bitloader.Import   = Import;
  Bitloader.Module   = Module;
  Bitloader.Fetch    = Fetch;
  module.exports   = Bitloader;
})();
