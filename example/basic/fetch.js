var Bitloader = require('../../dist/bit-loader.js');

var loader = new Bitloader({
  fetch: loadFile
});


loader.import(["like1", "like2"]).then(function(result) {
  console.log(result);
});


function loadFile(moduleMeta) {
  return {
    source: "fetch module: " + moduleMeta.path
  };
}
