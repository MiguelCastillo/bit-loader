var logger = require("loggero").create("Meta/Compiler");
var Module = require("../module");


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

  if (!Module.Meta.canCompile(moduleMeta)) {
    return Promise.resolve(moduleMeta);
  }

  return manager.pipelines.compile.run(moduleMeta);
};


/**
 * The compile step evaluates the module meta source.
 *
 * This step is synchronous.
 */
MetaCompile.compile = function(manager, moduleMeta) {
  logger.log(moduleMeta.name, moduleMeta);

  if (Module.Meta.canCompile(moduleMeta)) {
    moduleMeta.configure(manager.compile(moduleMeta));
  }
};


module.exports = MetaCompile;
