var chai = require("chai");
window.chai   = chai;
window.expect = chai.expect;
window.assert = chai.assert;

mocha.setup("bdd");

require([
  "test/spec/utils",
  "test/spec/import",
  "test/spec/loader",
  "test/spec/registry",
  "test/spec/middleware",
  "test/spec/bit-loader"
], function() {
  mocha.run();
});
