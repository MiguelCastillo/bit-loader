var System = (function() {
  var importer = bitimports.config({
    baseUrl: '../',
    paths: {
      chai: 'node_modules/chai/chai'
    }
  });

  importer.ignore(['chai', 'dist/bit-loader']);
  importer.Logger.enableAll();
  return importer;
})();

var require = System.require; // eslint-disable-line
