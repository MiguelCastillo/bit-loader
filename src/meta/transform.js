var logger = require("loggero").create("Meta/Transform");
var types  = require("dis-isa");


function MetaTransform() {
}


/**
 * The transform enables transformation providers to process the moduleMeta
 * before it is compiled into an actual Module instance.  This is where steps
 * such as linting and processing coffee files can take place.
 */
MetaTransform.pipeline = function(manager, moduleMeta) {
  logger.log(moduleMeta.name, moduleMeta);

  if (!types.isString(moduleMeta.source)) {
    return Promise.resolve(moduleMeta);
  }

  return manager.pipelines.transform.run(moduleMeta);
};


module.exports = MetaTransform;
