//var logger   = require("loggero").create("controllers/builder");
var helpers  = require("./helpers");
var Module   = require("../module");
var Pipeline = require("../pipeline");


function Builder(manager) {
  if (!manager) {
    throw new TypeError("Must provide a manager");
  }

  this.manager = manager;

  this.pipeline = new Pipeline([
    compile(manager),
    link(manager)
  ]);
}


Builder.prototype.build = function(id) {
  if (this.manager.controllers.registry.getModuleState(id) === Module.State.READY) {
    return this.manager.controllers.registry.getModule(id);
  }

  return build(this, this.manager.controllers.registry.getModule(id));
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


function compile(manager) {
  return helpers.serviceRunnerSync(manager, Module.State.LOADED, Module.State.COMPILE, manager.services.compile);
}


function link(manager) {
  return helpers.serviceRunnerSync(manager, Module.State.COMPILE, Module.State.READY, manager.services.link);
}


/**
 * Builds a `# sourceURL` string from the URL.
 *
 * @private
 *
 * @param {Module.Meta} moduleMeta - Module meta object this function is processing
 * @returns {string} The proper source url to be inserted in the module source
 */
function getSourceUrl(moduleMeta) {
  var url = canUseSourceURL(moduleMeta) ? moduleMeta.path : moduleMeta.id;
  return url ? "\n//# sourceURL=" + url : "";
}


/**
 * Verifies if a sourceUrl should be the full url of the module or just
 * the module name. This is to avoid having source maps and the source
 * url being added be the same url because browsers don't handle that
 * very well.
 *
 * @private
 *
 * @param {Module.Meta} moduleMeta - Module meta object this function is processing
 * @returns {boolean}
 */
function canUseSourceURL(moduleMeta) {
  if (!moduleMeta.source) {
    return false;
  }

  return (moduleMeta.source.indexOf("//# sourceMappingURL=") === -1) && (moduleMeta.source.indexOf("//# sourceURL=") === -1);
}


module.exports = Builder;
