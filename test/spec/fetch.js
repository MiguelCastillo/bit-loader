import chance from "chance";
import { expect } from "chai";
import Bitloader from "src/bit-loader";

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

  describe("When fetching a module that is excluded", function() {
    var excludeName, result;

    beforeEach(function() {
      excludeName = chance().string();
      return loader
        .exclude(excludeName).controllers.fetcher
        .fetch(excludeName)
        .then(function(r) {
          result = r;
        });
    });

    it("then resolve provider is not called", function() {
      sinon.assert.notCalled(resolveStub);
    });

    it("then fetch provider is not called", function() {
      sinon.assert.notCalled(fetchStub);
    });

    it("then module meta path is `null`", function() {
      expect(result.path).to.equal(null);
    });

    it("then module meta name is properly set", function() {
      expect(result.name).to.equal(excludeName);
    });

    it("then module meta id is properly set", function() {
      expect(result.id).to.equal(excludeName);
    });

    it("then module meta source is properly set", function() {
      expect(result.source).to.equal("");
    });
  });
});
