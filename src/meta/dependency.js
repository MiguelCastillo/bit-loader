(function() {
  "use strict";

  var Promise = require('../promise'),
      Module  = require('../module'),
      Utils   = require('../utils'),
      logger  = require('../logger').factory("Meta/Dependency");


  /**
   * Loads up all dependencies for the module
   *
   * @returns {Function} callback to call with the Module instance with the
   *   dependencies to be resolved
   */
  function MetaDependency(manager, moduleMeta) {
    logger.log(moduleMeta.name, moduleMeta);

    if (manager.rules.ignore.match(moduleMeta.name, "dependency")) {
      return Promise.resolve(moduleMeta);
    }

    function dependenciesFinished() {
      // Return if the module has no dependencies
      if (!Module.Meta.hasDependencies(moduleMeta)) {
        return moduleMeta;
      }

      return loadDependencies(manager, moduleMeta);
    }

    function canExecuteProvider(provider) {
      if (provider.filter && !provider.filter.test(moduleMeta.location)) {
        return false;
      }
      if (provider.ignore && provider.ignore.test(moduleMeta.location)) {
        return false;
      }
    }


    // Run dependency pipeline
    return manager.pipelines.dependency
      .runAll(moduleMeta, canExecuteProvider)
      .then(dependenciesFinished, Utils.forwardError);
  }


  function loadDependencies(manager, moduleMeta) {
    var i, length, loading = new Array(moduleMeta.deps.length);

    for (i = 0, length = moduleMeta.deps.length; i < length; i++) {
      loading[i] = manager.providers.loader.fetch(moduleMeta.deps[i], moduleMeta);
    }

    function dependenciesFetched() {
      return moduleMeta;
    }

    return Promise.all(loading).then(dependenciesFetched, Utils.forwardError);
  }


  module.exports = MetaDependency;
})();
