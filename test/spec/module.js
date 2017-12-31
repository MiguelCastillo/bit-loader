import { expect } from "chai";
import chanceFactory from "chance";
import Module from "../../src/module";

const chance = chanceFactory();

describe("Module Test Suite", function() {
  describe("When creating a module meta", function() {
    var meta;

    var act = function(config) {
       meta = new Module(config);
    };

    describe("and the module meta is empty - no name", function() {
      it("then an exception is thrown because a name must be provided", function() {
        expect(act).to.throw(TypeError, "Must provide a name or source for the module");
      });
    });

    describe("and the module meta has a name", function() {
      var name;

      beforeEach(function() {
        name = chance.word({syllables: 3});

        act({
          name: name
        });
      });

      it("then the module meta instance is created with the specified name", function() {
        expect(name).to.equal(meta.name);
      });

      it("then the module meta has deps array", function() {
        expect(meta.deps).to.be.instanceof(Array);
      });

      it("then the module meta has an empty deps array", function() {
        expect(meta.deps.length).to.equal(0);
      });
    });

    describe("and the module meta has a path", function() {
      var name, path, directory, filename;

      beforeEach(function() {
        name = chance.word({syllables: 3});
        directory = chance.word({syllables: 3}) + "/";
        filename = "." + chance.word({syllables: 3}) + ".js"; // edge case with files with dots on them
        path = directory + filename;

        act({
          name: name,
          path: path
        });
      });

      it("then the path is properly set", function() {
        expect(meta.path).to.equal(path);
      });

      it("then the directory property is properly set", function() {
        expect(meta.directory).to.equal(directory);
      });

      it("then the file name property is properly set", function() {
        expect(meta.filename).to.equal(filename);
      });
    });

    describe("and the module meta has a path with url hash and url params", function() {
      var name, path, directory, filename, urlExtras;

      beforeEach(function() {
        urlExtras = "?sweet=param#{'hash-isnt-cool-anymore': 1}/";
        name = chance.word({syllables: 3});
        directory = chance.word({syllables: 3}) + "/";
        filename = chance.word({syllables: 3}) + ".js"; // edge case with files with dots on them
        path = directory + filename + urlExtras;

        act({
          name: name,
          path: path
        });
      });

      it("then the path is properly set", function() {
        expect(meta.path).to.equal(path);
      });

      it("then the directory property is properly set", function() {
        expect(meta.directory).to.equal(directory);
      });

      it("then the file name property is properly set", function() {
        expect(meta.filename).to.equal(filename);
      });
    });

    describe("and a file path is merged into the module meta instance", function() {
      var name, path, directory, filename, mergedMeta;

      beforeEach(function() {
        name = chance.word({syllables: 3});
        directory = chance.word({syllables: 3}) + "/";
        filename = "." + chance.word({syllables: 3}) + ".js"; // edge case with files with dots on them
        path = directory + filename;

        act({
          name: name
        });

        mergedMeta = meta.configure({
          path: path
        });
      });

      it("then a new module meta instance is created", function() {
        expect(mergedMeta).to.not.equal(meta);
      });

      it("then the path is properly set", function() {
        expect(mergedMeta.path).to.equal(path);
      });

      it("then the directory is properly calculated from the the path", function() {
        expect(mergedMeta.directory).to.equal(directory);
      });

      it("then the file name is properly calculated from the path", function() {
        expect(mergedMeta.filename).to.equal(filename);
      });

      it("then the path is unchanged in the old module meta instance", function() {
        expect(meta.path).to.equal(undefined);
      });

      it("then the directory is unchanged in the old module meta instance", function() {
        expect(meta.directory).to.equal(undefined);
      });

      it("then the file name is unchanged in the old module meta instance", function() {
        expect(meta.filename).to.equal(undefined);
      });
    });

    describe("and a Windows file path is merged into the module meta instance", function() {
      var name, path, directory, filename, mergedMeta;

      beforeEach(function() {
        name = chance.word({syllables: 3});
        directory = "C:\\" + chance.word({syllables: 3}) + "\\\\";
        filename = "." + chance.word({syllables: 3}) + ".js"; // edge case with files with dots on them
        path = directory + filename;

        act({
          name: name
        });

        mergedMeta = meta.configure({
          path: path
        });
      });

      it("then a new module meta instance is created", function() {
        expect(mergedMeta).to.not.equal(meta);
      });

      it("then the path is properly set", function() {
        expect(mergedMeta.path).to.equal(path);
      });

      it("then the directory is properly calculated from the the path", function() {
        expect(mergedMeta.directory).to.equal(directory);
      });

      it("then the file name is properly calculated from the path", function() {
        expect(mergedMeta.filename).to.equal(filename);
      });
    });

  });
});
