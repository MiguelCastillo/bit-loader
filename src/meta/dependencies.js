(function() {
  "use strict";

  var Promise = require('../promise'),
      Module  = require('../module'),
      Utils   = require('../utils'),
      Logger  = require('../logger'),
      logger  = Logger.factory("Meta/Dependencies");

  /**
   * Loads up all dependencies for the module
   *
   * @returns {Function} callback to call with the Module instance with the
   *   dependencies to be resolved
   */
  function MetaDependencies(manager, moduleMeta) {
    logger.log(moduleMeta.name, moduleMeta);

    // Return if the module has no dependencies
    if (!Module.Meta.hasDependencies(moduleMeta)) {
      return Promise.resolve(moduleMeta);
    }

    var i, length, loading = new Array(moduleMeta.deps.length);
    for (i = 0, length = moduleMeta.deps.length; i < length; i++) {
      loading[i] = manager.providers.loader.fetch(moduleMeta.deps[i], moduleMeta);
    }

    return Promise.all(loading)
      .then(dependenciesFetched, Utils.forwardError);

    function dependenciesFetched() {
      return moduleMeta;
    }
  }

  module.exports = MetaDependencies;
})();
