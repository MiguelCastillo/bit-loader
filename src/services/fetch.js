var logger  = require("loggero").create("service/fetch");
var inherit = require("../inherit");
var Service = require("../service");


function Fetch(context) {
  Service.call(this, context);

  this._logger = logger;
}


inherit.base(Fetch).extends(Service);


Fetch.prototype.canProcess = function(moduleMeta) {
  return moduleMeta.hasOwnProperty("path")
    && !moduleMeta.hasOwnProperty("code")
    && !moduleMeta.hasOwnProperty("source")
    && !moduleMeta.hasOwnProperty("factory");
};


module.exports = Fetch;
