!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.bitLoader=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * spromise Copyright (c) 2014 Miguel Castillo.
 * Licensed under MIT
 *
 * https://github.com/MiguelCastillo/spromise
 */

/**
 * spromise Copyright (c) 2014 Miguel Castillo.
 * Licensed under MIT
 */

(function(e,t){typeof require=="function"&&typeof exports=="object"&&typeof module=="object"?module.exports=t():typeof define=="function"&&define.amd?define(t):e.spromise=t()})(this,function(){var e,t;return function(){function i(e){return typeof e.factory=="function"?t(e.deps,e.factory):e.factory}function s(e,t){var n,s,o,u,a=[];for(n=0,s=e.length;n<s;n++){o=e[n],u=r[o]||t[o];if(!u)throw new TypeError("Module "+o+" has not yet been loaded");r[o]?(u.hasOwnProperty("code")||(u.code=i(u)),a[n]=u.code):a[n]=u}return a}var n=this,r={};t=function o(e,t){var i,u,a={};return a.require=o,a.exports={},a.module={exports:a.exports},typeof e=="string"&&(i=e,e=[e]),e.length&&(e=s(e.slice(0),a)),typeof t=="function"?u=t.apply(n,e):u=r[i]?r[i].code:t,u===void 0?a.module.exports:u},e=function(t,n,i){r[t]={name:t,deps:n,factory:i}}}.call(this),e("src/samdy",function(){}),e("src/async",["require","exports","module"],function(e,t,n){function i(e){r(e)}var r;i.delay=function(e,t,n){setTimeout(e.apply.bind(e,this,n||[]),t)},typeof process=="object"&&typeof process.nextTick=="function"?r=process.nextTick:typeof setImmediate=="function"?r=setImmediate:r=function(e){setTimeout(e,0)},i.nextTick=r,n.exports=i}),e("src/promise",["require","exports","module","src/async"],function(e,t,n){function o(e,t){t=t||new u;var n=this;n.then=function(e,n){return t.then(e,n)},n.resolve=function(){return t.transition(i.resolved,arguments,this),n},n.reject=function(){return t.transition(i.rejected,arguments,this),n},n.promise={then:n.then,always:n.always,done:n.done,"catch":n.fail,fail:n.fail,notify:n.notify,state:n.state,constructor:o},n.promise.promise=n.promise,n.then.stateManager=t,e&&e.call(n,n.resolve,n.reject)}function u(e){this.state=i.pending,e&&e.state&&this.transition(e.state,e.value,e.context)}function a(e){this.promise=e.promise}function l(e){c.debug&&(console.error(e),e&&e.stack&&console.log(e.stack))}function c(e){return new o(e)}var r=e("src/async"),i={pending:0,resolved:1,rejected:2,always:3,notify:4},s=["pending","resolved","rejected"];o.prototype.done=function(e){return this.then.stateManager.enqueue(i.resolved,e),this.promise},o.prototype.catch=o.prototype.fail=function(e){return this.then.stateManager.enqueue(i.rejected,e),this.promise},o.prototype.finally=o.prototype.always=function(e){return this.then.stateManager.enqueue(i.always,e),this.promise},o.prototype.notify=function(e){return this.then.stateManager.enqueue(i.notify,e),this.promise},o.prototype.state=function(){return s[this.then.stateManager.state]},o.prototype.isPending=function(){return this.then.stateManager.state===i.pending},o.prototype.isResolved=function(){return this.then.stateManager.state===i.resolved},o.prototype.isRejected=function(){return this.then.stateManager.state===i.resolved},o.prototype.delay=function(t){var n=this;return new o(function(e,i){n.then(function(){r.delay(e.bind(this),t,arguments)},i.bind(this))})},u.prototype.enqueue=function(e,t){function r(){n.state===e||i.always===e?t.apply(n.context,n.value):i.notify===e&&t.call(n.context,n.state,n.value)}this.state?f.asyncTask(r):(this.queue||(this.queue=[])).push(r);var n=this},u.prototype.transition=function(e,t,n){if(this.state)return;this.state=e,this.context=n,this.value=t;var r=this.queue;r&&(this.queue=null,f.asyncQueue(r))},u.prototype.then=function(e,t){var n=this;e=e&&typeof e=="function"?e:null,t=t&&typeof t=="function"?t:null;if(!e&&n.state===i.resolved||!t&&n.state===i.rejected)return new o(null,n);var r=new o;return n.enqueue(i.notify,function(s,o){var f=s===i.resolved?e||t:t||e;f&&(o=u.runHandler(s,o,this,r,f)),o!==!1&&(new a({promise:r})).finalize(s,o,this)}),r},u.runHandler=function(e,t,n,r,i){try{t=i.apply(n,t)}catch(s){return l(s),r.reject.call(n,s),!1}return t===undefined?[]:[t]},a.prototype.finalize=function(e,t,n){var r=this,s=this.promise,u,a;if(t.length){u=t[0];if(u===s)a=s.reject.call(n,new TypeError("Resolution input must not be the promise being resolved"));else if(u&&u.constructor===o)a=u.notify(function(t,n){r.finalize(t,n,this)});else if(u!==undefined&&u!==null)switch(typeof u){case"object":case"function":a=this.runThenable(u,n)}}a||(e===i.resolved?s.resolve.apply(n,t):s.reject.apply(n,t))},a.prototype.runThenable=function(e,t){var n=this,r=!1;try{var s=e.then;if(typeof s=="function")return s.call(e,function(){r||(r=!0,n.finalize(i.resolved,arguments,this))},function(){r||(r=!0,n.promise.reject.apply(this,arguments))}),!0}catch(o){return r||n.promise.reject.call(t,o),!0}return!1};var f={_asyncQueue:[],asyncTask:function(e){f._asyncQueue.push(e)===1&&r(f.taskRunner(f._asyncQueue))},asyncQueue:function(e){e.length===1?f.asyncTask(e[0]):f.asyncTask(f.taskRunner(e))},taskRunner:function(e){return function(){var n;while(n=e[0])f._runTask(n),e.shift()}},_runTask:function(e){try{e()}catch(t){l(t)}}};c.prototype=o.prototype,c.defer=function(){return new o},c.reject=function(){return new o(null,new u({context:this,value:arguments,state:i.rejected}))},c.resolve=c.thenable=function(e){if(e){if(e.constructor===o)return e;if(typeof e.then=="function")return new o(e.then)}return new o(null,new u({context:this,value:arguments,state:i.resolved}))},c.delay=function(t){var n=Array.prototype.slice(arguments,1);return new o(function(e){r.delay(e.bind(this),t,n)})},c.states=i,c.debug=!1,n.exports=c}),e("src/all",["require","exports","module","src/promise","src/async"],function(e,t,n){function s(e,t,n){return typeof e=="function"?e.apply(n,t||[]):e}function o(e){function a(){u--,u||n.resolve.call(o,t)}function f(e){return function(){t[e]=arguments.length===1?arguments[0]:arguments,a()}}function l(){var r,i,o;for(r=0,o=u;r<o;r++)i=e[r],i&&typeof i.then=="function"?i.then(f(r),n.reject):(t[r]=s(i),a())}e=e||[];var t=[],n=r.defer(),o=this,u=e.length;return e.length?(i(l),n):n.resolve(e)}var r=e("src/promise"),i=e("src/async");n.exports=o}),e("src/when",["require","exports","module","src/promise","src/all"],function(e,t,n){function s(){var e=this,t=arguments;return new r(function(n,r){i.call(e,t).then(function(t){n.apply(e,t)},function(t){r.call(e,t)})})}var r=e("src/promise"),i=e("src/all");n.exports=s}),e("src/race",["require","exports","module","src/promise"],function(e,t,n){function i(e){return e?new r(function(t,n){function o(){s||(s=!0,t.apply(this,arguments))}function u(){s||(s=!0,n.apply(this,arguments))}var r,i,s=!1;for(r=0,i=e.length;r<i;r++)e[r].then(o,u)}):r.resolve()}var r=e("src/promise");n.exports=i}),e("src/spromise",["require","exports","module","src/promise","src/async","src/when","src/all","src/race"],function(e,t,n){var r=e("src/promise");r.aync=e("src/async"),r.when=e("src/when"),r.all=e("src/all"),r.race=e("src/race"),n.exports=r}),t("src/spromise")});
},{}],2:[function(require,module,exports){
(function () {
  "use strict";

  var Promise    = require('spromise'),
      Utils      = require('./utils'),
      Logger     = require('./logger'),
      Fetch      = require('./fetch'),
      Import     = require('./import'),
      Loader     = require('./loader'),
      Module     = require('./module'),
      Registry   = require('./registry'),
      Middleware = require('./middleware');


  function Bitloader(options, factories) {
    options   = options   || {};
    factories = factories || {};

    this.context   = Registry.getById();
    this.transform = Middleware.factory(this);
    this.plugin    = Middleware.factory(this);

    if (options.transforms) {
      this.transform(options.transforms);
    }

    if (options.plugins) {
      this.plugin(options.plugins);
    }

    // Override any of these factories if you need specialized implementation
    var providers = {
      fetch  : factories.fetch  ? factories.fetch(this)  : new Bitloader.Fetch(this),
      loader : factories.loader ? factories.loader(this) : new Bitloader.Loader(this),
      import : factories.import ? factories.import(this) : new Bitloader.Import(this)
    };

    // Expose interfaces
    this.providers = providers;
    this.fetch     = providers.fetch.fetch.bind(providers.fetch);
    this.load      = providers.loader.load.bind(providers.loader);
    this.import    = providers.import.import.bind(providers.import);
  }


  /**
   * Clears the context, which means that all cached modules and other pertinent data
   * will be deleted.
   */
  Bitloader.prototype.clear = function() {
    Registry.clearById(this.context._id);
  };


  /**
   * Checks is the module has been fully finalized, which is when the module instance
   * get stored in the module registry
   */
  Bitloader.prototype.isModuleCached = function(name) {
    return this.context.modules.hasOwnProperty(name);
  };


  /**
   * Checks if the module instance is in the module registry
   */
  Bitloader.prototype.hasModule = function(name) {
    return this.isModuleCached(name) || this.providers.loader.isLoaded(name);
  };


  /**
   * Returns the module instance if one exists.  If the module instance isn't in the
   * module registry, then a TypeError exception is thrown
   */
  Bitloader.prototype.getModule = function(name) {
    if (!this.hasModule(name)) {
      throw new TypeError("Module `" + name + "` has not yet been loaded");
    }

    if (!this.isModuleCached(name)) {
      this.context.modules[name] = this.providers.loader.buildModule(name);
    }

    return this.context.modules[name];
  };


  /**
   * Add a module instance to the module registry.  And if the module already exists in
   * the module registry, then a TypeError exception is thrown.
   *
   * @param {Module} mod - Module instance to add to the module registry
   *
   * @returns {Module} Module instance added to the registry
   */
  Bitloader.prototype.setModule = function(mod) {
    var name = mod.name;

    if (!(mod instanceof(Module))) {
      throw new TypeError("Module `" + name + "` is not an instance of Module");
    }

    if (this.isModuleCached(name)) {
      throw new TypeError("Module instance `" + name + "` already exists");
    }

    return (this.context.modules[name] = mod);
  };


  /**
   * Returns the module code from the module registry. If the module code has not
   * yet been fully compiled, then we defer to the loader to build the module and
   * return the code.
   *
   * @param {string} name - The name of the module code to get from the module registry
   *
   * @return {generic} The module code.
   */
  Bitloader.prototype.getModuleCode = function(name) {
    if (!this.hasModule(name)) {
      throw new TypeError("Module `" + name + "` has not yet been loaded");
    }

    return this.getModule(name).code;
  };


  /**
   * Sets module code directly in the module registry.
   *
   * @param {string} name - The name of the module, which is used by other modules
   *  that need it as a dependency.
   * @param {generic} code - The actual code that is returned consuming the module
   *  as a dependency.
   *
   * @returns {generic} The module code.
   */
  Bitloader.prototype.setModuleCode = function(name, code) {
    if (this.hasModule(name)) {
      throw new TypeError("Module code for `" + name + "` already exists");
    }

    var mod = new Module({
      name: name,
      code: code
    });

    return this.setModule(mod).code;
  };


  Bitloader.prototype.Promise = Promise;
  Bitloader.prototype.Module  = Module;
  Bitloader.prototype.Utils   = Utils;
  Bitloader.prototype.Logger  = Logger;

  // Expose constructors and utilities
  Bitloader.Promise    = Promise;
  Bitloader.Utils      = Utils;
  Bitloader.Registry   = Registry;
  Bitloader.Loader     = Loader;
  Bitloader.Import     = Import;
  Bitloader.Module     = Module;
  Bitloader.Fetch      = Fetch;
  Bitloader.Middleware = Middleware;
  Bitloader.Logger     = Logger;
  module.exports       = Bitloader;
})();

},{"./fetch":3,"./import":4,"./loader":5,"./logger":6,"./middleware":12,"./module":13,"./registry":16,"./utils":18,"spromise":1}],3:[function(require,module,exports){
(function() {
  "use strict";

  function Fetch() {
  }

  Fetch.prototype.fetch = function(/*name*/) {
    throw new TypeError("Not implemented, must be implemented by the consumer code");
  };

  module.exports = Fetch;
})();

},{}],4:[function(require,module,exports){
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
      else if (manager.hasModule(name)) {
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
      function getModuleCode(mod) {
        if (name !== mod.name) {
          throw new TypeError("Module name must be the same as the name used for loading the Module itself");
        }

        importer.removeModule(mod.name);
        return manager.getModuleCode(mod.name);
      }

      return manager.load(name).then(getModuleCode, Utils.forwardError);
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

},{"./stateful-items":17,"./utils":18,"spromise":1}],5:[function(require,module,exports){
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
    this.pipeline = new Pipeline([metaTransform, metaDependencies]);
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

    return loader
      .fetch(name, parentMeta)
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

    if (manager.hasModule(name)) {
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
   * Utility helper that runs a module meta object through the transformation workflow.
   * The module meta object passed *must* have a string source property, which is what
   * the transformation workflow primarily operates against.
   *
   * @param {object} moduleMeta - Module meta object with require `source` property that
   *  is processed by the transformation pipeline.
   *
   * @returns {Promise} That when resolved, the fully tranformed module meta is returned.
   *
   */
  Loader.prototype.transform = function(moduleMeta) {
    if (!moduleMeta) {
      throw new TypeError("Must provide a module meta object");
    }

    if (typeof(moduleMeta.source) !== "string") {
      throw new TypeError("Must provide a source string property with the content to transform");
    }

    moduleMeta.deps = moduleMeta.deps || [];
    return metaTransform(this.manager, moduleMeta);
  };


  /**
   * Put a module meta object through the pipeline, which includes the transformation
   * and dependency loading stages.
   *
   * @param {object} moduleMeta - Module meta object to run through the pipeline
   * @returns {Promise} that when fulfilled, the processed module meta object is returned.
   */
  Loader.prototype.pipelineModuleMeta = function(moduleMeta) {
    if (!metaValidation(this.manager, moduleMeta)) {
      return Promise.resolve(moduleMeta);
    }

    return this.pipeline
      .run(this.manager, moduleMeta)
      .then(function pipelineFinished() {
        return moduleMeta;
      }, Utils.forwardError);
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

},{"./meta/compilation":7,"./meta/dependencies":8,"./meta/fetch":9,"./meta/transform":10,"./meta/validation":11,"./module/linker":14,"./pipeline":15,"./stateful-items":17,"./utils":18,"spromise":1}],6:[function(require,module,exports){
var _enabled = false,
    _only    = false;

function getDate() {
  return (new Date()).getTime();
}

function Logger(name) {
  this.name = name;
  this._enabled = true;
}

Logger.prototype.factory = function(name) {
  return new Logger(name);
};

Logger.prototype.log = function() {
  if (!this.isEnabled()) {
    return;
  }

  console.log.apply(console, [getDate(), this.name].concat(arguments));
};

Logger.prototype.dir = function() {
  if (!this.isEnabled()) {
    return;
  }

  console.dir.apply(console, arguments);
};

Logger.prototype.error = function() {
  if (!this.isEnabled()) {
    return;
  }

  console.error.apply(console, arguments);
};

Logger.prototype.isEnabled = function() {
  return this._enabled && _enabled && (!_only || _only === this.name);
};

Logger.prototype.enable = function() {
  this._enabled = true;
};

Logger.prototype.disable = function() {
  this._enabled = false;
};

Logger.prototype.only = function() {
  Logger._only = this.name;
};

Logger.prototype.all = function() {
  Logger._only = null;
};

Logger.prototype.disableAll = function() {
  Logger.disable();
};

Logger.prototype.enableAll = function() {
  Logger.enable();
};


// Expose the constructor to be able to create new instances from an
// existing instance.
Logger.prototype.Logger = Logger;
Logger._enabled = typeof(console) !== 'undefined';
Logger.enable  = function() {
  _enabled = true;
};

Logger.disable = function() {
  _enabled = false;
};

Logger.only = function(name) {
  _only = name;
};

module.exports = new Logger();

},{}],7:[function(require,module,exports){
(function() {
  "use strict";

  var Module = require('../module'),
      Logger = require('../logger'),
      logger = Logger.factory("Meta/Compilation");

  function compile(moduleMeta) {
    var mod;

    if (moduleMeta.hasOwnProperty("code")) {
      mod = new Module(moduleMeta);
    }
    else if (typeof(moduleMeta.compile) === 'function') {
      mod = moduleMeta.compile();
    }

    // We will coerce the name no matter what name (if one at all) the Module was
    // created with. This will ensure a consistent state in the loading engine.
    mod.name = moduleMeta.name;
    return mod;
  }

  /**
   * The compile step is to convert the moduleMeta to an instance of Module. The
   * fetch provider is in charge of adding the compile interface in the moduleMeta
   * as that is the place with the most knowledge about how the module was loaded
   * from the server/local file system.
   */
  function MetaCompilation(manager, moduleMeta) {
    logger.log(moduleMeta.name, moduleMeta);

    var mod     = compile(moduleMeta),
        modules = mod.modules || {};

    // Copy modules over to the modules bucket if it does not exist. Anything
    // that has already been loaded will get ignored.
    for (var item in modules) {
      if (modules.hasOwnProperty(item) && !manager.hasModule(item) && mod.name !== item) {
        manager.setModule(modules[item]);
      }
    }

    mod.deps = mod.deps.concat(moduleMeta.deps);
    mod.meta = moduleMeta;
    return mod;
  }

  module.exports = MetaCompilation;
})();

},{"../logger":6,"../module":13}],8:[function(require,module,exports){
(function() {
  "use strict";

  var Logger = require('../logger'),
      logger = Logger.factory("Meta/Dependencies");

  /**
   * Loads up all dependencies for the module
   *
   * @returns {Function} callback to call with the Module instance with the
   *   dependencies to be resolved
   */
  function MetaDependencies(manager, moduleMeta) {
    logger.log(moduleMeta.name, moduleMeta);

    // Return if the module has no dependencies
    if (!moduleMeta.deps || !moduleMeta.deps.length) {
      return manager.Promise.resolve(moduleMeta);
    }

    var loading = moduleMeta.deps.map(function fetchDependency(mod_name) {
      return manager.providers.loader.fetch(mod_name, moduleMeta);
    });

    return manager.Promise.all(loading)
      .then(function dependenciesFetched() {return moduleMeta;}, manager.Utils.forwardError);
  }

  module.exports = MetaDependencies;
})();

},{"../logger":6}],9:[function(require,module,exports){
(function() {
  "use strict";

  var Promise = require('spromise'),
      Logger  = require('../logger'),
      Utils   = require('../utils'),
      logger  = Logger.factory("Meta/Fetch");

  function MetaFetch(manager, name, parentMeta) {
    logger.log(name);
    return Promise.resolve(manager.fetch(name, parentMeta))
      .then(moduleFetched, Utils.forwardError);

    // Once the module meta is fetched, we want to add helper properties
    // to it to facilitate further processing.
    function moduleFetched(moduleMeta) {
      manager.Module.MetaValidation(moduleMeta);

      if (!moduleMeta.name) {
        moduleMeta.name = name;
      }

      moduleMeta.deps    = moduleMeta.deps || [];
      moduleMeta.manager = manager;
      return moduleMeta;
    }
  }

  module.exports = MetaFetch;
})();

},{"../logger":6,"../utils":18,"spromise":1}],10:[function(require,module,exports){
(function() {
  "use strict";

  var Logger = require('../logger'),
      logger = Logger.factory("Meta/Tranform");

  /**
   * The transform enables transformation providers to process the moduleMeta
   * before it is compiled into an actual Module instance.  This is where steps
   * such as linting and processing coffee files can take place.
   */
  function MetaTransform(manager, moduleMeta) {
    logger.log(moduleMeta.name, moduleMeta);
    return manager.transform.runAll(moduleMeta)
      .then(function() {
        return moduleMeta;
      }, manager.Utils.forwardError);
  }

  module.exports = MetaTransform;
})();

},{"../logger":6}],11:[function(require,module,exports){
(function() {
  "use strict";

  /**
   * Simple validation hook to make sure the module meta object can be
   * pushed through the loader pipeline.
   */
  function MetaValidation(manager, moduleMeta) {
    return !moduleMeta.hasOwnProperty("code");
  }

  module.exports = MetaValidation;
})();

},{}],12:[function(require,module,exports){
(function() {
  "use strict";

  var Promise = require('spromise'),
      Logger  = require('./logger'),
      Utils   = require('./utils');

  var logger = Logger.factory("Middleware");

  /**
   * @constructor For checking middleware provider instances
   */
  function Provider() {
  }


  /**
   * Middleware provides a mechanism for registering `plugins` that can be
   * called in the order in which they are registered.  These middlewares can
   * be module names that can be loaded at runtime or can be functions.
   */
  function Middleware(manager) {
    this.manager   = manager;
    this.providers = [];
    this.named     = {};
  }


  /**
   * Method to register middleware providers.  Providers can be methods, a module
   * name, or an object with a method in it called `handler`.  If the provider is
   * is a module name, then it will be loaded dynamically. These providers will also
   * be registered as `named` providers, which are providers.  Named providers are
   * those that can be executed by name.  For example, you can say `middleware.run("concat");`
   * Registering a provider that is function will just be an `anonymouse` provider
   * and will only execute when running the entire chain of providers.  When passing
   * in an object, you will need to define a method `handler`. But you can optionally
   * pass in a name, which will cause the provider to be registered as a `named`
   * provider.
   *
   * @param {Object | Array<Object>} providers - One or collection of providers to
   *   be registered in this middleware manager instance.
   *
   *
   * For example, the provider below is just a method that will get invoked when
   * running the entire sequence of providers.
   *
   * ``` javascript
   * middleware.use(function() {
   *   console.log("1");
   * });
   * ```
   *
   * But registering a provider as a name will cause the middleware engine to
   * dynamically load it, and can also be executed with `run("concat")` which
   * runs only the provider `concat` rather than the entire chain.
   *
   * ``` javascript
   * middleware.use(`concat`);
   * ```
   *
   * The alternative for registering `named` providers is to pass in a `Object` with a
   * `handler` method and a `name`.  The name is only required if you are interested in
   * more control for executing the provider.
   *
   * ``` javascript
   * middleware.use({
   *  name: "concat",
   *  handler: function() {
   *  }
   * });
   * ```
   */
  Middleware.prototype.use = function(providers) {
    if (!Utils.isArray(providers)) {
      providers = [providers];
    }

    for (var provider in providers) {
      if (providers.hasOwnProperty(provider)) {
        provider = this.configure(providers[provider]);
        this.providers.push(provider);

        if (Utils.isString(provider.name)) {
          this.named[provider.name] = provider;
        }
      }
    }
  };


  /**
   * Method that runs `named` providers.  You can pass in a name of the provider
   * to be executed or an array of names.  If passing in an array, the order in
   * array is the order in which they will be ran; regardless of the order in
   * which they were registered.
   *
   * When a provider is executed, it can terminate the execution sequence by
   * returning a value.  You can also `throw` to teminate the execution. Otherwise
   * the sequence will run for as long as no poviders return anything.
   *
   * The only thing a provider can return is a promise, which is really useful
   * if the provider needs to do some work asynchronously.
   *
   * @param {string | Array<string>} names - Name(s) of the providers to run
   *
   * @returns {Promise}
   */
  Middleware.prototype.run = function(names) {
    if (Utils.isString(names)) {
      names = [names];
    }

    if (!Utils.isArray(names)) {
      throw new TypeError("List of handlers must be a string or an array of names");
    }

    var i, length;
    var handlers = [];

    for (i = 0, length = names.length; i < length; i++) {
      handlers.push(this.named[names[i]]);
    }

    return _runProviders(handlers, Array.prototype.slice.call(arguments, 1));
  };


  /**
   * Method to run all registered providers in the order in which they were
   * registered.
   *
   * @returns {Promise}
   */
  Middleware.prototype.runAll = function() {
    return _runProviders(this.providers, arguments);
  };


  /**
   * Method to normalize provider settings to proper provider objects that can
   * be used by the middleware manager.
   */
  Middleware.prototype.configure = function(options) {
    var provider = new Provider();

    if (Utils.isFunction(options)) {
      provider.handler = options;
    }
    else if (Utils.isString(options)) {
      provider.name    = options;
      provider.handler = _deferred(this, provider);
    }
    else if (Utils.isPlainObject(options)) {
      if (!Utils.isFunction(options.handler)) {
        if (!Utils.isString(options.name)) {
          throw new TypeError("Middleware provider must have a handler method or a name");
        }

        provider.handler = _deferred(this, provider);
      }

      Utils.merge(provider, options);
    }

    provider.settings = provider.settings || {};
    return provider;
  };


  /**
   * Convenience method to allow registration of providers by calling the middleware
   * manager itself rather than the use method.
   *
   * E.g.
   *
   * middleware(function() {
   * })
   *
   * vs.
   *
   * middleware.use(function() {
   * });
   *
   */
  Middleware.factory = function(manager) {
    var middleware = new Middleware(manager);

    function instance(provider) {
      middleware.use(provider);
    }

    instance.use    = middleware.use.bind(middleware);
    instance.run    = middleware.run.bind(middleware);
    instance.runAll = middleware.runAll.bind(middleware);
    return Utils.extend(instance, middleware);
  };


  Middleware.Provider = Provider;


  /**
   * @private
   * Method that enables chaining in providers that have to be dynamically loaded.
   */
  function _deferred(middleware, provider) {
    return function deferredTransform() {
      var args = arguments;
      provider.__pending = true;

      logger.log("import [start]", provider);
      provider.handler = middleware.manager.import(provider.name)
        .then(function transformReady(handler) {
          logger.log("import [end]", provider);
          delete provider.__pending;
          provider.handler = handler;
          return handler.apply(provider, args);
        });

      provider.handler.name = provider.name;
      return provider.handler;
    };
  }


  /**
   * @private
   * Method that runs a cancellable sequence of promises.
   */
  function _runProviders(providers, data) {
    var cancelled = false;

    return providers.reduce(function(prev, curr) {
      return prev.then(function(next) {
        if (next === false) {
          cancelled = true;
        }

        if (!cancelled && !curr.__pending) {
          logger.log("transformation", curr.name);
          return curr.handler.apply(curr, data);
        }
      }, function(err) {
        cancelled = true;
        return err;
      });
    }, Promise.resolve());
  }


  module.exports = Middleware;
})();

},{"./logger":6,"./utils":18,"spromise":1}],13:[function(require,module,exports){
(function() {
  "use strict";

  var Utils = require('./utils');

  var Type = {
    "UNKNOWN" : "UNKNOWN",
    "AMD"     : "AMD",     //Asynchronous Module Definition
    "CJS"     : "CJS",     //CommonJS
    "IEFF"    : "IEFF"     //Immediately Executed Factory Function
  };


  function Module(options) {
    if (!options) {
      throw new TypeError("Must provide options to create the module");
    }

    if (options.hasOwnProperty("code")) {
      this.code = options.code;
    }

    if (options.hasOwnProperty("factory")) {
      this.factory = options.factory;
    }

    this.type     = options.type || Type.UNKNOWN;
    this.name     = options.name;
    this.deps     = options.deps ? options.deps.slice(0) : [];
    this.settings = Utils.extend({}, options);
  }


  function MetaValidation(options) {
    if (!options) {
      throw new TypeError("Must provide options");
    }

    if (!MetaValidation.hasCode(options) && !MetaValidation.canCompile(options)) {
      throw new TypeError("ModuleMeta must provide a `source` string and `compile` interface, or `code`.");
    }
  }


  MetaValidation.hasCode = function(options) {
    return options.hasOwnProperty("code");
  };


  MetaValidation.canCompile = function(options) {
    return typeof(options.source) === "string" && typeof(options.compile) === "function";
  };


  Module.MetaValidation = MetaValidation;
  Module.Type = Type;
  module.exports = Module;
})();

},{"./utils":18}],14:[function(require,module,exports){
(function(root) {
  "use strict";

  var Logger = require('../logger'),
      logger = Logger.factory("Module/Linker");

  function ModuleLinker(manager, mod) {
    function traverseDependencies(mod) {
      logger.log(mod.name, mod);

      // Get all dependencies to feed them to the module factory
      var deps = mod.deps.map(function resolveDependency(mod_name) {
        if (manager.hasModule(mod_name)) {
          return manager.getModuleCode(mod_name);
        }

        return traverseDependencies(manager.getModule(mod_name)).code;
      });

      if (mod.factory && !mod.hasOwnProperty("code")) {
        mod.code = mod.factory.apply(root, deps);
      }

      return mod;
    }

    return manager.setModule(traverseDependencies(mod));
  }

  module.exports = ModuleLinker;
})(typeof(window) !== 'undefined' ? window : this);

},{"../logger":6}],15:[function(require,module,exports){
(function() {
  "use strict";

  var Promise = require('spromise');

  function Pipeline(assets) {
    this.assets = assets;
  }

  Pipeline.prototype.run = function() {
    var args = arguments;
    function cb(curr) {
      return function pipelineAssetReady() {
        return curr.apply((void 0), args);
      };
    }

    return this.assets.reduce(function(prev, curr) {
      return prev.then(cb(curr), forwardError);
    }, Promise.resolve());
  };

  function forwardError(error) {
    return error;
  }

  module.exports = Pipeline;
})();

},{"spromise":1}],16:[function(require,module,exports){
(function() {
  "use strict";

  var storage = {};

  function Registry() {
  }

  Registry.getById = function(id) {
    if (!id) {
      id = (new Date()).getTime().toString();
    }

    return storage[id] || (storage[id] = {
      _id     : id,
      code    : {},
      modules : {}
    });
  };

  Registry.clearById = function(id) {
    var _item;
    if (storage.hasOwnProperty(id)) {
      _item = storage[id];
      delete storage[id];
    }
    return _item;
  };

  module.exports = Registry;
})();

},{}],17:[function(require,module,exports){
(function() {
  "use strict";

  function StatefulItems(items) {
    this.items = items || {};
  }


  /**
   * Helper methods for CRUD operations on `items` map for based on their StateTypes
   */


  StatefulItems.prototype.getState = function(name) {
    if (!this.hasItem(name)) {
      throw new TypeError("`" + name + "` not found");
    }

    return this.items[name].state;
  };


  StatefulItems.prototype.hasItemWithState = function(state, name) {
    return this.hasItem(name) && this.items[name].state === state;
  };


  StatefulItems.prototype.hasItem = function(name) {
    return this.items.hasOwnProperty(name);
  };


  StatefulItems.prototype.getItem = function(state, name) {
    if (!this.hasItemWithState(state, name)) {
      throw new TypeError("`" + name + "` is not " + state);
    }

    return this.items[name].item;
  };


  StatefulItems.prototype.setItem = function(state, name, item) {
    return (this.items[name] = {item: item, state: state}).item;
  };


  StatefulItems.prototype.removeItem = function(name) {
    if (!this.items.hasOwnProperty(name)) {
      throw new TypeError("`" + name + "` cannot be removed - not found");
    }

    var item = this.items[name];
    delete this.items[name];
    return item.item;
  };


  module.exports = StatefulItems;
})();

},{}],18:[function(require,module,exports){
(function() {
  "use strict";

  function noop() {
  }

  function isNull(item) {
    return item === null || item === (void 0);
  }

  function isArray(item) {
    return item instanceof(Array);
  }

  function isString(item) {
    return typeof(item) === "string";
  }

  function isObject(item) {
    return typeof(item) === "object";
  }

  function isPlainObject(item) {
    return !!item && !isArray(item) && (item.toString() === "[object Object]");
  }

  function isFunction(item) {
    return !isNull(item) && item.constructor === Function;
  }

  function isDate(item) {
    return item instanceof(Date);
  }

  function result(input, args, context) {
    if (isFunction(input) === "function") {
      return input.apply(context, args||[]);
    }
    return input[args];
  }

  function toArray(items) {
    if (isArray(items)) {
      return items;
    }

    return Object.keys(items).map(function(item) {
      return items[item];
    });
  }

  /**
   * Copies all properties from sources into target
   */
  function extend(target) {
    var source, length, i;
    var sources = Array.prototype.slice.call(arguments, 1);
    target = target || {};

    // Allow n params to be passed in to extend this object
    for (i = 0, length  = sources.length; i < length; i++) {
      source = sources[i];
      for (var property in source) {
        if (source.hasOwnProperty(property)) {
          target[property] = source[property];
        }
      }
    }

    return target;
  }

  /**
   * Deep copy of all properties insrouces into target
   */
  function merge(target) {
    var source, length, i;
    var sources = Array.prototype.slice.call(arguments, 1);
    target = target || {};

    // Allow `n` params to be passed in to extend this object
    for (i = 0, length  = sources.length; i < length; i++) {
      source = sources[i];
      for (var property in source) {
        if (source.hasOwnProperty(property)) {
          if (isPlainObject(source[property])) {
            target[property] = merge(target[property], source[property]);
          }
          else {
            target[property] = source[property];
          }
        }
      }
    }

    return target;
  }


  function printError(error) {
    if (error && !error.handled) {
      error.handled = true;
      if (error.stack) {
        console.log(error.stack);
      }
      else {
        console.error(error);
      }
    }

    return error;
  }


  function forwardError(error) {
    return error;
  }


  module.exports = {
    isNull: isNull,
    isArray: isArray,
    isString: isString,
    isObject: isObject,
    isPlainObject: isPlainObject,
    isFunction: isFunction,
    isDate: isDate,
    toArray: toArray,
    noop: noop,
    result: result,
    extend: extend,
    merge: merge,
    printError: printError,
    forwardError: forwardError
  };
})();

},{}]},{},[2])(2)
});