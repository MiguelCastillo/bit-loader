!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.bitloader=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * spromise Copyright (c) 2014 Miguel Castillo.
 * Licensed under MIT
 */

(function() {
  "use strict";

  var Promise = require("./promise"),
      async   = require("./async");

  function _result(input, args, context) {
    if (typeof(input) === "function") {
      return input.apply(context, args||[]);
    }
    return input;
  }

  function All(values) {
    values = values || [];

    // The input is the queue of items that need to be resolved.
    var resolutions = [],
        promise     = Promise.defer(),
        context     = this,
        remaining   = values.length;

    if (!values.length) {
      return promise.resolve(values);
    }

    // Check everytime a new resolved promise occurs if we are done processing all
    // the dependent promises.  If they are all done, then resolve the when promise
    function checkPending() {
      remaining--;
      if (!remaining) {
        promise.resolve.call(context, resolutions);
      }
    }

    // Wrap the resolution to keep track of the proper index in the closure
    function resolve(index) {
      return function() {
        resolutions[index] = arguments.length === 1 ? arguments[0] : arguments;
        checkPending();
      };
    }

    function processQueue() {
      var i, item, length;
      for (i = 0, length = remaining; i < length; i++) {
        item = values[i];
        if (item && typeof item.then === "function") {
          item.then(resolve(i), promise.reject);
        }
        else {
          resolutions[i] = _result(item);
          checkPending();
        }
      }
    }

    // Process the promises and callbacks
    async(processQueue);
    return promise;
  }

  module.exports = All;
}());


},{"./async":2,"./promise":3}],2:[function(require,module,exports){
/**
 * spromise Copyright (c) 2014 Miguel Castillo.
 * Licensed under MIT
 */

/*global process, setImmediate*/
(function() {
  "use strict";

  var nextTick;

  function Async(cb) {
    nextTick(cb);
  }

  Async.delay = function(callback, timeout, args) {
    setTimeout(callback.apply.bind(callback, this, args || []), timeout);
  };


  /**
   * Find the prefered method for queue callbacks in the event loop
   */

  if (typeof(process) === "object" && typeof(process.nextTick) === "function") {
    nextTick = process.nextTick;
  }
  else if (typeof(setImmediate) === "function") {
    nextTick = setImmediate;
  }
  else {
    nextTick = function(cb) {
      setTimeout(cb, 0);
    };
  }

  Async.nextTick = nextTick;
  module.exports = Async;
}());

},{}],3:[function(require,module,exports){
/**
 * spromise Copyright (c) 2014 Miguel Castillo.
 * Licensed under MIT
 */

(function() {
  "use strict";

  var async = require("./async");

  var states = {
    "pending"  : 0,
    "resolved" : 1,
    "rejected" : 2,
    "always"   : 3,
    "notify"   : 4
  };

  var strStates = [
    "pending",
    "resolved",
    "rejected"
  ];

  /**
   * Small Promise
   */
  function Promise(resolver, stateManager) {
    stateManager = stateManager || new StateManager();
    var target = this;

    target.then = function(onResolved, onRejected) {
      return stateManager.then(onResolved, onRejected);
    };

    target.resolve = function() {
      stateManager.transition(states.resolved, arguments, this);
      return target;
    };

    target.reject = function() {
      stateManager.transition(states.rejected, arguments, this);
      return target;
    };

    // Read only access point for the promise.
    target.promise = {
      then   : target.then,
      always : target.always,
      done   : target.done,
      catch  : target.fail,
      fail   : target.fail,
      notify : target.notify,
      state  : target.state,
      constructor : Promise // Helper to detect spromise instances
    };

    target.promise.promise = target.promise;
    target.then.stateManager = stateManager;

    if (resolver) {
      resolver.call(target, target.resolve, target.reject);
    }
  }

  Promise.prototype.done = function(cb) {
    this.then.stateManager.enqueue(states.resolved, cb);
    return this.promise;
  };

  Promise.prototype.catch = Promise.prototype.fail = function(cb) {
    this.then.stateManager.enqueue(states.rejected, cb);
    return this.promise;
  };

  Promise.prototype.finally = Promise.prototype.always = function(cb) {
    this.then.stateManager.enqueue(states.always, cb);
    return this.promise;
  };

  Promise.prototype.notify = function(cb) {
    this.then.stateManager.enqueue(states.notify, cb);
    return this.promise;
  };

  Promise.prototype.state = function() {
    return strStates[this.then.stateManager.state];
  };

  Promise.prototype.isPending = function() {
    return this.then.stateManager.state === states.pending;
  };

  Promise.prototype.isResolved = function() {
    return this.then.stateManager.state === states.resolved;
  };

  Promise.prototype.isRejected = function() {
    return this.then.stateManager.state === states.resolved;
  };

  Promise.prototype.delay = function delay(ms) {
    var _self = this;
    return new Promise(function(resolve, reject) {
      _self.then(function() {
        async.delay(resolve.bind(this), ms, arguments);
      }, reject.bind(this));
    });
  };

  /**
   * Provides a set of interfaces to manage callback queues and the resolution state
   * of the promises.
   */
  function StateManager(options) {
    // Initial state is pending
    this.state = states.pending;

    // If a state is passed in, then we go ahead and initialize the state manager with it
    if (options && options.state) {
      this.transition(options.state, options.value, options.context);
    }
  }

  /**
   * Figure out if the promise is pending/resolved/rejected and do the appropriate
   * action with the callback based on that.
   */
  StateManager.prototype.enqueue = function (state, cb) {
    if (!this.state) {
      (this.queue || (this.queue = [])).push(TaskAction);
    }
    else {
      // If the promise has already been resolved and its queue has been processed, then
      // we need to schedule the new task for processing ASAP by putting in the asyncQueue
      TaskManager.asyncTask(TaskAction);
    }

    var stateManager = this;
    function TaskAction() {
      if (stateManager.state === state || states.always === state) {
        cb.apply(stateManager.context, stateManager.value);
      }
      else if (states.notify === state) {
        cb.call(stateManager.context, stateManager.state, stateManager.value);
      }
    }
  };

  /**
   * Transitions the state of the promise from pending to either resolved or
   * rejected.  If the promise has already been resolved or rejected, then
   * this is a noop.
   */
  StateManager.prototype.transition = function (state, value, context) {
    if (this.state) {
      return;
    }

    this.state   = state;
    this.context = context;
    this.value   = value;

    var queue = this.queue;
    if (queue) {
      this.queue = null;
      TaskManager.asyncQueue(queue);
    }
  };

  // 2.2.7: https://promisesaplus.com/#point-40
  StateManager.prototype.then = function(onResolved, onRejected) {
    var stateManager = this;

    // Make sure onResolved and onRejected are functions, or null otherwise
    onResolved = (onResolved && typeof(onResolved) === "function") ? onResolved : null;
    onRejected = (onRejected && typeof(onRejected) === "function") ? onRejected : null;

    // 2.2.7.3 and 2.2.7.4: https://promisesaplus.com/#point-43
    // If there are no onResolved or onRejected callbacks and the promise
    // is already resolved, we just return a new promise and copy the state
    if ((!onResolved && stateManager.state === states.resolved) ||
        (!onRejected && stateManager.state === states.rejected)) {
      return new Promise(null, stateManager);
    }

    var promise = new Promise();
    stateManager.enqueue(states.notify, function NotifyAction(state, value) {
      var handler = (state === states.resolved) ? (onResolved || onRejected) : (onRejected || onResolved);
      if (handler) {
        value = StateManager.runHandler(state, value, this, promise, handler);
      }

      if (value !== false) {
        (new Resolution({promise: promise})).finalize(state, value, this);
      }
    });
    return promise;
  };


  StateManager.runHandler = function(state, value, context, promise, handler) {
    // Try catch in case calling the handler throws an exception
    try {
      value = handler.apply(context, value);
    }
    catch(ex) {
      printDebug(ex);
      promise.reject.call(context, ex);
      return false;
    }

    return value === undefined ? [] : [value];
  };


  /**
   * Thenable resolution
   */
  function Resolution(options) {
    this.promise = options.promise;
  }

  /**
   * Promise resolution procedure
   *
   * @param {states} state - Is the state of the promise resolution (resolved/rejected)
   * @param {array} value - Is value of the resolved promise
   * @param {context} context - Is that context used when calling resolved/rejected
   */
  Resolution.prototype.finalize = function(state, value, context) {
    var resolution = this,
        promise    = this.promise,
        input, pending;

    if (value.length) {
      input = value[0];

      // 2.3.1 https://promisesaplus.com/#point-48
      if (input === promise) {
        pending = promise.reject.call(context, new TypeError("Resolution input must not be the promise being resolved"));
      }

      // 2.3.2 https://promisesaplus.com/#point-49
      // if the incoming promise is an instance of spromise, we adopt its state
      else if (input && input.constructor === Promise) {
        pending = input.notify(function NotifyDelegate(state, value) {
          resolution.finalize(state, value, this);
        });
      }

      // 2.3.3 https://promisesaplus.com/#point-53
      // Otherwise, if x is an object or function
      else if (input !== undefined && input !== null) {
        switch(typeof(input)) {
          case "object":
          case "function":
            pending = this.runThenable(input, context);
        }
      }
    }

    // 2.3.4 https://promisesaplus.com/#point-64
    // If x is not an object or function, fulfill promise with x.
    if (!pending) {
      if (state === states.resolved) {
        promise.resolve.apply(context, value);
      }
      else {
        promise.reject.apply(context, value);
      }
    }
  };

  /**
   * Run thenable.
   */
  Resolution.prototype.runThenable = function(thenable, context) {
    var resolution = this,
        resolved   = false;

    try {
      // 2.3.3.1 https://promisesaplus.com/#point-54
      var then = thenable.then;  // Reading `.then` could throw
      if (typeof(then) === "function") {
        // 2.3.3.3 https://promisesaplus.com/#point-56
        then.call(thenable, function resolvePromise() {
          if (!resolved) { resolved = true;
            resolution.finalize(states.resolved, arguments, this);
          }
        }, function rejectPromise() {
          if (!resolved) { resolved = true;
            resolution.promise.reject.apply(this, arguments);
          }
        });

        return true;
      }
    }
    catch (ex) {
      if (!resolved) {
        resolution.promise.reject.call(context, ex);
      }

      return true;
    }

    return false;
  };

  /**
   * Task manager to handle queuing up async tasks in an optimal manner
   */
  var TaskManager = {
    _asyncQueue: [],
    asyncTask: function(task) {
      if (TaskManager._asyncQueue.push(task) === 1) {
        async(TaskManager.taskRunner(TaskManager._asyncQueue));
      }
    },
    asyncQueue: function(queue) {
      if (queue.length === 1) {
        TaskManager.asyncTask(queue[0]);
      }
      else {
        TaskManager.asyncTask(TaskManager.taskRunner(queue));
      }
    },
    taskRunner: function(queue) {
      return function runTasks() {
        var task;
        while ((task = queue[0])) {
          TaskManager._runTask(task);
          queue.shift();
        }
      };
    },
    _runTask: function(task) {
      try {
        task();
      }
      catch(ex) {
        printDebug(ex);
      }
    }
  };

  function printDebug(ex) {
    if (Factory.debug) {
      console.error(ex);
      if (ex && ex.stack) {
        console.log(ex.stack);
      }
    }
  }

  /**
   * Public interface to create promises
   */
  function Factory(resolver) {
    return new Promise(resolver);
  }

  // Enable type check with instanceof
  Factory.prototype = Promise.prototype;

  /**
   * Interface to play nice with libraries like when and q.
   */
  Factory.defer = function () {
    return new Promise();
  };

  /**
   * Create a promise that's already rejected
   *
   * @returns {Promise} A promise that is alraedy rejected with the input value
   */
  Factory.reject = function () {
    return new Promise(null, new StateManager({
      context: this,
      value: arguments,
      state: states.rejected
    }));
  };

  /**
   * Interface that makes sure a promise is returned, regardless of the input.
   * 1. If the input is a promsie, then that's immediately returned.
   * 2. If the input is a thenable (has a then method), then a new promise is returned
   *    that's chained to the input thenable.
   * 3. If the input is any other value, then a new promise is returned and resolved with
   *    the input value
   *
   * @returns {Promise}
   */
  Factory.resolve = Factory.thenable = function (value) {
    if (value) {
      if (value.constructor === Promise) {
        return value;
      }
      else if (typeof(value.then) === "function") {
        return new Promise(value.then);
      }
    }

    return new Promise(null, new StateManager({
      context: this,
      value: arguments,
      state: states.resolved
    }));
  };

  /**
   * Creates a promise that's resolved after ms number of milleseconds. All arguments passed
   * in to delay, with the excpetion of ms, will be used to resolve the new promise with.
   *
   * @param {number} ms - Number of milliseconds to wait before the promise is resolved.
   */
  Factory.delay = function delay(ms) {
    var args = Array.prototype.slice(arguments, 1);
    return new Promise(function(resolve) {
      async.delay(resolve.bind(this), ms, args);
    });
  };

  // Expose enums for the states
  Factory.states = states;
  Factory.debug  = false;
  module.exports = Factory;
}());

},{"./async":2}],4:[function(require,module,exports){
/**
 * spromise Copyright (c) 2014 Miguel Castillo.
 * Licensed under MIT
 */

(function() {
  "use strict";

  var Promise = require("./promise");

  function Race(iterable) {
    if (!iterable) {
      return Promise.resolve();
    }

    return new Promise(function(resolve, reject) {
      var i, length, _done = false;
      for (i = 0, length = iterable.length; i < length; i++) {
        iterable[i].then(_resolve, _reject);
      }

      function _resolve() {
        if (!_done) {
          _done = true;
          /*jshint -W040 */
          resolve.apply(this, arguments);
          /*jshint +W040 */
        }
      }

      function _reject() {
        if (!_done) {
          _done = true;
          /*jshint -W040 */
          reject.apply(this, arguments);
          /*jshint +W040 */
        }
      }
    });
  }

  module.exports = Race;
}());

},{"./promise":3}],5:[function(require,module,exports){
/**
 * spromise Copyright (c) 2014 Miguel Castillo.
 * Licensed under MIT
 */

(function() {
  "use strict";

  var Promise   = require("./promise");
  Promise.async = require("./async");
  Promise.when  = require("./when");
  Promise.all   = require("./all");
  Promise.race  = require("./race");

  module.exports = Promise;
}());

},{"./all":1,"./async":2,"./promise":3,"./race":4,"./when":6}],6:[function(require,module,exports){
/**
 * spromise Copyright (c) 2014 Miguel Castillo.
 * Licensed under MIT
 */

(function() {
  "use strict";

  var Promise = require("./promise"),
      All     = require("./all");

  /**
   * Interface to allow multiple promises to be synchronized
   */
  function When() {
    var context = this, args = arguments;
    return new Promise(function(resolve, reject) {
      All.call(context, args).then(function(results) {
        resolve.apply(context, results);
      },
      function(reason) {
        reject.call(context, reason);
      });
    });
  }

  module.exports = When;
}());

},{"./all":1,"./promise":3}],7:[function(require,module,exports){
(function () {
  "use strict";

  var Promise    = require('./promise'),
      Utils      = require('./utils'),
      Logger     = require('./logger'),
      Fetch      = require('./fetch'),
      Import     = require('./import'),
      Loader     = require('./loader'),
      Module     = require('./module'),
      Registry   = require('./registry'),
      Middleware = require('./middleware');

  var registryId = 0;
  function getRegistryId() {
    return 'bitloader-' + registryId++;
  }

  var ModuleState = {
    LOADED: "loaded"
  };


  /**
   * @class
   *
   * Facade for relevant interfaces to register and import modules
   */
  function Bitloader(options, factories) {
    options   = options   || {};
    factories = factories || {};

    this.context   = Registry.getById(getRegistryId());
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
      fetcher  : factories.fetch  ? factories.fetch(this)  : new Bitloader.Fetch(this),
      loader   : factories.loader ? factories.loader(this) : new Bitloader.Loader(this),
      importer : factories.import ? factories.import(this) : new Bitloader.Import(this)
    };

    // Public Interface
    this.providers = providers;
    this.fetch     = providers.fetcher.fetch.bind(providers.fetcher);
    this.load      = providers.loader.load.bind(providers.loader);
    this.register  = providers.loader.register.bind(providers.loader);
    this.import    = providers.importer.import.bind(providers.importer);
  }


  /**
   * Clears the context, which means that all cached modules and other pertinent data
   * will be deleted.
   */
  Bitloader.prototype.clear = function() {
    this.context.clear();
  };


  /**
   * Checks if the module instance is in the module registry
   */
  Bitloader.prototype.hasModule = function(name) {
    return this.context.hasModule(name) || this.providers.loader.isLoaded(name);
  };


  /**
   * Returns the module instance if one exists.  If the module instance isn't in the
   * module registry, then a TypeError exception is thrown
   */
  Bitloader.prototype.getModule = function(name) {
    if (!this.hasModule(name)) {
      throw new TypeError("Module `" + name + "` has not yet been loaded");
    }

    if (!this.context.hasModule(name)) {
      return this.context.setModule(ModuleState.LOADED, name, this.providers.loader.syncBuildModule(name));
    }

    return this.context.getModule(name);
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

    if (!name || typeof(name) !== 'string') {
      throw new TypeError("Module must have a name");
    }

    if (this.context.hasModule(name)) {
      throw new TypeError("Module instance `" + name + "` already exists");
    }

    return this.context.setModule(ModuleState.LOADED, name, mod);
  };


  /**
   * Interface to delete a module from the registry.
   *
   * @param {string} name - Name of the module to delete
   *
   * @returns {Module} Deleted module
   */
  Bitloader.prototype.deleteModule = function(name) {
    if (!this.context.hasModule(name)) {
      throw new TypeError("Module instance `" + name + "` does not exists");
    }

    return this.context.deleteModule(name);
  };


  /**
   * Returns the module code from the module registry. If the module code has not
   * yet been fully compiled, then we defer to the loader to build the module and
   * return the code.
   *
   * @param {string} name - The name of the module code to get from the module registry
   *
   * @return {object} The module code.
   */
  Bitloader.prototype.getModuleCode = function(name) {
    if (!this.hasModule(name)) {
      throw new TypeError("Module `" + name + "` has not yet been loaded");
    }

    return this.getModule(name).code;
  };


  /**
   * Sets module evaluated code directly in the module registry.
   *
   * @param {string} name - The name of the module, which is used by other modules
   *  that need it as a dependency.
   * @param {object} code - The evaluated code to be set
   *
   * @returns {object} The evaluated code.
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


  /**
   * Checks is the module has been fully finalized, which is when the module instance
   * get stored in the module registry
   */
  Bitloader.prototype.isModuleCached = function(name) {
    return this.context.hasModule(name);
  };


  Bitloader.prototype.Promise    = Promise;
  Bitloader.prototype.Module     = Module;
  Bitloader.prototype.Utils      = Utils;
  Bitloader.prototype.Logger     = Logger;
  Bitloader.prototype.Middleware = Middleware;

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

},{"./fetch":8,"./import":9,"./loader":10,"./logger":11,"./middleware":16,"./module":17,"./promise":20,"./registry":21,"./utils":23}],8:[function(require,module,exports){
(function() {
  "use strict";

  function Fetch() {
  }

  Fetch.prototype.fetch = function(/*name*/) {
    throw new TypeError("Not implemented, must be implemented by the consumer code");
  };

  module.exports = Fetch;
})();

},{}],9:[function(require,module,exports){
(function() {
  "use strict";

  var Promise  = require('./promise'),
      Registry = require('./registry'),
      Utils    = require('./utils');

  var registryId = 0;
  function getRegistryId() {
    return 'import-' + registryId++;
  }


  var ModuleState = {
    LOADING: "loading"
  };


  /**
   * Module importer. Primary function is to load Module instances and resolving
   * their dependencies in order to make the Module fully consumable.
   */
  function Import(manager) {
    if (!manager) {
      throw new TypeError("Must provide a manager");
    }

    this.manager = manager;
    this.context = Registry.getById(getRegistryId());
  }


  /**
   * Import is the method to load a Module
   *
   * @param {Array<string> | string} names - module(s) to import
   *
   * @returns {Promise}
   */
  Import.prototype.import = function(name, options) {
    options = options || {};
    var importer = this;

    if (typeof(name) === "string") {
      return Promise.resolve(importer._getModule(name, options));
    }

    return Promise.all(name.map(function getModuleByName(name) {
      return importer._getModule(name, options);
    }));
  };


  /**
   * Loops through the array of names, loading whatever has not yet been loaded,
   * and returning what has already been loaded.
   *
   * @param {Array<string>} names - Array of module names
   * @param {Object} options
   */
  Import.prototype._getModule = function(name, options) {
    var importer = this,
        manager  = this.manager;

    if (hasModule(options.modules, name)) {
      return options.modules[name];
    }
    else if (manager.hasModule(name)) {
      return manager.getModuleCode(name);
    }
    else if (importer.hasModule(name)) {
      return importer.getModule(name);
    }

    // Wrap in a separate promise to handle this:
    // https://github.com/MiguelCastillo/spromise/issues/35
    return new Promise(function deferredModuleResolver(resolve, reject) {
      importer.setModule(name, importer._loadModule(name))
        .then(function moduleSuccess(result) {
          resolve(result);
        }, function moduleError(error) {
          reject(error);
        });
    });
  };


  /**
   * Load module
   */
  Import.prototype._loadModule = function(name) {
    return this.manager
      .load(name)
      .then(this._getModuleCode(name), Utils.forwardError);
  };


  /**
   * Handler for when modules are loaded.
   */
  Import.prototype._getModuleCode = function(name) {
    var importer = this;

    return function getCode(mod) {
      if (name !== mod.name) {
        return Promise.reject(new TypeError("Module name must be the same as the name used for loading the Module itself"));
      }

      importer.deleteModule(mod.name);
      return importer.manager.getModuleCode(mod.name);
    };
  };


  function hasModule(target, name) {
    return target && target.hasOwnProperty(name);
  }

  Import.prototype.hasModule = function(name) {
    return this.context.hasModuleWithState(ModuleState.LOADING, name);
  };

  Import.prototype.getModule = function(name) {
    return this.context.getModuleWithState(ModuleState.LOADING, name);
  };

  Import.prototype.setModule = function(name, item) {
    return this.context.setModule(ModuleState.LOADING, name, item);
  };

  Import.prototype.deleteModule = function(name) {
    return this.context.deleteModule(name);
  };

  module.exports = Import;
})();


},{"./promise":20,"./registry":21,"./utils":23}],10:[function(require,module,exports){
(function() {
  "use strict";

  var Promise          = require('./promise'),
      Module           = require('./module'),
      Utils            = require('./utils'),
      Pipeline         = require('./pipeline'),
      Registry         = require('./registry'),
      moduleLinker     = require('./module/linker'),
      metaFetch        = require('./meta/fetch'),
      metaTransform    = require('./meta/transform'),
      metaDependencies = require('./meta/dependencies'),
      metaCompilation  = require('./meta/compilation');


  var registryId = 0;
  function getRegistryId() {
    return 'loader-' + registryId++;
  }


  /**
   * - Loaded means that the module meta is all processed and it is ready to be
   *  built into a Module instance. Only for SYNC processing.
   *
   * - Pending means that the module meta is already loaded, but it needs it's
   *  dependencies processed, which might lead to further loading of module meta
   *  objects. Only for ASYNC processing.
   *
   * - Loading means that the module meta is currently being loaded. Only for ASYNC
   *  processing.
   */
  var ModuleState = {
    LOADING: "loading",
    LOADED:  "loaded",
    PENDING: "pending"
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
    this.context  = Registry.getById(getRegistryId());
    this.pipeline = new Pipeline([metaTransform, metaDependencies]);
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
   * instance of Module. The purporse for moduleMeta is to allow a tranformation pipeline to
   * process the raw source before building the final product - a Module instance. The
   * transformation pipeline allows us to do things like convert coffeescript to javascript.
   *
   * Primary workflow:
   * fetch     -> module name {string}
   * transform -> module meta {compile:fn, source:string}
   * load deps -> module meta {compile:fn, source:string}
   * compile moduleMeta
   * link module
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

    if (loader.isLoaded(name) || loader.isPending(name)) {
      return Promise.resolve(buildModule());
    }

    return loader
      .fetch(name, parentMeta)
      .then(buildModule, Utils.forwardError);

    function buildModule() {
      return loader.asyncBuildModule(name);
    }
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
   * @returns {Promise}
   */
  Loader.prototype.fetch = function(name, parentMeta) {
    var loader  = this,
        manager = this.manager;

    if (!name) {
      return Promise.reject(new TypeError("Must provide the name of the module to fetch"));
    }

    if (manager.hasModule(name)) {
      return Promise.resolve();
    }

    if (loader.isLoading(name)) {
      return loader.getLoading(name);
    }

    var loading = loader
      ._fetchModuleMeta(name, parentMeta)
      .then(moduleMetaReady, Utils.printError);

    return loader.setLoading(name, loading);

    function moduleMetaReady(moduleMeta) {
      loader.setLoaded(name, moduleMeta);
    }
  };


  /**
   * Converts a module meta object to a full Module instance.
   *
   * @param {string} name - The name of the module meta to convert to an instance of Module.
   *
   * @returns {Module} Module instance from the conversion of module meta
   */
  Loader.prototype.syncBuildModule = function(name) {
    var mod = this._compileModuleMeta(name);

    if (!mod) {
      if (this.isPending(name)) {
        throw new TypeError("Unable to synchronously build dynamic module '" + name + "'");
      }
      else {
        throw new TypeError("Unable to synchronously build module '" + name + "'");
      }
    }

    return this._linkModule(mod);
  };


  /**
   * Build module handling any async Module registration.  What this means is that if a module
   * is being loaded and it calls System.register to register itself, then it needs to be handled
   * as an async step because that could be loading other dependencies.
   *
   * @param {string} name - Name of the target Module
   *
   * @returns {Promise}
   */
  Loader.prototype.asyncBuildModule = function(name) {
    var loader = this;
    var mod;

    if (this.isLoaded(name)) {
      mod = this._compileModuleMeta(name);
    }
    else if (this.manager.hasModule(name)) {
      return Promise.resolve(this.manager.getModule(name));
    }

    // If the module evaluation didn't register a new module, then we return whatever
    // was produced.
    if (!this.isPending(name)) {
      return Promise.resolve(this._linkModule(mod));
    }

    // Right here is where we handle dynamic registration of modules while are being loaded.
    // E.g. System.register to register a module that's being loaded
    return metaDependencies(loader.manager, loader.deleteModule(name))
      .then(buildDependencies, Utils.forwardError)
      .then(linkModuleMeta, Utils.forwardError);


    //
    // Helper methods
    //

    function buildDependencies(moduleMeta) {
      var pending = moduleMeta.deps.map(function buildDependency(moduleName) {
        return loader.asyncBuildModule(moduleName);
      });

      return Promise.all(pending)
        .then(function dependenciesBuilt() {
          return moduleMeta;
        });
    }

    function linkModuleMeta(moduleMeta) {
      return loader._linkModule(new Module(moduleMeta));
    }
  };


  /**
   * Interface to register a module meta that can be put compiled to a Module instance
   */
  Loader.prototype.register = function(name, deps, factory, type) {
    if (this.manager.hasModule(name) || this.hasModule(name)) {
      throw new TypeError("Module '" + name + "' is already loaded");
    }

    this.setPending(name, {
      name    : name,
      deps    : deps,
      factory : factory,
      type    : type
    });
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
      return Promise.reject(new TypeError("Must provide a module meta object"));
    }

    if (typeof(moduleMeta.source) !== "string") {
      throw Promise.reject(new TypeError("Must provide a source string property with the content to transform"));
    }

    moduleMeta.deps = moduleMeta.deps || [];
    return metaTransform(this.manager, moduleMeta);
  };


  /**
   * Calls the fetch provider to get a module meta object, and then puts it through
   * the module meta pipeline
   *
   * @param {string} name - Module name for which to build the module meta for
   * @param {Object} parentMeta - Is the module meta object that is requesting the fetch
   *   transaction, which is important when processing sub dependencies.
   *
   * @returns {Promise} When resolved, a module meta that has gone through the pipeline
   *   is returned.
   */
  Loader.prototype._fetchModuleMeta = function(name, parentMeta) {
    var loader = this;

    // This is where the call to fetch the module meta takes place. Once the
    // module meta is loaded, it is put through the transformation pipeline.
    return metaFetch(this.manager, name, parentMeta)
      .then(pipelineModuleMeta, Utils.forwardError);

    function pipelineModuleMeta(moduleMeta) {
      return loader._pipelineModuleMeta(moduleMeta);
    }
  };


  /**
   * Put a module meta object through the pipeline, which includes the transformation
   * and dependency loading stages.
   *
   * @param {object} moduleMeta - Module meta object to run through the pipeline.
   *
   * @returns {Promise} that when fulfilled, the processed module meta object is returned.
   */
  Loader.prototype._pipelineModuleMeta = function(moduleMeta) {
    if (Module.Meta.isCompiled(moduleMeta)) {
      return Promise.resolve(moduleMeta);
    }

    return this.pipeline
      .run(this.manager, moduleMeta)
      .then(pipelineFinished, Utils.forwardError);

    function pipelineFinished() {
      return moduleMeta;
    }
  };


  /**
   * Convert a module meta object into a proper Module instance.
   *
   * @param {string} name - Name of the module meta object to be converted.
   *
   * @returns {Module}
   */
  Loader.prototype._compileModuleMeta = function(name) {
    var moduleMeta;
    var manager = this.manager;

    if (this.isLoaded(name)) {
      moduleMeta = this.deleteModule(name);
    }
    else if (this.manager.isModuleCached(name)) {
      throw new TypeError("Module `" + name + "` is already loaded, so you can just call `manager.getModule(name)`");
    }
    else {
      throw new TypeError("Module `" + name + "` is not loaded yet. Make sure to call `load` or `fetch` prior to calling `linkModuleMeta`");
    }

    // Compile module meta to create a Module instance
    return metaCompilation(manager, moduleMeta);
  };


  /**
   * Finalizes a Module instance by pulling in all the dependencies and calling the module
   * factory method if available.  This is the very last stage of the Module building process
   *
   * @param {Module} mod - Module instance to link
   *
   * @returns {Module} Instance all linked
   */
  Loader.prototype._linkModule = function(mod) {
    if (!(mod instanceof(Module))) {
      throw new TypeError("Module `" + mod.name + "` is not an instance of Module");
    }

    ////
    // This is the sweet spot when synchronous build process and dynamic module registration meet.
    //
    // Module registration/import are async operations. Build process is sync.  So the challenge
    // is to make sure these two don't cross paths.  We solve this problem by making sure we
    // only process pending module meta objects in async module loading methods such as
    // `import`, because that method is asynchronous.  We want async operations to run early
    // and finish all they work.  And then ONLY run sync operations so that calls like `require`
    // can behave synchronously.
    ////
    if (this.isPending(mod.name)) {
      console.warn("Module '" + mod.name + "' is being dynamically registered while being loaded.", "You don't need to call 'System.register' when the module is already being loaded.");
    }

    // Run the Module instance through the module linker
    return moduleLinker(this.manager, mod);
  };


  /**
   * Check if there is currently a module loading or loaded.
   *
   * @param {string} name - The name of the module meta to check
   *
   * @returns {Boolean}
   */
  Loader.prototype.hasModule = function(name) {
    return this.context.hasModule(name);
  };


  /**
   * Method to retrieve the module meta with the given name, if one exists.  If it
   * is loading, then the promise for the pending request is returned. Otherwise
   * the actual module meta object is returned.
   *
   * @param {string} name - The name of the module meta to get
   *
   * @returns {object | Promise}
   */
  Loader.prototype.getModule = function(name) {
    return this.context.getModule(name);
  };


  /**
   * Checks if the module meta with the given name is currently loading
   *
   * @param {string} name - The name of the module meta to check
   *
   * @returns {Boolean} - true if the module name is being loaded, false otherwise.
   */
  Loader.prototype.isLoading = function(name) {
    return this.context.hasModuleWithState(ModuleState.LOADING, name);
  };


  /**
   * Method to retrieve the module meta with the given name, if it is loading.
   *
   * @param {string} name - The name of the loading module meta to get.
   *
   * @returns {Promise}
   */
  Loader.prototype.getLoading = function(name) {
    return this.context.getModuleWithState(ModuleState.LOADING, name);
  };


  /**
   * Method to set the loading module meta with the given name.
   *
   * @param {string} name - The name of the module meta to set
   * @param {Object} item - The module meta to set
   *
   * @returns {Object} The module meta being set
   */
  Loader.prototype.setLoading = function(name, item) {
    return this.context.setModule(ModuleState.LOADING, name, item);
  };


  /**
   * Method to check if a module meta object is in a pending state, which means
   * that all it needs is have its dependencies loaded and then it's ready to
   * to be compiled.
   *
   * @param {string} name - Name of the module meta object
   *
   * @returns {Boolean}
   */
  Loader.prototype.isPending = function(name) {
    return this.context.hasModuleWithState(ModuleState.PENDING, name);
  };


  /**
   * Method to get a module meta object to the pending state.
   *
   * @param {string} name - Name of the module meta to get
   *
   * @returns {Object} Module meta object
   */
  Loader.prototype.getPending = function(name) {
    return this.context.getModuleWithState(ModuleState.PENDING, name);
  };


  /**
   * Method to set a module meta object to the pending state.
   *
   * @param {string} name - Name of the module meta object
   * @param {Object} item - Module meta object to be set
   *
   * @returns {Object} Module meta being set
   */
  Loader.prototype.setPending = function(name, item) {
    return this.context.setModule(ModuleState.PENDING, name, item);
  };


  /**
   * Method to check if a module meta with the given name is already loaded.
   *
   * @param {string} name - The name of the module meta to check.
   *
   * @returns {Boolean}
   */
  Loader.prototype.isLoaded = function(name) {
    return this.context.hasModuleWithState(ModuleState.LOADED, name);
  };


  /**
   * Method to retrieve the module meta with the given name, if one exists.
   *
   * @param {string} name - The name of the loaded module meta to set
   *
   * @returns {Object} The loaded module meta
   */
  Loader.prototype.getLoaded = function(name) {
    return this.context.getModuleWithState(ModuleState.LOADED, name);
  };


  /**
   * Method to set the loaded module meta with the given name
   *
   * @param {string} name - The name of the module meta to set
   * @param {Object} item - The module meta to set
   *
   * @returns {Object} The module meta being set
   */
  Loader.prototype.setLoaded = function(name, item) {
    return this.context.setModule(ModuleState.LOADED, name, item);
  };


  /**
   * Method to remove the module from storage
   *
   * @param {string} name - The name of the module meta to remove
   *
   * @returns {Object} The module meta being removed
   */
  Loader.prototype.deleteModule = function(name) {
    return this.context.deleteModule(name);
  };


  module.exports = Loader;
})();

},{"./meta/compilation":12,"./meta/dependencies":13,"./meta/fetch":14,"./meta/transform":15,"./module":17,"./module/linker":18,"./pipeline":19,"./promise":20,"./registry":21,"./utils":23}],11:[function(require,module,exports){
(function() {
  "use strict";

  var _enabled = false;
  var _only    = false;
  var noop     = function noop() {};


  /**
   * @class
   * Logger instance with a name
   *
   * @param {string} name - Name of the logger
   */
  function Logger(name, options) {
    options = options || {};
    this.name     = name;
    this._enabled = true;
    this._target  = ensureTarget(options._target);
  }


  /**
   * Helper factory method to create named loggers
   */
  Logger.prototype.factory = function(name, options) {
    return new Logger(name, options);
  };


  /**
   * Method to log a message.
   *
   * Verifies that logger is enabled. If it is enabled, then the message(s) are
   * logged. Otherwise ignored.
   */
  Logger.prototype.log = function() {
    if (!this.isEnabled()) {
      return;
    }

    this._target.log.apply(this._target, [getDate(), this.name].concat(arguments));
  };


  /**
   * Method to log JSON.
   *
   * Verifies that the logger is enabled. If it is enabled, then the input JSON
   * is logged.  Otherwise ignored.
   */
  Logger.prototype.dir = function() {
    if (!this.isEnabled()) {
      return;
    }

    this._target.dir.apply(this._target, arguments);
  };


  /**
   * Method to log errors.
   *
   * Verifies that the logger is enabled. If it is enabled, then the error(s)
   * are logged.  Otherwise ignored.
   */
  Logger.prototype.error = function() {
    if (!this.isEnabled()) {
      return;
    }

    this._target.error.apply(this._target, arguments);
  };


  /**
   * Checks if the logger can write messages.
   *
   * @returns {boolean}
   */
  Logger.prototype.isEnabled = function() {
    return this._enabled && _enabled && (!_only || _only === this.name);
  };


  /**
   * Method to enable the logger intance. If loggers have been disabled
   * globally then this flag will not have an immediate effect, until
   * loggers are globally enabled.
   */
  Logger.prototype.enable = function() {
    this._enabled = true;
  };


  /**
   * Method to disable the logger instance. Like {@link Logger#enable},
   * this setting does not have an immediate effect if loggers are globally
   * disabled.
   */
  Logger.prototype.disable = function() {
    this._enabled = false;
  };


  /**
   * Method to make sure only this logger logs messages. If another logger is
   * set to only, then the request is silently ignored.
   */
  Logger.prototype.only = function() {
    if (!Logger._only) {
      Logger._only = this.name;
    }
  };


  /**
   * Method to remove the logger from the `only` state to allow other loggers
   * set themselves as only.
   */
  Logger.prototype.all = function() {
    Logger._only = null;
  };


  /**
   * Disables loggers globally.
   */
  Logger.prototype.disableAll = function() {
    Logger.disable();
  };


  /**
   * Enables loggers globally.
   */
  Logger.prototype.enableAll = function() {
    Logger.enable();
  };


  // Expose the constructor to be able to create new instances from an
  // existing instance.
  Logger.prototype.Logger = Logger;


  /**
   * Underlying method to enable all logger instances
   *
   * @private
   */
  Logger.enable  = function() {
    _enabled = true;
  };


  /**
   * Underlying method to disable all logger instances
   *
   * @private
   */
  Logger.disable = function() {
    _enabled = false;
  };


  /**
   * Underlying method to set the `only` logger instance that can log message
   *
   * @private
   */
  Logger.only = function(name) {
    _only = name;
  };


  /**
   * Underlying method to remove the `only` logger instance that can log
   * message
   *
   * @private
   */
  Logger.all = function() {
    _only = null;
  };


  /**
   * Returns a valid console interface with three methods:
   * - log, which logs raw text messages.
   * - error, which logs errors including exceptions.
   * - dir, which logs JSON
   *
   * @returns {{log: function, error: function, dir: function}}
   */
  function getConsole() {
    var _result;
    if (typeof(console) !== 'undefined') {
      _result = console;
    }
    else {
      _result = {log: noop, error: noop, dir: noop};
    }
    return _result;
  }


  /**
   * Method that fills in the target object to make sure we have a valid target
   * we are writing to.
   */
  function ensureTarget(target) {
    if (!target) {
      return getConsole();
    }

    target.log   = target.log   || noop;
    target.error = target.error || noop;
    target.dir   = target.dir   || noop;
    return target;
  }


  /**
   * Helper method to get timestamps for logged message
   *
   * @private
   */
  function getDate() {
    return (new Date()).getTime();
  }


  /**
   * Default logger instance available
   */
  module.exports = new Logger();
}());

},{}],12:[function(require,module,exports){
(function() {
  "use strict";

  var Module = require('../module'),
      Logger = require('../logger'),
      logger = Logger.factory("Meta/Compilation");

  /**
   * The compile step is to convert the moduleMeta to an instance of Module. The
   * fetch provider is in charge of adding the compile interface in the moduleMeta
   * as that is the place with the most knowledge about how the module was loaded
   * from the server/local file system.
   */
  function MetaCompilation(manager, moduleMeta) {
    logger.log(moduleMeta.name, moduleMeta);

    var mod;
    if (Module.Meta.canCompile(moduleMeta)) {
      mod = moduleMeta.compile();
    }
    else if (Module.Meta.isCompiled(moduleMeta)) {
      mod = new Module(moduleMeta);
    }

    if (mod) {
      // We will coerce the name no matter what name (if one at all) the Module was
      // created with. This will ensure a consistent state in the loading engine.
      mod.name = moduleMeta.name;

      // Set the mod.meta for convenience
      mod.meta = moduleMeta;
      return mod;
    }
  }

  module.exports = MetaCompilation;
})();

},{"../logger":11,"../module":17}],13:[function(require,module,exports){
(function() {
  "use strict";

  var Promise = require('../promise'),
      Module  = require('../module'),
      Utils   = require('../utils'),
      Logger  = require('../logger'),
      logger  = Logger.factory("Meta/Dependencies");

  /**
   * Loads up all dependencies for the module
   *
   * @returns {Function} callback to call with the Module instance with the
   *   dependencies to be resolved
   */
  function MetaDependencies(manager, moduleMeta) {
    logger.log(moduleMeta.name, moduleMeta);

    // Return if the module has no dependencies
    if (!Module.Meta.hasDependencies(moduleMeta)) {
      return Promise.resolve(moduleMeta);
    }

    var i, length, loading = new Array(moduleMeta.deps.length);
    for (i = 0, length = moduleMeta.deps.length; i < length; i++) {
      loading[i] = manager.providers.loader.fetch(moduleMeta.deps[i], moduleMeta);
    }

    return Promise.all(loading)
      .then(dependenciesFetched, Utils.forwardError);

    function dependenciesFetched() {
      return moduleMeta;
    }
  }

  module.exports = MetaDependencies;
})();

},{"../logger":11,"../module":17,"../promise":20,"../utils":23}],14:[function(require,module,exports){
(function() {
  "use strict";

  var Promise = require('../promise'),
      Module  = require('../module'),
      Utils   = require('../utils'),
      Logger  = require('../logger'),
      logger  = Logger.factory("Meta/Fetch");

  function MetaFetch(manager, name, parentMeta) {
    logger.log(name);

    return Promise.resolve(manager.fetch(name, parentMeta))
      .then(moduleFetched, Utils.forwardError);

    // Once the module meta is fetched, we want to add helper properties
    // to it to facilitate further processing.
    function moduleFetched(moduleMeta) {
      if (!(moduleMeta instanceof(Module.Meta))) {
        Module.Meta.validate(moduleMeta);
        moduleMeta.deps = moduleMeta.deps || [];
      }

      moduleMeta.name = name;
      return moduleMeta;
    }
  }

  module.exports = MetaFetch;
})();

},{"../logger":11,"../module":17,"../promise":20,"../utils":23}],15:[function(require,module,exports){
(function() {
  "use strict";

  var Utils  = require('../utils'),
      Logger = require('../logger'),
      logger = Logger.factory("Meta/Tranform");

  /**
   * The transform enables transformation providers to process the moduleMeta
   * before it is compiled into an actual Module instance.  This is where steps
   * such as linting and processing coffee files can take place.
   */
  function MetaTransform(manager, moduleMeta) {
    logger.log(moduleMeta.name, moduleMeta);

    return manager.transform.runAll(moduleMeta)
      .then(transformationFinished, Utils.forwardError);

    function transformationFinished() {
      return moduleMeta;
    }
  }

  module.exports = MetaTransform;
})();

},{"../logger":11,"../utils":23}],16:[function(require,module,exports){
(function() {
  "use strict";

  var Promise = require('./promise'),
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

    return this;
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
      handlers.push(this.getProvider(names[i]));
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
   * Gets the middleware provider by name.  It also handles when the middlware
   * handler does not exist.
   *
   * @returns {Provider}
   */
  Middleware.prototype.getProvider = function(name) {
    if (!this.named.hasOwnProperty(name)) {
      throw new TypeError("Middleware provider '" + name + "' does not exist");
    }

    return this.named[name];
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
      return prev.then(function middlewareSequenceNext(next) {
        if (next === false) {
          cancelled = true;
        }

        if (!cancelled && !curr.__pending) {
          logger.log("transformation [start]", curr.name);
          var result = curr.handler.apply(curr, data);
          logger.log("transformation [end]", curr.name);
          return result;
        }
      }, function middlewareSequenceError(err) {
        cancelled = true;
        return err;
      });
    }, Promise.resolve());
  }


  module.exports = Middleware;
}());

},{"./logger":11,"./promise":20,"./utils":23}],17:[function(require,module,exports){
(function() {
  "use strict";

  var Utils = require('./utils');

  var Type = {
    "UNKNOWN" : "UNKNOWN",
    "AMD"     : "AMD",     //Asynchronous Module Definition
    "CJS"     : "CJS",     //CommonJS
    "IIFE"    : "IIFE"     //Immediately-Invoked Function Expression
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


  function Meta(options) {
    Meta.validate(options);
    Utils.extend(this, options);

    if (!options.deps) {
      this.deps = [];
    }
  }


  Meta.validate = function(moduleMeta) {
    if (!moduleMeta) {
      throw new TypeError("Must provide options");
    }

    if (!Meta.isCompiled(moduleMeta) && !Meta.canCompile(moduleMeta)) {
      throw new TypeError("ModuleMeta must provide a `source` string and `compile` interface, or `code`.");
    }
  };


  Meta.hasDependencies = function(moduleMeta) {
    return moduleMeta.deps && moduleMeta.deps.length;
  };


  Meta.isCompiled = function(moduleMeta) {
    return moduleMeta.hasOwnProperty("code") || typeof(moduleMeta.factory) === "function";
  };


  Meta.canCompile = function(moduleMeta) {
    return !Meta.isCompiled(moduleMeta) && typeof(moduleMeta.source) === "string" && typeof(moduleMeta.compile) === "function";
  };


  Module.Meta = Meta;
  Module.Type = Type;
  module.exports = Module;
})();

},{"./utils":23}],18:[function(require,module,exports){
(function(root) {
  "use strict";

  var Logger = require('../logger'),
      logger = Logger.factory("Module/Linker");

  function ModuleLinker(manager, mod) {
    function traverseDependencies(mod) {
      logger.log(mod.name, mod);

      // Get all dependencies to feed them to the module factory
      var deps = mod.deps.map(function resolveDependency(mod_name) {
        if (manager.isModuleCached(mod_name)) {
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

},{"../logger":11}],19:[function(require,module,exports){
(function() {
  "use strict";

  var Promise = require('./promise'),
      Utils   = require('./utils');

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
      return prev.then(cb(curr), Utils.forwardError);
    }, Promise.resolve());
  };

  module.exports = Pipeline;
})();

},{"./promise":20,"./utils":23}],20:[function(require,module,exports){
(function() {
  "use strict";
  module.exports = require("spromise");
}());

},{"spromise":5}],21:[function(require,module,exports){
(function() {
  "use strict";

  var StatefulItems = require('./stateful-items');
  var storage = {};

  var registryId = 0;
  function getRegistryId() {
    return 'generic-' + registryId++;
  }


  /**
   * Module registry
   */
  function Registry(options) {
    options = options || {};
    this._id     = options.id || getRegistryId();
    this.modules = options.modules || new StatefulItems();
  }


  Registry.prototype.clear = function() {
    if (storage.hasOwnProperty(this._id)) {
      delete storage[this._id];
    }
    return this;
  };


  Registry.prototype.hasModule = function(name) {
    return this.modules.hasItem(name);
  };


  Registry.prototype.getModule = function(name) {
    return this.modules.getItem(name);
  };


  Registry.prototype.deleteModule = function(name) {
    return this.modules.removeItem(name);
  };


  Registry.prototype.setModule = function(state, name, item) {
    return this.modules.setItem(state, name, item);
  };


  Registry.prototype.getModuleState = function(name) {
    return this.modules.getState(name);
  };


  Registry.prototype.hasModuleWithState = function(state, name) {
    return this.modules.hasItemWithState(state, name);
  };


  Registry.prototype.getModuleWithState = function(state, name) {
    return this.modules.getItemWithState(state, name);
  };


  /**
   * Factory method that creates Registries with an id
   */
  Registry.getById = function(id) {
    if (!id) {
      id = getRegistryId();
    }

    return storage[id] || (storage[id] = new Registry({id: id}));
  };


  /**
   * Destroys Registries by id.
   */
  Registry.clearById = function(id) {
    if (storage.hasOwnProperty(id)) {
      return storage[id].clear();
    }
  };


  module.exports = Registry;
})();

},{"./stateful-items":22}],22:[function(require,module,exports){
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


  StatefulItems.prototype.getItemWithState = function(state, name) {
    if (!this.hasItemWithState(state, name)) {
      throw new TypeError("`" + name + "` is not " + state);
    }

    return this.items[name].item;
  };


  StatefulItems.prototype.hasItem = function(name) {
    return this.items.hasOwnProperty(name);
  };


  StatefulItems.prototype.getItem = function(name) {
    if (!this.hasItem(name)) {
      throw new TypeError("`" + name + "` not found");
    }

    return this.items[name].item;
  };


  StatefulItems.prototype.removeItem = function(name) {
    if (!this.items.hasOwnProperty(name)) {
      throw new TypeError("`" + name + "` cannot be removed - not found");
    }

    var item = this.items[name];
    delete this.items[name];
    return item.item;
  };


  StatefulItems.prototype.setItem = function(state, name, item) {
    return (this.items[name] = {item: item, state: state}).item;
  };


  module.exports = StatefulItems;
})();

},{}],23:[function(require,module,exports){
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


  function notImplemented() {
    throw new TypeError("Not implemented");
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
    forwardError: forwardError,
    notImplemented: notImplemented
  };
})();

},{}]},{},[7])(7)
});