var logger  = require("loggero").create("service/fetch");
var inherit = require("../inherit");
var Service = require("../service");


function Fetch(manager) {
  Service.call(this);

  this._manager = manager;
  this._logger = logger;
}


inherit.base(Fetch).extends(Service);


Fetch.prototype.canProcess = function(moduleMeta) {
  return this.canExecute(moduleMeta)
    && moduleMeta.hasOwnProperty("path")
    && !moduleMeta.hasOwnProperty("code")
    && !moduleMeta.hasOwnProperty("source")
    && !moduleMeta.hasOwnProperty("factory");
};


module.exports = Fetch;
