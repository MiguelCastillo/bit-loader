var fs          = require("fs");
var joint       = require("stream-joint");
var Bitloader   = require("bit-loader");
var fileReader  = require("./fileReader");
var compiler    = require("./compiler");
var resolvePath = require("./resolvePath");
var Utils       = Bitloader.Utils;


Bitloader.Logger
  .enable()
  .pipe(joint(process.stdout))
  .pipe(joint(fs.createWriteStream('./temp.log')));


var loader = new Bitloader({
  resolve: resolvePath,
  fetch: fileReader,
  compile: compiler
});


// Load two modules
loader
  .import(["js/sample1.js", "js/sample2.js"])
  .then(function(result) {
    console.log(result[0], result[1]);
  }, Utils.reportError);


module.exports = loader;
