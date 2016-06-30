import chance from "chance";
import { expect } from "chai";
import Bitloader from "src/bit-loader";
import Module from "src/module";

describe("Fetch Test Suite", function() {
  var loader, fetchStub, resolveStub, transformStub, dependencyStub, precompileStub;
  var nameLikeData, resolveLikeData, fetchLikeData, transformLikeData, dependencyLikeData;
  var nameDep1Data, resolveDep1Data, fetchDep1Data, transformDep1Data, dependencyDep1Data;
  var nameCommonData, resolveCommonData, fetchCommonData, transformCommonData, dependencyCommonData;

  beforeEach(function() {
    nameLikeData = {name: "like"};
    resolveLikeData = {path: "this is the real path"};
    fetchLikeData = {source: "source content"};
    transformLikeData = {source: "transformed source"};
    dependencyLikeData = {deps: ["dep1", "common-dep"]};

    nameDep1Data = {name: "dep1"};
    resolveDep1Data = {path: "real path to dep1"};
    fetchDep1Data = {source: "dep1 source"};
    transformDep1Data = {source: "changed dep1 source"};
    dependencyDep1Data = {deps: ["common-dep"]};

    nameCommonData = {name: "common-dep"};
    resolveCommonData = {path: "path to common-dep dependency"};
    fetchCommonData = {source: "source for common-dep"};
    transformCommonData = {source: "transformed source for common-data"};
    dependencyCommonData = {deps: []};

    resolveStub = sinon.stub();
    resolveStub
      .withArgs(sinon.match(nameLikeData))
      .returns(resolveLikeData);
    resolveStub
      .withArgs(sinon.match(nameDep1Data))
      .returns(resolveDep1Data);
    resolveStub
      .withArgs(sinon.match(nameCommonData))
      .returns(resolveCommonData);

    fetchStub = sinon.stub()
    fetchStub
      .withArgs(sinon.match(nameLikeData))
      .returns(fetchLikeData);
    fetchStub
      .withArgs(sinon.match(nameDep1Data))
      .returns(fetchDep1Data);
    fetchStub
      .withArgs(sinon.match(nameCommonData))
      .returns(fetchCommonData);

    transformStub = sinon.stub();
    transformStub
      .withArgs(sinon.match(nameLikeData))
      .returns(transformLikeData);
    transformStub
      .withArgs(sinon.match(nameDep1Data))
      .returns(transformDep1Data);
    transformStub
      .withArgs(sinon.match(nameCommonData))
      .returns(transformCommonData);

    dependencyStub = sinon.stub();
    dependencyStub
      .withArgs(sinon.match(nameLikeData))
      .returns(dependencyLikeData);
    dependencyStub
      .withArgs(sinon.match(nameDep1Data))
      .returns(dependencyDep1Data);
    dependencyStub
      .withArgs(sinon.match(nameCommonData))
      .returns(dependencyCommonData);

    precompileStub = sinon.stub();

    loader = new Bitloader({
      resolve: resolveStub,
      fetch: fetchStub,
      transform: transformStub,
      dependency: dependencyStub,
      precompile: precompileStub
    });
  });


  describe("When fetching a module called `like`", function() {
    var result;

    beforeEach(function() {
      return loader.controllers.fetcher.fetch("like").then(function(r) {
        result = r;
      });
    });

    it("then `resolve` is called with `like` name data", function() {
      sinon.assert.calledWith(resolveStub, sinon.match(nameLikeData));
    });

    it("then `resolve` is called with `dep1` name data", function() {
      sinon.assert.calledWith(resolveStub, sinon.match(nameDep1Data));
    });

    it("then `resolve` is called with `common-dep` name data", function() {
      sinon.assert.calledWith(resolveStub, sinon.match(nameCommonData));
    });

    it("then `fetch` is called with `like` resolve data", function() {
      sinon.assert.calledWith(fetchStub, sinon.match(resolveLikeData));
    });

    it("then `fetch` is called with `dep1` resolve data", function() {
      sinon.assert.calledWith(fetchStub, sinon.match(resolveDep1Data));
    });

    it("then `fetch` is called with `common-dep` resolve data", function() {
      sinon.assert.calledWith(fetchStub, sinon.match(resolveCommonData));
    });

    it("then `transform` is called with `like` fetch data", function() {
      sinon.assert.calledWith(transformStub, sinon.match(fetchLikeData));
    });

    it("then `transform` is called with `dep1` fetch data", function() {
      sinon.assert.calledWith(transformStub, sinon.match(fetchDep1Data));
    });

    it("then `transform` is called with `common-dep` fetch data", function() {
      sinon.assert.calledWith(transformStub, sinon.match(fetchCommonData));
    });

    it("then `dependency` is called with `like` tranfom data", function() {
      sinon.assert.calledWith(dependencyStub, sinon.match(transformLikeData));
    });

    it("then `dependency` is called with `dep1` tranfom data", function() {
      sinon.assert.calledWith(dependencyStub, sinon.match(transformDep1Data));
    });

    it("then `dependency` is called with `common-dep` tranfom data", function() {
      sinon.assert.calledWith(dependencyStub, sinon.match(transformCommonData));
    });

    it("then `precompile` is called with `like` transform data", function() {
      sinon.assert.calledWith(precompileStub, sinon.match(transformLikeData));
    });

    it("then `precompile` is called with `dep1` transform data", function() {
      sinon.assert.calledWith(precompileStub, sinon.match(transformDep1Data));
    });

    it("then `precompile` is called with `common-dep` transform data", function() {
      sinon.assert.calledWith(precompileStub, sinon.match(transformCommonData));
    });

    it("then the result will have all the aggregated data", function() {
      expect(result).to.eql(new Module({
        deps: [],
        directory: "",
        fileName: "this is the real path",
        id: "this is the real path",
        name: "like",
        path: "this is the real path",
        referrer: {
          id: undefined,
          name: undefined,
          path: undefined
        },
        state: "resolve",
        type: "UNKNOWN"
      }));
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
