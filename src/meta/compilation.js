(function() {
  "use strict";

  var Module = require('../module'),
      Logger = require('../logger'),
      logger = Logger.factory("Meta/Compilation");

  /**
   * The compile step is to convert the moduleMeta to an instance of Module. The
   * fetch provider is in charge of adding the compile interface in the moduleMeta
   * as that is the place with the most knowledge about how the module was loaded
   * from the server/local file system.
   */
  function MetaCompilation(manager, moduleMeta) {
    logger.log(moduleMeta.name, moduleMeta);

    var mod;
    if (moduleMeta.hasOwnProperty("code") || typeof(moduleMeta.factory) === 'function') {
      mod = new Module(moduleMeta);
    }
    else if (typeof(moduleMeta.compile) === 'function') {
      mod = moduleMeta.compile();
    }
    else {
      throw new TypeError("Unable to create Module instance due to invalid module meta object");
    }

    // We will coerce the name no matter what name (if one at all) the Module was
    // created with. This will ensure a consistent state in the loading engine.
    mod.name = moduleMeta.name;

    // Set the mod.meta for convenience
    mod.meta = moduleMeta;
    return mod;
  }

  module.exports = MetaCompilation;
})();
