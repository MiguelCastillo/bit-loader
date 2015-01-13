(function() {
  "use strict";

  var Promise = require('spromise'),
      Utils   = require('./utils');


  /**
   * Loads up all dependencies for the module
   *
   * @returns {Function} callback to call with the Module instance with the
   *   dependencies to be resolved
   */
  function MetaDependencies(manager) {
    return function dependencies(mod) {
      // Return if the module has no dependencies
      if (!mod.deps || !mod.deps.length) {
        return mod;
      }

      var loading = mod.deps.map(function(mod_name) {
        return manager.load(mod_name);
      });

      return Promise.when.apply((void 0), loading)
        .then(function() {return mod;}, Utils.forwardError);
    };
  }

  module.exports = MetaDependencies;
})();
