const logger = require("loggero").create("controllers/importer");
const types = require("dis-isa");
const inherit = require("../inherit");
const Controller = require("../controller");
const File = require("../file");


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
Import.prototype.import = function(data, referrer) {
  const file = new File(data);

  if (file.name || file.id || file.path) {
    logger.info(file.name || file.id || file.path, referrer);
  }

  return (
    file.names ? this._importNames(file, referrer) :
    file.contents ? this._importSource(file, referrer) :
    null
  );
};


Import.prototype._importSource = function(file, referrer) {
  const registry = this.context.controllers.registry;
  const loader = this.context.controllers.loader;
  return loader.load(file, referrer).then(getModuleExports(registry), moduleError);
};


Import.prototype._importNames = function(file, referrer) {
  const registry = this.context.controllers.registry;
  const loader = this.context.controllers.loader;
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
