(function() {
  "use strict";

  function Fetch() {
  }

  Fetch.prototype.fetch = function(/*name*/) {
    throw new TypeError("Fetch:fetch is not implemented, must be implemented by the consumer code");
  };

  Fetch.prototype.canProcess = function() {
    return false;
  };

  module.exports = Fetch;
})();
