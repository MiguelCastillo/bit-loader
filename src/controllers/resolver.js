//var logger = require("loggero").create("controllers/resolver");
var inherit    = require("../inherit");
var Module     = require("../module");
var Controller = require("../controller");


function Resolver(context) {
  Controller.call(this, context);
}


inherit.base(Resolver).extends(Controller);


Resolver.prototype.resolve = function(name, referrer) {
  var moduleMeta = new Module.Meta({
    name: name,
    referrer: referrer
  });

  return this.context.services.resolve.run(moduleMeta).then(configureId);
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
