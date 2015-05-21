var fs = require("fs");
var Bitloader = require("../../dist/bit-loader.js");
var Promise = Bitloader.Promise;
var Utils = Bitloader.Utils;


var loader = new Bitloader({
  fetch: loadFile,
  compile: compileModule
});


// Load two modules
loader
  .import(["js/sample1.js", "js/sample2.js"])
  .then(function(result) {
    console.log(result);
  }, Utils.forwardError);


/**
 * File reader
 */
function loadFile(moduleMeta) {
  // Read file from disk and return a module meta
  return readFile(moduleMeta.name).then(function(text) {
    return {
      source: text
    };
  }, Utils.forwardError);
}


/**
 * Module compiler that convert source to runnable code.
 */
function compileModule(moduleMeta) {
  return {
    code: evaluate(moduleMeta)
  };
}


/**
 * Helper method that evaluates source to generate runnable code
 */
function evaluate(moduleMeta) {
  var _exports = {};
  var _module = {exports: _exports};
  /* jshint -W054 */
  (new Function("module", "exports", moduleMeta.source))(_module, _exports);
  /* jshint +W054 */
  return _module;
}


/**
 * Read file from storage.  You can very easily replace this with a routine that
 * loads data using XHR.
 */
function readFile(fileName) {
  return new Promise(function(resolve, reject) {
    var filecontent = "";
    var stream = fs
      .createReadStream(__dirname + "/" + fileName)
      .setEncoding("utf8");

    stream.on("readable", function() {
      filecontent += stream.read();
    });

    stream.on("end", function() {
      resolve(filecontent);
    });

    stream.on("error", reject);
  });
}


module.exports = loader;
