define(['dist/bit-loader'], function(Bitloader) {

  describe("Plugin Test Suite", function() {
    var bitloader;

    describe("When registering a single plugin for `transform`", function() {
      var transformStub;
      beforeEach(function() {
        bitloader = new Bitloader();
        transformStub = sinon.stub();

        bitloader.plugin({
          "transform": transformStub
        });

        return bitloader.providers.loader._pipelineModuleMeta({"source":""});
      });

      it("then the `transform` plugin is called", function() {
        expect(transformStub.calledOnce).to.equal(true);
      });
    });


    describe("When registering a plugin for `transform` and `dependency`", function() {
      var transformStub, dependencyStub;
      beforeEach(function() {
        bitloader = new Bitloader();
        transformStub = sinon.stub();
        dependencyStub = sinon.stub();

        bitloader.plugin({
          "transform": transformStub,
          "dependency": dependencyStub
        });

        return bitloader.providers.loader._pipelineModuleMeta({"source":""});
      });

      it("then the `transform` plugin is called", function() {
        expect(transformStub.calledOnce).to.equal(true);
      });

      it("then the `dependency` plugin is called", function() {
        expect(dependencyStub.calledOnce).to.equal(true);
      });
    });


    describe("When registering named plugins for `transform` and `dependency`", function() {
      var transformStub, dependencyStub;
      beforeEach(function() {
        bitloader = new Bitloader();
        transformStub = sinon.stub();
        dependencyStub = sinon.stub();

        bitloader.plugin("myplugin", {
          "transform": transformStub,
          "dependency": dependencyStub
        });

        return bitloader.providers.loader._pipelineModuleMeta({"source":""});
      });

      it("then the `transform` plugin is called", function() {
        expect(transformStub.calledOnce).to.equal(true);
      });

      it("then the `dependency` plugin is called", function() {
        expect(dependencyStub.calledOnce).to.equal(true);
      });
    });


    describe("When registering plugin `less` for `transform`", function() {
      var lessTransformStub, textTransformStub;
      beforeEach(function() {
        bitloader = new Bitloader();
        lessTransformStub = sinon.stub();
        textTransformStub = sinon.stub();

        bitloader.plugin("less", {
          "transform": lessTransformStub
        });

        bitloader.plugin("text", {
          "transform": textTransformStub
        });

        return bitloader.providers.loader._pipelineModuleMeta({"plugins": ["less"], "source":""});
      });

      it("then the `less` plugin for `transform` is called", function() {
        expect(lessTransformStub.calledOnce).to.equal(true);
      });

      it("then the `text` plugin for `transform` is NOT called", function() {
        expect(textTransformStub.called).to.equal(false);
      });
    });


    describe("When registering plugin `less` for `transform` and `dependency`", function() {
      var lessTransformStub, lessDependencyStub, textTransformStub, textDependencyStub;
      beforeEach(function() {
        bitloader = new Bitloader();
        lessTransformStub  = sinon.stub();
        lessDependencyStub = sinon.stub();
        textTransformStub  = sinon.stub();
        textDependencyStub = sinon.stub();

        bitloader.plugin("less", {
          "transform": lessTransformStub,
          "dependency": lessDependencyStub
        });

        bitloader.plugin("text", {
          "transform": textTransformStub,
          "dependency": textDependencyStub
        });

        return bitloader.providers.loader._pipelineModuleMeta({"plugins": ["less"], "source":""});
      });

      it("then the `less` plugin for `transform` is called", function() {
        expect(lessTransformStub.calledOnce).to.equal(true);
      });

      it("then the `less` plugin for `dependency` is called", function() {
        expect(lessDependencyStub.calledOnce).to.equal(true);
      });

      it("then the `text` plugin for `transform` is NOT called", function() {
        expect(textTransformStub.called).to.equal(false);
      });

      it("then the `text` plugin for `dependency` is NOT called", function() {
        expect(textDependencyStub.called).to.equal(false);
      });
    });


    describe("When registering a plugin for a pipeline that does not exist", function() {
      var tranformStub, bitloaderSpy;
      beforeEach(function() {
        bitloader = new Bitloader();
        tranformStub = sinon.stub();
        bitloaderSpy = sinon.spy(bitloader, "plugin");

        try {
          bitloader.plugin({
            "tranform": tranformStub
          });
        }
        catch(e) {
        }

        return bitloader.providers.loader._pipelineModuleMeta({"source":""});
      });

      it("then an exception is thrown", function() {
        expect(bitloaderSpy.threw()).to.equal(true);
      });

      it("then the `transform` plugin is never called", function() {
        expect(tranformStub.called).to.equal(false);
      });
    });


    describe("When registering 1 dependency handler", function() {
      var dependencyStub, moduleMeta;

      beforeEach(function() {
        bitloader = new Bitloader();
        moduleMeta = {"source": ""};
        dependencyStub = sinon.stub();

        bitloader.pipelines.dependency.use(dependencyStub);

        return bitloader.providers.loader._pipelineModuleMeta(moduleMeta);
      });

      it("then the dependency handler is called once", function() {
        expect(dependencyStub.calledOnce).to.equal(true);
      });

      it("then then dependency handler is called with the modulemeta object", function() {
        expect(dependencyStub.calledWithExactly(moduleMeta)).to.equal(true);
      });
    });


    describe("When registering 1 dependency and 1 transform handler", function() {
      var dependencyStub, transformStub, moduleMeta;

      beforeEach(function() {
        bitloader = new Bitloader();
        moduleMeta = {"source": ""};
        dependencyStub = sinon.stub();
        transformStub = sinon.stub();

        bitloader.pipelines.transform.use(transformStub);
        bitloader.pipelines.dependency.use(dependencyStub);

        return bitloader.providers.loader._pipelineModuleMeta(moduleMeta);
      });

      it("then the transform handler is called once", function() {
        expect(transformStub.calledOnce).to.equal(true);
      });

      it("then then transform handler is called with the modulemeta object", function() {
        expect(transformStub.calledWithExactly(moduleMeta)).to.equal(true);
      });

      it("then the dependency handler is called once", function() {
        expect(dependencyStub.calledOnce).to.equal(true);
      });

      it("then the dependency handler is called with the modulemeta object", function() {
        expect(dependencyStub.calledWithExactly(moduleMeta)).to.equal(true);
      });
    });

  });

});
