(function() {
  "use strict";

  /**
   * The compile step is to convert the moduleMeta to an instance of Module. The
   * fetch provider is in charge of adding the compile interface in the moduleMeta
   * as that is the place with the most knowledge about how the module was loaded
   * from the server/local file system.
   */
  function MetaCompilation(manager) {
    return function compileModuleMeta(moduleMeta) {
      var mod     = moduleMeta.compile(),
          modules = mod.modules || {};

      // Copy modules over to the modules bucket if it does not exist. Anything
      // that has already been loaded will get ignored.
      for (var item in modules) {
        if (modules.hasOwnProperty(item) && !manager.hasModule(item) && mod.name !== item) {
          manager.setModule(item, modules[item]);
        }
      }

      mod.meta = moduleMeta;
      return mod;
    };
  }

  module.exports = MetaCompilation;
})();
