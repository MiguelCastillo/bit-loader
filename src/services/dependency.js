var logger  = require("loggero").create("service/dependency");
var types   = require("dis-isa");
var Service = require("../service");


function Dependency(manager) {
  Service.call(this);
  this._manager = manager;
  this._logger = logger;
}


Dependency.prototype = Object.create(Service.prototype);
Dependency.prototype.constructor = Dependency;


Dependency.prototype.canProcess = function(moduleMeta) {
  return this.canExecute(moduleMeta) && types.isString(moduleMeta.source);
};


module.exports = Dependency;
