(function() {
  "use strict";

  var Promise = require('spromise'),
      Utils   = require('./utils');


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
  Middleware.prototype.use = function(provider) {
    if (Utils.isFunction(provider)) {
      provider = {handler: provider};
    }
    else if (Utils.isString(provider)) {
      var name = provider;
      provider = {};
      provider.handler = _deferred(this, name, provider);
      this.named[name] = provider;
    }
    else if (Utils.isPlainObject(provider)) {
      if (provider.name) {
        this.named[provider.name] = provider;
      }

      if (!Utils.isFunction(provider.handler)) {
        throw new TypeError("Middleware provider must have a handler method");
      }
    }

    this.providers.push(provider);
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

    return _runProvider(handlers, Array.prototype.slice.call(arguments, 1));
  };


  /**
   * Method to run all registered providers in the order in which they were
   * registered.
   *
   * @returns {Promise}
   */
  Middleware.prototype.runAll = function() {
    return _runProvider(this.providers, arguments);
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

    return Utils.extend(instance, middleware);
  };


  /**
   * @private
   * Method that enables chaining in providers that have to be dynamically loaded.
   */
  function _deferred(middleware, name, provider) {
    return function() {
      var context = this,
          args    = arguments;

      return middleware.manager.import(name).then(function(handler) {
        provider.handler = handler;
        return handler.apply(context, args);
      });
    };
  }


  /**
   * @private
   * Method that runs a cancellable sequence of promises.
   */
  function _runProvider(provider, data) {
    var cancelled = false;

    return provider.reduce(function(prev, curr) {
      return prev.then(function() {
        if (arguments.length) {
          cancelled = true;
        }

        if (cancelled) {
          return;
        }

        return curr.handler.apply(curr, data);
      }, function(err) {
        cancelled = true;
        return err;
      });
    }, Promise.resolve());
  }


  module.exports = Middleware;
})();
