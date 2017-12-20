import Bitloader from "../../src/bit-loader";
import sinon from "sinon";

describe("Import Test Suite", function() {
  describe("When importing a module with source that exports a string", function() {
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

      return loader.import("hello").then(resultStub);
    });

    it("then the result is a string with the source module", function() {
      sinon.assert.calledWith(resultStub, sinon.match.string);
    });

    it("then the module exports the string from the source", function() {
      sinon.assert.calledWith(resultStub, "source content");
    });
  });
});
