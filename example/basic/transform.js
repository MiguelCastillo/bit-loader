var Bitloader = require('../../dist/bit-loader.js');
var loader = new Bitloader({}, {fetch: fetchFactory});

// Register anonymous transform
loader.transform.use(addStrict);

loader.import(["like1", "like2"]).then(function(r1, r2) {
  console.log(r1, r2);
});


// When fetchFactory is called, the instance of loader is passed in.
function fetchFactory(/*loader*/) {
  function compile() {
    console.log("compile '" + this.name + "'");
    // `this` is an augmented meta module object that has access to manager,
    // which is the instance of loader.
    return new this.manager.Module({code: evaluate(this)});
  }

  return {
    fetch: function(name) {
      console.log("fetching '" + name + "'");
      // Notice that fetch returns a simple object with a `compile` method.
      // When a `compile` method is provided, a `source` property of type
      // string must also be proivded.
      // This object returned is what we call a module meta object.
      return {compile: compile, source: "exports.result = 1;"};
    }
  };
}


// Add strict to the module before it is executed.
function addStrict(moduleMeta) {
  console.log("transform '" + moduleMeta.name + "'");
  moduleMeta.source = "'use strict;'\n" + moduleMeta.source;
}


function evaluate(moduleMeta) {
  var _exports = {};
  var _module = {exports: _exports};
  /* jshint -W054 */
  (new Function("module", "exports", moduleMeta.source))(_module, _exports);
  /* jshint +W054 */
  return _module;
}
