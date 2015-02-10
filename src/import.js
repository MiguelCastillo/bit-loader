(function() {
  "use strict";

  var Promise       = require('spromise'),
      StatefulItems = require('./stateful-items'),
      Utils         = require('./utils');


  var StateTypes = {
    loading: "loading"
  };


  /**
   * Module importer.  Primary function is to load Module instances and resolving
   * their dependencies in order to make the Module fully consumable.
   */
  function Import(manager) {
    if (!manager) {
      throw new TypeError("Must provide a manager");
    }

    this.manager = manager;
    this.modules = new StatefulItems();
  }


  /**
   * Import is the interface to load a Module
   *
   * @param {Array<string> | string} names - module(s) to import
   *
   * @returns {Promise}
   */
  Import.prototype.import = function(names, options) {
    options = options || {};
    var importer = this;

    // Coerce string to array to simplify input processing
    if (typeof(names) === "string") {
      names = [names];
    }

    return new Promise(function deferredModuleImport(resolve, reject) {
      // Callback when modules are loaded
      function modulesLoaded(modules) {
        resolve.apply((void 0), modules);
      }

      // Callback if there was an error loading the modules
      function handleError(error) {
        reject.call((void 0), Utils.printError(error));
      }

      // Load modules
      Promise
        .all(importer._getModules(names, options))
        .then(modulesLoaded, handleError);
    });
  };


  /**
   * Loops through the array of names, loading whatever has not yet been loaded,
   * and returning what has already been loaded.
   *
   * @param {Array<string>} names - Array of module names
   * @param {Object} options
   */
  Import.prototype._getModules = function(names, options) {
    var importer = this,
        manager  = this.manager;

    return names.map(function getModule(name) {
      if (hasModule(options.modules, name)) {
        return options.modules[name];
      }
      else if (manager.hasModule(name)) {
        return manager.getModuleCode(name);
      }
      else if (importer.hasModule(name)) {
        return importer.getModule(name);
      }

      // Workflow for loading a module that has not yet been loaded
      return importer.setModule(name, importer._loadModule(name));
    });
  };


  /**
   * Load module
   */
  Import.prototype._loadModule = function(name) {
    return this.manager
      .load(name)
      .then(this._getModuleCode(name), Utils.forwardError);
  };


  /**
   * Handler for when modules are loaded.
   */
  Import.prototype._getModuleCode = function(name) {
    var importer = this;

    return function getCode(mod) {
      if (name !== mod.name) {
        throw new TypeError("Module name must be the same as the name used for loading the Module itself");
      }

      importer.removeModule(mod.name);
      return importer.manager.getModuleCode(mod.name);
    };
  };


  function hasModule(target, name) {
    return target && target.hasOwnProperty(name);
  }

  Import.prototype.hasModule = function(name) {
    return this.modules.hasItemWithState(StateTypes.loading, name);
  };


  Import.prototype.getModule = function(name) {
    return this.modules.getItem(StateTypes.loading, name);
  };


  Import.prototype.setModule = function(name, item) {
    return this.modules.setItem(StateTypes.loading, name, item);
  };


  Import.prototype.removeModule = function(name) {
    return this.modules.removeItem(name);
  };


  module.exports = Import;
})();
