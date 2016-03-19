var logger  = require("loggero").create("service/precompile");
var inherit = require("../inherit");
var Service = require("../service");


function PreCompile(context) {
  Service.call(this, context);

  this._logger = logger;
}


inherit.base(PreCompile).extends(Service);


module.exports = PreCompile;
