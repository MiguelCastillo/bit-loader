var Bitloader = require("src/bit-loader");
var Module = require("src/module");

describe("Build Test Suite", function() {
  var loader, moduleMeta, result;

  beforeEach(function() {
    loader = new Bitloader();
  });

  describe("When building a module meta object with source that exports a string", function() {
    beforeEach(function() {
      moduleMeta = new Module.Meta("test module");
      moduleMeta = moduleMeta.configure({ source: "module.exports = 'test';" });
      moduleMeta = loader.controllers.registry.setModule(moduleMeta, "loaded");

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
      moduleMeta = new Module.Meta("test module");
      moduleMeta = moduleMeta.configure({ source: "var a = require('a'); module.exports = {name: 'test', dep: a};" });
      moduleMeta = moduleMeta.configure({ getDependencyExportsByName: getDependencyExportsByNameStub });
      moduleMeta = loader.controllers.registry.setModule(moduleMeta, "loaded");

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
      dependencyMeta = new Module.Meta("a");
      dependencyMeta = dependencyMeta.configure({ id: "a", source: "module.exports = 1;" });
      dependencyMeta = loader.controllers.registry.setModule(dependencyMeta, "loaded");

      moduleMeta = new Module.Meta("test module");
      moduleMeta = moduleMeta.configure({ deps: [ dependencyMeta ] });
      moduleMeta = moduleMeta.configure({ source: "var a = require('a'); module.exports = {name: 'test', dep: a};" });
      moduleMeta = loader.controllers.registry.setModule(moduleMeta, "loaded");

      result = loader.controllers.builder.build(moduleMeta.id);
    });

    it("then the module exports an object that include the required dependency", function() {
      expect(result.exports.dep).to.equal(1);
    });
  });
});
