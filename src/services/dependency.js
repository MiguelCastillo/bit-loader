var logger  = require("loggero").create("service/dependency");
var inherit = require("../inherit");
var types   = require("dis-isa");
var Service = require("../service");


function Dependency(context) {
  Service.call(this, context);

  this._logger = logger;
}


inherit.base(Dependency).extends(Service);


Dependency.prototype.canProcess = function(moduleMeta) {
  return types.isString(moduleMeta.source);
};


module.exports = Dependency;
