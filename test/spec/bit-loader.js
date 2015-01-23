define(["dist/bit-loader"], function(Bitloader) {

  describe("Bitloader Suite", function() {
    var bitloader;
    beforeEach(function() {
      bitloader = new Bitloader({
        "baseUrl": "../",
        "packages": [{
          "location": "tests",
          "main": "main",
          "name": "js"
        }]
      });
    });

    it("then bitloader is an instance of `Bitloader`", function() {
      expect(bitloader instanceof(Bitloader)).to.equal(true);
    });
  });

  /*
  describe("Modules Integration Suite", function() {
    describe("When Importing an empty object", function() {
      it("then result is an object with no properties", function() {
        return mloader.import("tests/js/emptyobject").done(function(result) {
          expect(result).to.be.an("object");
          expect(Object.keys(result).length).to.equal(0);
        });
      });
    });

    describe("When Importing an empty objects and an empty string", function() {
      it("then result is one object with no properties and one empty string", function() {
        return mloader.import(["tests/js/emptyobject", "tests/js/emptystring"]).done(function(emptyobject, emptystring) {
          expect(emptyobject).to.be.an("object");
          expect(Object.keys(emptyobject).length).to.equal(0);
          expect(emptystring).to.be.a("string");
          expect(emptystring.length).to.equal(0);
        });
      });
    });

    describe("When Importing nested dependencies in deep3", function() {
      it("then deep3 is an object", function() {
        return mloader.import("tests/js/deep3").done(function(result) {
          expect(result).to.be.an("object");
          expect(Object.keys(result).length).to.equal(1);

          expect(result.deep3).to.be.an("object");
          expect(Object.keys(result.deep3).length).to.equal(1);

          expect(result.deep3.deep2).to.be.an("object");
          expect(Object.keys(result.deep3.deep2).length).to.equal(1);

          expect(result.deep3.deep2.onedependency).to.be.an("object");
          expect(Object.keys(result.deep3.deep2.onedependency).length).to.equal(2);

          expect(result.deep3.deep2.onedependency.hello).to.be.a("string");
          expect(result.deep3.deep2.onedependency.hello).to.equal("world");
          expect(result.deep3.deep2.onedependency.init).to.be.a("function");
        });
      });
    });

    describe("When Importing package called `js`", function() {
      it("then pacakge `js` is loaded", function() {
        return mloader.import("js").done(function(result) {
          expect(result).to.be.an("object");
          expect(Object.keys(result).length).to.equal(1);

          expect(result.deep3).to.be.an("object");
          expect(Object.keys(result.deep3).length).to.equal(1);

          expect(result.deep3.deep2).to.be.an("object");
          expect(Object.keys(result.deep3.deep2).length).to.equal(1);

          expect(result.deep3.deep2.onedependency).to.be.an("object");
          expect(Object.keys(result.deep3.deep2.onedependency).length).to.equal(2);

          expect(result.deep3.deep2.onedependency.hello).to.be.a("string");
          expect(result.deep3.deep2.onedependency.hello).to.equal("world");
          expect(result.deep3.deep2.onedependency.init).to.be.a("function");
        });
      });
    });
  });
  */
});
