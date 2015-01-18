(function() {
  "use strict";

  var Promise          = require('spromise'),
      Utils            = require('./utils'),
      Pipeline         = require('./pipeline'),
      StatefulItems    = require('./stateful-items'),
      moduleLinker     = require('./module/linker'),
      metaFetch        = require('./meta/fetch'),
      metaValidation   = require('./meta/validation'),
      metaTransform    = require('./meta/transform'),
      metaDependencies = require('./meta/dependencies'),
      metaCompilation  = require('./meta/compilation');

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
    this.pipeline = new Pipeline([metaValidation, metaTransform, metaDependencies]);
    this.modules  = new StatefulItems();
  }


  /**
   * Handles the process of returning the instance of the Module if one exists, otherwise
   * the workflow for creating the instance is kicked off, which will eventually lead to
   * the creation of a Module instance
   *
   * The workflow is to take in a module name that needs to be loaded.  If a module with
   * the given name isn't loaded, then we fetch it.  The fetch call returns a promise, which
   * when resolved returns a moduleMeta. The moduleMeta is an intermediate object that contains
   * the module source from fetch and a compile method used for converting the source to an
   * instance of Module. The purporse for moduleMeta is to allow a tranformation pipeline to process
   * the raw source before compiling it to the final product. The transformation pipeline allows us
   * to do things like convert coffeescript to javascript.
   *
   * Primary workflow:
   * fetch     -> module name {string}
   * transform -> module meta {compile:fn, source:string}
   * load deps -> module meta {compile:fn, source:string}
   * compile
   *
   * @param {string} name - The name of the module to load.
   *
   * @returns {Promise} - Promise that will resolve to a Module instance
   */
  Loader.prototype.load = function(name) {
    var loader  = this,
        manager = this.manager;

    if (!name) {
      return Promise.reject(new TypeError("Must provide the name of the module to load"));
    }

    if (manager.hasModule(name)) {
      return Promise.resolve(manager.getModule(name));
    }
    else if (loader.hasModule(name)) {
      return Promise.resolve(loader.getModule(name));
    }

    return loader.fetch(name)
      .then(function moduleFetched(getModuleDelegate) {
        return getModuleDelegate();
      }, Utils.forwardError);
  };


  Loader.prototype.fetch = function(name) {
    var loader  = this,
        manager = this.manager;

    if (manager.hasModule(name) || loader.isLoaded(name)) {
      return Promise.resolve(getModuleDelegate);
    }

    if (loader.isLoading(name)) {
      return loader.getLoading(name);
    }

    //
    // This is where the call to fetch the module meta takes. Once the module
    // meta is loaded, it is put through the transformation pipeline.
    //
    var loading = metaFetch(manager, name)
      .then(processModuleMeta, handleError)
      .then(moduleFetched, handleError);

    // Make sure to set the module as loading so that further request know the
    // state of the module meta
    return loader.setLoading(name, loading);


    function moduleFetched(moduleMeta) {
      loader.setLoaded(name, moduleMeta);
      return getModuleDelegate;
    }

    function handleError(error) {
      Utils.printError(error);
      return error;
    }

    function processModuleMeta(moduleMeta) {
      return loader.processModuleMeta(moduleMeta);
    }

    function getModuleDelegate() {
      if (manager.hasModule(name)) {
        return manager.getModule(name);
      }
      else {
        return loader.buildModule(name);
      }
    }
  };


  Loader.prototype.processModuleMeta = function(moduleMeta) {
    return this.pipeline
      .run(this.manager, moduleMeta)
      .then(function() {return moduleMeta;}, Utils.forwardError);
  };


  Loader.prototype.buildModule = function(name) {
    var manager = this.manager,
        mod;

    if (manager.hasModule(name)) {
      mod = manager.getModule(name);
    }
    else if (this.isLoaded(name)) {
      mod = metaCompilation(manager, this.removeModule(name));
    }
    else {
      throw new TypeError("Module `" + name + "` is not loaded yet.  Make sure to call `load` or `fetch` prior to calling this method");
    }

    // Resolve module dependencies and return the final code.
    return moduleLinker(manager, mod);
  };


  /**
   * Check is there is currently a module loaded or loading.
   *
   * @returns {Boolean}
   */
  Loader.prototype.hasModule = function(name) {
    this.modules.hasItem(name);
  };


  /**
   * Method to retrieve the moduleMeta regardless of whether it is loading or
   * already loaded.  If it is loading, then a promise is returned, otherwise
   * the actual metaModule object is returned.
   *
   * @returns {moduleMeta | Promise}
   */
  Loader.prototype.getModule = function(name) {
    return this.modules.getItem(name);
  };


  /**
   * Checks is a module is being put through the fetch and the transform pipeline.
   *
   * @returns {Boolean} - true if the module name is being loaded, false otherwise.
   */
  Loader.prototype.isLoading = function(name) {
    return this.modules.hasItemWithState(StateTypes.loading, name);
  };


  /**
   * Method to retrieve the moduleMeta if it is in the loading state.  Otherwise
   * an exception is thrown.
   *
   * @returns {Promise}
   */
  Loader.prototype.getLoading = function(name) {
    return this.modules.getItem(StateTypes.loading, name);
  };

  Loader.prototype.setLoading = function(name, item) {
    return this.modules.setItem(StateTypes.loading, name, item);
  };

  Loader.prototype.isLoaded = function(name) {
    return this.modules.hasItemWithState(StateTypes.loaded, name);
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


  module.exports = Loader;
})();
