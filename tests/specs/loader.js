define(["dist/bit-loader"], function(Bitloader) {
  var Loader  = Bitloader.Loader,
      Promise = Bitloader.Promise;

  describe("Loader Suite", function() {

    /*
    describe("When loading a module from context.loaded", function() {
      var loader, yes, modYes, modFetchStub;

      beforeEach(function() {
        modFetchStub = sinon.stub().returns(Promise.reject("Fetch must not be called when loading from `context.loaded`"));
        modYes = {};
        loader = new Loader({
          fetch: modFetchStub,
          context: {
            loaded: {
              "yes": modYes
            }
          }
        });

        return loader.load("yes")
          .then(function(_yes) {
            yes = _yes;
          });
      });

      it("then modYes is loaded from `context.loaded`", function() {
        expect(yes).to.equal(modYes);
      });

      it("then `fetch` is not called", function() {
        expect(modFetchStub.called).to.equal(false);
      });
    });
    */


    describe("When loading a module with `fetch`", function() {
      var loader, yes, modYesPromise, moduleMeta, compiledMod, hasModuleStub, setModuleStub, modFetchStub, modCompileStub, modRunStub;

      beforeEach(function() {
        moduleMeta = {};
        compiledMod = {name: "yes"};
        modCompileStub = sinon.stub().withArgs(moduleMeta).returns(compiledMod);
        moduleMeta.compile = modCompileStub;
        modYesPromise = Promise.resolve(moduleMeta);
        modFetchStub = sinon.stub().withArgs("yes").returns(modYesPromise);
        modRunStub = sinon.stub().returns(Promise.resolve());
        hasModuleStub = sinon.stub().returns(false);
        setModuleStub = sinon.stub().returns(compiledMod);

        loader = new Loader({
          hasModule: hasModuleStub,
          setModule: setModuleStub,
          fetch: modFetchStub,
          transform: {runAll: modRunStub}
        });

        return loader.load("yes")
          .then(function(_yes) {
            yes = _yes;
          });
      });

      it("then `fetch` was called once", function() {
        expect(modFetchStub.withArgs("yes").calledOnce).to.equal(true);
      });

      it("then `fetch` returns `modYesPromise`", function() {
        expect(modFetchStub.returnValues[0]).to.equal(modYesPromise);
      });

      it("then `compile` is called once", function() {
        expect(modCompileStub.withArgs(moduleMeta).calledOnce).to.equal(true);
      });

      it("then module `yes` is loaded and equal to `compiledMod`", function() {
        expect(yes).to.equal(compiledMod);
      });

      it("then `run` is called", function() {
        expect(modRunStub.calledOnce).to.equal(true);
      });
    });
  });

});
