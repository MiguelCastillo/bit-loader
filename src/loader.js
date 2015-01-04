(function() {
  "use strict";

  var Promise = require('spromise');

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
    this.context  = manager.context || {};
    this.pipeline = [fetch, validate, transform, compile];

    if (!this.context.loaded) {
      this.context.loaded = {};
    }
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
        context = this.context;

    if (!name) {
      throw new TypeError("Must provide the name of the module to load");
    }

    // If the context does not have a module with the given name, then we go on to
    // fetch the source and put it through the workflow to create a Module instance.
    if (!context.loaded.hasOwnProperty(name)) {
      // This is where the workflow for fetching, transforming, and compiling happens.
      // It is designed to easily add more steps to the workflow.
      context.loaded[name] = runPipeline(loader, name);
    }

    return Promise.resolve(context.loaded[name]);
  };


  function forwardError(error) {
    return error;
  }


  function runPipeline(loader, name) {
    return loader.pipeline.reduce(function(prev, curr) {
      return prev.then(curr(loader, name), forwardError);
    }, Promise.resolve());
  }


  function fetch(loader, name) {
    return function() {
      return loader.manager.fetch(name);
    };
  }


  /**
   * Method to ensure we have a valid module meta object before we continue on with
   * the rest of the pipeline.
   */
  function validate() {
    return function(moduleMeta) {
      if (!moduleMeta) {
        throw new TypeError("Must provide a ModuleMeta");
      }

      if (!moduleMeta.compile) {
        throw new TypeError("ModuleMeta must provide have a `compile` interface");
      }

      return moduleMeta;
    };
  }

  /**
   * The transform enables transformation providers to process the moduleMeta
   * before it is compiled into an actual Module instance.  This is where steps
   * such as linting and processing coffee files can take place.
   */
  function transform(loader) {
    return function(moduleMeta) {
      return loader.manager.transform.runAll(moduleMeta)
        .then(function() {return moduleMeta;}, forwardError);
    };
  }

  /**
   * The compile step is to convert the moduleMeta to an instance of Module. The
   * fetch provider is in charge of adding the compile interface in the moduleMeta
   * as that is the place with the most knowledge about how the module was loaded
   * from the server/local file system.
   */
  function compile(loader) {
    return function(moduleMeta) {
      var mod     = moduleMeta.compile(),
          modules = moduleMeta.loaded ? moduleMeta.loaded.modules : {};

      // Copy modules over to the loaded bucket if it does not exist. Anything
      // that has already been loaded will get ignored.
      for (var item in modules) {
        if (modules.hasOwnProperty(item) && !loader.context.loaded.hasOwnProperty(item)) {
          loader.context.loaded[item] = modules[item];
        }
      }

      mod.meta = moduleMeta;
      return (loader.context.loaded[mod.name] = mod);
    };
  }

  module.exports = Loader;
})(typeof(window) !== 'undefined' ? window : this);
