(function() {
  "use strict";

  var Logger = require('../logger'),
      Utils  = require('../utils'),
      logger = Logger.factory("Meta/Fetch");

  function MetaFetch(manager, name) {
    logger.log(name);
    return manager.fetch(name)
      .then(moduleFetched, Utils.forwardError);

    // Once the module meta is fetched, we want to add helper properties
    // to it to facilitate further processing.
    function moduleFetched(moduleMeta) {
      moduleMeta.deps    = moduleMeta.deps || [];
      moduleMeta.manager = manager;
      return moduleMeta;
    }
  }

  module.exports = MetaFetch;
})();
