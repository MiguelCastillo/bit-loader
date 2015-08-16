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
var bitloader = new Bitloader();


/**
 * Add any modules that shouldn't be processed by the `transform` and `dependency`
 * pipelines right here.  The match is done on the module id being imported
 */
bitloader.ignore(["react"]);


/**
 * Setup plugin with:
 * - resolve to convert module ids to module paths
 * - fetch to load module files from storage
 * - transform to convert module files to other formats. E.g. JSX to JavaScript
 * - dependency to process and load module dependencies
 */
bitloader.plugin("js", {
  resolve: resolvePath.configure({baseUrl: __filename}),
  fetch: fileReader,
  transform: [babel],
  dependency: [umd_deps]
});


/**
 * Import two modules. One with just ES2015 and the other with React JSX and ES2015
 */
bitloader.load(["./js/Name.js"])
  .then(bundler(bitloader), log2console)
  .then(log2console, log2console);
