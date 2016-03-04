var logger  = require("loggero").create("service/linker");
var inherit = require("../inherit");
var Module  = require("../module");
var Service = require("../service");


function Link(context) {
  Service.call(this, context);
}


inherit.base(Link).extends(Service);


Link.prototype.canProcess = function(moduleMeta) {
  return this.canExecute(moduleMeta) && Module.Meta.isCompiled(moduleMeta);
};


/**
 * The linker step is where we take the evaluated source, build all the dependencies
 * and call the factory method on the module if available.
 *
 * This is the step where the Module instance is finally created.
 *
 * @returns {Module}
 */
Link.prototype.runSync = function(moduleMeta) {
  this._logger && this._logger.log(moduleMeta.name, moduleMeta);

  if (!this.canProcess(moduleMeta)) {
    throw new TypeError("Module " + moduleMeta.name + " cannot be linked");
  }

  var context = this.context;

  function traverseDependencies(mod) {
    logger.log(mod.name, mod);

    // Build all the dependecies in the dependency graph.
    var depsGraph = mod.deps.map(function resolveDependency(modDep) {
      if (context.controllers.registry.getModuleState(modDep.id) === Module.State.READY) {
        return context.controllers.registry.getModule(modDep.id).exports;
      }

      return traverseDependencies(context.controllers.builder.build(modDep.id)).exports;
    });

    // If the module itself is not yet built, then build it if there is a factory
    // method that can be called.
    if (mod.factory && !mod.hasOwnProperty("exports")) {
      mod.exports = mod.factory.apply(undefined, depsGraph);
    }

    return mod;
  }

  // Create module instance...
  var _module = new Module(moduleMeta);

  // We will coerce the name no matter what name (if one at all) the Module was
  // created with. This will ensure a consistent state in the loading engine.
  _module.name = moduleMeta.name;

  // Set the mod.meta for convenience
  _module.meta = moduleMeta;

  // Link it
  return traverseDependencies(_module);
};


module.exports = Link;
