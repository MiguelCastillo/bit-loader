var Bitloader = require("bit-loader");

var loader = new Bitloader({
  fetch: loadFile
});


loader.import(["like1", "like2"]).then(function(result) {
  console.log(result);
});


function loadFile(moduleMeta) {
  moduleMeta.configure({
    source: "fetch module: " + moduleMeta.path
  });
}
