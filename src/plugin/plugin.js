var utils = require("belty");
var types = require("dis-isa");
var Builder = require("./builder");
var Matches = require("../matches");
var inherit = require("../inherit");
var blueprint = require("../blueprint");


var defaultServiceHooks = {
  resolve: [],
  fetch: [],
  pretransform: [],
  transform: [],
  dependency: [],
  precompile: []
};


var PluginBlueprint = blueprint(utils.merge({
  context: null,
  id: null,

  // pattern mathing rules
  matchers: new Matches()
}, defaultServiceHooks));


function Plugin(options) {
  PluginBlueprint.call(this);
  return this.merge(utils.pick(options, ["id", "context"]));
}


inherit.base(Plugin).extends(PluginBlueprint);


Plugin.prototype.configure = function(options) {
  var plugin = this;
  var configuration = configurPlugin(options);
  var serviceHooks = utils.pick(configuration, Object.keys(defaultServiceHooks));

  var handlers = Object
    .keys(serviceHooks)
    .reduce(function(container, serviceName) {
      if (!plugin[serviceName].length) {
        plugin.context.registerPluginWithService(serviceName, plugin.id);
      }

      var handlerIds = utils
        .toArray(serviceHooks[serviceName])
        .map(function(config) {
          var handler = plugin.context.configureHandler(config.id, configureHandler(config));
          return handler.id;
        });

      container[serviceName] = plugin[serviceName].concat(handlerIds);
      return container;
    }, {});

  return this
    .merge(handlers)
    .merge({ matchers: this.matchers.configure(configuration.matchers || configuration) });
};


/**
 * Runs all plugin handlers to process the data.
 */
Plugin.prototype.run = function(serviceName, data) {
  var plugin = this;
  var handlers = this[serviceName];
  var cancelled = false;

  if (!types.isString(serviceName)) {
    throw new Error("Service name must be a string");
  }

  if (!handlers) {
    throw new Error("Service '" + serviceName + "' is unknown");
  }

  function cancel() {
    cancelled = true;
  };

  function canRun(data) {
    if (!cancelled) {
      return data;
    }
  }

  return plugin.context.loadHandlers().then(function() {
    return handlers
      .map(function(id) {
        return plugin.context.getHandler(id);
      })
      .filter(function(handler) {
        return handler.canExecute(data);
      })
      .reduce(function(current, handler) {
        return current
          .then(canRun)
          .then(runHandler(handler, cancel));
      }, Promise.resolve(data));
  });
};


Plugin.prototype.serialize = function() {
  var plugin = this;

  var handlers = Object
    .keys(defaultServiceHooks)
    .filter(function(serviceName) {
      return plugin[serviceName].length;
    })
    .map(function(serviceName) {
      return {
        serviceName: serviceName,
        handlers: plugin[serviceName]
      };
    })
    .reduce(function(handlers, handlerConfigs) {
      handlers[handlerConfigs.serviceName] = handlerConfigs.handlers.map(function(handlerId) {
        return plugin.context.getHandler(handlerId).serialize();
      });

      return handlers;
    }, {});

  return utils.merge(utils.pick(this, ["id"]), handlers);
};


function configurPlugin(options) {
  if (types.isFunction(options)) {
    options = options(new Builder());

    if (options instanceof Builder) {
      options = options.build();
    }
  }

  return options;
}


function configureHandler(options) {
  if (types.isFunction(options) || types.isString(options)) {
    options = {
      handler: options
    };
  }

  return options;
}



/**
 * Method that return a function that executes a plugin handler.
 */
function runHandler(handler, cancel) {
  return function runHandlerDelegate(data) {
    if (!data) {
      return Promise.resolve();
    }

    return Promise
      .resolve(handler)
      .then(function(handler) {
        return handler.run(data, cancel);
      })
      .then(function(result) {
        return data.configure(result);
      });
  };
}


module.exports   = Plugin;
