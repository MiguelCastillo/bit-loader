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
    this.name     = name || ("plugin-" + (pluginId++));
    this.target   = target;
    this._matches = {};
  }


  /**
   * Configure plugin
   */
  Plugin.prototype.configure = function(options) {
    var target   = this.target;
    var settings = Utils.merge({}, options);

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

      regiterHandlers(this, settings[targetItem], target[targetItem]);
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
   * Register pipeline handlers
   */
  function regiterHandlers(plugin, settings, pipeline) {
    settings = configureHandlers(settings);

    if (!settings.handler) {
      throw new TypeError("Plugin must have handlers defined");
    }

    pipeline.use({
      name    : plugin.name,
      handler : createHandler(plugin, settings)
    });
  }


  /**
   * Configures pipeline handlers
   */
  function configureHandlers(settings) {
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
   * Creates handler for pipeline to handle module meta objects
   */
  function createHandler(plugin, settings) {
    return function handlerDelegate(moduleMeta) {
      if (!canExecute(plugin, moduleMeta)) {
        return Promise.resolve();
      }


      // This is a nasty little sucker with nested layers of promises...
      // Handlers themselves can return promises and get injected in the
      // sequence.
      return settings.handler.reduce(function(prev, curr) {
        return prev.then(function pluginHandler() {
          return curr.call(plugin, moduleMeta);
        }, Utils.reportError);
      }, Promise.resolve());
    };
  }


  /**
   * Checks if the handler can process the module meta object based on
   * the matching rules for path and name.
   */
  function canExecute(plugin, moduleMeta) {
    var ruleLength, allLength = 0;

    for (var match in plugin._matches) {
      if (!plugin._matches.hasOwnProperty(match)) {
        continue;
      }

      ruleLength = plugin._matches[match].getLength();
      allLength += ruleLength;

      if (ruleLength && plugin._matches[match].match(moduleMeta[match])) {
        return true;
      }
    }

    // If there was no matching rule, then we will return true.  That's because
    // if there weren't any rules put in place to restrict module processing,
    // then the assumption is that the module can be processed.
    return !allLength;
  }


  module.exports = Plugin;
}());
