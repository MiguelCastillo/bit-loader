var logger  = require("loggero").create("service/compile");
var inherit = require("../inherit");
var Module  = require("../module");
var Service = require("../service");
var Eval    = require("./eval");


function Compile(context) {
  Service.call(this, context);

  this._logger = logger;
}


inherit.base(Compile).extends(Service);


Compile.prototype.canProcess = function(moduleMeta) {
  return Module.canCompile(moduleMeta);
};


Compile.prototype.runSync = function(moduleMeta) {
  this._logger && this._logger.log(moduleMeta.name, moduleMeta);

  if (!this.validate(moduleMeta)) {
    return moduleMeta;
  }

  var mod = { exports: {} };
  Eval(this.context.controllers.loader, mod, mod.exports, moduleMeta.getDependencyExportsByName, moduleMeta.directory, moduleMeta.filepath, moduleMeta.source);
  return moduleMeta.configure(mod);
};


module.exports = Compile;
