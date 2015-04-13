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

    describe("When calling `transform`", function() {
      var bitloader;

      beforeEach(function() {
        bitloader = new Bitloader();
      });


      describe("when transforming an anonymous function", function() {
        var result, source, moduleMeta;

        beforeEach(function() {
          source = "function() {}";
          moduleMeta = {source: source};

          return bitloader.providers.loader
            .transform(moduleMeta)
            .then(function(_result) {
              result = _result;
            });
        });


        it("then result is moduleMeta", function() {
          expect(result).to.equal(moduleMeta);
        });

        it("then result.source is a string", function() {
          expect(result.source).to.be.a('string');
        });

        it("then result.deps to be an array", function() {
          expect(result.deps).to.be.an('array');
        });

        it("then result.deps is empty", function() {
          expect(result.deps.length).to.equal(0);
        });
      });


      describe("when transforming an function and one CJS dependency", function() {
        var result, source, moduleMeta;

        beforeEach(function() {
          source = "var x = require('x'); function hello() {}";
          moduleMeta = {source: source};

          return bitloader.providers.loader
            .transform(moduleMeta)
            .then(function(_result) {
              result = _result;
            });
        });


        it("then result is moduleMeta", function() {
          expect(result).to.equal(moduleMeta);
        });

        it("then result.source is a string", function() {
          expect(result.source).to.be.a('string');
        });

        it("then result.deps to be an array", function() {
          expect(result.deps).to.be.an('array');
        });

        it("then result.deps is empty", function() {
          expect(result.deps.length).to.equal(0);
        });
      });
    });

    describe("When calling `_pipelineModuleMeta`", function() {
      var bitloader;

      beforeEach(function() {
        bitloader = new Bitloader();
      });

      describe("and registering 1 dependency handler", function() {
        var dependencyStub, moduleMeta;

        beforeEach(function() {
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

      describe("and registering 1 dependency and 1 transform handler", function() {
        var dependencyStub, transformStub, moduleMeta;

        beforeEach(function() {
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

    describe("When defining `ignore` rules", function() {
      var bitloader, dependencyStub, transformStub;
      beforeEach(function() {
        bitloader = new Bitloader();
        dependencyStub = sinon.stub();
        transformStub = sinon.stub();
        bitloader.pipelines.transform.use(transformStub);
        bitloader.pipelines.dependency.use(dependencyStub);
      });


      describe("and defining an ignore rule for `dependecy` with match `test.js`", function() {
        beforeEach(function() {
          bitloader.ignore({
            name: "dependency",
            match: "test.js"
          });
        });


        describe("and running pipeline on `test.js`", function() {
          var moduleMeta;
          beforeEach(function() {
            moduleMeta = {"name": "test.js", "source": ""};
            return bitloader.providers.loader._pipelineModuleMeta(moduleMeta);
          });

          it("then `transform` is executed", function() {
            expect(transformStub.called).to.equal(true);
          });

          it("then `dependency` is not executed", function() {
            expect(dependencyStub.called).to.equal(false);
          });
        });
      });


      describe("and defining an ignore rule for `dependency` with match `test1.js` and later add `test2.js`", function() {
        beforeEach(function() {
          bitloader.ignore({
            name: "dependency",
            match: "test1.js"
          });

          bitloader.ignore({
            name: "dependency",
            match: "test2.js"
          });
        });

        describe("and running pipeline on `test1.js`", function() {
          var moduleMeta;
          beforeEach(function() {
            moduleMeta = {"name": "test1.js", "source": ""};
            return bitloader.providers.loader._pipelineModuleMeta(moduleMeta);
          });

          it("then `transform` is executed", function() {
            expect(transformStub.called).to.equal(true);
          });

          it("then `dependency` is not executed", function() {
            expect(dependencyStub.called).to.equal(false);
          });
        });

        describe("and running pipeline on `test2.js`", function() {
          var moduleMeta;
          beforeEach(function() {
            moduleMeta = {"name": "test2.js", "source": ""};
            return bitloader.providers.loader._pipelineModuleMeta(moduleMeta);
          });

          it("then `transform` is executed", function() {
            expect(transformStub.called).to.equal(true);
          });

          it("then `dependency` is not executed", function() {
            expect(dependencyStub.called).to.equal(false);
          });
        });
      });


      describe("and defining one generic ignore rule with match `test.js`", function() {
        beforeEach(function() {
          bitloader.ignore({
            match: 'test.js'
          });
        });

        describe("and running pipeline on `test.js`", function() {
          var moduleMeta;
          beforeEach(function() {
            moduleMeta = {"name": "test.js", "source": ""};
            return bitloader.providers.loader._pipelineModuleMeta(moduleMeta);
          });

          it("then `transform` is not executed", function() {
            expect(transformStub.called).to.equal(false);
          });

          it("then `dependency` is not executed", function() {
            expect(dependencyStub.called).to.equal(false);
          });
        });

        describe("and running pipeline on `doesrun.js`", function() {
          var moduleMeta;
          beforeEach(function() {
            moduleMeta = {"name": "doesrun.js", "source": ""};
            return bitloader.providers.loader._pipelineModuleMeta(moduleMeta);
          });

          it("then `transform` is executed", function() {
            expect(transformStub.called).to.equal(true);
          });

          it("then `dependency` is executed", function() {
            expect(dependencyStub.called).to.equal(true);
          });
        });

      });

    });

    describe("When registering `plugins`", function() {
      var bitloader;
      beforeEach(function() {
        bitloader = new Bitloader();
      });

      describe("and registering a single plugin for `transform`", function() {
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
          expect(transformStub.called).to.equal(true);
        });
      });


      describe("and registering a plugin for `transform` and `dependency`", function() {
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

      describe("and registering a plugin for a pipeline that does not exist", function() {
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

});
