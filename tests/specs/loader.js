define(["dist/bit-loader"], function(Bitloader) {
  var Loader  = Bitloader.Loader,
      Utils   = Bitloader.Utils,
      Promise = Bitloader.Promise;

  describe("Loader Suite", function() {
    describe("When loading module that is already loaded in `manager`", function() {
      var yes, loader, hasModuleStub, getModuleStub, loaderHasModuleStub, loaderGetModuleStub, moduleLoadedStub, loaderSetModuleStub;

      beforeEach(function() {
        yes = {date: new Date()};
        hasModuleStub = sinon.stub().returns(true);
        getModuleStub = sinon.stub().withArgs("yes").returns(yes);
        moduleLoadedStub = sinon.stub();
        loaderHasModuleStub = sinon.stub();
        loaderGetModuleStub = sinon.stub();
        loaderSetModuleStub = sinon.stub();

        var manager = {
          hasModule: hasModuleStub,
          getModule: getModuleStub
        };

        loader = new Loader(manager);
        loader.hasModule  = loaderHasModuleStub;
        loader.getModule  = loaderGetModuleStub;
        loader.setLoading = loaderSetModuleStub;
        return loader.load("yes").then(moduleLoadedStub);
      });

      it("then `manager.hasModule` is called once", function() {
        expect(hasModuleStub.calledOnce).to.equal(true);
      });

      it("then `manager.hasModule` is called with `yes`", function() {
        expect(hasModuleStub.calledWithExactly("yes")).to.equal(true);
      });

      it("then `manager.getModule` is called once", function() {
        expect(getModuleStub.calledOnce).to.equal(true);
      });

      it("then `manager.getModule` is called with `yes`", function() {
        expect(getModuleStub.calledWithExactly("yes")).to.equal(true);
      });

      it("then module loaded callback with called once", function() {
        expect(moduleLoadedStub.calledOnce).to.equal(true);
      });

      it("then module loaded callback with called with module `yes`", function() {
        expect(moduleLoadedStub.calledWithExactly(yes)).to.equal(true);
      });

      it("then `loader.hasModule` is not called", function() {
        expect(loaderHasModuleStub.called).is.equal(false);
      });

      it("then `loader.getModule` is not called", function() {
        expect(loaderGetModuleStub.called).is.equal(false);
      });

      it("then `loader.setLoading` is not called", function() {
        expect(loaderSetModuleStub.called).to.equal(false);
      });
    });


    describe("When loading module that is loaded in `loader` but not yet compiled to a `Module`", function() {
      var yes, loader, moduleLoadedStub, hasModuleStub, getModuleStub, loaderHasModuleStub, loaderGetModuleStub, loaderSetModuleStub;

      beforeEach(function() {
        yes = {yes: new Date()};
        moduleLoadedStub = sinon.stub();
        hasModuleStub = sinon.stub().withArgs("yes").returns(false);
        getModuleStub = sinon.stub();
        loaderHasModuleStub = sinon.stub().withArgs("yes").returns(true);
        loaderGetModuleStub = sinon.stub().withArgs("yes").returns(yes);
        loaderSetModuleStub = sinon.stub();

        var manager = {
          hasModule: hasModuleStub,
          getModule: getModuleStub
        };

        loader = new Loader(manager);
        loader.hasModule = loaderHasModuleStub;
        loader.getModule = loaderGetModuleStub;
        loader.setModule = loaderSetModuleStub;
        return loader.load("yes").then(moduleLoadedStub);
      });

      it("then `manager.hasModule` is called with `yes`", function() {
        expect(hasModuleStub.calledWithExactly("yes")).to.equal(true);
      });

      it("then `manager.getModule` is not called", function() {
        expect(getModuleStub.called).to.equal(false);
      });

      it("then `loader.hasModule` is called once", function() {
        expect(loaderHasModuleStub.calledOnce).to.equal(true);
      });

      it("then `loader.hasModule` is called with `yes`", function() {
        expect(loaderHasModuleStub.calledWithExactly("yes")).to.equal(true);
      });

      it("then `loader.getModule` is called once", function() {
        expect(loaderGetModuleStub.calledOnce).to.equal(true);
      });

      it("then `loader.getModule` is called with `yes`", function() {
        expect(loaderGetModuleStub.calledWithExactly("yes")).to.equal(true);
      });

      it("then `loader.setLoading` is not called", function() {
        expect(loaderSetModuleStub.called).to.equal(false);
      });
    });

  });
});
