var logger = require("loggero").create("service/resolve");
var Service = require("../service");


function Resolve(manager) {
  Service.call(this);
  this._manager = manager;
  this._logger = logger;
}


Resolve.prototype = Object.create(Service.prototype);
Resolve.prototype.constructor = Resolve;


Resolve.prototype.canProcess = function(moduleMeta) {
  return this.canExecute(moduleMeta) && !moduleMeta.hasOwnProperty("path");
};


Resolve.prototype.processResult = function(moduleMeta, result) {
  if (moduleMeta === result || !result || moduleMeta.path) {
    return moduleMeta;
  }

  if (!result.path && result.url) {
    result.path = result.url && result.url.href;
  }

  // If module meta does not have an id, then we try to infer it from the
  // either the result.id or the result.path.
  if (!moduleMeta.hasOwnProperty("id") && !result.hasOwnProperty("id") && result.path) {
    result.id = result.path;
  }

  delete result.name;
  return moduleMeta.configure(result);
};


module.exports = Resolve;
