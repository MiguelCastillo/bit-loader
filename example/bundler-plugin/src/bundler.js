var browserPack = require("browser-pack");


/**
 * Bundles up incoming modules
 */
function bundler(modules) {
  return new Promise(function(resolve, reject) {
    var buffer = "";

    // Combine all browser pack bits into an array that can be processed by
    // browser pack.
    var data = modules.map(function(mod) {
      return mod.meta.browserpack;
    });

    browserPack()
      .on("data", function(data) {
        if (data !== null) {
          buffer += "" + data;
        }
      })
      .on("end", function() {
        resolve(buffer);
      })
      .on("error", function(error) {
        reject(error);
      })
      .end(JSON.stringify(data));
  });
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
