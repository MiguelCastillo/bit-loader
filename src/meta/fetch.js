var types       = require("types");
var runPipeline = require("./runPipeline");
var utils       = require("../utils");
var logger      = require("../logger").create("Meta/Fetch");


function MetaFetch() {
}


/**
 * Runs fetch pipeline to give plugins a chance to load the meta source
 */
MetaFetch.pipeline = function(manager, moduleMeta) {
  logger.log(moduleMeta.name, moduleMeta);

  if (!canProcess(manager, moduleMeta)) {
    return Promise.resolve(moduleMeta);
  }

  function fetchFinished() {
    // If a pipeline item has added source to the module meta, then we
    // are done with this stage.  Otherwise, we will run the default
    // fetch provider
    if (types.isString(moduleMeta.source)) {
      return moduleMeta;
    }

    return MetaFetch.fetch(manager, moduleMeta);
  }

  return runPipeline(manager.pipelines.fetch, moduleMeta)
    .then(fetchFinished, utils.reportError);
};


/**
 * Fetch source using default fetch
 */
MetaFetch.fetch = function(manager, moduleMeta) {
  logger.log(moduleMeta.name, moduleMeta);

  if (!canProcess(manager, moduleMeta)) {
    return Promise.resolve(moduleMeta);
  }

  return Promise.resolve(manager.fetch(moduleMeta))
    .then(function(meta) {
      return moduleMeta.configure(meta);
    }, utils.reportError);
};


function canProcess(manager, moduleMeta) {
  return !types.isString(moduleMeta.source) && !manager.rules.ignore.fetch.match(moduleMeta.name);
}


module.exports = MetaFetch;
