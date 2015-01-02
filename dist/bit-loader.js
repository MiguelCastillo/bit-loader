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

  var Promise  = require('spromise'),
      Utils    = require('./utils'),
      Import   = require('./import'),
      Loader   = require('./loader'),
      Module   = require('./module'),
      Registry = require('./registry'),
      Fetch    = require('./fetch');

  function BitLoader() {
    this.middlewares = {};
    this.context     = Registry.getById();

    // Override any of these constructors if you need specialized implementation
    var providers = {
      fetch   : new BitLoader.Fetch(this),
      loader  : new BitLoader.Loader(this),
      import  : new BitLoader.Import(this)
    };

    // Expose interfaces
    this.providers = providers;
    this.fetch     = providers.fetch.fetch.bind(providers.fetch);
    this.load      = providers.loader.load.bind(providers.loader);
    this.import    = providers.import.import.bind(providers.import);
  }

  BitLoader.prototype.use = function(name, provider) {
    if (!provider || !provider.handler) {
      throw new TypeError("Must provide a providers with a `handler` interface");
    }

    var middleware = this.middlewares[name] || (this.middlewares[name] = []);

    if (typeof(provider) === "function") {
      provider = {handler: provider};
    }

    middleware.push(provider);
  };

  BitLoader.prototype.run = function(name) {
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

  BitLoader.prototype.clear = function() {
    return Registry.clearById(this.context._id);
  };


  BitLoader.prototype.Promise = Promise;
  BitLoader.prototype.Module  = Module;
  BitLoader.prototype.Utils   = Utils;

  // Expose constructors and utilities
  BitLoader.Promise  = Promise;
  BitLoader.Utils    = Utils;
  BitLoader.Registry = Registry;
  BitLoader.Loader   = Loader;
  BitLoader.Import   = Import;
  BitLoader.Module   = Module;
  BitLoader.Fetch    = Fetch;
  module.exports   = BitLoader;
})();

},{"./fetch":3,"./import":4,"./loader":5,"./module":6,"./registry":7,"./utils":8,"spromise":1}],3:[function(require,module,exports){
(function() {
  "use strict";

  function Fetch() {
  }

  Fetch.prototype.fetch = function(/*name*/) {
    throw new TypeError("Not implemented");
  };

  module.exports = Fetch;
})();

},{}],4:[function(require,module,exports){
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

    this.manager = manager;
    this.context = manager.context || {};

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
        manager  = this.manager,
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
      return (context.modules[name] = manager.load(name)
        .then(validate,               passThroughError)
        .then(dependencies(importer), passThroughError)
        .then(finalize(importer),     passThroughError)
        .then(cache(importer),        passThroughError));
    });

    return Promise.when.apply((void 0), deps).catch(function(error) {
      console.error("===> error", error);
    });
  };

  function passThroughError(error) {
    return error;
  }

  function validate(mod) {
    if (mod instanceof(Module) === false) {
      throw new TypeError("input must be an Instance of Module");
    }
    return mod;
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

},{"./module":6,"spromise":1}],5:[function(require,module,exports){
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

    this.manager = manager;
    this.context = manager.context || {};

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
        manager = this.manager,
        context = this.context;

    if (!name) {
      throw new TypeError("Must provide the name of the module to load");
    }

    // If the context does not have a module with the given name, then we go on to
    // fetch the source and put it through the workflow to create a Module instance.
    if (!context.loaded.hasOwnProperty(name)) {
      // This is where the workflow for fetching, transforming, and compiling happens.
      // It is designed to easily add more steps to the workflow.
      context.loaded[name] = manager.fetch(name)
        .then(validate,          passThroughError)
        .then(transform(loader), passThroughError)
        .then(compile(loader),   passThroughError);
    }

    return Promise.resolve(context.loaded[name]);
  };


  function passThroughError(error) {
    return error;
  }

  /**
   * Method to ensure we have a valid module meta object before we continue on with
   * the rest of the pipeline.
   */
  function validate(moduleMeta) {
    if (!moduleMeta) {
      throw new TypeError("Must provide a ModuleMeta");
    }

    if (!moduleMeta.compile) {
      throw new TypeError("ModuleMeta must provide have a `compile` interface");
    }

    return moduleMeta;
  }

  /**
   * The transform enables transformation providers to process the moduleMeta
   * before it is compiled into an actual Module instance.  This is where steps
   * such as linting and processing coffee files can take place.
   */
  function transform(/*loader*/) {
    return function(moduleMeta) {
      return moduleMeta;
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

},{"spromise":1}],6:[function(require,module,exports){
(function() {
  "use strict";

  var Utils = require('./utils');

  var Type = {
    "AMD" : "AMD", //Asynchronous Module Definition
    "CJS" : "CJS", //CommonJS
    "IEFF": "IEFF" //Immediately Executed Factory Function
  };

  function Module(options) {
    if (!options) {
      throw new TypeError("Must provide options to create the module");
    }

    if (!Type[options.type]) {
      throw new TypeError("Must provide a valid module type. E.g. 'AMD', 'CJS', 'IEFF'.");
    }

    if (options.hasOwnProperty("code")) {
      this.code = options.code;
    }

    if (options.hasOwnProperty("factory")) {
      this.factory = options.factory;
    }

    this.type     = options.type;
    this.name     = options.name;
    this.deps     = options.deps ? options.deps.slice(0) : [];
    this.settings = Utils.merge({}, options);
  }

  Module.Type = Type;
  module.exports = Module;
})();

},{"./utils":8}],7:[function(require,module,exports){
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
      _id       : id,
      loaded    : {},
      modules   : {},
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

},{}],8:[function(require,module,exports){
(function() {
  "use strict";

  function noop() {}

  function isNull(item) {
    return item === null || item === undefined;
  }

  function isArray(item) {
    return item instanceof(Array);
  }

  function isObject(item) {
    return typeof(item) === "object";
  }

  function isPlainObject(item) {
    return !!(item && (item).toString() === "[object Object]");
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

  module.exports = {
    isNull: isNull,
    isArray: isArray,
    isObject: isObject,
    isPlainObject: isPlainObject,
    isFunction: isFunction,
    isDate: isDate,
    noop: noop,
    result: result,
    extend: extend,
    merge: merge
  };
})();

},{}]},{},[2])(2)
});