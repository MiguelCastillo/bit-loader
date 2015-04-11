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

        it("then then dependency handler is called with the modulemeta object", function() {
          expect(dependencyStub.calledWithExactly(moduleMeta)).to.equal(true);
        });
      });

    });

    describe("When excluding modules for processing", function() {
      /**
      importer.exclude({
        "from": ["transform", "dependency", "compile"],
        "match": ["/test/**.js", "chai", "bit-imports"]
      });
      */

      it("Must implement");
    });

  });

});
