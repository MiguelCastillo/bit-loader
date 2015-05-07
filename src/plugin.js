(function() {
  "use strict";

  var Promise     = require("promise");
  var Utils       = require("./utils");
  var RuleMatcher = require("./rule-matcher");

  var pluginId = 0;


  /**
   * Plugin
   */
  function Plugin(name, target) {
    this.name       = name || ("plugin-" + (pluginId++));
    this.target     = target;
    this._matches   = {};
    this._delegates = {};
    this._handlers  = {};
  }


  /**
   * Configure plugin
   */
  Plugin.prototype.configure = function(options) {
    var target   = this.target;
    var settings = Utils.merge({}, options);
    var pluginSettings;

    // Add matching rules
    if (settings.match) {
      for (var match in settings.match) {
        if (!settings.match.hasOwnProperty(match)) {
          continue;
        }

        this.addMatchingRules(match, settings.match[match]);
      }
    }


    // Hook into the different pipelines
    for (var targetItem in settings) {
      if (!settings.hasOwnProperty(targetItem) || targetItem === "match") {
        continue;
      }

      if (!target.hasOwnProperty(targetItem)) {
        throw new TypeError("Unable to register plugin for '" + targetItem + "'. '" + targetItem + "' is not found");
      }

      // Make sure we have a good plugin's configuration settings for the target.
      pluginSettings = configurePlugin(settings[targetItem]);

      // Must provide handlers for the plugin's target
      if (!pluginSettings.handler) {
        throw new TypeError("Plugin must have 'handler' defined");
      }

      // Let's store the handlers that will get called.
      this._handlers[targetItem] = pluginSettings.handler;

      // Register target delegate is one does not exist.  Delegates are the callbacks
      // registered with the target that when called will execute all the registered
      // handlers in a promise sequence.
      if (!this._delegates[targetItem]) {
        this._delegates[targetItem] = registerDelegate(this, target[targetItem], targetItem);
      }
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
   * Configures matches
   */
  function configureMatchingRules(matches) {
    if (Utils.isString(matches)) {
      matches = [matches];
    }
    return Utils.isArray(matches) ? matches : [];
  }


  /**
   * Register pipeline handler delegate
   */
  function registerDelegate(plugin, pipeline, targetName) {
    var targetDelegate = createHandler(plugin, targetName);

    pipeline.use({
      name    : plugin.name,
      match   : plugin._matches,
      handler : targetDelegate
    });

    return targetDelegate;
  }


  /**
   * Creates handler for pipeline to handle module meta objects
   */
  function createHandler(plugin, targetName) {
    return function handlerDelegate(moduleMeta) {
      if (!canExecute(plugin._matches, moduleMeta)) {
        return Promise.resolve();
      }


      // This is a nasty little sucker with nested layers of promises...
      // Handlers themselves can return promises and get injected in the
      // sequence.
      return plugin._handlers[targetName].reduce(function(prev, curr) {
        return prev.then(function pluginHandler() {
          return curr.call(plugin, moduleMeta);
        }, Utils.reportError);
      }, Promise.resolve());
    };
  }


  /**
   * Configures pipeline handlers
   */
  function configurePlugin(settings) {
    if (Utils.isFunction(settings)) {
      settings = {
        handler: [settings]
      };
    }
    else if (Utils.isArray(settings)) {
      settings = {
        handler: settings
      };
    }
    else if (Utils.isFunction(settings.handler)) {
      settings.handler = [settings.handler];
    }

    return settings;
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
