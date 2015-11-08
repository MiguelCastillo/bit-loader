var logger  = require("loggero").create("service/transform");
var types   = require("dis-isa");
var Service = require("../service");


function Transform(manager) {
  Service.call(this);
  this._manager = manager;
  this._logger = logger;
}


Transform.prototype = Object.create(Service.prototype);
Transform.prototype.constructor = Transform;


Transform.prototype.canProcess = function(moduleMeta) {
  return this.canExecute(moduleMeta) && types.isString(moduleMeta.source);
};


module.exports = Transform;
