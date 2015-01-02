define([
  "chai"
], function(chai) {

  window.chai   = chai;
  window.expect = chai.expect;
  window.assert = chai.assert;

  mocha.setup("bdd");

  require([
    "tests/specs/utils",
    "tests/specs/import",
    "tests/specs/loader",
    "tests/specs/registry",
    "tests/specs/bit-loader"
  ], mocha.run);
});
