var Bitloader = require("dist/bit-loader");

describe("Transform Test Suite", function() {

  describe("When calling `transform`", function() {
    var bitloader;

    beforeEach(function() {
      bitloader = new Bitloader();
    });


    describe("when transforming an anonymous function", function() {
      var source, transformStub;

      beforeEach(function() {
        transformStub = sinon.stub();
        source = "function() {}";
        return bitloader.transform(source).then(transformStub);
      });


      it("then the transform callback is called once", function() {
        sinon.assert.calledOnce(transformStub);
      });

      it("then the transform callback is called with the input string", function() {
        sinon.assert.calledWith(transformStub, source);
      });
    });


    describe("when transforming with a registered plugin", function() {
      var source, transformedSource, transformPluginStub, transformStub;

      beforeEach(function() {
        source = "var x = 1;";
        transformedSource = "var a = 1;";
        transformStub = sinon.stub();
        transformPluginStub = sinon.stub().returns({ source: transformedSource });

        bitloader.plugin({
          transform: transformPluginStub
        });

        return bitloader.transform(source).then(transformStub);
      });

      it("then transform callback is called once", function() {
        sinon.assert.calledOnce(transformStub);
      });

      it("then transform callback is called with transformed string", function() {
        sinon.assert.calledWith(transformStub, transformedSource);
      });

      it("then transform plugin is called once", function() {
        sinon.assert.calledOnce(transformPluginStub);
      });

      it("then transform plugin is called with the unprocessed string", function() {
        sinon.assert.calledWith(transformPluginStub, sinon.match({ source: source }));
      });
    });
  });
});
