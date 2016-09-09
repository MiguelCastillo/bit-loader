var logger  = require("loggero").create("service/pretransform");
var inherit = require("../inherit");
var Service = require("../service");


function PreTransform(context) {
  Service.call(this, context);

  this._logger = logger;
}


inherit.base(PreTransform).extends(Service);


module.exports = PreTransform;
