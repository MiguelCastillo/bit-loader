var Bitloader   = require("bit-loader");
var log2console = require("log2console");


var loader = new Bitloader({
  resolve: resolver,
  fetch: loadFile
});


loader.import(["like1", "like2"]).then(function(result) {
  log2console(result[0] + "\n" + result[1]);
}, log2console);


function resolver(moduleName) {
  return {
    path: moduleName.name
  };
}


function loadFile(moduleMeta) {
  return {
    source: "module.exports = '" + moduleMeta.name + "';"
  };
}
