var logger = require("loggero").create("pipeline");

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
    return prev.then(cb(curr), logger.error);
  }, Promise.resolve());
};

module.exports = Pipeline;
