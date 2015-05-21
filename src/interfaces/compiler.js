(function() {
  "use strict";

  function Compiler() {
  }

  Compiler.prototype.compile = function(moduleMeta) {
    return {
      code: moduleMeta.source
    };
  };

  module.exports = Compiler;
})();
