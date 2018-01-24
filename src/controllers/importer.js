const logger = require("loggero").create("controllers/importer");
const types = require("dis-isa");
const inherit = require("../inherit");
const Controller = require("../controller");


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
Import.prototype.import = function(file, referrer) {
  const registry = this.context.controllers.registry;
  const loader = this.context.controllers.loader;

  logger.info(types.isString(file) ? file : (file.name || file.id || file.path), referrer);

  return loader.load(file, referrer).then(getModuleExports(registry), moduleError);
};


function moduleError(error) {
  logger.error(error);
  throw error;
}


function getModuleExports(registry) {
  return (modules) => (
    types.isArray(modules) ?
    modules.map(mod => registry.getModule(mod.id).exports) :
    registry.getModule(modules.id).exports
  );
}


module.exports = Import;
