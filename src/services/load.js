var logger  = require("loggero").create("Meta/Import");
var Module  = require("../module");
var Service = require("../service");


function Load(manager) {
  Service.call(this);
  this._manager = manager;
  this._logger = logger;
}


Load.prototype = Object.create(Service.prototype);
Load.prototype.constructor = Load;


Load.prototype.canProcess = function(moduleMeta) {
  return this.canExecute(moduleMeta) && Module.Meta.canImport(moduleMeta);
};


module.exports = Load;
