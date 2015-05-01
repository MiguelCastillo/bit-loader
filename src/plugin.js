(function() {
  "use strict";

  var Promise     = require('promise');
  var Utils       = require('./utils');
  var RuleMatcher = require('./rule-matcher');

  var pluginId = 0;


  /**
   * Plugin
   */
  function Plugin(name, manager) {
    this.name       = name || ("plugin-" + (pluginId++));
    this.manager    = manager;

    this._matchPath = new RuleMatcher();
    this._matchName = new RuleMatcher();
  }


  /**
   * Configure plugin
   */
  Plugin.prototype.configure = function(options) {
    var pipelines = this.manager.pipelines;
    var settings  = Utils.merge({}, options);

    this.matchPath(settings.matchPath);
    this.matchName(settings.matchName);

    // Remove the matching rules, if any exist... The rest can only be pipeline
    // items.  So if there is stuff in the plugin config that is not in the
    // pipeline, the plugin registration will not be successful.
    delete settings.matchPath;
    delete settings.matchName;

    for (var target in settings) {
      if (!settings.hasOwnProperty(target)) {
        continue;
      }

      if (!pipelines.hasOwnProperty(target)) {
        throw new TypeError("Unable to register plugin for `" + target + "`. '" + target + "' is not found");
      }

      regiterHandlers(this, settings[target], pipelines[target]);
    }

    return this;
  };


  /**
   * Adds path matching rules
   */
  Plugin.prototype.matchPath = function(matches) {
    if (matches && matches.length) {
      this._matchPath.add(configureMatches(matches));
    }
    return this;
  };


  /**
   * Add name matching rules
   */
  Plugin.prototype.matchName = function(matches) {
    if (matches && matches.length) {
      this._matchName.add(configureMatches(matches));
    }
    return this;
  };


  /**
   * Configures matches
   */
  function configureMatches(matches) {
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
  function configureHandlers(options) {
    if (Utils.isFunction(options)) {
      options = {
        handler: [options]
      };
    }
    else if (Utils.isArray(options)) {
      options = {
        handler: options
      };
    }
    else if (Utils.isFunction(options.handler)) {
      options.handler = [options.handler];
    }

    return options;
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
        return prev.then(function() {
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
    var matchPathLength = plugin._matchPath.getLength();
    if (matchPathLength && plugin._matchPath.match(moduleMeta.path)) {
      return true;
    }

    var matchNameLength = plugin._matchName.getLength();
    if (matchNameLength && plugin._matchName.match(moduleMeta.name)) {
      return true;
    }

    return !matchPathLength && !matchNameLength;
  }

  module.exports = Plugin;
}());
