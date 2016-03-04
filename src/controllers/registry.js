//var logger = require("loggero").create("controllers/registry");
var inherit = require("../inherit");
var Module = require("../module");
var Repository = require("../repository");
var Controller = require("../controller");


//
// TODO: Make the registry stateless.
// I prefer controllers being stateless. But keeping the instance of the repository will do for now.
//


function Registry(context) {
  Controller.call(this, context);

  this.repository = new Repository();
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
  return this.repository.hasItem(id);
};


Registry.prototype.getModule = function(id) {
  if (!this.hasModule(id)) {
    throw new Error("Module with id `" + id + "` not found");
  }

  return this.repository.getItem(id).mod;
};


Registry.prototype.setModule = function(mod, state) {
  var id = mod.id;

  if (this.hasModule(id) && this.getModuleState(id) === state) {
    throw new Error("Module instance `" + mod.name || mod.id + "` already exists");
  }

  this.repository.setItem(id, {mod: mod, state: state});
  return mod;
};


Registry.prototype.deleteModule = function(id) {
  if (!this.hasModule(id)) {
    throw new Error("Unable to delete module with id `" + id + "`. Module not found.");
  }

  return this.repository.deleteItem(id).mod;
};


Registry.prototype.getModuleState = function(id) {
  if (!this.hasModule(id)) {
    throw new Error("Module instance `" + id + "` not found");
  }

  return this.repository.getItem(id).state;
};


module.exports = Registry;
