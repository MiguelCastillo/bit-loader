var logger     = require("loggero").create("controllers/importer");
var inherit    = require("../inherit");
var Module     = require("../module");
var Controller = require("../controller");


/**
 * Module importer. Primary function is to load Module instances and resolving
 * their dependencies in order to make the Module fully consumable.
 */
function Import(context) {
  Controller.call(this, context);

  this._important = [];
}


inherit.base(Import).extends(Controller);


/**
 * Import is the method to load a Module
 *
 * @param {Array<string> | string} names - module(s) to import
 *
 * @returns {Promise}
 */
Import.prototype.import = function(names, options) {
  logger.info("import", names, options);

  return Promise.resolve(this._important)
    .then(clearImportant(this))
    .then(importModules(this, names, options));
};


/**
 * Imports that must occur before any other imports. So every import
 * will wait for all `important` imports to finish first.
 */
Import.prototype.important = function(names, options) {
  logger.info("import IMPORTANT", names, options);

  var pending = importModules(this, names, options)();
  this._important.push(pending);
  return pending;
};


/**
 * Gets the module by name.  If the module has not been loaded before, then
 * it is loaded via the module loader
 *
 * @param {Array<string>} names - Array of module names
 * @param {Object} options
 */
Import.prototype._getModule = function(name, options) {
  options = options || {};
  var context = this.context;
  var registry = context.controllers.registry;

  if (registry.hasModule(name) && registry.getModuleState(name) === Module.State.READY) {
    return Promise.resolve(registry.getModule(name).exports);
  }

  // Wrap in a separate promise to handle this:
  // https://github.com/MiguelCastillo/spromise/issues/35
  return new Promise(function resolver(resolve, reject) {
    function moduleError(error) {
      logger.error(error);
      reject(error);
    }

    function getModuleExports(mod) {
      resolve(context.controllers.registry.getModule(mod.id).exports);
    }

    context.controllers.loader
      .load(name)
      .then(getModuleExports, moduleError);
  });
};


function clearImportant(importer) {
  return function clearImportantDelegate() {
    importer._important = [];
  };
}


function importModules(importer, names, options) {
  return function importModuleDelegate() {
    if (typeof(names) === "string") {
      return Promise.resolve(names).then(getModuleByName(importer, options));
    }

    return Promise.all(names.map(getModuleByName(importer, options)));
  };
}


function getModuleByName(importer, options) {
  return function getModuleByNameDelegate(name) {
    return importer._getModule(name, options);
  };
}


module.exports = Import;
