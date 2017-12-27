var logger     = require("loggero").create("controllers/importer");
var types      = require("dis-isa");
var inherit    = require("../inherit");
var Module     = require("../module");
var Controller = require("../controller");


/**
 * Module importer. Primary function is to load Module instances and resolving
 * their dependencies in order to make the Module fully consumable.
 */
function Import(context) {
  Controller.call(this, context);
}


inherit.base(Import).extends(Controller);


/**
 * Import is the method to load a Module
 *
 * @param {Array<string> | string} names - module(s) to import
 *
 * @returns {Promise}
 */
Import.prototype.importNames = function(names, referrer) {
  logger.info(names, referrer);

  return (
    types.isArray(names) ?
    Promise.all(names.map((name) => this._importModule(name, referrer))) :
    this._importModule(names, referrer)
  );
};


Import.prototype.importSource = function(source, referrer) {
  function moduleError(error) {
    logger.error(error);
    throw error;
  }

  function getModuleExports(mod) {
    return context.controllers.registry.getModule(mod.id).exports;
  }

  return context.controllers.loader.loadSource(source, referrer).then(getModuleExports, moduleError);
};


/**
 * Gets the module by name.  If the module has not been loaded before, then
 * it is loaded via the module loader
 *
 * @param {Array<string>} names - Array of module names
 * @param {Object} options
 */
Import.prototype._importModule = function(name, referrer) {
  var context = this.context;
  var registry = context.controllers.registry;

  if (registry.hasModule(name) && registry.getModuleState(name) === Module.State.READY) {
    return Promise.resolve(registry.getModule(name).exports);
  }

  function moduleError(error) {
    logger.error(error);
    throw error;
  }

  function getModuleExports(mod) {
    return context.controllers.registry.getModule(mod.id).exports;
  }

  return context.controllers.loader.loadNames(name, referrer).then(getModuleExports, moduleError);
};


module.exports = Import;
