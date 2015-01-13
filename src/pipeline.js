(function() {
  "use strict";

  var Promise = require('spromise');

  function Pipeline(assets) {
    this.assets = assets;
  }

  Pipeline.prototype.run = function() {
    var args = arguments;
    return this.assets.reduce(function(prev, curr) {
      return prev.then(curr.apply((void 0), args), forwardError);
    }, Promise.resolve());
  };

  function forwardError(error) {
    return error;
  }

  module.exports = Pipeline;
})();
