var logger  = require("loggero").create("service/transform");
var types   = require("dis-isa");
var inherit = require("../inherit");
var Service = require("../service");


function Transform(manager) {
  Service.call(this);

  this._manager = manager;
  this._logger = logger;
}


inherit.base(Transform).extends(Service);


Transform.prototype.canProcess = function(moduleMeta) {
  return this.canExecute(moduleMeta) && types.isString(moduleMeta.source);
};


module.exports = Transform;
