var fs          = require("fs");
var JSONStream  = require("JSONStream");
var joint       = require("stream-joint");
var log2console = require("log2console");
var Bitloader   = require("bit-loader");
var fileReader  = require("./src/fileReader");
var resolvePath = require("./src/resolvePath");


Bitloader.logger
  .enable()
  .pipe(JSONStream.stringify(false))
  .pipe(joint(process.stdout))
  .pipe(joint(fs.createWriteStream("temp.log")));


var loader = new Bitloader({
  resolve: resolvePath.configure({baseUrl: __filename}),
  fetch: fileReader
});


// Load two modules
loader
  .import(["js/sample1.js", "js/sample2.js"])
  .then(function(result) {
    log2console(result[0]);
    log2console(result[1]);
  }, log2console);
