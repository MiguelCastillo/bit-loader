(function() {
  "use strict";

  var Promise = require('./promise'),
      Utils   = require('./utils'),
      logger  = require('./logger').factory("Middleware");


  /**
   * @constructor For checking middleware provider instances
   */
  function Provider(middleware, options) {
    this.middleware = middleware;
    this.configure(options);
  }


  /**
   * Configure the provider with the given options.  Options will be processed
   * and merged into the provided as needed.
   *
   * @param {object} options - Options to configure the provider with.
   */
  Provider.prototype.configure = function(options) {
    var middleware = this.middleware;

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
  };


  /**
   * Method that determines if the handler should be called and then calls
   * if need be.
   *
   * @returns {Promise} Promise returned from the call to the handler.
   */
  Provider.prototype.execute = function(data) {
    return this.handler.apply(this, data);
  };


  /**
   * Method that is called to handler a request.
   */
  Provider.prototype.handler = function() {
    throw new TypeError("Must be implemented");
  };


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
   * Method to register middleware providers. Providers can be methods, a module name,
   * or an object.
   *
   * For example, the provider below is just a method that will get invoked when
   * running the entire sequence of providers. The provider is registered as an
   * anonymous provider.
   *
   * ``` javascript
   * middleware.use(function() {
   *   console.log("1");
   * });
   * ```
   *
   * But registering a provider as a name will cause the middleware engine to
   * dynamically load it at runtime, and can also be executed by name.
   *
   * ``` javascript
   * middleware.use(`concat`);
   * middleware.run(`concat`);
   * ```
   *
   * The alternative for registering named providers is to pass in a `Object` with a
   * `handler` method and a `name`.  The name is only required if you are interested in
   * more control for executing the provider.
   *
   * ``` javascript
   * middleware.use({
   *  name: "concat",
   *  handler: function() {
   *  }
   * });
   *
   * // Will only run `concat`
   * middleware.run(`concat`);
   *
   * // Will run all registered providers, including `concat`
   * middleware.runAll();
   * ```
   *
   * @param {Object | Array<Object>} providers - One or collection of providers to
   *   be registered in this middleware instance.
   *
   * @returns {Middleware} Returns instance of Middleware
   */
  Middleware.prototype.use = function(providers) {
    if (!Utils.isArray(providers)) {
      providers = [providers];
    }

    var i, length, provider;
    for (i = 0, length = providers.length; i < length; i++) {
      provider = providers[i];

      if (!provider) {
        throw new TypeError("Middleware provider must not be empty");
      }

      if (provider.name && this.hasProvider(provider.name)) {
        Utils.merge(this.getProvider(provider.name), provider);
      }
      else {
        provider = new Provider(this, provider);
        this.providers.push(provider);

        if (Utils.isString(provider.name)) {
          this.named[provider.name] = provider;
        }
      }
    }

    return this;
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
   * Determines whether or not the provider with the specific name is already
   * registered.
   *
   * @param {string} name - Name of the provider.
   * @returns {boolean} Whether or not the named provider is already registered
   */
  Middleware.prototype.hasProvider = function(name) {
    return this.named.hasOwnProperty(name);
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
  Middleware.prototype.run = function(names, data, canExecuteProvider) {
    if (Utils.isString(names)) {
      names = [names];
    }

    if (!Utils.isArray(names)) {
      throw new TypeError("List of handlers must be a string or an array of names");
    }

    if (data && !Utils.isArray(data)) {
      data = [data];
    }

    var i, length;
    var providers = [];

    for (i = 0, length = names.length; i < length; i++) {
      providers.push(this.getProvider(names[i]));
    }

    return _runProviders(providers, data, canExecuteProvider);
  };


  /**
   * Method to run all registered providers in the order in which they were
   * registered.
   *
   * @returns {Promise}
   */
  Middleware.prototype.runAll = function(data, canExecuteProvider) {
    if (data && !Utils.isArray(data)) {
      data = [data];
    }

    return _runProviders(this.providers, data, canExecuteProvider);
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

    function importProvider() {
      if (!provider.__pending) {
        logger.log("import [start]", provider);
        provider.__pending = middleware.settings
          .import(provider.name)
          .then(providerImported, Utils.reportError);
      }
      else {
        logger.log("import [pending]", provider);
      }

      return provider.__pending;
    }

    function providerImported(handler) {
      logger.log("import [end]", provider);
      delete provider.__pending;
      provider.configure(handler);
    }


    return function deferredHandlerDelegate() {
      var data = arguments;

      // Callback when provider is loaded
      function providerReady() {
        return provider.execute(data);
      }

      return importProvider().then(providerReady, Utils.reportError);
    };
  }


  /**
   * @private
   * Method that runs a cancellable sequence of promises.
   */
  function _runProviders(providers, data, canExecuteProvider) {
    // Method that runs the sequence of providers
    function providerSequence(result, provider) {
      var cancelled = false;

      function providerSequenceRun(result) {
        if (result === false) {
          cancelled = true;
        }

        if (!cancelled) {
          if (!canExecuteProvider || (canExecuteProvider && canExecuteProvider(provider) !== false)) {
            return provider.execute(data);
          }
        }
      }

      function providerSequenceError(err) {
        cancelled = true;
        return err;
      }

      return result.then(providerSequenceRun, providerSequenceError);
    }

    return providers.reduce(providerSequence, Promise.resolve());
  }


  module.exports = Middleware;
}());
