(function() {
  "use strict";

  var Promise     = require("promise");
  var Utils       = require("./utils");
  var RuleMatcher = require("./rule-matcher");
  var logger      = require("./logger").factory('Plugin');

  var pluginId = 0;


  /**
   * Plugin
   */
  function Plugin(name, options) {
    options = options || {};
    this.name       = name || ("plugin-" + (pluginId++));
    this.settings   = options;
    this.services   = options.services || options.pipelines;
    this._matches   = {};
    this._delegates = {};
    this._handlers  = {};
    this._deferred  = {};
  }


  /**
   * Configure plugin
   */
  Plugin.prototype.configure = function(options) {
    var settings = Utils.merge({}, options);

    // Add matching rules
    for (var matchName in settings.match) {
      if (!settings.match.hasOwnProperty(matchName)) {
        continue;
      }

      this.addMatchingRules(matchName, settings.match[matchName]);
    }

    // Hook into the different services
    for (var serviceName in settings) {
      if (!settings.hasOwnProperty(serviceName) || serviceName === "match") {
        continue;
      }

      this.addHandlers(serviceName, settings[serviceName]);
    }

    return this;
  };


  /**
   * Method for adding matching rules used for determining if a
   * module meta should be processed by the plugin or not.
   */
  Plugin.prototype.addMatchingRules = function(matchName, matches) {
    var rules;
    if (matches && matches.length) {
      rules = this._matches[matchName] || (this._matches[matchName] = new RuleMatcher());
      rules.add(configureMatchingRules(matches));
    }

    return this;
  };


  /**
   * Adds handlers for the particular service.
   */
  Plugin.prototype.addHandlers = function(serviceName, handlers) {
    if (!this.services.hasOwnProperty(serviceName)) {
      throw new TypeError("Unable to register plugin for '" + serviceName + "'. '" + serviceName + "' is not found");
    }

    // Register service delegate if one does not exist.  Delegates are the callbacks
    // registered with the service that when called, the plugins executes all the
    // plugin's handlers in a promise sequence.
    if (!this._delegates[serviceName]) {
      this._delegates[serviceName] = createServiceHandler(this, serviceName);
      registerServiceHandler(this, this.services[serviceName], this._delegates[serviceName]);
    }

    // Make sure we have a good plugin's configuration settings for the service.
    this._handlers[serviceName] = configurePluginHandlers(this, serviceName, handlers);

    return this;
  };


  /**
   * Configures matches
   */
  function configureMatchingRules(matches) {
    if (Utils.isString(matches)) {
      matches = [matches];
    }

    return Utils.isArray(matches) ? matches : [];
  }


  /**
   * Register service handler delegate
   */
  function registerServiceHandler(plugin, service, handler) {
    service.use({
      name    : plugin.name,
      match   : plugin._matches,
      handler : handler
    });
  }


  /**
   * Creates service handler to process module meta objects
   */
  function createServiceHandler(plugin, serviceName) {

    // The service handler iterates through all the plugin handlers
    // passing in the correspoding module meta to be processed.
    return function handlerDelegate(moduleMeta) {
      function handlerIterator(prev, handlerConfig) {
        function pluginHandler() {
          return handlerConfig.handler.call(handlerConfig, moduleMeta, handlerConfig.options);
        }
        return prev.then(pluginHandler, Utils.reportError);
      }

      // This is a nasty little sucker with nested layers of promises...
      // Handlers themselves can return promises and get injected into
      // the promise sequence.
      return plugin._handlers[serviceName].reduce(handlerIterator, Promise.resolve());
    };
  }


  /**
   * Function that goes through all the handlers and configures each one. This is
   * where handle things like if a handler is a string, then we assume it is the
   * name of a module that we need to load...
   */
  function configurePluginHandlers(plugin, serviceName, handlers) {
    // Must provide handlers for the plugin's target
    if (!handlers) {
      throw new TypeError("Plugin must have 'handlers' defined");
    }

    if (!Utils.isArray(handlers)) {
      handlers = [handlers];
    }


    function handlerIterator(handlerConfig, i) {
      if (!handlerConfig) {
        throw new TypeError("Plugin handler must be a string, a function, or an object with a handler that is a string or a function");
      }

      if (Utils.isFunction(handlerConfig) || Utils.isString(handlerConfig)) {
        handlerConfig = {
          handler: handlerConfig
        };
      }

      // Handle dynamic handler loading
      if (Utils.isString(handlerConfig.handler)) {
        var handlerName = handlerConfig.handler;

        handlerConfig.handler = function deferredHandlerDelegate(moduleMeta) {
          function handlerReady(newhandler) {
            // Naive approach to make sure we replace the proper handler
            if (handlerConfig === handlers[i]) {
              handlers[i].handler = newhandler;
              return newhandler.call(handlerConfig, moduleMeta, handlerConfig.options);
            }
            else {
              return Promise.reject(new TypeError("Unable to register '" + serviceName + ":" + handlerName + "'. The collection of handlers has mutated."));
            }
          }

          return deferredPluginHandler(plugin, serviceName, handlerName).then(handlerReady, Utils.reportError);
        };
      }

      if (!Utils.isFunction(handlerConfig.handler)) {
        throw new TypeError("Plugin handler must be a function or a string");
      }

      return handlerConfig;
    }


    return (handlers = handlers.map(handlerIterator));
  }


  /**
   * Create a handler delegate that when call, it loads a module to be used
   * as the actual handler used in a service.
   */
  function deferredPluginHandler(plugin, serviceName, handlerName) {
    if (!plugin.settings.import) {
      throw new TypeError("You must configure an import method in order to dynamically load plugin handlers");
    }

    // Create a name that won't conflict with other deferred handlers in
    // the plugin.
    var deferredName = serviceName + ":" + handlerName;

    // Function that imports the service handler and makes sure to manage
    // caching to prevent multiple calls to import
    function importHandler() {
      if (!plugin._deferred[deferredName]) {
        logger.log("import [start]", deferredName, plugin);
        plugin._deferred[deferredName] = plugin.settings.import(handlerName);
      }
      else {
        logger.log("import [pending]", deferredName, plugin);
      }

      return plugin._deferred[deferredName];
    }

    // Callback when provider is loaded
    function handlerReady(handler) {
      if (plugin._deferred[deferredName]) {
        logger.log("import [end]", deferredName, plugin);
        delete plugin._deferred[deferredName];
      }

      return handler;
    }

    return importHandler().then(handlerReady, Utils.reportError);
  }


  /**
   * Checks if the handler can process the module meta object based on
   * the matching rules for path and name.
   */
  function canExecute(matches, moduleMeta) {
    var ruleLength, allLength = 0;

    if (matches) {
      for (var match in matches) {
        if (!matches.hasOwnProperty(match)) {
          continue;
        }

        ruleLength = matches[match].getLength();
        allLength += ruleLength;

        if (ruleLength && matches[match].match(moduleMeta[match])) {
          return true;
        }
      }
    }

    // If there was no matching rule, then we will return true.  That's because
    // if there weren't any rules put in place to restrict module processing,
    // then the assumption is that the module can be processed.
    return !allLength;
  }


  function createCanExecute(moduleMeta) {
    return function canExecuteDelegate(plugin) {
      return canExecute(plugin.match, moduleMeta);
    };
  }


  Plugin.canExecute       = canExecute;
  Plugin.createCanExecute = createCanExecute;
  module.exports = Plugin;
}());
