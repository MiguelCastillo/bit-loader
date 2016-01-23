import { expect } from "chai";
import Bitloader from "src/bit-loader";

describe("Bitloader Test Suite", function() {
  var bitloader;
  beforeEach(function() {
    bitloader = new Bitloader();
  });

  it("then bitloader is an instance of `Bitloader`", function() {
    expect(bitloader instanceof(Bitloader)).to.equal(true);
  });


  describe("and registering a plugin with handlers for `fetch`, `transform`, `dependency`, and `compile`", function() {
    var defaultResolveStub, defaultFetchStub, defaultCompileStub, resolveStub, fetchStub, transformStub, dependencyStub, compileStub;

    beforeEach(function() {
      defaultResolveStub = sinon.stub();
      defaultFetchStub   = sinon.stub();
      defaultCompileStub = sinon.stub();
      resolveStub        = sinon.spy(function() { return { path: "some/path" }; });
      fetchStub          = sinon.spy(function() { return { source: "var t = 'some source'; module.exports = t;" }; });
      transformStub      = sinon.spy(function() { return { source: "var t = 'transformed source'; module.exports = t;" }; });
      dependencyStub     = sinon.spy(function() { return { deps: [] }; });
      compileStub        = sinon.spy(function() { return { exports: "compiled source" }; });

      bitloader = new Bitloader({
        resolve : defaultResolveStub,
        fetch   : defaultFetchStub,
        compile : defaultCompileStub
      });

      bitloader.plugin({
        resolve    : resolveStub,
        fetch      : fetchStub,
        transform  : transformStub,
        dependency : dependencyStub,
        compile    : compileStub
      });

      return bitloader.import("js");
    });

    it("then default 'fetch' is NOT called", function() {
      sinon.assert.notCalled(defaultFetchStub);
    });

    it("then default 'compile' is NOT called", function() {
      sinon.assert.notCalled(defaultCompileStub);
    });

    it("then default `resolve` is NOT called", function() {
      sinon.assert.notCalled(defaultResolveStub);
    });

    it("then `resolve` plugin is called once", function() {
      sinon.assert.calledOnce(resolveStub);
    });

    it("then `resolve` plugin is called with a module meta with name `js`", function() {
      sinon.assert.calledWith(resolveStub, sinon.match({name: "js"}));
    });

    it("then `fetch` plugin is called once", function() {
      sinon.assert.calledOnce(fetchStub);
    });

    it("then `fetch` plugin is called with a module meta with path `some/path`", function() {
      sinon.assert.calledWith(fetchStub, sinon.match({path: "some/path"}));
    });

    it("then `transform` plugin is called once", function() {
      sinon.assert.calledOnce(transformStub);
    });

    it("then `dependency` plugin is called once", function() {
      sinon.assert.calledOnce(dependencyStub);
    });

    it("then `compile` plugin is NOT called", function() {
      sinon.assert.notCalled(compileStub);
    });
  });
});
