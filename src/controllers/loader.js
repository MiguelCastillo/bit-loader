//var logger = require("loggero").create("controllers/loader");
var types  = require("dis-isa");
var Module = require("../module");


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
function Loader(manager) {
  if (!manager) {
    throw new TypeError("Must provide a manager");
  }

  this.manager = manager;
}


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
Loader.prototype.load = function(names, referrer) {
  if (types.isString(names)) {
    return load(this, referrer)(names);
  }

  return Promise.all(names.map(load(this, referrer)));
};


Loader.prototype.resolve = function(name, referrer) {
  return this.manager.services.resolve.run(new Module.Meta({
    name: name,
    referrer: referrer
  }));
};


function load(loader, referrer) {
  return function(name) {
    if (!name) {
      return Promise.reject("Must provide the name of the module to load");
    }

    return fetch(loader, name, referrer).then(buildMeta(loader));
  };
}


function fetch(loader, name, referrer) {
  return loader.manager.controllers.fetcher.fetch(name, referrer);
}


function buildMeta(loader) {
  return function(moduleMeta) {
    return loader.manager.controllers.builder.build(moduleMeta.id);
  };
}


module.exports = Loader;
