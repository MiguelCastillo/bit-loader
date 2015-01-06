(function(root) {
  "use strict";

  var Promise = require('spromise'),
      Module  = require('./module');

  /**
   * Module importer.  Primary function is to load Module instances and resolving
   * their dependencies in order to make the Module fully consumable.
   */
  function Import(manager) {
    if (!manager) {
      throw new TypeError("Must provide a manager");
    }

    this.manager  = manager;
    this.context  = manager.context || {};
    this.pipeline = [load, validate, dependencies, finalize, cache];

    if (!this.context.modules) {
      this.context.modules = {};
    }
  }

  /**
   * Import is the interface to load up a Module, fully resolving its dependencies,
   * and caching it to prevent the same module from being processed more than once.
   *
   * @param {Array<string> | string} names - module(s) to import
   *
   * @returns {Promise}
   */
  Import.prototype.import = function(names, options) {
    options = options || {};
    var importer = this,
        context  = this.context;

    // Coerce string to array to simplify input processing
    if (typeof(names) === "string") {
      names = [names];
    }

    // This logic figures out if the module's dependencies need to be resolved and if
    // they also need to be downloaded.
    var deps = names.map(function(name) {
      // Search in the options passed in for the module being loaded.  This is how I
      // allow dependency injection to happen.
      if (options.modules && options.modules.hasOwnProperty(name)) {
        return options.modules[name];
      }
      else if (context.modules.hasOwnProperty(name)) {
        return context.modules[name];
      }

      // Workflow for loading a module that has not yet been loaded
      return (context.modules[name] = runPipeline(importer, name));
    });

    return Promise.when.apply((void 0), deps).catch(function(error) {
      console.error(error);
    });
  };


  function forwardError(error) {
    return error;
  }


  function runPipeline(importer, name) {
    return importer.pipeline.reduce(function(prev, curr) {
      return prev.then(curr(importer, name), forwardError);
    }, Promise.resolve());
  }


  function validate() {
    return function (mod) {
      if (mod instanceof(Module) === false) {
        throw new TypeError("input must be an Instance of Module");
      }
      return mod;
    };
  }


  function load(importer, name) {
    return function() {
      return importer.manager.load(name);
    };
  }

  /**
   * Loads up all dependencies for the modules
   *
   * @returns {Function} callback to call with the Module instance with the
   *   dependencies to be resolved
   */
  function dependencies(importer) {
    return function(mod) {
      // If the module has a property `code` that means the module has already
      // been fully resolved.
      if (!mod.deps.length || mod.hasOwnProperty("code")) {
        return mod;
      }

      return new Promise(function(resolve /*, reject*/) {
        importer.import(mod.deps).then(function() {
          resolve(mod, arguments);
        });
      });
    };
  }

  /**
   * Finalizes the module by calling the `factory` method with any dependencies
   *
   * @returns {Function} callback to call with the Module instance to finalize
   */
  function finalize() {
    return function(mod, deps) {
      if (mod.factory && !mod.hasOwnProperty("code")) {
        mod.code = mod.factory.apply(root, deps);
      }
      return mod;
    };
  }

  /**
   * Adds module to the context to cache it
   */
  function cache(importer) {
    return function(mod) {
      return (importer.context.modules[name] = mod.code);
    };
  }

  module.exports = Import;
})(typeof(window) !== 'undefined' ? window : this);
