(function() {
  "use strict";

  var Module = require('../module'),
      Logger = require('../logger'),
      logger = Logger.factory("Meta/Compilation");

  function compile(moduleMeta) {
    var mod;

    if (moduleMeta.hasOwnProperty("code")) {
      mod = new Module(moduleMeta);
    }
    else if (typeof(moduleMeta.compile) === 'function') {
      mod = moduleMeta.compile();
    }

    // We will coerce the name no matter what name (if one at all) the Module was
    // created with. This will ensure a consistent state in the loading engine.
    mod.name = moduleMeta.name;
    return mod;
  }

  /**
   * The compile step is to convert the moduleMeta to an instance of Module. The
   * fetch provider is in charge of adding the compile interface in the moduleMeta
   * as that is the place with the most knowledge about how the module was loaded
   * from the server/local file system.
   */
  function MetaCompilation(manager, moduleMeta) {
    logger.log(moduleMeta.name, moduleMeta);

    var mod     = compile(moduleMeta),
        modules = mod.modules || {};

    // Copy modules over to the modules bucket if it does not exist. Anything
    // that has already been loaded will get ignored.
    for (var item in modules) {
      if (modules.hasOwnProperty(item) && !manager.hasModule(item) && mod.name !== item) {
        manager.setModule(modules[item]);
      }
    }

    mod.deps = mod.deps.concat(moduleMeta.deps);
    mod.meta = moduleMeta;
    return mod;
  }

  module.exports = MetaCompilation;
})();
