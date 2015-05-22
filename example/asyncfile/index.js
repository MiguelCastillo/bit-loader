var fileReader = require("./fileReader");
var Bitloader  = require("bit-loader");
var Utils      = Bitloader.Utils;


var loader = new Bitloader({
  resolve: resolvePath,
  fetch: fileReader,
  compile: compileModule
});


// Load two modules
loader
  .import(["js/sample1.js", "js/sample2.js"])
  .then(function(result) {
    console.log(result[0], result[1]);
  }, Utils.forwardError);



/**
 * Convert module name to full module path
 */
function resolvePath(moduleMeta) {
  moduleMeta.configure({
    path: __dirname + "/" + moduleMeta.name
  });
}


/**
 * Module compiler that convert source to runnable code.
 */
function compileModule(moduleMeta) {
  moduleMeta.configure({
    code: evaluate(moduleMeta)
  });
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


module.exports = loader;
