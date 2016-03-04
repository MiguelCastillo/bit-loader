var logger  = require("loggero").create("service/resolve");
var inherit = require("../inherit");
var Service = require("../service");


function Resolve(context) {
  Service.call(this, context);

  this._logger = logger;
}


inherit.base(Resolve).extends(Service);


Resolve.prototype.canProcess = function(moduleMeta) {
  return this.canExecute(moduleMeta) && !moduleMeta.hasOwnProperty("path");
};


module.exports = Resolve;
