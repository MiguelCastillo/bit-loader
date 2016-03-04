var logger  = require("loggero").create("service/compile");
var inherit = require("../inherit");
var Module  = require("../module");
var Service = require("../service");
var Eval    = require("./eval");


function Compile(manager) {
  Service.call(this);

  this._manager = manager;
  this._logger = logger;
}


inherit.base(Compile).extends(Service);


Compile.prototype.canProcess = function(moduleMeta) {
  return this.canExecute(moduleMeta) && Module.Meta.canCompile(moduleMeta);
};


Compile.prototype.runSync = function(moduleMeta) {
  this._logger && this._logger.log(moduleMeta.name, moduleMeta);

  if (!this.canProcess(moduleMeta)) {
    return moduleMeta;
  }

  var mod = { exports: {} };
  Eval(this._manager.controllers.loader, mod, mod.exports, moduleMeta.getDependencyExportsByName, moduleMeta.getDirectory(), moduleMeta.getFilePath(), moduleMeta.source);
  return moduleMeta.configure(mod);
};


module.exports = Compile;
