(function() {
  "use strict";

  var Promise     = require("promise");
  var Utils       = require("./utils");
  var RuleMatcher = require("./rule-matcher");

  var pluginId = 0;


  /**
   * Plugin
   */
  function Plugin(name, settings) {
    settings = settings || {};
    this.name       = name || ("plugin-" + (pluginId++));
    this.settings   = settings;
    this.services   = settings.services || settings.pipelines;
    this._matches   = {};
    this._delegates = {};
    this._handlers  = {};
  }


  /**
   * Configure plugin
   */
  Plugin.prototype.configure = function(options) {
    var settings = Utils.merge({}, options);

    // Add matching rules
    for (var match in settings.match) {
      if (!settings.match.hasOwnProperty(match)) {
        continue;
      }

      this.addMatchingRules(match, settings.match[match]);
    }

    // Hook into the different services
    for (var serviceName in settings) {
      if (!settings.hasOwnProperty(serviceName) || serviceName === "match") {
        continue;
      }

      this.addHandlers(settings[serviceName], serviceName);
    }

    return this;
  };


  /**
   * Method for adding matching rules used for determining if a
   * module meta should be processed by the plugin or not.
   */
  Plugin.prototype.addMatchingRules = function(name, matches) {
    var rules;
    if (matches && matches.length) {
      rules = this._matches[name] || (this._matches[name] = new RuleMatcher());
      rules.add(configureMatchingRules(matches));
    }

    return this;
  };


  /**
   * Adds handlers for the particular service.
   */
  Plugin.prototype.addHandlers = function(handlers, serviceName) {
    if (!this.services.hasOwnProperty(serviceName)) {
      throw new TypeError("Unable to register plugin for '" + serviceName + "'. '" + serviceName + "' is not found");
    }

    // Make sure we have a good plugin's configuration settings for the service.
    this._handlers[serviceName] = configureHandlers(handlers);

    // Register service delegate if one does not exist.  Delegates are the callbacks
    // registered with the service that when called, the plugins executes all the
    // plugin's handlers in a promise sequence.
    if (!this._delegates[serviceName]) {
      this._delegates[serviceName] = createHandlerDelegate(this, serviceName);
      registerHandlerDelegate(this, this.services[serviceName], this._delegates[serviceName]);
    }

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
  function registerHandlerDelegate(plugin, service, handlerDelegate) {
    service.use({
      name    : plugin.name,
      match   : plugin._matches,
      handler : handlerDelegate
    });
  }


  /**
   * Creates handler for service to handle module meta objects
   */
  function createHandlerDelegate(plugin, serviceName) {
    return function handlerDelegate(moduleMeta) {
      if (!canExecute(plugin._matches, moduleMeta)) {
        return Promise.resolve();
      }

      // This is a nasty little sucker with nested layers of promises...
      // Handlers themselves can return promises and get injected into
      // the promise sequence.
      return plugin._handlers[serviceName].reduce(function(prev, curr) {
        return prev.then(function pluginHandler() {
          return curr.call(plugin, moduleMeta);
        }, Utils.reportError);
      }, Promise.resolve());
    };
  }


  /**
   * Function that goes through all the handlers and configures each one. This is
   * where handle things like if a handler is a string, then we assume it is the
   * name of a module that we need to load...
   */
  function configureHandlers(handlers) {
    // Must provide handlers for the plugin's target
    if (!handlers) {
      throw new TypeError("Plugin must have 'handlers' defined");
    }

    if (Utils.isFunction(handlers)) {
      handlers = [handlers];
    }
    else if (Utils.isString(handlers)) {
      handlers = [handlers];
    }

    return handlers.map(function(handler) {
      if (!handler || (!Utils.isString(handler) && !Utils.isFunction(handler))) {
        throw new TypeError("Plugin handler must be a string or a function");
      }

      if (Utils.isString(handler)) {
        // load dynamic plugin handler
      }

      return handler;
    });
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
      if (plugin.match) {
        return canExecute(plugin.match, moduleMeta);
      }
      return true;
    };
  }


  Plugin.canExecute       = canExecute;
  Plugin.createCanExecute = createCanExecute;
  module.exports = Plugin;
}());
