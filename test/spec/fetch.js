var Bitloader = require("src/bit-loader");

describe("Fetch Test Suite", function() {
  var loader, fetchStub, resolveStub, transformStub, dependencyStub, resolveData, fetchData, transformData;

  beforeEach(function() {
    resolveData = {path: "this is the real path"};
    fetchData = {source: "source content"};
    transformData = {source: "transformed source"};

    resolveStub = sinon.stub().returns(resolveData);
    fetchStub = sinon.stub().returns(fetchData);
    transformStub = sinon.stub().returns(transformData);
    dependencyStub = sinon.stub();

    loader = new Bitloader({
      resolve: resolveStub,
      fetch: fetchStub,
      transform: transformStub,
      dependency: dependencyStub
    });
  });


  describe("When fetching a module called `like`", function() {
    beforeEach(function() {
      return loader.controllers.fetcher.fetch("like");
    });

    it("then `resolve` is called with `like`", function() {
      sinon.assert.calledWith(resolveStub, sinon.match({name: "like"}));
    });

    it("then `fetch` is called with `like`", function() {
      sinon.assert.calledWith(fetchStub, sinon.match(resolveData));
    });

    it("then `transform` is called with source `source content`", function() {
      sinon.assert.calledWith(transformStub, sinon.match(fetchData));
    });

    it("then `dependency` is called with source `transformed content`", function() {
      sinon.assert.calledWith(dependencyStub, sinon.match(transformData));
    });
  });
});
