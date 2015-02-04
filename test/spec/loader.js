define(["dist/bit-loader"], function(Bitloader) {
  var Loader  = Bitloader.Loader;

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


    describe("When module is loaded with a module meta that has `code` property defined", function() {
      var yes, loader, pipelineFinishedStub, pipelineAssetStub;

      beforeEach(function() {
        yes = {code: new Date()};
        pipelineFinishedStub = sinon.stub();
        pipelineAssetStub    = sinon.stub();

        var manager = {};
        loader = new Loader(manager);
        loader.pipeline.assets[0] = pipelineAssetStub;
        return loader.pipelineModuleMeta(yes).then(pipelineFinishedStub);
      });

      it("then the pipeline runs successfully", function() {
        expect(pipelineFinishedStub.called).to.equal(true);
      });

      it("then pipeline `done` hanlder is called with module meta", function() {
        expect(pipelineFinishedStub.calledWithExactly(yes)).to.equal(true);
      });

      it("then the loader pipeline does not run", function() {
        expect(pipelineAssetStub.called).to.equal(false);
      });
    });


    describe("When module is loaded with a module meta that has `compile` and `source` properties", function() {
      var yes, loader, pipelineFinishedStub, pipelineAssetStub;

      beforeEach(function() {
        yes = {source: "var somecode;", compile: function() {}};
        pipelineFinishedStub = sinon.stub();
        pipelineAssetStub    = sinon.stub();

        var manager = {};
        loader = new Loader(manager);
        loader.pipeline.assets = [pipelineAssetStub];
        return loader.pipelineModuleMeta(yes).then(pipelineFinishedStub);
      });

      it("then the pipeline runs successfully", function() {
        expect(pipelineFinishedStub.called).to.equal(true);
      });

      it("then the pipeline `done` handler is called with module meta", function() {
        expect(pipelineFinishedStub.calledWithExactly(yes)).to.equal(true);
      });

      it("then the loader pipeline does run", function() {
        expect(pipelineAssetStub.called).to.equal(true);
      });
    });


    describe("When module meta is registered with the `register` interface", function() {
      var loader, moduleName, hasModuleStub, setModuleStub, factoryStub, moduleCode;

      beforeEach(function() {
        moduleName = "module1";
        moduleCode = function rad() {};
        setModuleStub = sinon.stub().returnsArg(0);
        hasModuleStub = sinon.stub().returns(false);
        factoryStub = sinon.stub().returns(moduleCode);


        loader = new Loader({
          hasModule: hasModuleStub,
          setModule: setModuleStub
        });

        loader.register(moduleName, [], factoryStub);
      });

      it("then module meta is registered", function() {
        expect(loader.hasModule(moduleName)).to.equal(true);
      });

      it("then module meta factory is not called", function() {
        expect(factoryStub.called).to.equal(false);
      });

      it("then manager `setModule` is not called", function() {
        expect(setModuleStub.called).to.equal(false);
      });


      describe("when loading registered module meta, the proper Module instance is created", function() {
        var moduleLoaderStub = sinon.stub();
        beforeEach(function() {
          return loader.load(moduleName).then(moduleLoaderStub);
        });

        it("then module loaded callback is called", function() {
          expect(moduleLoaderStub.called).to.equal(true);
        });

        it("then manager `setModule` is called with and instance of module", function() {
          expect(setModuleStub.args[0][0]).to.be.instanceof(Bitloader.Module);
        });

        it("then module instance is created", function() {
          expect(moduleLoaderStub.args[0][0]).to.be.instanceof(Bitloader.Module);
        });
      });

    });

  });
});
