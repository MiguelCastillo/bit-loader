//var logger = require("loggero").create("controllers/loader");
var types  = require("dis-isa");
var inherit = require("../inherit");
var Controller = require("../controller");


/**
 * The purpose of Loader is to return full instances of Module. Overview of the workflow:
 *
 * 1. Resolve - converts name to path for loading the module from storage.
 * 2. Fetch - load source from storage (remote server, local file system).
 * 3. Transform - transpile the source that was fetched.
 * 4. Dependency - parses out dependencies on other modules.
 * 5. Compile - evaluates the source that was fetched and transformed.
 * 6. Link - processes the entire dependency graph in order to instantiate modules.
 */
function Loader(context) {
  Controller.call(this, context);
}


inherit.base(Loader).extends(Controller);


/**
 * Handles the process of returning the instance of the Module if one exists, otherwise
 * the workflow for creating the instance is kicked off, which will eventually lead to
 * the creation of a Module instance
 *
 * @param {string} name - The name of the module to load.
 * @param {{path: string, name: string}} referrer - Object with the
 *  location and name of the requesting module.
 *
 * @returns {Promise} - Promise that will resolve to a Module instance
 */
Loader.prototype.fromName = function fromName(names, referrer) {
  return (
    types.isArray(names) ?
    Promise.all(names.map((name) => this._loadName(name, referrer))) :
    this._loadName(names, referrer)
  );
};

// same thing.
Loader.prototype.load = Loader.prototype.fromName;


Loader.prototype.fromSource = function fromSource(source, referrer) {
  if (!source) {
    return Promise.reject("Must provide a string source to load");
  }

  const controllers = this.context.controllers;
  return controllers.fetcher.fromSource(source, referrer).then((mod) => controllers.builder.build(mod.id));
};


Loader.prototype._loadName = function(name, referrer) {
  if (!name) {
    return Promise.reject("Must provide the name of the module to load");
  }

  const controllers = this.context.controllers;
  return controllers.fetcher.fetch(name, referrer).then((mod) => controllers.builder.build(mod.id));
};


module.exports = Loader;
