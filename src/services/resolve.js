var logger  = require("loggero").create("service/resolve");
var inherit = require("../inherit");
var Service = require("../service");


function Resolve(manager) {
  Service.call(this);

  this._manager = manager;
  this._logger = logger;
}


inherit.base(Resolve).extends(Service);


Resolve.prototype.canProcess = function(moduleMeta) {
  return this.canExecute(moduleMeta) && !moduleMeta.hasOwnProperty("path");
};


module.exports = Resolve;
