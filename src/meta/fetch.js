var logger = require("loggero").create("Meta/Fetch");
var Module = require("../module");

function MetaFetch() {
}


/**
 * Runs fetch pipeline to give plugins a chance to load the meta source
 */
MetaFetch.pipeline = function(manager, moduleMeta) {
  logger.log(moduleMeta.name, moduleMeta);

  if (Module.Meta.canCompile(moduleMeta)) {
    return Promise.resolve(moduleMeta);
  }

  function fetchFinished() {
    // If a pipeline item has added source to the module meta, then we
    // are done with this stage.  Otherwise, we will run the default
    // fetch provider
    if (Module.Meta.canCompile(moduleMeta)) {
      return moduleMeta;
    }

    return MetaFetch.fetch(manager, moduleMeta);
  }

  return manager.pipelines.fetch
    .run(moduleMeta)
    .then(fetchFinished, logger.error);
};


/**
 * Fetch source using default fetch
 */
MetaFetch.fetch = function(manager, moduleMeta) {
  logger.log(moduleMeta.name, moduleMeta);

  if (Module.Meta.canCompile(moduleMeta)) {
    return Promise.resolve(moduleMeta);
  }

  return Promise.resolve(manager.fetch(moduleMeta))
    .then(function(meta) {
      return moduleMeta.configure(meta);
    }, logger.error);
};


module.exports = MetaFetch;
