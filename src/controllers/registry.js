//var logger = require("loggero").create("controllers/registry");
var inherit = require("../inherit");
var Module = require("../module");
var Controller = require("../controller");


function Registry(context) {
  Controller.call(this, context);
}


inherit.base(Registry).extends(Controller);


Registry.prototype.register = function(name, exports) {
  return this.setModule(new Module.Meta({
    id: name,
    name: name,
    exports: exports
  }), Module.State.READY);
};


Registry.prototype.hasModule = function(id) {
  return this.context.repository.hasItem(id);
};


Registry.prototype.findModules = function(criteria) {
  return this.context.repository
    .findAll({
      module: criteria
    })
    .map(function(result) {
      return result.module;
    });
};


Registry.prototype.findModule = function(criteria) {
  var result = this.context.repository.findFirst({
    module: criteria
  });

  return result ? result.module : null;
};


Registry.prototype.getModule = function(id) {
  if (!this.hasModule(id)) {
    throw new Error("Module with id `" + id + "` not found");
  }

  return this.context.repository.getItem(id).module;
};


Registry.prototype.setModule = function(mod, state) {
  var id = mod.id;

  if (this.hasModule(id) && this.getModuleState(id) === state) {
    throw new Error("Module instance `" + mod.name || mod.id + "` already exists");
  }

  this.context.repository.setItem(id, {module: mod, state: state});
  return mod;
};


Registry.prototype.deleteModule = function(id) {
  if (!this.hasModule(id)) {
    throw new Error("Unable to delete module with id `" + id + "`. Module not found.");
  }

  return this.context.repository.deleteItem(id).module;
};


Registry.prototype.getModuleState = function(id) {
  if (!this.hasModule(id)) {
    throw new Error("Module instance `" + id + "` not found");
  }

  return this.context.repository.getItem(id).state;
};


module.exports = Registry;
