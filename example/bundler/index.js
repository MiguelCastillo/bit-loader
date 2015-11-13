var Bitloader   = require("bit-loader");
var babel       = require("babel-bits");
var umd_deps    = require("deps-bits");
var log2console = require("log2console");

var bundler     = require("./src/bundler");
var fileReader  = require("./src/fileReader");
var resolvePath = require("./src/resolvePath");


/**
 * Create bit loader. We register a single plugin for processing module files
 */
var loader = new Bitloader();


// We don't really wanna process react...
loader.ignore("react");


/**
 * Setup plugin with:
 * - resolve to convert module ids to module paths
 * - fetch to load module files from storage
 * - transform to convert module files to other formats. E.g. JSX to JavaScript
 * - dependency to process and load module dependencies
 */
loader.plugin({
  resolve: resolvePath.configure({baseUrl: __filename}),
  fetch: fileReader,
  transform: [babel],
  dependency: [umd_deps]
});


/**
 * Import two modules. One with just ES2015 and the other with React JSX and ES2015
 */
loader
  .fetch(["./js/Name.js"])
  .then(bundler(loader, {}))
  .then(log2console, printStack);


// Alternate syntax.
//
//bundler(loader, {})
//  .bundle(["./js/Name.js"])
//  .then(log2console, printStack);


function printStack(err) {
  if (err && err.stack) {
    console.error(err.stack);
  }
  else {
    console.log(err);
  }
}
