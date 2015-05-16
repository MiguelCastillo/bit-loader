(function() {
  "use strict";

  function Fetcher() {
  }

  Fetcher.prototype.fetch = function(/*moduleMeta*/) {
    throw new TypeError("Fetcher:fetch is not implemented, must be implemented by the consumer code");
  };

  Fetcher.prototype.canProcess = function() {
    return false;
  };

  module.exports = Fetcher;
})();
