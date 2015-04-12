(function() {
  "use strict";

  var Utils   = require('../utils'),
      Promise = require('../promise'),
      logger  = require('../logger').factory("Meta/Tranform");

  /**
   * The transform enables transformation providers to process the moduleMeta
   * before it is compiled into an actual Module instance.  This is where steps
   * such as linting and processing coffee files can take place.
   */
  function MetaTransform(manager, moduleMeta) {
    logger.log(moduleMeta.name, moduleMeta);

    if (manager.rules.ignore.match(moduleMeta.name, "transform")) {
      return Promise.resolve(moduleMeta);
    }

    return manager.pipelines.transform.runAll(moduleMeta)
      .then(transformationFinished, Utils.forwardError);

    function transformationFinished() {
      return moduleMeta;
    }
  }

  module.exports = MetaTransform;
})();
