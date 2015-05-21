(function() {
  "use strict";

  function Resolver() {
  }

  Resolver.prototype.resolve = function(moduleMeta /*, moduleParent*/) {
    return {
      cname: moduleMeta.path,
      path: moduleMeta.name
    };
  };

  module.exports = Resolver;
})();
