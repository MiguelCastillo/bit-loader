import { expect } from "chai";
import chance from "chance";
import Module from "src/module";

describe("Module Test Suite", function() {
  describe("When creating a module meta", function() {
    var meta;

    var act = function(config) {
       meta = new Module(config);
    };

    describe("and the module meta is empty - no name", function() {
      it("then an exception is thrown because a name must be provided", function() {
        expect(act).to.throw(TypeError, "Must provide a name, which is used by the resolver to resolve the path for the resource");
      });
    });

    describe("and the module meta has a name", function() {
      var name;

      beforeEach(function() {
        name = chance().string();

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
      var path, directory, fileName;

      beforeEach(function() {
        directory = chance().string() + "/";
        fileName = "." + chance().string() + ".js"; // edge case with files with dots on them
        path = directory + fileName;

        act({
          name: chance().string(),
          path: path
        });
      });

      it("then the path is properly set", function() {
        expect(meta.getFilePath()).to.equal(path);
      });

      it("then the directory is properly calculated from the the path", function() {
        expect(meta.getDirectory()).to.equal(directory);
      });

      it("then the directory property is properly set", function() {
        expect(meta.directory).to.equal(directory);
      });

      it("then the file name is properly calculated from the path", function() {
        expect(meta.getFileName()).to.equal(fileName);
      });

      it("then the file name property is properly set", function() {
        expect(meta.fileName).to.equal(fileName);
      });
    });

    describe("and a file path is merged into the module meta instance", function() {
      var path, directory, fileName, mergedMeta;

      beforeEach(function() {
        directory = chance().string() + "/";
        fileName = "." + chance().string() + ".js"; // edge case with files with dots on them
        path = directory + fileName;

        act({
          name: chance().string()
        });

        mergedMeta = meta.configure({
          path: path
        });
      });

      it("then a new module meta instance is created", function() {
        expect(mergedMeta).to.not.equal(meta);
      });

      it("then the path is properly set", function() {
        expect(mergedMeta.getFilePath()).to.equal(path);
      });

      it("then the directory is properly calculated from the the path", function() {
        expect(mergedMeta.getDirectory()).to.equal(directory);
      });

      it("then the file name is properly calculated from the path", function() {
        expect(mergedMeta.getFileName()).to.equal(fileName);
      });

      it("then the path is unchanged in the old module meta instance", function() {
        expect(meta.getFilePath()).to.equal("");
      });

      it("then the directory is unchanged in the old module meta instance", function() {
        expect(meta.getDirectory()).to.equal("");
      });

      it("then the file name is unchanged in the old module meta instance", function() {
        expect(meta.getFileName()).to.equal("");
      });
    });

    describe("and a Windows file path is merged into the module meta instance", function() {
      var path, directory, fileName, mergedMeta;

      beforeEach(function() {
        directory = "C:\\" + chance().string() + "\\\\";
        fileName = "." + chance().string() + ".js"; // edge case with files with dots on them
        path = directory + fileName;

        act({
          name: chance().string()
        });

        mergedMeta = meta.configure({
          path: path
        });
      });

      it("then a new module meta instance is created", function() {
        expect(mergedMeta).to.not.equal(meta);
      });

      it("then the path is properly set", function() {
        expect(mergedMeta.getFilePath()).to.equal(path);
      });

      it("then the directory is properly calculated from the the path", function() {
        expect(mergedMeta.getDirectory()).to.equal(directory);
      });

      it("then the file name is properly calculated from the path", function() {
        expect(mergedMeta.getFileName()).to.equal(fileName);
      });
    });

  });
});
