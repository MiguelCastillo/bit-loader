var logger = require("loggero").create("plugin/registrar");
var Manager = require("./manager");
var Plugin = require("./plugin");
var Handler = require("./handler");
var utils = require("belty");
var _managerId = 1;


/**
 * Registrar is a stateful service for managing registration and loading
 * of plugins.
 */
function Registrar(context, services) {
  this.context = context;
  this.services = services;
  this.managers = {};
  this.plugins = {};
  this.handlers = {};
}


Registrar.prototype.configure = function(options) {
  return utils.merge(this, utils.pick(options, ["managers", "plugins", "handlers"]));
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


Registrar.prototype.configureManager = function(id, options) {
  if (!id) {
    id = _managerId++;
  }

  this.managers[id] = this._configure(id, options, this.managers, Manager);
  return this;
};


Registrar.prototype.hasManager = function(id) {
  return this.managers.hasOwnProperty(id);
};


Registrar.prototype.getManager = function(id) {
  return this.managers[id];
};


Registrar.prototype.getManagers = function(ids) {
  return this._items(ids, this.managers);
};


Registrar.prototype.configurePlugin = function(id, options) {
  this.plugins[id] = this._configure(id, options, this.plugins, Plugin);
  return this;
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
  this.handlers[id] = this._configure(id, options, this.handlers, Handler);
  return this;
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


Registrar.prototype.registerPluginWithService = function(serviceName, pluginDelegate) {
  if (!this.services) {
    throw TypeError("Unable to register plugin. Services have not been configured");
  }

  if (!this.services.hasOwnProperty(serviceName)) {
    throw TypeError("Unable to register plugin. '" + serviceName + "' service does not exist");
  }

  this.services[serviceName].use(pluginDelegate);
  return this;
};


Registrar.prototype.serialize = function() {
  return this.getManagers().map(function(manager) {
    return manager.serialize();
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
