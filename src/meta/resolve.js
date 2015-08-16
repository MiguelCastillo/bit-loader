var log2console = require("log2console");
var runPipeline = require("./runPipeline");
var logger      = require("../logger").create("Meta/Resolve");


function MetaResolve() {
}


MetaResolve.pipeline = function(manager, moduleMeta) {
  logger.log(moduleMeta.name, moduleMeta);

  function resolveFinished() {
    if (moduleMeta.hasOwnProperty("path")) {
      return moduleMeta;
    }

    return MetaResolve.resolve(manager, moduleMeta);
  }

  return runPipeline(manager.pipelines.resolve, moduleMeta)
    .then(resolveFinished, log2console);
};


MetaResolve.resolve = function(manager, moduleMeta) {
  logger.log(moduleMeta.name, moduleMeta);

  return Promise.resolve(manager.resolve(moduleMeta))
    .then(function(meta) {
      meta = meta || {};
      if (!meta.cname) {
        meta.cname = meta.name || meta.path;
      }

      delete meta.name;
      return moduleMeta.configure(meta);
    }, log2console);
};


module.exports = MetaResolve;
