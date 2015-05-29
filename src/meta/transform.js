(function() {
  "use strict";

  var runPipeline = require("./runPipeline");
  var Promise     = require("../promise");
  var Utils       = require("../utils");
  var logger      = require("../logger").factory("Meta/Transform");

  function MetaTransform() {
  }


  /**
   * The transform enables transformation providers to process the moduleMeta
   * before it is compiled into an actual Module instance.  This is where steps
   * such as linting and processing coffee files can take place.
   */
  MetaTransform.pipeline = function(manager, moduleMeta) {
    logger.log(moduleMeta.name, moduleMeta);

    if (manager.rules.ignore.match(moduleMeta.name, "transform")) {
      return Promise.resolve(moduleMeta);
    }

    function transformationFinished() {
      return moduleMeta;
    }

    return runPipeline(manager.pipelines.transform, moduleMeta)
      .then(transformationFinished, Utils.reportError);
  };


  module.exports = MetaTransform;
})();
