var Bitloader = require("src/bit-loader");

describe("Load Test Suite", function() {
  describe("When loading a module with source that exports a string", function() {
    var loader, resultStub, resolveStub, fetchStub, resolveData, fetchData;

    beforeEach(function() {
      resolveData = {path: "this is the real path"};
      fetchData = {source: "module.exports = 'source content';"};

      resolveStub = sinon.stub().returns(resolveData);
      fetchStub = sinon.stub().returns(fetchData);
      resultStub = sinon.stub();

      loader = new Bitloader({
        resolve: resolveStub,
        fetch: fetchStub
      });

      return loader.load("hello").then(resultStub);
    });

    it("then the result is the module", function() {
      sinon.assert.calledWith(resultStub, sinon.match.object);
    });

    it("then the module exports the string from the source", function() {
      sinon.assert.calledWith(resultStub, sinon.match({exports: "source content"}));
    });
  });
});
