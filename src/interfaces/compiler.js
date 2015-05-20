(function() {
  "use strict";

  function Compiler() {
  }

  Compiler.prototype.compile = function(/*moduleMeta*/) {
    throw new TypeError("Compiler:compile is not implemented, must be implemented by the consumer code");
  };

  module.exports = Compiler;
})();
