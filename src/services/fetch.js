var logger  = require("loggero").create("service/fetch");
var Service = require("../service");


function Fetch(manager) {
  Service.call(this);
  this._manager = manager;
  this._logger = logger;
}


Fetch.prototype = Object.create(Service.prototype);
Fetch.prototype.constructor = Fetch;


Fetch.prototype.canProcess = function(moduleMeta) {
  return this.canExecute(moduleMeta)
    && moduleMeta.hasOwnProperty("path")
    && !moduleMeta.hasOwnProperty("code")
    && !moduleMeta.hasOwnProperty("source")
    && !moduleMeta.hasOwnProperty("factory");
};


module.exports = Fetch;
