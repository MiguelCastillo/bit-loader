var log2console = require("log2console");
var types       = require("dis-isa");
var runPipeline = require("./runPipeline");
var logger      = require("../logger").create("Meta/Transform");


function MetaTransform() {
}


/**
 * The transform enables transformation providers to process the moduleMeta
 * before it is compiled into an actual Module instance.  This is where steps
 * such as linting and processing coffee files can take place.
 */
MetaTransform.pipeline = function(manager, moduleMeta) {
  logger.log(moduleMeta.name, moduleMeta);

  if (!canProcess(manager, moduleMeta)) {
    return Promise.resolve(moduleMeta);
  }

  function transformationFinished() {
    return moduleMeta;
  }

  return runPipeline(manager.pipelines.transform, moduleMeta)
    .then(transformationFinished, log2console);
};


function canProcess(manager, moduleMeta) {
  return types.isString(moduleMeta.source) && !manager.rules.ignore.transform.match(moduleMeta.name);
}


module.exports = MetaTransform;
