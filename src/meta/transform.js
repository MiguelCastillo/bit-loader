(function() {
  "use strict";

  var Logger = require('../logger'),
      logger = Logger.factory("Meta/Tranform");

  /**
   * The transform enables transformation providers to process the moduleMeta
   * before it is compiled into an actual Module instance.  This is where steps
   * such as linting and processing coffee files can take place.
   */
  function MetaTransform(manager, moduleMeta) {
    logger.log(moduleMeta.name, moduleMeta);
    return manager.transform.runAll(moduleMeta)
      .then(function() {
        return moduleMeta;
      }, manager.Utils.forwardError);
  }

  module.exports = MetaTransform;
})();
