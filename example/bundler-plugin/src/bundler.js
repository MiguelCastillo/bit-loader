var browserPack = require("browser-pack");
var pstream     = require("./pstream");


/**
 * Bundles up incoming modules
 */
function bundler(modules) {
  // Combine all browser pack bits into an array that can be processed by
  // browser pack.
  var data = modules.map(function(mod) {
    return mod.meta.browserpack;
  });

  var stream  = browserPack();
  var promise = pstream(stream);
  stream.end(JSON.stringify(data));
  return promise;
}


/**
 * Transform to map from module meta objects to browser pack objects
 */
bundler.transform = function(moduleMeta) {
  moduleMeta.configure({
    browserpack: {
      id: moduleMeta.name,
      source: moduleMeta.source,
      deps: {}
    }
  });
};


module.exports = bundler;
