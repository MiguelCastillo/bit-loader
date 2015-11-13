//var logger = require("loggero").create("controllers/resolver");
var Module = require("../module");


function Resolver(manager) {
  if (!manager) {
    throw new TypeError("Must provide a manager");
  }

  this.manager = manager;
}


Resolver.prototype.resolve = function(name, referrer) {
  var moduleMeta = new Module.Meta({
    name: name,
    referrer: referrer
  });

  return this.manager.services.resolve.run(moduleMeta).then(configureId);
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
};


module.exports = Resolver;
