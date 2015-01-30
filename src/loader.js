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
   * are stored in the manager's context to avoid loading the same module multiple times.
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
  Loader.prototype.load = function(name, parentMeta) {
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

    return loader.fetch(name, parentMeta)
      .then(function moduleFetched(getModuleDelegate) {
        return getModuleDelegate();
      }, Utils.forwardError);
  };


  /**
   * This method fetches the module meta if it is not already loaded. Once the
   * the module meta is fetched, it is put through the transform pipeline. Once
   * the transformation is done, all dependencies are fetched.
   *
   * The purpose for this method is to setup the module meta and all its dependencies
   * so that the module meta can be converted to an instance of Module synchronously.
   *
   * Use this method if the intent is to preload dependencies without actually compiling
   * module metas to instances of Module.
   *
   * @param {string} name - The name of the module to fetch
   * @returns {Promise} A promise that when resolved will provide a delegate method
   *   that can be called to compile the module meta to a Module and return it.
   */
  Loader.prototype.fetch = function(name, parentMeta) {
    var loader  = this,
        manager = this.manager;

    if (manager.hasModule(name) || loader.isLoaded(name)) {
      return Promise.resolve(getModuleDelegate);
    }

    if (loader.isLoading(name)) {
      return loader.getLoading(name);
    }

    // This is where the call to fetch the module meta takes place. Once the
    // module meta is loaded, it is put through the transformation pipeline.
    var loading = metaFetch(manager, name, parentMeta)
      .then(pipelineModuleMeta, handleError)
      .then(moduleFetched, handleError);

    // Set the state of the module meta to pending so that future fetch request
    // can just use the currently loading one.
    return loader.setLoading(name, loading);


    function moduleFetched(moduleMeta) {
      loader.setLoaded(name, moduleMeta);
      return getModuleDelegate;
    }

    function handleError(error) {
      Utils.printError(error);
      return error;
    }

    function pipelineModuleMeta(moduleMeta) {
      return loader.pipelineModuleMeta(moduleMeta);
    }

    function getModuleDelegate() {
      if (manager.hasModule(name)) {
        return manager.getModule(name);
      }

      return loader.buildModule(name);
    }
  };


  /**
   * Put a module meta object through the pipeline, which includes the transformation
   * and dependency loading stages.
   *
   * @param {object} moduleMeta - Module meta object to run through the pipeline
   * @returns {Promise} that when fulfilled, the processed module meta object is returned.
   */
  Loader.prototype.pipelineModuleMeta = function(moduleMeta) {
    return this.pipeline
      .run(this.manager, moduleMeta)
      .then(function pipelineFinished() {return moduleMeta;}, Utils.forwardError);
  };


  /**
   * Converts a module meta object to a full Module instance.
   *
   * @param {object} moduleMeta - The module meta object to convert to Module instance
   * @returns {Module} Module instance from the conversion of module meta
   */
  Loader.prototype.compileModuleMeta = function(moduleMeta) {
    var manager = this.manager,
        mod     = metaCompilation(manager, moduleMeta);

    // Resolve module dependencies and return the Module instance.
    return moduleLinker(manager, mod);
  };


  /**
   * Converts a module meta object to a full Module instance.
   *
   * @param {string} name - The name of the module meta to convert to an instance of Module
   * @returns {Module} Module instance from the conversion of module meta
   */
  Loader.prototype.buildModule = function(name) {
    var moduleMeta;
    var manager = this.manager;

    if (this.isLoaded(name)) {
      moduleMeta = this.removeModule(name);
    }
    else if (manager.isModuleCached(name)) {
      throw new TypeError("Module `" + name + "` is already loaded, so you can just call `manager.getModule(name)`");
    }
    else {
      throw new TypeError("Module `" + name + "` is not loaded yet. Make sure to call `load` or `fetch` prior to calling `linkModuleMeta`");
    }

    return this.compileModuleMeta(moduleMeta);
  };


  /**
   * Check if there is currently a module loading or loaded.
   *
   * @param {string} name - The name of the module meta to check
   * @returns {Boolean}
   */
  Loader.prototype.hasModule = function(name) {
    this.modules.hasItem(name);
  };


  /**
   * Method to retrieve the module meta with the given name, if one exists.  If it
   * is loading, then the promise for the pending request is returned. Otherwise
   * the actual module meta object is returned.
   *
   * @param {string} name - The name of the module meta to get
   * @returns {moduleMeta | Promise}
   */
  Loader.prototype.getModule = function(name) {
    return this.modules.getItem(name);
  };


  /**
   * Checks if the module meta with the given name is currently loading
   *
   * @param {string} name - The name of the module meta to check
   * @returns {Boolean} - true if the module name is being loaded, false otherwise.
   */
  Loader.prototype.isLoading = function(name) {
    return this.modules.hasItemWithState(StateTypes.loading, name);
  };


  /**
   * Method to retrieve the module meta with the given name, if it is loading.
   *
   * @param {string} name - The name of the loading module meta to get.
   * @returns {Promise}
   */
  Loader.prototype.getLoading = function(name) {
    return this.modules.getItem(StateTypes.loading, name);
  };


  /**
   * Method to set the loading module meta with the given name.
   *
   * @param {string} name - The name of the module meta to set
   * @param {Object} item - The module meta to set
   * @returns {Object} The module meta being set
   */
  Loader.prototype.setLoading = function(name, item) {
    return this.modules.setItem(StateTypes.loading, name, item);
  };


  /**
   * Method to check if a module meta with the given name is already loaded.
   *
   * @param {string} name - The name of the module meta to check.
   * @returns {Boolean}
   */
  Loader.prototype.isLoaded = function(name) {
    return this.modules.hasItemWithState(StateTypes.loaded, name);
  };


  /**
   * Method to retrieve the module meta with the given name, if one exists.
   *
   * @param {string} name - The name of the loaded module meta to set
   * @returns {Object} The loaded module meta
   */
  Loader.prototype.getLoaded = function(name) {
    return this.modules.getItem(StateTypes.loaded, name);
  };


  /**
   * Method to set the loaded module meta with the given name
   *
   * @param {string} name - The name of the module meta to set
   * @param {Object} item - The module meta to set
   * @returns {Object} The module meta being set
   */
  Loader.prototype.setLoaded = function(name, item) {
    return this.modules.setItem(StateTypes.loaded, name, item);
  };


  /**
   * Method to remove the module from storage
   *
   * @param {string} name - The name of the module meta to remove
   * @returns {Object} The module meta being removed
   */
  Loader.prototype.removeModule = function(name) {
    return this.modules.removeItem(name);
  };


  module.exports = Loader;
})();
