var runPipeline = require("./runPipeline");
var Promise     = require("../promise");
var Module      = require("../module");
var Utils       = require("../utils");
var logger      = require("../logger").factory("Meta/Compiler");


function MetaCompile() {
}


/**
 * Runs compiler pipeline to give plugins a chances to compile the meta module
 * if one is registered.
 *
 * This step is asynchronous.
 */
MetaCompile.pipeline = function(manager, moduleMeta) {
  logger.log(moduleMeta.name, moduleMeta);

  if (!Module.Meta.canCompile(moduleMeta) || !canProcess(manager, moduleMeta)) {
    return Promise.resolve(moduleMeta);
  }

  function compilationFinished() {
    return moduleMeta;
  }

  return runPipeline(manager.pipelines.compile, moduleMeta)
    .then(compilationFinished, Utils.reportError);
};


/**
 * The compile step is to convert the moduleMeta to an instance of Module.
 *
 * This step is synchronous.
 */
MetaCompile.compile = function(manager, moduleMeta) {
  logger.log(moduleMeta.name, moduleMeta);

  if (!canProcess(manager, moduleMeta)) {
    return;
  }

  if (Module.Meta.canCompile(moduleMeta)) {
    moduleMeta.configure(manager.compile(moduleMeta));
  }

  if (!Module.Meta.isCompiled(moduleMeta)) {
    throw new TypeError("Module " + moduleMeta.name + " is not compiled");
  }

  // Create Module instance!  This is what we have been processing all this data for.
  var mod = new Module(moduleMeta);

  // We will coerce the name no matter what name (if one at all) the Module was
  // created with. This will ensure a consistent state in the loading engine.
  mod.name = moduleMeta.name;

  // Set the mod.meta for convenience
  mod.meta = moduleMeta;
  return mod;
};


function canProcess(manager, moduleMeta) {
  return !manager.rules.ignore.match(moduleMeta.name, "compile");
}


module.exports = MetaCompile;
