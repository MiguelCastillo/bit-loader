(function() {
  "use strict";

  var Utils = require('./utils');

  /**
   * The transform enables transformation providers to process the moduleMeta
   * before it is compiled into an actual Module instance.  This is where steps
   * such as linting and processing coffee files can take place.
   */
  function MetaTransform(manager) {
    return function tranform(moduleMeta) {
      return manager.transform.runAll(moduleMeta)
        .then(function() {return moduleMeta;}, Utils.forwardError);
    };
  }

  module.exports = MetaTransform;
})();
