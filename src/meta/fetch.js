(function() {
  "use strict";

  var Promise = require('../promise'),
      Module  = require('../module'),
      Utils   = require('../utils'),
      logger  = require('../logger').factory("Meta/Fetch");

  function MetaFetch(manager, name, parentMeta) {
    logger.log(name);

    var moduleMeta = new Module.Meta(name);

    function metaResolve() {
      return Promise.resolve(manager.resolve(moduleMeta, parentMeta))
        .then(function(meta) {
          return moduleMeta.configure(meta);
        }, Utils.reportError);
    }

    function metaFetch() {
      return Promise.resolve(manager.fetch(moduleMeta, parentMeta))
        .then(function(meta) {
          return moduleMeta.configure(meta);
        }, Utils.reportError);
    }

    return metaResolve().then(metaFetch, Utils.reportError);
  }

  module.exports = MetaFetch;
})();
