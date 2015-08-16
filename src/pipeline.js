var log2console = require("log2console");

function Pipeline(assets) {
  this.assets = assets;
}

Pipeline.prototype.run = function() {
  var args = arguments;
  function cb(curr) {
    return function pipelineAssetReady() {
      return curr.apply((void 0), args);
    };
  }

  return this.assets.reduce(function(prev, curr) {
    return prev.then(cb(curr), log2console);
  }, Promise.resolve());
};

module.exports = Pipeline;
