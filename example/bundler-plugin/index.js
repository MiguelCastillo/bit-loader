var bundler     = require("./src/bundler");
var fileReader  = require("./src/fileReader");
var resolvePath = require("./src/resolvePath");
var Bitloader   = require("bit-loader");
var babel       = require("babel-bits");
var umd_deps    = require("deps-bits");
var Utils       = Bitloader.Utils;


/**
 * Create bit loader with a fetch core hook for reading files from storage
 */
var bitloader = new Bitloader();


/**
 * Setup a babel transform
 */
bitloader.plugin("js", {
  resolve: resolvePath.configure({baseUrl: __filename}),
  fetch: fileReader,
  transform: [babel],
  dependency: [umd_deps]
});


/**
 * Add any modules that shouldn't be processed by the `transform` and `dependency`
 * pipelines right here.  The match is done on the module id being imported
 */
bitloader.ignore({
  match: ["react"]
});


/**
 * Import two modules. One with just ES2015 and the other with React JSX and ES2015
 */
loadModules(["./js/Name.js"])
  .then(bundler(bitloader), Utils.forwardError)
  .then(toConsole, Utils.forwardError);


function toConsole(buffer) {
  console.log(buffer);
}


/**
 * Convenience method to load modules and get the module instances back
 * rather then the executable code, which is the difference between
 * import and load.  Import gives back the evaluated code, whereas
 * load gives back the full module instance.
 */
function loadModules(modules) {
  if (Utils.isString(modules)) {
    modules = [modules];
  }

  return Promise.all(modules.map(function(mod) {
    return bitloader.load(mod);
  }));
}
