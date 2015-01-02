!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.MLoader=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
(function() {
  "use strict";

  var Promise = require('spromise');

  var readyStates = {
    UNSENT           : 0, // open()has not been called yet.
    OPENED           : 1, // send()has not been called yet.
    HEADERS_RECEIVED : 2, // send() has been called, and headers and status are available.
    LOADING          : 3, // Downloading; responseText holds partial data.
    DONE             : 4  // The operation is complete.
  };


  function Ajax(options) {
    if (typeof(options) === "string") {
      options = {url: options};
    }

    var deferred     = Promise.defer();
    var request      = new XMLHttpRequest(),
        method       = options.method || "GET",
        url          = options.url,
        async        = options.async || true,
        user         = options.user,
        password     = options.password,
        data         = options.data || null,
        headers      = options.headers || {};

    if (!url) {
      throw new TypeError("Must provide a URL");
    }

    for (var header in headers) {
      if (headers.hasOwnProperty(header)) {
        request.setRequestHeader(header, headers[header]);
      }
    }

    if (async) {
      request.onreadystatechange = StateChanged.bind(request, options, deferred);
    }

    // Send request
    request.open(method, url, async, user, password);
    request.send(data);

    if (!async) {
      StateChanged.call(request, options, deferred);
    }

    return deferred.promise;
  }


  function StateChanged(options, deferred) {
    var request = this,
        state = request.readyState;

    if (state === readyStates.DONE) {
      if (request.status === 200) {
        var result = (options.transform || transform)(request.responseText, options.responseType);
        deferred.resolve(result, request);
      }
      else {
        deferred.reject(request);
      }
    }
  }


  function transform(text, type) {
    if (type === 'json') {
      return JSON.parse(text);
    }

    return text;
  }


  module.exports = Ajax;
})();

},{"spromise":1}],3:[function(require,module,exports){
(function(root) {
  "use strict";

  var Module   = require('./module'),
      Registry = require('./registry');

  function Define(manager) {
    this.manager = manager;
    this.context = (manager && manager.context) || Registry.getById();
  }

  /**
   * AMD compliant define interface
   * Defines a module to be loaded and consumed by other modules.  Two types of modules
   * come through here, named and anonymous.
   */
  Define.prototype.define = function () {
    var _module = Define.adapters.apply({}, arguments),
        context = Define.getGlobalModule();

    if (_module.name) {
      // Do no allow modules to override other modules...
      if (context.modules.hasOwnProperty(_module.name)) {
        throw new Error("Module " + _module.name + " is already defined");
      }
      else {
        context.modules[_module.name] = _module;
      }
    }
    else {
      context.anonymous.push(_module);
    }
  };

  /**
   * Adapter interfaces to define modules
   */
  Define.adapters = function (name, deps, factory) {
    var signature = ["", typeof name, typeof deps, typeof factory].join("/");
    var adapter   = Define.adapters[signature];

    if (!adapter) {
      throw new TypeError("Module define signature isn't valid: " + signature);
    }

    return adapter.apply(this, arguments);
  };

  Define.adapters.create = function (name, deps, factory) {
    var mod = {
      type: Module.Type.AMD,
      cjs: [],
      name: name,
      deps: deps
    };

    if (typeof(factory) === "function") {
      mod.factory = factory;
      mod.source  = factory.toString();
    }
    else {
      mod.code = factory;
    }

    return new Module(mod);
  };

  Define.adapters["/string/object/function"]        = function (name, deps, factory) { return Define.adapters.create(name, deps, factory); };
  Define.adapters["/string/function/undefined"]     = function (name, factory)       { return Define.adapters.create(name, [], factory); };
  Define.adapters["/object/function/undefined"]     = function (deps, factory)       { return Define.adapters.create(undefined, deps, factory); };
  Define.adapters["/object/undefined/undefined"]    = function (data)                { return Define.adapters.create(undefined, [], data); };
  Define.adapters["/string/object/undefined"]       = Define.adapters["/string/function/undefined"];
  Define.adapters["/function/undefined/undefined"]  = Define.adapters["/object/undefined/undefined"];
  Define.adapters["/string/undefined/undefined"]    = Define.adapters["/object/undefined/undefined"];
  Define.adapters["/number/undefined/undefined"]    = Define.adapters["/object/undefined/undefined"];
  Define.adapters["/undefined/undefined/undefined"] = Define.adapters["/object/undefined/undefined"];

  Define.getGlobalModule = function() {
    if (!root.DefineGlobalModule) {
      root.DefineGlobalModule = {
        modules: {},
        anonymous: []
      };
    }

    return root.DefineGlobalModule;
  };

  Define.clearGlobalModule = function() {
    var _module = root.DefineGlobalModule;
    root.DefineGlobalModule = null;
    return _module;
  };

  Define.compile = function(moduleMeta) {
    var loaded  = moduleMeta.loaded,
        modules = loaded.modules,
        mod     = modules[moduleMeta.name];

    // Check if the module was loaded as a named module or an anonymous module.
    // If it was loaded as an anonymous module, then we need to manually add it
    // the list of named modules
    if (!mod && loaded.anonymous && loaded.anonymous.length) {
      mod      = loaded.anonymous.shift();
      mod.name = moduleMeta.name;

      // Make module available as pending resolution so that it can be loaded
      // whenever it is requested as dependency.
      modules[mod.name] = mod;
    }

    return modules[mod.name];
  };

  module.exports = Define;
})(typeof(window) !== 'undefined' ? window : this);

},{"./module":9,"./registry":10}],4:[function(require,module,exports){
(function() {
  "use strict";

  var Ajax   = require('./ajax'),
      Define = require('./define');

  function Fetch(moduleMeta) {
    var _url = moduleMeta.file.toUrl();

    return (new Ajax(_url)).then(function(source) {
      moduleMeta.source  = source;
      moduleMeta.compile = function() {
        var __header = "",
            __footer = "",
            __module = {exports: {}};

        //__header += "'use strict';"; // Make this optional
        //__header += "debugger;";     // Make this optional
        __footer += ";//# sourceURL=" + _url;

        /* jshint -W061, -W054 */
        (new Function("module", __header + source + __footer))(__module);
        //(new Function("module", "exports", __header + source + __footer))(__module, __module.exports);
        /* jshint +W061, +W054 */

        moduleMeta.loaded = Define.clearGlobalModule();
        return Define.compile(moduleMeta);
      };

      return moduleMeta;
    });
  }

  module.exports = Fetch;
})();

},{"./ajax":2,"./define":3}],5:[function(require,module,exports){
(function() {
  "use strict";

  function File (fileUri, baseUri) {
    var fileName, mergedPath;
    baseUri = baseUri || "";
    fileUri = File.parseUri(fileUri);

    if (fileUri.protocol || !baseUri) {
      fileName = File.parseFileName(fileUri.path);
    }
    else {
      baseUri    = File.parseUri(baseUri);
      mergedPath = File.mergePaths(fileUri.path, baseUri ? baseUri.path : "/");
      fileName   = File.parseFileName(mergedPath);
    }

    this._file    = fileUri;
    this.protocol = fileUri.protocol ? fileUri.protocol + fileUri.protocolmark : undefined;
    this.name     = fileName.name;
    this.path     = fileName.path;
  }

  File.prototype.toUrl = function (extension) {
    var file = this;
    return (file.protocol || "") + (file.path || "") + file.name + (extension || ".js");
  };

  /**
   * Parses out uri
   */
  File.parseUri = function(uriString) {
    if (!uriString) {
      throw new Error("Must provide a string to parse");
    }

    if (File.isHttpProtocol(uriString)) {
      return File.parseHttpProtocol(uriString);
    }
    else {
      return File.parseFileProtocol(uriString);
    }
  };

  /**
   * Parses out the string into file components
   * return {object} file object
   */
  File.parseFileProtocol = function (uriString) {
    var uriParts = /^(?:(file:)(\/\/\/?))?(([A-Za-z-]+:)?[/\\d\w\.\s-]+)/gmi.exec(uriString);
    uriParts.shift();

    // Make sure we sanitize the slashes
    if (uriParts[2]) {
      uriParts[2] = File.normalize(uriParts[2]);
    }

    return {
      protocol: uriParts[0],
      protocolmark: uriParts[1],
      path: uriParts[2],
      drive: uriParts[3],
      href: uriString,
      uriParts: uriParts
    };
  };

  /**
   * Parses out a string into an http url
   * @return {object} url object
   */
  File.parseHttpProtocol = function (uriString) {
    var uriParts = /^((https?:)(\/\/)([\d\w\.-]+)(?::(\d+))?)?([\/\\\w\.()-]*)?(?:([?][^#]*)?(#.*)?)*/gmi.exec(uriString);
    uriParts.shift();

    // Make sure we sanitize the slashes
    if (uriParts[5]) {
      uriParts[5] = File.normalize(uriParts[5]);
    }

    return {
      origin: uriParts[0],
      protocol: uriParts[1],
      protocolmark: uriParts[2],
      hostname: uriParts[3],
      port: uriParts[4],
      path: uriParts[5],
      search: uriParts[6],
      hash: uriParts[7],
      href: uriString,
      uriParts: uriParts
    };
  };

  /**
   * Tests if a uri has a protocol
   * @return {boolean} if the uri has a protocol
   */
  File.hasProtocol = function (path) {
    return /^(?:(https?|file)(:\/\/\/?))/g.test(path) === false;
  };

  /**
   * Test is the input constains the file protocol delimiter.
   * @return {boolean} True is it is a file protocol, othterwise false
   */
  File.isFileProtocol = function (protocolString) {
    return /^file:/gmi.test(protocolString);
  };

  /**
   * Test is the input constains the http/https protocol delimiter.
   * @return {boolean} True is it is an http protocol, othterwise false
   */
  File.isHttpProtocol = function (protocolString) {
    return /^https?:/gmi.test(protocolString);
  };

  /**
   * Build and file object with the important pieces
   */
  File.parseFileName = function (fileString) {
    var fileName;
    var pathName = fileString.replace(/([^/]+)$/gmi, function(match) {
      fileName = match;
      return "";
    });

    return {
      name: fileName,
      path: pathName
    };
  };

  /**
   * Removes all forward and back slashes to forward slashes as well as all duplicates slashes
   * and resolve all . and .. in the path.
   * @param {string} path - Path to normalize
   * @return {string} path with only one forward slash a path delimters
   */
  File.normalize = function (path) {
    var pathParts = path.replace(/[\\/]+/g, "/").split("/"),
        pathCount = pathParts.length - 1,
        skip      = 0,
        newPath   = [];

    while (pathCount >= 0) {
      if (pathCount > 0) {
        if (pathParts[pathCount] === "..") {
          pathCount -= 1; skip++; continue;
        }
        else if (pathParts[pathCount] === ".") {
          pathCount -= 1; continue;
        }
      }

      if (skip) {
        pathCount -= skip;
        skip = 0;
      }

      newPath.unshift(pathParts[pathCount]);
      pathCount--;
    }

    return newPath.join('/');
  };

  /**
   * Merges a path with a base.  This is used for handling relative paths.
   * @return {string} Merge path
   */
  File.mergePaths = function (path, base) {
    if (path[0] === '/') {
      return File.normalize(path);
    }

    if (base && path) {
      path = base + "/" + path;
    }
    else {
      path = path || base;
    }

    return File.normalize(path);
  };

  module.exports = File;
})();

},{}],6:[function(require,module,exports){
(function(root) {
  "use strict";

  var Registry = require('./registry'),
      Promise  = require('spromise');

  /**
   * Module importer.  Primary function is to load Module instances and resolving
   * their dependencies in order to make the Module fully consumable.
   */
  function Import(manager) {
    this.manager = manager;
    this.context = (manager && manager.context) || Registry.getById();
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
    var loader  = this,
        manager = this.manager,
        context = this.context;

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
      return (context.modules[name] = manager
        .load(name)
        .then(dependencies(loader))
        .then(finalize(loader))
        .then(cache(loader)));
    });

    return Promise.when.apply((void 0), deps).fail(function(error) {
      console.error("===> error", error);
    });
  };

  /**
   * Loads up all dependencies for the modules
   *
   * @returns {Function} callback to call with the Module instance with the
   *   dependencies to be resolved
   */
  function dependencies(loader) {
    return function(mod) {
      // If the module has a property `code` that means the module has already
      // been fully resolved.
      if (!mod.deps.length || mod.hasOwnProperty("code")) {
        return mod;
      }

      return new Promise(function(resolve /*, reject*/) {
        loader.manager.import(mod.deps).then(function() {
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
  function cache(loader) {
    return function(mod) {
      return (loader.context.modules[name] = mod.code);
    };
  }

  module.exports = Import;
})(typeof(window) !== 'undefined' ? window : this);

},{"./registry":10,"spromise":1}],7:[function(require,module,exports){
(function() {
  "use strict";

  var Promise  = require('spromise'),
      Registry = require('./registry');

  /**
   * The purpose of Loader is to return full instances of Module.  Module instances
   * are stored in the context to avoid loading the same module multiple times.
   * If the module is loaded, then we just return that.  If it has not bee loaded yet,
   * then we:
   *
   * 1. Fetch its source; remote server, local file system... You can specify a fetch
   *      provider to define how source files are retrieved
   * 2. Transform the source that was fetched.  This step enables processing of the
   *      source before it is compiled into an instance of Module.
   * 3. Compile the source that was fetched and transformed into a proper
   *      instance of Module
   */
  function Loader(manager) {
    this.manager = manager;
    this.context = (manager && manager.context) || Registry.getById();
  }

  /**
   * Handles the process of returning the instance of the Module if one exists, otherwise
   * the workflow for creating the instance is kicked off.
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
      var moduleMeta = manager.resolve(name);

      // This is where the workflow for fetching, transforming, and compiling happens.
      // It is designed to easily add more steps to the workflow.
      context.loaded[name] = manager
        .fetch(moduleMeta)
        .then(transform(loader))
        .then(compile(loader));
    }

    return Promise.resolve(context.loaded[name]);
  };

  /**
   * The transform enables transformation providers to process the moduleMeta
   * before it is compiled into an actual Module instance.  This is where steps
   * such as linting and processing coffee files can take place.
   */
  function transform(loader) {
    return function(moduleMeta) {
      loader.manager.providers.transformation.transform(moduleMeta);
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
      if (!moduleMeta.compile) {
        throw new TypeError("ModuleMeta must provide have a `compile` interface");
      }

      var mod     = moduleMeta.compile(),
          loaded  = moduleMeta.loaded || {},
          modules = loaded.modules;

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

},{"./registry":10,"spromise":1}],8:[function(require,module,exports){
(function (root) {
  "use strict";

  var File           = require('./file'),
      Utils          = require('./utils'),
      Loader         = require('./loader'),
      Define         = require('./define'),
      Import         = require('./import'),
      Require        = require('./require'),
      Resolver       = require('./resolver'),
      Registry       = require('./registry'),
      Fetch          = require('./fetchxhr'),
      Transformation = require('./transformation'),
      Ajax           = require('./ajax'),
      Promise        = require('spromise');

  function MLoader(options) {
    this.settings = Utils.extend({}, MLoader.defaults, options);
    this.context  = Registry.getById();

    var providers = {
      loader         : MLoader.Loader(this),
      resolver       : MLoader.Resolver(this),
      import         : MLoader.Import(this),
      require        : MLoader.Require(this),
      define         : MLoader.Define(this),
      transformation : MLoader.Transformation(this)
    };

    // Expose interfaces
    this.fetch     = Fetch;
    this.providers = providers;
    this.define    = providers.define.define.bind(providers.define);
    this.load      = providers.loader.load.bind(providers.loader);
    this.resolve   = providers.resolver.resolve.bind(providers.resolver);
    this.import    = providers.import.import.bind(providers.import);
    this.require   = providers.require.require.bind(providers.require);
  }

  MLoader.prototype.clear = function() {
    return Registry.clearById(this.context._id);
  };

  MLoader.prototype.configure = function(options) {
    Utils.merge(this.settings, options);
  };

  MLoader.configure = function (options) {
    Utils.merge(mloader.settings, options);
    return new MLoader(options);
  };

  MLoader.defaults = {
    global: this,
    baseUrl: "",
    cache: true,
    deps: [],
    paths: {},
    shim: {},
    packages: []
  };

  // Expose constructors and utilities
  MLoader.File           = File;
  MLoader.Utils          = Utils;
  MLoader.Promise        = Promise;
  MLoader.Registry       = Registry;
  MLoader.Ajax           = Ajax;
  MLoader.Loader         = factory(Loader);
  MLoader.Resolver       = factory(Resolver);
  MLoader.Import         = factory(Import);
  MLoader.Require        = factory(Require);
  MLoader.Define         = factory(Define);
  MLoader.Transformation = factory(Transformation);

  function factory(Constructor) {
    return function(context) {
      return new Constructor(context || mloader);
    };
  }

  var mloader     = new MLoader(root.require);
  MLoader.require = mloader.require;
  MLoader.import  = mloader.import;
  MLoader.define  = mloader.define;

  // Expose `amd` for modules to properly detect support for `amd`
  mloader.define.amd = {};

  module.exports  = MLoader;
})(typeof(window) !== 'undefined' ? window : this);

},{"./ajax":2,"./define":3,"./fetchxhr":4,"./file":5,"./import":6,"./loader":7,"./registry":10,"./require":11,"./resolver":12,"./transformation":13,"./utils":14,"spromise":1}],9:[function(require,module,exports){
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

},{"./utils":14}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
(function() {
  "use script";

  var Registry = require('./registry'),
      Utils    = require('./utils');

  function Require(manager) {
    this.manager = manager;
    this.context = (manager && manager.context) || Registry.getById();
  }

  Require.prototype.require = function(name, ready, options) {
    var manager = this.manager,
        context = this.context;

    if (context.modules.hasOwnProperty(name)) {
      return context.modules[name];
    }
    else {
      return manager.import(name, options).done(ready || Utils.noop);
    }
  };

  module.exports = Require;
})();

},{"./registry":10,"./utils":14}],12:[function(require,module,exports){
(function(root) {
  "use strict";

  var Registry = require('./registry'),
      File     = require('./file');

  function Resolver(manager) {
    this.manager = manager;
    this.context = (manager && manager.context) ? manager.context : Registry.getById();
  }

  Resolver.prototype.resolve = function(name) {
    var i, length, pkg, shimName;
    var manager  = this.manager,
        context  = this.context,
        settings = manager.settings,
        shim     = settings.shim,
        packages = settings.packages,
        fileName = "";

    // Go through the packages and figure if the module is actually configured as such.
    for (i = 0, length = packages.length; i < length; i++) {
      pkg = packages[i] || '';
      if (pkg.name === name || pkg === name) {
        if (pkg.location) {
          fileName = pkg.location + "/";
        }

        fileName += name + "/" + (pkg.main || "main");
        break;
      }
    }
    
    if (!fileName) {
      fileName = (settings.paths && settings.paths[name]) || name;
    }

    // Once the module has been fully resolved, we finally added to the list of available modules
    if (shim && shim.hasOwnProperty(name)) {
      shimName = shim[name].exports || name;
      if (root.hasOwnProperty(name)) {
        context.modules[name] = root[name];
      }
    }

    return {
      name: name,
      file: new File(fileName, settings.baseUrl),
      urlArgs: settings.urlArgs
    };
  };

  module.exports = Resolver;
})(typeof(window) !== 'undefined' ? window : this);

},{"./file":5,"./registry":10}],13:[function(require,module,exports){
(function() {
  "use strict";

  function Transformation(manager) {
    this.manager = manager;
  }

  Transformation.prototype.transform = function(mod) {
    return mod;
  };

  module.exports = Transformation;
})();

},{}],14:[function(require,module,exports){
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

},{}]},{},[8])(8)
});