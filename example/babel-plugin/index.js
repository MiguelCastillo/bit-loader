var fileReader  = require("./src/fileReader");
var resolvePath = require("./src/resolvePath");
var Bitloader   = require("bit-loader");
var babel       = require("babel-bits");
var log2console = require("log2console");


/**
 * Create bit loader with a fetch core hook for reading files from storage
 */
var loader = new Bitloader();


/**
 * Setup a babel transform
 */
loader.plugin({
  resolve: resolvePath.configure({baseUrl: __filename}),
  fetch: fileReader,
  transform: babel
});


/**
 * Import two modules. One with just ES2015 and the other with React JSX and ES2015
 */
loader
  .getSource(["./js/Name.js", "./js/HelloWorld.jsx"])
  .then(function(result) {
    log2console(result[0]);
    log2console(result[1]);
  }, log2console);
