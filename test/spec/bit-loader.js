import { expect } from "chai";
import sinon from "sinon";
import Bitloader from "../../src/bit-loader";

describe("Bitloader Test Suite", function() {
  var bitloader;

  describe("Given an empty instance of Bitloader", function() {
    beforeEach(function() {
      bitloader = new Bitloader();
    });

    function checkService(name) {
      it("then the instance has a " + name + " service", function() {
        expect(bitloader.services[name]).to.be.ok;
      });
    }

    it("then the instance is of type `Bitloader`", function() {
      expect(bitloader instanceof(Bitloader)).to.equal(true);
    });

    checkService("preresolve");
    checkService("resolve");
    checkService("postresolve");

    checkService("prefetch");
    checkService("fetch");
    checkService("postfetch");

    checkService("pretransform");
    checkService("transform");
    checkService("posttransform");

    checkService("predependency");
    checkService("dependency");
    checkService("postdependency");

    checkService("precompile");
    checkService("compile");
    checkService("link");
  });

  describe("When creating a new instance of Bitloader with a plugin with handlers for `fetch`, `transform`, `dependency`, and `compile`", function() {
    var defaultResolveStub, defaultFetchStub, defaultCompileStub, resolveStub, fetchStub, transformStub, dependencyStub, precompileStub, compileStub;

    beforeEach(function() {
      defaultResolveStub = sinon.stub();
      defaultFetchStub   = sinon.stub();
      defaultCompileStub = sinon.stub();
      resolveStub        = sinon.spy(function() { return { path: "some/path" }; });
      fetchStub          = sinon.spy(function() { return { source: "var t = 'some source'; module.exports = t;" }; });
      transformStub      = sinon.spy(function() { return { source: "var t = 'transformed source'; module.exports = t;" }; });
      dependencyStub     = sinon.spy(function() { return { deps: [] }; });
      precompileStub     = sinon.spy(function() { return { source: "module.exports = 'final vvvvalue';" }; });
      compileStub        = sinon.spy(function() { return { exports: "compiled source" }; });

      bitloader = new Bitloader({
          resolve : defaultResolveStub,
          fetch   : defaultFetchStub,
          compile : defaultCompileStub
        })
        .plugin({
          resolve    : resolveStub,
          fetch      : fetchStub,
          transform  : transformStub,
          dependency : dependencyStub,
          precompile : precompileStub,
          compile    : compileStub
        });
    });

    describe("and importing a module called `js`", function() {
      beforeEach(function() {
        return bitloader.import("js");
      });

      it("then default `resolve` is NOT called", function() {
        sinon.assert.notCalled(defaultResolveStub);
      });

      it("then default 'fetch' is NOT called", function() {
        sinon.assert.notCalled(defaultFetchStub);
      });

      it("then default 'compile' is NOT called", function() {
        sinon.assert.notCalled(defaultCompileStub);
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

      it("then `transfom` plugin was called with the proper source", function() {
        sinon.assert.calledWith(transformStub, sinon.match({source: "var t = 'some source'; module.exports = t;"}));
      });

      it("then `dependency` plugin is called once", function() {
        sinon.assert.calledOnce(dependencyStub);
      });

      it("then `precompile` plugin is called once", function() {
        sinon.assert.calledOnce(precompileStub);
      });

      it("then `precompile` plugin is called once", function() {
        sinon.assert.calledWith(precompileStub, sinon.match({deps: []}));
      });

      it("then `compile` plugin is NOT called", function() {
        sinon.assert.notCalled(compileStub);
      });
    });

    describe("and adding a single string `ignore` rule", function() {
      var rule;

      beforeEach(function() {
        rule = "lagunita";
        sinon.stub(bitloader.services.transform, "ignore");
        sinon.stub(bitloader.services.dependency, "ignore");
        bitloader.ignore(rule);
      });

      it("then `transform` service is called with `name` `laguna`", function() {
        sinon.assert.calledWithExactly(bitloader.services.transform.ignore, "name", "lagunita");
      });

      it("then `dependency` service is called with `name` `laguna`", function() {
        sinon.assert.calledWithExactly(bitloader.services.dependency.ignore, "name", "lagunita");
      });
    });

    describe("and adding a string array of `ignore` rules", function() {
      var rule;

      beforeEach(function() {
        rule = ["lagunita", "robot", "chicken"];
        sinon.stub(bitloader.services.transform, "ignore");
        sinon.stub(bitloader.services.dependency, "ignore");
        bitloader.ignore(rule);
      });

      it("then `transform` service is called with `name` `laguna`", function() {
        sinon.assert.calledWithExactly(bitloader.services.transform.ignore, "name", "lagunita");
      });

      it("then `transform` service is called with `name` `robot`", function() {
        sinon.assert.calledWithExactly(bitloader.services.transform.ignore, "name", "robot");
      });

      it("then `transform` service is called with `name` `chicken`", function() {
        sinon.assert.calledWithExactly(bitloader.services.transform.ignore, "name", "chicken");
      });

      it("then `dependency` service is called with `name` `laguna`", function() {
        sinon.assert.calledWithExactly(bitloader.services.dependency.ignore, "name", "lagunita");
      });

      it("then `dependency` service is called with `name` `robot`", function() {
        sinon.assert.calledWithExactly(bitloader.services.dependency.ignore, "name", "robot");
      });

      it("then `dependency` service is called with `name` `chicken`", function() {
        sinon.assert.calledWithExactly(bitloader.services.dependency.ignore, "name", "chicken");
      });
    });

    describe("and adding an array of `ignore` rules with a `name`, a `path`, and `magic` properties", function() {
      var rules;

      beforeEach(function() {
        rules = [{
          name: "lagunita"
        }, {
          path: "robot"
        }, {
          magic: /chicken/
        }];

        sinon.stub(bitloader.services.transform, "ignore");
        sinon.stub(bitloader.services.dependency, "ignore");
        bitloader.ignore(rules);
      });

      it("then `transform` service is called with `name` `laguna`", function() {
        sinon.assert.calledWithExactly(bitloader.services.transform.ignore, "name", "lagunita");
      });

      it("then `transform` service is called with `path` `robot`", function() {
        sinon.assert.calledWithExactly(bitloader.services.transform.ignore, "path", "robot");
      });

      it("then `transform` service is called with `magic` /chicken/", function() {
        sinon.assert.calledWithExactly(bitloader.services.transform.ignore, "magic", /chicken/);
      });

      it("then `dependency` service is called with `name` `laguna`", function() {
        sinon.assert.calledWithExactly(bitloader.services.dependency.ignore, "name", "lagunita");
      });

      it("then `dependency` service is called with `path` `robot`", function() {
        sinon.assert.calledWithExactly(bitloader.services.dependency.ignore, "path", "robot");
      });

      it("then `dependency` service is called with `magic` /chicken/", function() {
        sinon.assert.calledWithExactly(bitloader.services.dependency.ignore, "magic", /chicken/);
      });
    });
  });
});
