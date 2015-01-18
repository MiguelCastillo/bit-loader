(function() {
  "use strict";

  var Logger = require('../logger'),
      logger = Logger.factory("Meta/Dependencies");

  /**
   * Loads up all dependencies for the module
   *
   * @returns {Function} callback to call with the Module instance with the
   *   dependencies to be resolved
   */
  function MetaDependencies(manager, moduleMeta) {
    logger.log(moduleMeta.name, moduleMeta);

    // Return if the module has no dependencies
    if (!moduleMeta.deps || !moduleMeta.deps.length) {
      return manager.Promise.resolve(moduleMeta);
    }

    var loading = moduleMeta.deps.map(function fetchDependency(mod_name) {
      return manager.providers.loader.fetch(mod_name);
    });

    return manager.Promise.all(loading)
      .then(function dependenciesFetched() {return moduleMeta;}, manager.Utils.forwardError);
  }

  module.exports = MetaDependencies;
})();
