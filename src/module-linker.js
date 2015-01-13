(function(root) {
  "use strict";

  function ModuleLinker(manager) {
    return function traverseDependencies(mod) {
      // Get all dependencies to feed them to the module factory
      var deps = mod.deps.map(function resolveDependency(mod_name) {
        if (manager.hasModuleCode(mod_name)) {
          return manager.getModuleCode(mod_name);
        }

        return traverseDependencies(manager.getModule(mod_name)).code;
      });

      if (mod.factory && !mod.hasOwnProperty("code")) {
        mod.code = mod.factory.apply(root, deps);
      }

      manager.setModuleCode(mod.name, mod.code);
      manager.setModule(mod.name, mod);
      return mod;
    };
  }

  module.exports = ModuleLinker;
})(typeof(window) !== 'undefined' ? window : this);
