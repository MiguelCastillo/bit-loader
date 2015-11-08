//var logger = require("loggero").create("controllers/registry");
var Module = require("../module");
var Repository = require("../repository");
var moduleId = 0;


//
// TODO: Make the registry stateless.
// I prefer controllers being stateless. But keeping the instance of the repository will do for now.
//


function Registry(manager) {
  if (!manager) {
    throw new Error("Manager must be provided");
  }

  this.manager = manager;
  this.repository = new Repository();
}


Registry.prototype.register = function(name, deps, factory, referrer) {
  return this.setModule(new Module.Meta({
    id: getUniqueModuleId(this),
    name: name,
    deps: deps,
    factory: factory,
    referrer: referrer
  }), Module.State.REGISTERED);
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


function getUniqueModuleId(registry) {
  var id;

  do {
    id = moduleId++;
  } while (registry.repository.hasItem(id));

  return id;
}


module.exports = Registry;
