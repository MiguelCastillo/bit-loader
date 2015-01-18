(function() {
  "use strict";

  var Logger = require('../logger'),
      logger = Logger.factory("Meta/Fetch");

  function MetaFetch(manager, name) {
    logger.log(name);
    return manager.fetch(name);
  }

  module.exports = MetaFetch;
})();
