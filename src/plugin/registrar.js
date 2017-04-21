var Plugin = require("./plugin");
var Builder = require("./builder");
var utils = require("belty");
var types = require("dis-isa");

var _pluginId = 1;


/**
 * Registrar is a stateful service for managing registration and loading
 * of plugins.
 */
function Registrar(context, services) {
  this.context = context;
  this.services = services;
  this.plugins = {};
}


Registrar.prototype.configure = function(options) {
  return utils.merge(this, utils.pick(options, ["plugins"]));
};


Registrar.prototype.configurePlugin = function(id, options) {
  if (types.isFunction(options)) {
    var servicesMap = Object.keys(this.services)
      .reduce(function(result, name) {
        result[name] = [];
        return result;
      }, {});

    options = options(new Builder(servicesMap));

    if (options instanceof Builder) {
      options = options.build();
    }
  }

  id = id || options.id || "plugin-" + _pluginId++;

  var currentPlugin = this.plugins[id] || new Plugin({ context: this, id: id });
  var updatedPlugin = currentPlugin.configure(options);
  var registrar = this;

  Object
    .keys(updatedPlugin.handlers)
    .filter(function(serviceName) {
      return !currentPlugin.handlers[serviceName];
    })
    .forEach(function(serviceName) {
      registrar.registerPluginWithService(serviceName, id);
    });

  this.plugins[id] = updatedPlugin;
  return this.plugins[id];
};


Registrar.prototype.hasPlugin = function(id) {
  return this.plugins.hasOwnProperty(id);
};


Registrar.prototype.getPlugin = function(id) {
  return this.plugins[id];
};


Registrar.prototype.getPlugins = function(ids) {
  var registrar = this;

  return (ids || Object.keys(registrar.plugins)).map(function(id) {
    return registrar.plugins[id];
  });
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


module.exports = Registrar;
