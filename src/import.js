(function() {
  "use strict";

  var Promise       = require('spromise'),
      StatefulItems = require('./stateful-items'),
      Utils         = require('./utils');


  var StateTypes = {
    pending: "pending"
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
    this.context = manager.context || {};
    this.modules = new StatefulItems();
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
        manager  = this.manager;

    // Coerce string to array to simplify input processing
    if (typeof(names) === "string") {
      names = [names];
    }

    return new Promise(function(resolve, reject) {
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
        .all(getModules())
        .then(modulesLoaded, handleError);
    });


    // Load modules wherever they are found...
    function getModules() {
      return names.map(function(name) {
        // Search in the options passed in for the module being loaded.  This is how I
        // allow dependency injection to happen.
        if (isModuleInOptions(name)) {
          return options.modules[name];
        }
        else if (manager.hasModuleCode(name)) {
          return manager.getModuleCode(name);
        }
        else if (importer.isPending(name)) {
          return importer.getPending(name);
        }

        // Workflow for loading a module that has not yet been loaded
        return importer.setPending(name, loadModule(name));
      });
    }

    // Checks if the module is in the options.modules object.
    function isModuleInOptions(name) {
      return options.modules && options.modules.hasOwnProperty(name);
    }

    function loadModule(name) {
      return manager.load(name).then(getModuleCode, Utils.forwardError);
    }

    function getModuleCode(mod) {
      importer.removePending(mod.name);
      return manager.providers.loader.getModuleCode(mod.name);
    }
  };


  Import.prototype.isPending = function(name) {
    return this.modules.isState(StateTypes.pending, name);
  };


  Import.prototype.getPending = function(name) {
    return this.modules.getItem(StateTypes.pending, name);
  };


  Import.prototype.setPending = function(name, item) {
    return this.modules.setItem(StateTypes.pending, name, item);
  };


  Import.prototype.removePending = function(name) {
    return this.modules.removeItem(name);
  };


  module.exports = Import;
})();
