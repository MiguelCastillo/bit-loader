var logger    = require("loggero").create("plugin/registrar");
var Manager   = require("./manager");
var utils     = require("belty");
var _plugins  = {};
var _handlers = {};
var managerId = 1;


/**
 * Registrar is a stateful service for managing registration and loading
 * of plugins.
 */
function Registrar(context, services) {
  this.context   = context;
  this.services  = services;
  this._managers = {};
}


Registrar.prototype.configure = function(name, settings) {
  this
    .getManager(name)
    .configure(settings);

  return this;
};


Registrar.prototype.registerHandler = function(id, handler) {
  _handlers[id] = handler;
  return this;
};


Registrar.prototype.hasHandler = function(id) {
  return _handlers.hasOwnProperty(id);
};


Registrar.prototype.getHandler = function(id) {
  return _handlers[id];
};


Registrar.prototype.getAllHandlers = function() {
  return _handlers;
};


Registrar.prototype.registerPlugin = function(id, plugin) {
  _plugins[id] = plugin;
};


Registrar.prototype.hasPlugin = function(id) {
  return _plugins.hasOwnProperty(id);
};


Registrar.prototype.getPlugin = function(id) {
  return _plugins[id];
};


Registrar.prototype.getAllPlugins = function() {
  return _plugins;
};


Registrar.prototype.loadHandlers = function() {
  if (this.pending) {
    return this.pending;
  }

  var registrar = this;
  var handlers  = registrar.getAllHandlers();

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
      registrar.registerHandler(handler.id, handler.configure({ handler: utils.noop }));
    });

    registrar.pending = registrar.context
      .config()
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


Registrar.prototype.registerPluginWithService = function(serviceName, plugin) {
  if (!this.services) {
    throw TypeError("Unable to register plugin. Services have not been configured");
  }

  if (!this.services.hasOwnProperty(serviceName)) {
    throw TypeError("Unable to register plugin. '" + plugin.name + "' service does not exist");
  }

  this.services[serviceName].use(plugin);
  return this;
};


Registrar.prototype.getManager = function(name) {
  if (!name) {
    name = managerId++;
  }

  if (!this._managers.hasOwnProperty(name)) {
    this._managers[name] = new Manager(this);
  }

  return this._managers[name];
};


function updateLoadedHandlers(registrar, handlers) {
  return function(result) {
    handlers.forEach(function(handler, i) {
      handler = registrar.getHandler(handler.id).configure({ handler: result[i] });
      registrar.registerHandler(handler.id, handler);
    });
  };
}


module.exports = Registrar;
