define(["dist/bit-loader"], function(Bitloader) {

  describe("Fetch Test Suite", function() {
    var loader, fetchStub, moduleMeta;

    beforeEach(function() {
      moduleMeta = {code: "this is content of the module"};
      fetchStub = sinon.stub().returns(moduleMeta);

      function fetchFactory() {
        return {
          fetch: fetchStub
        };
      }

      loader = new Bitloader({}, {fetch: fetchFactory});
    });


    describe("When fetching a module called `like`", function() {
      var result;
      beforeEach(function() {
        result = loader.fetch("like");
      });

      it("then fetch is called with `like`", function() {
        expect(fetchStub.calledWithExactly("like")).to.equal(true);
      });

      it("then result from fetch is module meta", function() {
        expect(result).to.equal(moduleMeta);
      });
    });


    describe("When loading a module called `I really like`", function() {
      var result;
      beforeEach(function() {
        return loader.load("I really like").then(function(_result) {
          result = _result;
        });
      });

      it("then fetch is called with `I really like`", function() {
        expect(fetchStub.calledWith("I really like")).to.equal(true);
      });

      it("then result from fetch is module meta", function() {
        expect(result).to.be.an.instanceof(Bitloader.Module);
      });
    });


    describe("When importing a module called `I really like this import`", function() {
      var result;
      beforeEach(function() {
        return loader.import("I really like this import").then(function(_result) {
          result = _result;
        });
      });

      it("then fetch is called with `I really like this import`", function() {
        expect(fetchStub.calledWith("I really like this import")).to.equal(true);
      });

      it("then result from import is `this is content of the module`", function() {
        expect(result).to.equal('this is content of the module');
      });
    });

  });
});
