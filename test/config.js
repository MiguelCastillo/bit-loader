var require = ( // eslint-disable-line
  function() {
    var importer = bitimports.config({
      "baseUrl": "../",
      "paths": {
        "chai": "node_modules/chai/chai"
      }
    });

    // Add modules to exclude from pipeline processing
    importer.ignore(["chai", "dist/bit-loader"]);

    bitimports.Logger.enableAll();
    return importer.require;
  }
)();
