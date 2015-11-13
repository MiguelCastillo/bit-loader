var logger  = require("loggero").create("service/resolve");
var Service = require("../service");


function Resolve(manager) {
  Service.call(this);
  this._manager = manager;
  this._logger = logger;
}


Resolve.prototype = Object.create(Service.prototype);
Resolve.prototype.constructor = Resolve;


Resolve.prototype.canProcess = function(moduleMeta) {
  return this.canExecute(moduleMeta) && !moduleMeta.hasOwnProperty("path");
};


module.exports = Resolve;
