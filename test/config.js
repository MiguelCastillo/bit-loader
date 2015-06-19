/* jshint -W098 */
var require = (function() {
/* jshint +W098 */
  var importer = bitimports.config({
    "baseUrl": "../",
    "paths": {
      "chai": "node_modules/chai/chai",
      "minimatch": "node_modules/minimatch/browser"
    }
  });

  importer.ignore({
    match: ["chai", "minimatch", "dist/bit-loader"]
  });

  bitimports.Logger.enableAll();
  return importer.require;
}());
