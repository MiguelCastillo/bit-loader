(function() {
  "use strict";

  /**
   * Simple validation hook to make sure the module meta object can be
   * pushed through the loader pipeline.
   */
  function MetaValidation(manager, moduleMeta) {
    return !moduleMeta.hasOwnProperty("code");
  }

  module.exports = MetaValidation;
})();
