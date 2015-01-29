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
        .all(importer.getModules(names, options))
        .then(modulesLoaded, handleError);
    });
  };

  // Load modules wherever they are found...
  Import.prototype.getModules = function(names, options) {
    var importer = this,
        manager  = this.manager;

    return names.map(function getModule(name) {
      if (isModuleInOptions(name)) {
        return options.modules[name];
      }
      else if (manager.isModuleCached(name)) {
        return manager.getModuleCode(name);
      }
      else if (importer.hasModule(name)) {
        return importer.getModule(name);
      }

      // Workflow for loading a module that has not yet been loaded
      return importer.setModule(name, loadModule(name));
    });


    function isModuleInOptions(name) {
      return options.modules && options.modules.hasOwnProperty(name);
    }

    function loadModule(name) {
      return manager.load(name).then(getModuleCode, Utils.forwardError);
    }

    function getModuleCode(mod) {
      importer.removeModule(mod.name);
      return manager.getModuleCode(mod.name);
    }
  };


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
