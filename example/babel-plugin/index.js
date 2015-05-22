var fileReader = require("./fileReader");
var Bitloader  = require("bit-loader");
var babel      = require("babel-bits");


/**
 * Create bit loader with a fetch core hook for reading files from storage
 */
var bitloader = new Bitloader({
  fetch: fileReader
});


/**
 * Setup a babel transform
 */
bitloader.plugin("js", {
  transform: babel
});


/**
 * Import two modules. One with just ES2015 and the other with React JSX and ES2015
 */
bitloader.import(["js/Name.js", "js/HelloWorld.jsx"]).then(function(result) {
  console.log(result[0], result[1]);
});
