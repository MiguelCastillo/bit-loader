(function() {
  "use strict";

  var Promise          = require('spromise'),
      Utils            = require('./utils'),
      Pipeline         = require('./pipeline'),
      StatefulItems    = require('./stateful-items'),
      moduleLinker     = require('./module-linker'),
      metaValidation   = require('./meta-validation'),
      metaTransform    = require('./meta-transform'),
      metaDependencies = require('./meta-dependencies'),
      metaCompilation  = require('./meta-compilation');

  var StateTypes = {
    loaded:  "loaded",
    loading: "loading"
  };


  /**
   * The purpose of Loader is to return full instances of Module.  Module instances
   * are stored in the context to avoid loading the same module multiple times.
   * If the module is loaded, then we just return that.  If it has not bee loaded yet,
   * then we:
   *
   * 1. Fetch its source; remote server, local file system... You must specify a fetch
   *      provider to define how source files are retrieved
   * 2. Transform the source that was fetched.  This step enables processing of the
   *      source before it is compiled into an instance of Module.
   * 3. Compile the source that was fetched and transformed into a proper instance
   *      of Module
   */
  function Loader(manager) {
    if (!manager) {
      throw new TypeError("Must provide a manager");
    }

    this.manager  = manager;
    this.pipeline = new Pipeline([fetchModuleMeta, metaValidation, metaTransform, metaDependencies]);
    this.modules  = new StatefulItems();
  }


  /**
   * Handles the process of returning the instance of the Module if one exists, otherwise
   * the workflow for creating the instance is kicked off.
   *
   * The workflow is to take in a module name that needs to be loaded.  If a module with
   * the given name isn't loaded, then we fetch it.  The fetch call returns a promise, which
   * when resolved returns a moduleMeta. The moduleMeta is an intermediate object that contains
   * the module source from fetch and a compile method used for converting the source to an
   * instance of Module. The purporse for moduleMeta is to allows to process the raw source
   * with a tranformation pipeline before compiling it to the final product.  The transformation
   * pipeline allows us to do things like convert coffeescript to javascript.
   *
   * Primary workflow:
   * fetch     -> module name {string}
   * transform -> module meta {compile:fn, source:string}
   * compile   -> module meta {compile:fn, source:string}
   * Module: {deps:array, name:string}
   *
   * @param {string} name - The name of the module to load.
   */
  Loader.prototype.load = function(name) {
    var loader  = this,
        manager = this.manager;

    if (!name) {
      throw new TypeError("Must provide the name of the module to load");
    }

    if (manager.hasModule(name)) {
      return Promise.resolve(manager.getModule(name));
    }
    else if (loader.isLoaded(name)) {
      return loader.getLoaded(name);
    }
    else {
      return loader.isLoading(name) ? loader.getLoading(name) : loader.setLoading(name, fetchModule());
    }


    /**
     * Helper methods for code readability and organization
     */
    function fetchModule() {
      return loader.pipeline.run(manager, name).then(moduleFetched, Utils.printError);
    }

    function moduleFetched(moduleMeta) {
      return loader.setLoaded(name, moduleMeta);
    }
  };


  /**
   * Finalizes the module by calling the `factory` method with any dependencies
   *
   * @returns {Function} callback to call with the Module instance to finalize
   */
  Loader.prototype.getModuleCode = function(name) {
    var manager = this.manager,
        mod;

    if (manager.hasModule(name)) {
      mod = manager.getModule(name);
    }
    else if (this.isLoaded(name)) {
      mod = metaCompilation(manager)(this.removeModule(name));
    }
    else {
      throw new TypeError("Module `" + name + "` is not loaded");
    }

    // Resolve module dependencies and return the final code.
    return moduleLinker(manager)(mod).code;
  };


  Loader.prototype.isLoading = function(name) {
    return this.modules.isState(StateTypes.loading, name);
  };

  Loader.prototype.getLoading = function(name) {
    return this.modules.getItem(StateTypes.loading, name);
  };

  Loader.prototype.setLoading = function(name, item) {
    return this.modules.setItem(StateTypes.loading, name, item);
  };

  Loader.prototype.isLoaded = function(name) {
    return this.modules.isState(StateTypes.loaded, name);
  };

  Loader.prototype.getLoaded = function(name) {
    return this.modules.getItem(StateTypes.loaded, name);
  };

  Loader.prototype.setLoaded = function(name, item) {
    return this.modules.setItem(StateTypes.loaded, name, item);
  };

  Loader.prototype.removeModule = function(name) {
    return this.modules.removeItem(name);
  };


  function fetchModuleMeta(manager, name) {
    return function() {
      return manager.fetch(name);
    };
  }


  module.exports = Loader;
})();
