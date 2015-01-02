!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.bitLoader=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * spromise Copyright (c) 2014 Miguel Castillo.
 * Licensed under MIT
 *
 * https://github.com/MiguelCastillo/spromise
 */

/**
 * @license almond 0.3.0 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */

/**
 * spromise Copyright (c) 2014 Miguel Castillo.
 * Licensed under MIT
 */

(function(e,t){typeof require=="function"&&typeof exports=="object"&&typeof module=="object"?module.exports=t():typeof define=="function"&&define.amd?define(t):e.spromise=t()})(this,function(){var e,t,n;return function(r){function v(e,t){return h.call(e,t)}function m(e,t){var n,r,i,s,o,u,a,f,c,h,p,v=t&&t.split("/"),m=l.map,g=m&&m["*"]||{};if(e&&e.charAt(0)===".")if(t){v=v.slice(0,v.length-1),e=e.split("/"),o=e.length-1,l.nodeIdCompat&&d.test(e[o])&&(e[o]=e[o].replace(d,"")),e=v.concat(e);for(c=0;c<e.length;c+=1){p=e[c];if(p===".")e.splice(c,1),c-=1;else if(p===".."){if(c===1&&(e[2]===".."||e[0]===".."))break;c>0&&(e.splice(c-1,2),c-=2)}}e=e.join("/")}else e.indexOf("./")===0&&(e=e.substring(2));if((v||g)&&m){n=e.split("/");for(c=n.length;c>0;c-=1){r=n.slice(0,c).join("/");if(v)for(h=v.length;h>0;h-=1){i=m[v.slice(0,h).join("/")];if(i){i=i[r];if(i){s=i,u=c;break}}}if(s)break;!a&&g&&g[r]&&(a=g[r],f=c)}!s&&a&&(s=a,u=f),s&&(n.splice(0,u,s),e=n.join("/"))}return e}function g(e,t){return function(){var n=p.call(arguments,0);return typeof n[0]!="string"&&n.length===1&&n.push(null),s.apply(r,n.concat([e,t]))}}function y(e){return function(t){return m(t,e)}}function b(e){return function(t){a[e]=t}}function w(e){if(v(f,e)){var t=f[e];delete f[e],c[e]=!0,i.apply(r,t)}if(!v(a,e)&&!v(c,e))throw new Error("No "+e);return a[e]}function E(e){var t,n=e?e.indexOf("!"):-1;return n>-1&&(t=e.substring(0,n),e=e.substring(n+1,e.length)),[t,e]}function S(e){return function(){return l&&l.config&&l.config[e]||{}}}var i,s,o,u,a={},f={},l={},c={},h=Object.prototype.hasOwnProperty,p=[].slice,d=/\.js$/;o=function(e,t){var n,r=E(e),i=r[0];return e=r[1],i&&(i=m(i,t),n=w(i)),i?n&&n.normalize?e=n.normalize(e,y(t)):e=m(e,t):(e=m(e,t),r=E(e),i=r[0],e=r[1],i&&(n=w(i))),{f:i?i+"!"+e:e,n:e,pr:i,p:n}},u={require:function(e){return g(e)},exports:function(e){var t=a[e];return typeof t!="undefined"?t:a[e]={}},module:function(e){return{id:e,uri:"",exports:a[e],config:S(e)}}},i=function(e,t,n,i){var s,l,h,p,d,m=[],y=typeof n,E;i=i||e;if(y==="undefined"||y==="function"){t=!t.length&&n.length?["require","exports","module"]:t;for(d=0;d<t.length;d+=1){p=o(t[d],i),l=p.f;if(l==="require")m[d]=u.require(e);else if(l==="exports")m[d]=u.exports(e),E=!0;else if(l==="module")s=m[d]=u.module(e);else if(v(a,l)||v(f,l)||v(c,l))m[d]=w(l);else{if(!p.p)throw new Error(e+" missing "+l);p.p.load(p.n,g(i,!0),b(l),{}),m[d]=a[l]}}h=n?n.apply(a[e],m):undefined;if(e)if(s&&s.exports!==r&&s.exports!==a[e])a[e]=s.exports;else if(h!==r||!E)a[e]=h}else e&&(a[e]=n)},e=t=s=function(e,t,n,a,f){if(typeof e=="string")return u[e]?u[e](t):w(o(e,t).f);if(!e.splice){l=e,l.deps&&s(l.deps,l.callback);if(!t)return;t.splice?(e=t,t=n,n=null):e=r}return t=t||function(){},typeof n=="function"&&(n=a,a=f),a?i(r,e,t,n):setTimeout(function(){i(r,e,t,n)},4),s},s.config=function(e){return s(e)},e._defined=a,n=function(e,t,n){t.splice||(n=t,t=[]),!v(a,e)&&!v(f,e)&&(f[e]=[e,t,n])},n.amd={jQuery:!0}}(),n("lib/almond/almond",function(){}),n("src/async",[],function(){function n(e){t(e)}var e=this,t;return e.setImmediate?t=e.setImmediate:e.process&&typeof e.process.nextTick=="function"?t=e.process.nextTick:t=function(t){e.setTimeout(t,0)},n.delay=function(t,n,r){e.setTimeout(t.apply.bind(t,this,r||[]),n)},n}),n("src/promise",["src/async"],function(e){function r(e,n){function o(e,t){return n.then(e,t)}function u(){return n.transition(t.resolved,this,arguments),s}function a(){return n.transition(t.rejected,this,arguments),s}if(this instanceof r==0)return new r(e,n);var s=this;n instanceof i==0&&(n=new i),o.constructor=r,o.stateManager=n,s.resolve=u,s.reject=a,s.then=o,s.promise={then:o,always:this.always,done:this.done,"catch":this.fail,fail:this.fail,notify:this.notify,state:this.state},s.promise.promise=s.promise,typeof e=="function"&&e.call(s,s.resolve,s.reject)}function i(e){this.state=t.pending,e&&e.state&&this.transition(e.state,e.context,e.value)}function s(e){this.promise=e||new r}var t={pending:0,always:1,resolved:2,rejected:3,notify:4},n=["pending","","resolved","rejected",""];return r.prototype.delay=function(t){var n=this;return new r(function(r,i){n.then(function(){e.delay(r.bind(this),t,arguments)},i.bind(this))})},r.prototype.always=function(n){return this.then.stateManager.enqueue(t.always,n),this.promise},r.prototype.done=function(n){return this.then.stateManager.enqueue(t.resolved,n),this.promise},r.prototype.fail=r.prototype.catch=function(n){return this.then.stateManager.enqueue(t.rejected,n),this.promise},r.prototype.notify=function(n){return this.then.stateManager.enqueue(t.notify,n),this.promise},r.prototype.state=function(){return n[this.then.stateManager.state]},r.prototype.isPending=function(){return this.then.stateManager.state===t.pending},r.prototype.isResolved=function(){return this.then.stateManager.state===t.resolved},r.prototype.isRejected=function(){return this.then.stateManager.state===t.resolved},r.defer=function(){return new r},r.reject=function(){return new r(null,new i({context:this,value:arguments,state:t.rejected}))},r.resolve=r.thenable=function(e){return e instanceof r?e:e&&typeof e.then=="function"?new r(e.then):new r(null,new i({context:this,value:arguments,state:t.resolved}))},r.delay=function(n){var i=Array.prototype.slice(arguments,1);return new r(function(t){e.delay(t.bind(this),n,i)})},i.prototype.enqueue=function(n,r,i){var s=this.state;s?s===n||t.always===n?i?r.apply(this.context,this.value):e(r.apply.bind(r,this.context,this.value)):t.notify===n&&(i?r.call(this.context,this.state,this.value):e(r.call.bind(r,this.context,this.state,this.value))):(this.queue||(this.queue=[])).push({state:n,cb:r})},i.prototype.transition=function(e,t,n,r){if(this.state)return;this.state=e,this.context=t,this.value=n;if(this.queue){var i=this.queue,s=i.length,o=0,u;this.queue=null;while(o<s)u=i[o++],this.enqueue(u.state,u.cb,r)}},i.prototype.then=function(e,n){e=typeof e=="function"?e:null,n=typeof n=="function"?n:null;if(!e&&this.state===t.resolved||!n&&this.state===t.rejected)return new r(null,this);var i=new s;return this.enqueue(t.notify,e||n?i.resolve(e,n):i.notify()),i.promise},s.prototype.resolve=function(e,n){var r=this;return function(s,o){var u=s===t.resolved?e||n:n||e;try{r.context=this,r.finalize(s,[u.apply(this,o)])}catch(a){r.promise.reject.call(r.context,a)}}},s.prototype.notify=function(){var e=this;return function(n,r){try{e.context=this,e.finalize(n,r)}catch(i){e.promise.reject.call(e.context,i)}}},s.prototype.chain=function(e){var t=this;return function(){try{t.resolved||(t.resolved=!0,t.context=this,t.finalize(e,arguments))}catch(r){t.promise.reject.call(t.context,r)}}},s.prototype.finalize=function(e,n){var i=n[0],o=i&&i.then,u=this.promise,a=this.context,f,l;if(i===this.promise)throw new TypeError("Resolution input must not be the promise being resolved");if(o&&o.constructor===r){o.stateManager.enqueue(t.notify,this.notify(),!0);return}l=typeof o=="function"?typeof i:null;if(l==="function"||l==="object")try{f=new s(u),o.call(i,f.chain(t.resolved),f.chain(t.rejected))}catch(c){f.resolved||u.reject.call(a,c)}else u.then.stateManager.transition(e,a,n,!0)},r.states=t,r}),n("src/all",["src/promise","src/async"],function(e,t){function n(e,t,n){return typeof e=="function"?e.apply(n,t||[]):e}function r(r){function a(){u--,u||s.resolve.call(o,i)}function f(e){return function(){i[e]=arguments.length===1?arguments[0]:arguments,a()}}function l(){var e,t,o;for(e=0,o=u;e<o;e++)t=r[e],t&&typeof t.then=="function"?t.then(f(e),s.reject):(i[e]=n(t),a())}r=r||[];var i=[],s=e.defer(),o=this,u=r.length;return r.length?(t(l),s):s.resolve(r)}return r}),n("src/when",["src/promise","src/all"],function(e,t){function n(){var n=this,r=arguments;return e(function(e,i){t.call(n,r).then(function(t){e.apply(n,t)},function(e){i.call(n,e)})})}return n}),n("src/spromise",["src/promise","src/async","src/when","src/all"],function(e,t,n,r){return e.async=t,e.when=n,e.all=r,e}),t("src/spromise")});
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

  function MLoader() {
    this.middlewares = {};
    this.context     = Registry.getById();

    // Override any of these constructors if you need specialized implementation
    var providers = {
      fetch   : new MLoader.Fetch(this),
      loader  : new MLoader.Loader(this),
      import  : new MLoader.Import(this)
    };

    // Expose interfaces
    this.providers = providers;
    this.fetch     = providers.fetch.fetch.bind(providers.fetch);
    this.load      = providers.loader.load.bind(providers.loader);
    this.import    = providers.import.import.bind(providers.import);
  }

  MLoader.prototype.use = function(name, provider) {
    if (!provider || !provider.handler) {
      throw new TypeError("Must provide a providers with a `handler` interface");
    }

    var middleware = this.middlewares[name] || (this.middlewares[name] = []);

    if (typeof(provider) === "function") {
      provider = {handler: provider};
    }

    middleware.push(provider);
  };

  MLoader.prototype.run = function(name) {
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

  MLoader.prototype.clear = function() {
    return Registry.clearById(this.context._id);
  };


  MLoader.prototype.Promise = Promise;
  MLoader.prototype.Module  = Module;
  MLoader.prototype.Utils   = Utils;

  // Expose constructors and utilities
  MLoader.Promise  = Promise;
  MLoader.Utils    = Utils;
  MLoader.Registry = Registry;
  MLoader.Loader   = Loader;
  MLoader.Import   = Import;
  MLoader.Module   = Module;
  MLoader.Fetch    = Fetch;
  module.exports   = MLoader;
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