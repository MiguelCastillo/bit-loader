(function() {
  "use strict";

  var Logger = require('../logger'),
      logger = Logger.factory("Meta/Validation");

  /**
   * Method to ensure we have a valid module meta object before we continue on with
   * the rest of the pipeline.
   */
  function MetaValidation(manager, moduleMeta) {
    logger.log(moduleMeta.name, moduleMeta);

    if (!moduleMeta) {
      throw new TypeError("Must provide a ModuleMeta");
    }

    if (typeof(moduleMeta.compile) !== "function") {
      throw new TypeError("ModuleMeta must provide have a `compile` interface that creates and returns an instance of Module");
    }

    moduleMeta.deps = moduleMeta.deps || [];
    moduleMeta.manager = manager;
    return moduleMeta;
  }

  module.exports = MetaValidation;
})();
