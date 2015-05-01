define(['dist/bit-loader'], function(Bitloader) {

  describe("Plugin Test Suite", function() {
    var bitloader;

    describe("When registering a single `transform` plugin", function() {
      var transformStub, moduleMeta;
      beforeEach(function() {
        bitloader = new Bitloader();
        moduleMeta = {"source": ""};
        transformStub = sinon.stub();

        bitloader.plugin({
          "transform": transformStub
        });

        return bitloader.providers.loader._pipelineModuleMeta(moduleMeta);
      });

      it("then the `transform` plugin is called", function() {
        expect(transformStub.calledOnce).to.equal(true);
      });

      it("then the `dependency` handler is called with the appropriate module meta object", function() {
        expect(transformStub.calledWithExactly(moduleMeta)).to.equal(true);
      });
    });


    describe("When registering a single `dependency` plugin", function() {
      var dependencyStub, moduleMeta;

      beforeEach(function() {
        bitloader = new Bitloader();
        moduleMeta = {"source": ""};
        dependencyStub = sinon.stub();

        bitloader.plugin({
          "dependency": dependencyStub
        });

        return bitloader.providers.loader._pipelineModuleMeta(moduleMeta);
      });

      it("then the `dependency` handler is called once", function() {
        expect(dependencyStub.calledOnce).to.equal(true);
      });

      it("then the `dependency` handler is called with the appropriate module meta object", function() {
        expect(dependencyStub.calledWithExactly(moduleMeta)).to.equal(true);
      });
    });


    describe("When registering a `transform` and `dependency` plugin", function() {
      var transformStub, dependencyStub, moduleMeta;
      beforeEach(function() {
        bitloader = new Bitloader();
        moduleMeta = {"source":""};
        transformStub = sinon.stub();
        dependencyStub = sinon.stub();

        bitloader.plugin({
          "transform": transformStub,
          "dependency": dependencyStub
        });

        return bitloader.providers.loader._pipelineModuleMeta(moduleMeta);
      });

      it("then the `transform` plugin is called", function() {
        expect(transformStub.calledOnce).to.equal(true);
      });

      it("then then `transform` plugin is called with appropriate module meta", function(){
        expect(transformStub.calledWithExactly(moduleMeta)).to.equal(true);
      });

      it("then the `dependency` plugin is called", function() {
        expect(dependencyStub.calledOnce).to.equal(true);
      });

      it("then then `dependency` plugin is called with appropriate module meta", function(){
        expect(dependencyStub.calledWithExactly(moduleMeta)).to.equal(true);
      });
    });


    describe("When registering a `transform` and `dependency` plugin with multiple handlers and `matchPath` pattern", function() {
      var transformStub1, transformStub2, transformStub3, dependencyStub1, dependencyStub2, moduleMeta;
      beforeEach(function() {
        bitloader = new Bitloader();
        moduleMeta = {"path": "test.js", "source":""};
        transformStub1  = sinon.stub();
        transformStub2  = sinon.stub();
        transformStub3  = sinon.stub();
        dependencyStub1 = sinon.stub();
        dependencyStub2 = sinon.stub();

        bitloader.plugin({
          "match": {
            "path": ["**/*.js"]
          },
          "transform": [transformStub1, transformStub2],
          "dependency": dependencyStub1
        });

        bitloader.plugin({
          "match": {
            "path": ["**/*.jsx"]
          },
          "transform": transformStub3,
          "dependency": dependencyStub2
        });

        return bitloader.providers.loader._pipelineModuleMeta(moduleMeta);
      });

      it("then the `transform` handler1 is called for pattern **/*.js", function() {
        expect(transformStub1.calledOnce).to.equal(true);
      });

      it("then the `transform` handler1 is called for pattern **/*.js with the appropriate module meta", function() {
        expect(transformStub1.calledWithExactly(moduleMeta)).to.equal(true);
      });

      it("then the `transform` handler2 is called for pattern **/*.js", function() {
        expect(transformStub2.calledOnce).to.equal(true);
      });

      it("then the `transform` handler2 is called for pattern **/*.js with the appropriate module meta", function() {
        expect(transformStub2.calledWithExactly(moduleMeta)).to.equal(true);
      });

      it("then the `dependency` handler1 is called for pattern **/*.js", function() {
        expect(dependencyStub1.calledOnce).to.equal(true);
      });

      it("then the `dependency` handler1 is called for pattern **/*.js with the appropriate module meta", function() {
        expect(dependencyStub1.calledWithExactly(moduleMeta)).to.equal(true);
      });

      it("then the `transform` handler3 is NOT called for pattern **/*.jsx", function() {
        expect(transformStub3.called).to.equal(false);
      });

      it("then the `dependency` handler2 is NOT called for pattern **/*.jsx", function() {
        expect(dependencyStub2.called).to.equal(false);
      });
    });


    describe("When registering a named plugin for `transform` and `dependency`", function() {
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
      var lessTransformStub1, lessTransformStub2, textTransformStub;
      beforeEach(function() {
        bitloader = new Bitloader();
        lessTransformStub1 = sinon.stub();
        lessTransformStub2 = sinon.stub();
        textTransformStub  = sinon.stub();

        bitloader.plugin("less", {
          "transform": [lessTransformStub1, lessTransformStub2]
        });

        bitloader.plugin("text", {
          "transform": textTransformStub
        });

        return bitloader.providers.loader._pipelineModuleMeta({"plugins": ["less"], "source":""});
      });

      it("then the `less` plugin handler1 for `transform` is called", function() {
        expect(lessTransformStub1.calledOnce).to.equal(true);
      });

      it("then the `less` plugin handler2 for `transform` is called", function() {
        expect(lessTransformStub2.calledOnce).to.equal(true);
      });

      it("then the `text` plugin for `transform` is NOT called", function() {
        expect(textTransformStub.called).to.equal(false);
      });
    });


    describe("When registering a `less` plugin for `transform` and importing a module", function() {
      var lessTransformStub1, lessTransformStub2, resolveStub, fetchStub, compileStub, moduleMeta, compiledModule;
      beforeEach(function() {
        moduleMeta = new Bitloader.Module.Meta({"name": "test", "plugins": ["less"], "source":""});
        compiledModule = new Bitloader.Module(moduleMeta);
        resolveStub = sinon.stub().returns(moduleMeta);
        fetchStub = sinon.stub();
        compileStub = sinon.stub().returns(compiledModule);
        lessTransformStub1 = sinon.stub();
        lessTransformStub2 = sinon.stub();

        bitloader = new Bitloader({}, {
          resolver: resolverFactory,
          fetcher: fetcherFactory,
          compiler: compilerFactory
        });

        bitloader.plugin("less", {
          "transform": [lessTransformStub1]
        });

        bitloader.plugin("css", {
          "transform": [lessTransformStub2]
        });

        function resolverFactory() {
          return {
            resolve: resolveStub
          };
        }

        function fetcherFactory() {
          return {
            fetch: fetchStub
          };
        }

        function compilerFactory() {
          return {
            compile: compileStub
          };
        }

        return bitloader.import("less!test.less");
      });

      it("then the `less` plugin handler1 for `transform` is called", function() {
        expect(lessTransformStub1.calledOnce).to.equal(true);
      });

      it("then the `less` plugin handler1 for `transform` is called with the appropriate module meta", function() {
        expect(lessTransformStub1.calledWith(sinon.match(moduleMeta))).to.equal(true);
      });

      it("then the `less` plugin handler2 for `transform` is NOT called", function() {
        expect(lessTransformStub2.called).to.equal(false);
      });
    });


    describe("When registering a plugin named `less` for `transform` and `dependency`", function() {
      var lessTransformStub, lessDependencyStub, textTransformStub, textDependencyStub, moduleMeta;
      beforeEach(function() {
        moduleMeta = {"plugins": ["less"], "source":""};
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

        return bitloader.providers.loader._pipelineModuleMeta(moduleMeta);
      });

      it("then the `less` plugin for `transform` is called", function() {
        expect(lessTransformStub.calledOnce).to.equal(true);
      });

      it("then the `less` plugin for `transform` is called with the appropriate module meta", function() {
        expect(lessTransformStub.calledWithExactly(moduleMeta)).to.equal(true);
      });

      it("then the `less` plugin for `dependency` is called", function() {
        expect(lessDependencyStub.calledOnce).to.equal(true);
      });

      it("then the `less` plugin for `dependency` is called with the appropriate module meta", function() {
        expect(lessDependencyStub.calledWithExactly(moduleMeta)).to.equal(true);
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

  });

});
