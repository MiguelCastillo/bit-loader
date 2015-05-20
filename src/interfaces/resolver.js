(function() {
  "use strict";

  function Resolver() {
  }

  Resolver.prototype.resolve = function(/*moduleMeta, moduleParent*/) {
    throw new TypeError("Resolver:resolve is not implemented, must be implemented by the consumer code");
  };

  module.exports = Resolver;
})();
