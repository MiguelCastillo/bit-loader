var Plugin  = require("./plugin");
var inherit = require("../inherit");
var Matches = require("../matches");


var id = 0;


/**
 * Plugin Manager is a plugin container that facilitates the execution of
 * plugins.
 */
function Manager(context) {
  this.id = "manager-" + id++;
  this.context = context;
  this.plugins = [];
}


inherit.base(Manager).extends(Matches);


/**
 * Configure plugin. This is a way to setup matching rules and handlers
 * in a single convenient call.
 *
 * @returns {Plugin}
 */
Manager.prototype.configure = function(settings) {
  // Process match/ignore options.
  Matches.prototype.configure.call(this, settings);

  Object
    .keys(settings)
    .filter(isPlugabble)
    .map(createPlugin(this))
    .map(configurePlugin(this, settings))
    .filter(canRegisterPlugin(this))
    .map(registerPlugin(this));

  return this;
};


Manager.prototype.getPluginIdFor = function(targetName) {
  return this.id + "-plugin-" + targetName;
};


var _pluginExceptionNames = ["match", "ignore", "extensions", "name"];
function isPlugabble(target) {
  return _pluginExceptionNames.indexOf(target) === -1;
}


function createPlugin(manager) {
  return function createPluginDelegate(target) {
    var id = manager.getPluginIdFor(target);
    if (!manager.context.hasPlugin(id)) {
      manager.context.registerPlugin(id, new Plugin(manager.context));
    }
    return target;
  };
}


function configurePlugin(manager, settings) {
  return function configurePluginDelegate(target) {
    var id = manager.getPluginIdFor(target);
    var plugin = manager.context.getPlugin(id).configure(settings[target]);
    manager.context.registerPlugin(id, plugin);
    return target;
  };
}


function canRegisterPlugin(manager) {
  return function canRegisterDelegate(target) {
    var id = manager.getPluginIdFor(target);
    return manager.plugins.indexOf(id) === -1;
  };
}


function registerPlugin(manager) {
  return function pluginRunnerDelegate(target) {
    var id = manager.getPluginIdFor(target);

    function pluginRunner(data) {
      if (!manager.canExecute(data)) {
        return data;
      }

      return manager.context.getPlugin(id).run(data);
    };

    manager.context.registerPluginWithService(target, pluginRunner);
    manager.plugins.push(id);
    return target;
  };
}


module.exports = Manager;
