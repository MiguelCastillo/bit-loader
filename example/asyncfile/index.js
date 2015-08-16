var fs          = require("fs");
var joint       = require("stream-joint");
var log2console = require("log2console");
var Bitloader   = require("bit-loader");
var fileReader  = require("./fileReader");
var compiler    = require("./compiler");
var resolvePath = require("./resolvePath");


Bitloader.Logger
  .enable()
  .pipe(joint(process.stdout))
  .pipe(joint(fs.createWriteStream("./temp.log")));


var loader = new Bitloader({
  resolve: resolvePath.configure({baseUrl: __filename}),
  fetch: fileReader,
  compile: compiler
});


// Load two modules
loader
  .import(["js/sample1.js", "js/sample2.js"])
  .then(function(result) {
    log2console(result[0]);
    log2console(result[1]);
  }, log2console);


module.exports = loader;
