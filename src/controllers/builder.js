//var logger   = require("loggero").create("controllers/builder");
var helpers    = require("./helpers");
var inherit    = require("../inherit");
var Module     = require("../module");
var Controller = require("../controller");
var Pipeline   = require("then-pipeline");


function Builder(context) {
  Controller.call(this, context);

  this.pipeline = new Pipeline([
    compile(context),
    link(context)
  ]);
}


inherit.base(Builder).extends(Controller);


Builder.prototype.build = function(id) {
  if (this.context.controllers.registry.getModuleState(id) === Module.State.READY) {
    return this.context.controllers.registry.getModule(id);
  }

  return build(this, this.context.controllers.registry.getModule(id));
};


function build(builder, moduleMeta) {
  if (!moduleMeta.getDependencyExportsByName) {
    moduleMeta = moduleMeta.configure({
      getDependencyExportsByName: getDependencyExportsByName(builder, moduleMeta)
    });
  }

  moduleMeta = moduleMeta.configure({
    source: moduleMeta.source + getSourceUrl(moduleMeta)
  });

  return builder.pipeline.runSync(moduleMeta);
}


function getDependencyExportsByName(builder, moduleMeta) {
  return function getDependency(name) {
    return moduleMeta.deps
      .filter(function(dep) {
        return dep.name === name;
      })
      .map(function(dep) {
        return builder.build(dep.id).exports;
      })[0]; // Sneaky... Always return the first item in the array...
  };
}


function compile(context) {
  return helpers.serviceRunnerSync(context, Module.State.LOADED, Module.State.COMPILE, context.services.compile);
}


function link(context) {
  return helpers.serviceRunnerSync(context, Module.State.COMPILE, Module.State.READY, context.services.link);
}


/**
 * Builds a `# sourceURL` string from the URL.
 *
 * @private
 *
 * @param { Module } moduleMeta - Module meta object this function is processing
 * @returns {string} The proper source url to be inserted in the module source
 */
function getSourceUrl(moduleMeta) {
  return !moduleMeta.path || hasSourceURL(moduleMeta) ?
    "" :
    "\n//# sourceURL=" + moduleMeta.path.replace(/^(https?):\/\/\/?[^\/]*/, "");
}


/**
 * Verifies if the module already has a `sourceURL` so that we don't override it.
 * @private
 *
 * @param { Module } moduleMeta - Module meta object this function is processing
 * @returns {boolean}
 */
function hasSourceURL(moduleMeta) {
  return moduleMeta.source && moduleMeta.source.indexOf("//# sourceURL=") !== -1;
}


module.exports = Builder;
