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

    if (!moduleMeta.hasOwnProperty("code") && typeof(moduleMeta.compile) !== "function") {
      throw new TypeError("ModuleMeta must provide have a `compile` interface that returns an instance of Module. Or a `code` property, which is used to build an instance of Module.");
    }

    return moduleMeta;
  }

  module.exports = MetaValidation;
})();
