var System = (function() {
  var importer = bitimports.config({
    baseUrl: "../",
    paths: {
      loggero: "node_modules/loggero/dist/index",
      "dis-isa": "node_modules/dis-isa/dist/index",
      "roolio": "node_modules/roolio/dist/index",
      "belty": "node_modules/belty/dist/index",
      "chai": "node_modules/chai/chai"
    }
  });

  importer.ignore(["chai", "loggero", "dis-isa", "roolio", "belty", "dist/bit-loader"]);
  importer.logger.enable();
  return importer;
})();

var require = System.require; // eslint-disable-line
