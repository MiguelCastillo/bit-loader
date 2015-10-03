var logger = require("loggero").create("Meta/Resolve");


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

  return manager.pipelines.resolve
    .run(moduleMeta)
    .then(resolveFinished, logger.error);
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
    }, logger.error);
};


module.exports = MetaResolve;
