import { expect } from "chai";
import Bitloader from "src/bit-loader";
import Module from "src/module";

describe("Build Test Suite", function() {
  var loader, moduleMeta, result;

  beforeEach(function() {
    loader = new Bitloader();
  });

  describe("When building a module meta object with source that exports a string", function() {
    beforeEach(function() {
      moduleMeta = new Module("test module");
      moduleMeta = moduleMeta.configure({ source: "module.exports = 'test';" });
      moduleMeta = loader.controllers.registry.setModule(moduleMeta, Module.State.LOADED);

      result = loader.controllers.builder.build(moduleMeta.id);
    });

    it("then building module meta exports the string from the source", function() {
      expect(result.exports).to.equal("test");
    });
  });

  describe("When building a module meta object with a required dependency in the source that's already build", function() {
    var getDependencyExportsByNameStub;

    beforeEach(function() {
      getDependencyExportsByNameStub = sinon.stub().returns(1);
      moduleMeta = new Module("test module");
      moduleMeta = moduleMeta.configure({ source: "var a = require('a'); module.exports = {name: 'test', dep: a};" });
      moduleMeta = moduleMeta.configure({ getDependencyExportsByName: getDependencyExportsByNameStub });
      moduleMeta = loader.controllers.registry.setModule(moduleMeta, Module.State.LOADED);

      result = loader.controllers.builder.build(moduleMeta.id);
    });

    it("then getDependencyExportsByName is called with the appropriate module name", function() {
      sinon.assert.calledWith(getDependencyExportsByNameStub, "a");
    });

    it("then the module exports an object that include the required dependency", function() {
      expect(result.exports.dep).to.equal(1);
    });
  });

  describe("When building a module meta object with a required dependency in the source that needs to be built", function() {
    var dependencyMeta;

    beforeEach(function() {
      dependencyMeta = new Module("a");
      dependencyMeta = dependencyMeta.configure({ id: "a", source: "module.exports = 1;" });
      dependencyMeta = loader.controllers.registry.setModule(dependencyMeta, Module.State.LOADED);

      moduleMeta = new Module("test module");
      moduleMeta = moduleMeta.configure({ deps: [ dependencyMeta ] });
      moduleMeta = moduleMeta.configure({ source: "var a = require('a'); module.exports = {name: 'test', dep: a};" });
      moduleMeta = loader.controllers.registry.setModule(moduleMeta, Module.State.LOADED);

      result = loader.controllers.builder.build(moduleMeta.id);
    });

    it("then the module exports an object that include the required dependency", function() {
      expect(result.exports.dep).to.equal(1);
    });
  });

  describe("When building a module", function() {

    describe("with no a sourceURL", function() {
      var modulePath;

      describe("with absolute path without protocol", function() {
        beforeEach(function() {
          modulePath = "some-real-path-url";

          moduleMeta = new Module("test module");
          moduleMeta = moduleMeta.configure({ source: "module.exports = {name: 'test', dep: 'a'};", path: modulePath });
          moduleMeta = loader.controllers.registry.setModule(moduleMeta, Module.State.LOADED);

          result = loader.controllers.builder.build(moduleMeta.id);
        });

        it("then the sourceURL is created", function() {
          expect(result.meta.source).to.contain("//# sourceURL=" + modulePath);
        });
      });

      describe("with a path that has http protocol with a domain name", function() {
        var domainName;

        beforeEach(function() {
          domainName = "http://domain:994";
          modulePath = "/some-real-path-url";

          moduleMeta = new Module("test module");
          moduleMeta = moduleMeta.configure({ source: "module.exports = {name: 'test', dep: 'a'};", path: domainName + modulePath });
          moduleMeta = loader.controllers.registry.setModule(moduleMeta, Module.State.LOADED);

          result = loader.controllers.builder.build(moduleMeta.id);
        });

        it("then the sourceURL is created without the domain only using the absoulte path of the resource", function() {
          expect(result.meta.source).to.contain("//# sourceURL=" + modulePath);
        });
      });
    });

    describe("with a sourceURL already specified", function() {
      var sourceURL;
      beforeEach(function() {
        sourceURL = "some-url";

        moduleMeta = new Module("test module");
        moduleMeta = moduleMeta.configure({ source: "module.exports = {name: 'test', dep: 'a'};\n//# sourceURL=" + sourceURL });
        moduleMeta = loader.controllers.registry.setModule(moduleMeta, Module.State.LOADED);

        result = loader.controllers.builder.build(moduleMeta.id);
      });

      it("then the sourceURL is not overriden", function() {
        expect(result.meta.source).to.contain("//# sourceURL=" + sourceURL);
      });
    });

  });
});
