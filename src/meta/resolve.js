var runPipeline = require("./runPipeline");
var Promise     = require("../promise");
var utils       = require("../utils");
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
    .then(resolveFinished, utils.reportError);
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
    }, utils.reportError);
};


module.exports = MetaResolve;
