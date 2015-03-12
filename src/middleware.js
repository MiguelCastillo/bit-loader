(function() {
  "use strict";

  var Promise = require('./promise'),
      Logger  = require('./logger'),
      Utils   = require('./utils'),
      logger  = Logger.factory("Middleware");

  /**
   * @constructor For checking middleware provider instances
   */
  function Provider(middleware, options) {
    if (Utils.isFunction(options)) {
      this.handler = options;
    }
    else if (Utils.isString(options)) {
      this.name = options;
      this.handler = deferredHandler(middleware, this);
    }
    else if (Utils.isPlainObject(options)) {
      if (!Utils.isFunction(options.handler)) {
        if (Utils.isString(options.name)) {
          this.handler = deferredHandler(middleware, this);
        }
        else {
          throw new TypeError("Middleware provider must have a handler method or a name");
        }
      }

      Utils.merge(this, options);
    }
  }


  /**
   * Middleware provides a mechanism for registering `plugins` that can be
   * called in the order in which they are registered.  These middlewares can
   * be module names that can be loaded at runtime or can be functions.
   */
  function Middleware(options) {
    this.settings  = options || {};
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
   *   be registered in this middleware instance.
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
        provider = new Provider(this, providers[provider]);
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
    var providers = [];

    for (i = 0, length = names.length; i < length; i++) {
      providers.push(this.getProvider(names[i]));
    }

    return _runProviders(providers, Array.prototype.slice.call(arguments, 1));
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


  Middleware.Provider = Provider;


  /**
   * @private
   * Method that enables chaining in providers that have to be dynamically loaded.
   */
  function deferredHandler(middleware, provider) {
    if (!middleware.settings.import) {
      throw new TypeError("You must configure an import method in order to dynamically load middleware providers");
    }

    return function deferredHandlerDelegate() {
      var args = arguments;
      provider.__pending = true;

      logger.log("import [start]", provider);
      return (provider.handler = middleware.settings
        .import(provider.name)
        .then(providerReady, Utils.reportError));


      // Callback when provider is loaded
      function providerReady(handler) {
        logger.log("import [end]", provider);
        delete provider.__pending;
        return (provider.handler = handler).apply(provider, args);
      }
    };
  }


  /**
   * @private
   * Method that runs a cancellable sequence of promises.
   */
  function _runProviders(providers, data) {
    return providers.reduce(providerSequence, Promise.resolve());

    // Method that runs the sequence of providers
    function providerSequence(prev, curr) {
      var cancelled = false;
      return prev.then(providerSequenceRun, providerSequenceError);

      function providerSequenceRun(result) {
        if (result === false) {
          cancelled = true;
        }

        if (!cancelled && !curr.__pending) {
          return curr.handler.apply(curr, data);
        }
      }

      function providerSequenceError(err) {
        cancelled = true;
        return err;
      }
    }
  }


  module.exports = Middleware;
}());
