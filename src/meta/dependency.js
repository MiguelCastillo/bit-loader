var logger = require("loggero").create("Meta/Dependency");
var Module = require("../module");


function MetaDependency() {
}


/**
 * Runs dependency pipeline to load up all dependencies for the module
 *
 * @returns {Function} callback to call with the Module instance with the
 *   dependencies to be resolved
 */
MetaDependency.pipeline = function(manager, moduleMeta) {
  logger.log(moduleMeta.name, moduleMeta);

  function dependenciesFinished() {
    if (Module.Meta.hasDependencies(moduleMeta)) {
      return loadDependencies(manager, moduleMeta);
    }

    return moduleMeta;
  }

  return manager.pipelines.dependency
    .run(moduleMeta)
    .then(dependenciesFinished, logger.error);
};


function loadDependencies(manager, moduleMeta) {
  var i, length, loading = new Array(moduleMeta.deps.length);

  for (i = 0, length = moduleMeta.deps.length; i < length; i++) {
    loading[i] = manager.providers.loader.fetch(moduleMeta.deps[i], moduleMeta);
  }

  function dependenciesFetched() {
    return moduleMeta;
  }

  return Promise.all(loading).then(dependenciesFetched, logger.error);
}


module.exports = MetaDependency;
