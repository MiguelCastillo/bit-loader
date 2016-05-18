var utils = require("belty");
var inherit = require("../inherit");
var Matches = require("../matches");
var blueprint = require("../blueprint");


var ManagerBlueprint = blueprint({
  id: null,
  context: null,
  plugins: {},
  matchers: new Matches()
});


/**
 * Plugin Manager is a plugin container that facilitates the execution of
 * plugins.
 */
function Manager(options) {
  ManagerBlueprint.call(this);

  options = options || {};

  return this.merge({
    id: options.id || createId(),
    context: options.context
  })
  .configure(options);
}


inherit.base(Manager).extends(ManagerBlueprint);


/**
 * Configure plugin. This is a way to setup matching rules and handlers
 * in a single convenient call.
 *
 * @returns {Plugin}
 */
Manager.prototype.configure = function(options) {
  var pluginKeys = Object.keys(utils.omit(options, ["matchers", "matches", "ignores", "extensions", "id", "context", "name"]));

  var plugins = pluginKeys
    .map(configurePlugin(this, options))
    .filter(canRegisterPlugin(this))
    .map(registerPlugin(this))
    .reduce(function(plugins, pluginConfig) {
      plugins[pluginConfig.plugin.id] = true;
      return plugins;
    }, {});

  return this.merge({
    plugins: plugins,
    matchers: this.matchers.configure(options.matchers || options)
  });
};


Manager.prototype.getPluginIdFor = function(serviceName) {
  return this.id + "-plugin-" + serviceName;
};


Manager.prototype.canExecute = function(data) {
  return this.matchers.canExecute(data);
};


Manager.prototype.serialize = function() {
  var manager = this;

  return utils.merge({
    plugins: Object.keys(this.plugins).map(function(item) {
      return manager.context.getPlugin(item).serialize();
    })
  }, utils.pick(this, ["id"]));
};


function configurePlugin(manager, settings) {
  return function configurePluginDelegate(serviceName) {
    var pluginId = settings[serviceName].id || manager.getPluginIdFor(serviceName);
    manager.context.configurePlugin(pluginId, settings[serviceName]);

    return {
      serviceName: serviceName,
      plugin: manager.context.getPlugin(pluginId)
    };
  };
}


function canRegisterPlugin(manager) {
  return function canRegisterDelegate(pluginConfig) {
    return manager.plugins[pluginConfig.plugin.id] !== true;
  };
}


function registerPlugin(manager) {
  return function registerPluginDelegate(pluginConfig) {
    manager.context.registerPluginWithService(pluginConfig.serviceName, pluginRunner(manager, pluginConfig.plugin.id));
    return pluginConfig;
  };
}


function pluginRunner(manager, pluginId) {
  var managerId = manager.id;
  var context = manager.context;

  return function pluginRunnerDelegate(data) {
    if (!context.getManager(managerId).canExecute(data)) {
      return data;
    }

    return context.getPlugin(pluginId).run(data);
  };
}


var id = 0;
function createId() {
  return "manager-" + id++;
}


Manager.pluginRunner = pluginRunner;
module.exports = Manager;
