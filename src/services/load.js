var logger  = require("loggero").create("Meta/Import");
var inherit = require("../inherit");
var Module  = require("../module");
var Service = require("../service");


function Load(context) {
  Service.call(this, context);

  this._logger = logger;
}


inherit.base(Load).extends(Service);


Load.prototype.canProcess = function(moduleMeta) {
  return this.canExecute(moduleMeta) && Module.canImport(moduleMeta);
};


module.exports = Load;
