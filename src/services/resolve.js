var logger  = require("loggero").create("service/resolve");
var inherit = require("../inherit");
var Service = require("../service");


function Resolve(context) {
  Service.call(this, context);

  this._logger = logger;
}


inherit.base(Resolve).extends(Service);


Resolve.prototype.run = Resolve.prototype.runAsync = function() {
  return Service.prototype.runAsync.apply(this, arguments).then(configureId);
};


Resolve.prototype.canProcess = function(moduleMeta) {
  return this.canExecute(moduleMeta) && !moduleMeta.hasOwnProperty("path");
};


function configureId(moduleMeta) {
  var result = {};

  if (!moduleMeta.path && moduleMeta.url) {
    result.path = moduleMeta.url && moduleMeta.url.href;
  }

  if (!moduleMeta.hasOwnProperty("id") && moduleMeta.path) {
    result.id = moduleMeta.path;
  }

  return moduleMeta.configure(result);
}


module.exports = Resolve;
