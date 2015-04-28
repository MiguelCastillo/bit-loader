(function() {
  "use strict";

  var Promise = require('promise'),
      Utils   = require('../utils'),
      logger  = require('logger').factory("Meta/Tranform");

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

    function transformationFinished() {
      return moduleMeta;
    }

    function canExecuteProvider(provider) {
      if (provider.filter && !provider.filter.test(moduleMeta.path)) {
        return false;
      }
      if (provider.ignore && provider.ignore.test(moduleMeta.path)) {
        return false;
      }
    }


    // Run transform pipeline.
    return manager.pipelines.transform
      .runAll(moduleMeta, canExecuteProvider)
      .then(transformationFinished, Utils.forwardError);
  }

  module.exports = MetaTransform;
})();
