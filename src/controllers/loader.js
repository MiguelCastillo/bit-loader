//var logger = require("loggero").create("controllers/loader");
const types  = require("dis-isa");
const inherit = require("../inherit");
const Controller = require("../controller");
const File = require("../file");


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
Loader.prototype.load = function(data, referrer) {
  const file = new File(data);
  const fetcher = this.context.controllers.fetcher;
  const builder = this.context.controllers.builder;
  return fetcher.fetch(file, referrer).then(buildModules(builder));
};


function buildModules(builder) {
  return (modules) => (
    types.isArray(modules) ?
    modules.map(mod => builder.build(mod.id)) :
    builder.build(modules.id)
  );
}

module.exports = Loader;
