var logger = require("loggero").create("plugin/registrar");
var Plugin = require("./plugin");
var Handler = require("./handler");
var Builder = require("./builder");
var utils = require("belty");
var types = require("dis-isa");

var _pluginId = 1;
var _handlerId = 1;


/**
 * Registrar is a stateful service for managing registration and loading
 * of plugins.
 */
function Registrar(context, services) {
  this.context = context;
  this.services = services;
  this.plugins = {};
  this.handlers = {};
}


Registrar.prototype.configure = function(options) {
  return utils.merge(this, utils.pick(options, ["plugins", "handlers"]));
};


Registrar.prototype._configure = function(id, options, container, Constructor) {
  var item = container[id] || new Constructor({ context: this, id: id });
  return item.configure(options);
};


Registrar.prototype._items = function(ids, container) {
  return (ids || Object.keys(container)).map(function(id) {
    return container[id];
  });
};


Registrar.prototype.configurePlugin = function(id, options) {
  if (types.isFunction(options)) {
    var servicesMap = this
      .getServiceNames()
      .reduce(function(result, name) {
        result[name] = [];
        return result;
      }, {});

    options = options(new Builder(servicesMap));

    if (options instanceof Builder) {
      options = options.build();
    }
  }

  id = id || options.id;

  if (!id) {
    id = "plugin-" + _pluginId++;
  }

  this.plugins[id] = this._configure(id, options, this.plugins, Plugin);
  return this.plugins[id];
};


Registrar.prototype.getServiceNames = function() {
  return Object.keys(this.services);
};


Registrar.prototype.hasPlugin = function(id) {
  return this.plugins.hasOwnProperty(id);
};


Registrar.prototype.getPlugin = function(id) {
  return this.plugins[id];
};


Registrar.prototype.getPlugins = function(ids) {
  return this._items(ids, this.plugins);
};


Registrar.prototype.configureHandler = function(id, options) {
  if (!id) {
    id = "handler-" + _handlerId++;
  }

  this.handlers[id] = this._configure(id, options, this.handlers, Handler);
  return this.handlers[id];
};


Registrar.prototype.hasHandler = function(id) {
  return this.handlers.hasOwnProperty(id);
};


Registrar.prototype.getHandler = function(id) {
  return this.handlers[id];
};


Registrar.prototype.getHandlers = function(ids) {
  return this._items(ids, this.handlers);
};


Registrar.prototype.loadHandlers = function(ids) {
  if (this.pending) {
    return Promise.resolve();
  }

  var registrar = this;
  var handlers  = registrar.getHandlers(ids);
  var dynamicHandlers = Object
    .keys(handlers)
    .filter(function(key) {
      return handlers[key].isDynamic();
    })
    .map(function(key) {
      return handlers[key];
    });

  if (dynamicHandlers.length) {
    var dynamicHandlerNames = dynamicHandlers
      .map(function(handler) {
        return handler.handler;
      });

    logger.log("loading", dynamicHandlerNames);

    dynamicHandlers.forEach(function(handler) {
      // While the plugin is loading, it cannot process anything. So we will
      // default any calls to it to pass thru. This is in a separate context
      // than application modules, so the only modules that are pass thru
      // are module dependencies for the plugin themselves.
      registrar.configureHandler(handler.id, { handler: utils.noop });
    });

    registrar.pending = registrar.context
      .import(dynamicHandlerNames)
      .then(updateLoadedHandlers(this, dynamicHandlers))
      .then(function() {
        logger.log("loaded", dynamicHandlerNames);
        delete registrar.pending;
      });

    return registrar.pending;
  }

  return Promise.resolve();
};


Registrar.prototype.registerPluginWithService = function(serviceName, pluginId) {
  if (!this.services) {
    throw TypeError("Unable to register plugin. Services have not been configured");
  }

  if (!this.services.hasOwnProperty(serviceName)) {
    throw TypeError("Unable to register plugin. '" + serviceName + "' service does not exist");
  }

  var registrar = this;

  this.services[serviceName].use(function() {
    var plugin = registrar.getPlugin(pluginId);
    var args = [serviceName].concat([].slice.call(arguments));
    return plugin.run.apply(plugin, args);
  });

  return this;
};


Registrar.prototype.serialize = function() {
  return this.getPlugins().map(function(plugin) {
    return plugin.serialize();
  });
};


function updateLoadedHandlers(registrar, handlers) {
  return function(result) {
    handlers.forEach(function(handler, i) {
      registrar.configureHandler(handler.id, { handler: result[i] });
    });
  };
}


module.exports = Registrar;
