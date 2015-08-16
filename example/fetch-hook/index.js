var Bitloader   = require("bit-loader");
var log2console = require("log2console");

var loader = new Bitloader({
  fetch: loadFile
});


loader.import(["like1", "like2"]).then(function(result) {
  log2console(result[0] + "\n" + result[1]);
});


function loadFile(moduleMeta) {
  moduleMeta.configure({
    source: "fetch module: " + moduleMeta.name
  });
}
