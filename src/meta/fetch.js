(function() {
  "use strict";

  var Promise = require('spromise'),
      Module  = require('../Module'),
      Logger  = require('../logger'),
      Utils   = require('../utils'),
      logger  = Logger.factory("Meta/Fetch");

  function MetaFetch(manager, name, parentMeta) {
    logger.log(name);

    return Promise.resolve(manager.fetch(name, parentMeta))
      .then(moduleFetched, Utils.forwardError);

    // Once the module meta is fetched, we want to add helper properties
    // to it to facilitate further processing.
    function moduleFetched(moduleMeta) {
      Module.MetaValidation(moduleMeta);

      if (!moduleMeta.name) {
        moduleMeta.name = name;
      }

      moduleMeta.deps    = moduleMeta.deps || [];
      moduleMeta.manager = manager;
      return moduleMeta;
    }
  }

  module.exports = MetaFetch;
})();
