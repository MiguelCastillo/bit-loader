//var logger = require("loggero").create("controllers/registry");
var inherit = require("../inherit");
var Module = require("../module");
var Controller = require("../controller");
var Repository = require("../repository");


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
  return Repository.hasItem(this.context.cache, id);
};


Registry.prototype.findModules = function(criteria) {
  return Repository
    .findAll(this.context.cache, {
      module: criteria
    })
    .map(function(result) {
      return result.module;
    });
};


Registry.prototype.findModule = function(criteria) {
  var result = Repository.findFirst(this.context.cache, {
    module: criteria
  });

  return result ? result.module : null;
};


Registry.prototype.getModule = function(id) {
  if (!this.hasModule(id)) {
    throw new Error("Module with id `" + id + "` not found");
  }

  return Repository.getItem(this.context.cache, id).module;
};


Registry.prototype.setModule = function(mod, state) {
  var id = mod.id;

  if (this.hasModule(id) && this.getModuleState(id) === state) {
    throw new Error("Module instance `" + mod.name || mod.id + "` already exists");
  }

  Repository.setItem(this.context.cache, id, {module: mod, state: state});
  return mod;
};


Registry.prototype.deleteModule = function(id) {
  if (!this.hasModule(id)) {
    throw new Error("Unable to delete module with id `" + id + "`. Module not found.");
  }

  var mod = Repository.getItem(this.context.cache, id).module;
  Repository.deleteItem(this.context.cache, id);
  return mod;
};


Registry.prototype.getModuleState = function(id) {
  if (!this.hasModule(id)) {
    throw new Error("Module instance `" + id + "` not found");
  }

  return Repository.getItem(this.context.cache, id).state;
};


module.exports = Registry;
