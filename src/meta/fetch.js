(function() {
  "use strict";

  var Logger = require('../logger'),
      logger = Logger.factory("Meta/Fetch");

  function MetaFetch(manager, name) {
    return function fetch() {
      logger.log(name);
      return manager.fetch(name);
    };
  }

  module.exports = MetaFetch;
})();
