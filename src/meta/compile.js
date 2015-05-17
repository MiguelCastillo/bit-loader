(function() {
  "use strict";

  var Promise     = require('promise'),
      runPipeline = require('./runPipeline'),
      Module      = require('../module'),
      Utils       = require('../utils'),
      logger      = require('logger').factory("Meta/Compiler");


  function MetaCompile() {
  }


  /**
   * Runs compiler pipeline to give plugins a chances to compile the meta module
   * if one is registered.
   */
  MetaCompile.pipeline = function(manager, moduleMeta) {
    logger.log(moduleMeta.name, moduleMeta);

    if (manager.rules.ignore.match(moduleMeta.name, "compile")) {
      return Promise.resolve(moduleMeta);
    }

    function compilationFinished() {
      return moduleMeta;
    }

    return runPipeline(manager.pipelines.compile, moduleMeta)
      .then(compilationFinished, Utils.forwardError);
  };


  /**
   * The compile step is to convert the moduleMeta to an instance of Module.
   */
  MetaCompile.compile = function(manager, moduleMeta) {
    logger.log(moduleMeta.name, moduleMeta);

    if (manager.rules.ignore.match(moduleMeta.name, "compile")) {
      return Promise.resolve();
    }

    var mod;
    if (Module.Meta.canCompile(moduleMeta)) {
      mod = manager.compile(moduleMeta);
    }
    else if (Module.Meta.isCompiled(moduleMeta)) {
      mod = new Module(moduleMeta);
    }

    if (mod) {
      // We will coerce the name no matter what name (if one at all) the Module was
      // created with. This will ensure a consistent state in the loading engine.
      mod.name = moduleMeta.name;

      // Set the mod.meta for convenience
      mod.meta = moduleMeta;
      return mod;
    }
  };


  module.exports = MetaCompile;
})();
