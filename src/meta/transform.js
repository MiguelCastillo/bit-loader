(function() {
  "use strict";

  var Promise     = require('promise'),
      runPipeline = require('./runPipeline'),
      Utils       = require('../utils'),
      logger      = require('logger').factory("Meta/Tranform");

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
      .then(transformationFinished, Utils.forwardError);
  };


  module.exports = MetaTransform;
})();
