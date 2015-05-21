var Bitloader = require('../../dist/bit-loader.js');
var Promise = Bitloader.Promise;

var loader = new Bitloader({
  fetch: loadFile
});


// Register anonymous transform directly in the transform pipeline
loader.pipelines.transform.use(addStrict);


loader.import(["like1", "like2"]).then(function(result) {
  console.log(result);
});


/**
 * File reader
 */
function loadFile(moduleMeta) {
  // Read file from disk and return a module meta
  return Promise.resolve({source: "fetch module: " + moduleMeta.name});
}


/**
 * Add strict to the module before it is executed.
 */
function addStrict(moduleMeta) {
  console.log("transform '" + moduleMeta.name + "'");
  moduleMeta.configure({source: "'use strict;'\n" + moduleMeta.source});
}
