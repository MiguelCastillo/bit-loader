define(['dist/bit-loader'], function(Bitloader) {
  var Middleware = Bitloader.Middleware;

  describe("Middleware Test Suite", function() {

    describe("When adding one middleware called `test`", function() {
      var middleware, testMiddlewareStub;
      beforeEach(function() {
        middleware = new Middleware();
        testMiddlewareStub = sinon.stub();
        middleware.use("test", testMiddlewareStub);
      });


      describe("and running the `test` middleware with no arguments", function() {
        beforeEach(function() {
          return middleware.run("test");
        });

        it("then `test` middleware is called only once", function() {
          expect(testMiddlewareStub.calledOnce).to.equal(true);
        });

        it("then `test` middleware is called with no arguments", function() {
          expect(testMiddlewareStub.args[0].length).to.equal(0);
        });
      });


      describe("and running the `test` middleware with 1 argument", function() {
        var timestamp;
        beforeEach(function() {
          timestamp = (new Date()).getTime();
          return middleware.run("test", timestamp);
        });

        it("then `test` middleware is called only once", function() {
          expect(testMiddlewareStub.calledOnce).to.equal(true);
        });

        it("then `test` middleware is called with 1 arguments", function() {
          expect(testMiddlewareStub.args[0].length).to.equal(1);
        });

        it("then `test` middleware is called with `timestamp`", function() {
          expect(testMiddlewareStub.args[0][0]).to.equal(timestamp);
        });
      });
    });


    describe("When adding two middleware called `sweet`, `sour`, `chicken`", function() {
      var middleware, sweetMiddlewareStub, sourMiddlewareStub, chickenMiddlewareStub;
      beforeEach(function() {
        middleware = new Middleware();
        sweetMiddlewareStub = sinon.stub();
        sourMiddlewareStub = sinon.stub();
        chickenMiddlewareStub = sinon.stub();
        middleware.use("sweet", sweetMiddlewareStub);
        middleware.use("sour", sourMiddlewareStub);
        middleware.use("chicken", chickenMiddlewareStub);
      });


      describe("and running `sweet` middleware with no arguments", function() {
        beforeEach(function() {
          return middleware.run("sweet");
        });

        it("then `sweet` middleware is called once", function() {
          expect(sweetMiddlewareStub.calledOnce).to.equal(true);
        });

        it("then `sour` middleware is not called", function() {
          expect(sourMiddlewareStub.called).to.equal(false);
        });

        it("then `chicken` middleware is not called", function() {
          expect(chickenMiddlewareStub.called).to.equal(false);
        });
      });


      describe("and running `sweet` and `chicken` middlewares with no arguments", function() {
        beforeEach(function() {
          return middleware.run(["sweet", "chicken"]);
        });

        it("then `sweet` middleware is called once", function() {
          expect(sweetMiddlewareStub.calledOnce).to.equal(true);
        });

        it("then `sour` middleware is not called", function() {
          expect(sourMiddlewareStub.called).to.equal(false);
        });

        it("then `chicken` middleware is called once", function() {
          expect(chickenMiddlewareStub.calledOnce).to.equal(true);
        });
      });


      describe("and running all middlewares with no arguments", function() {
        beforeEach(function() {
          return middleware.runAll();
        });

        it("then `sweet` middleware is called once", function() {
          expect(sweetMiddlewareStub.calledOnce).to.equal(true);
        });

        it("then `sour` middleware is called once", function() {
          expect(sourMiddlewareStub.calledOnce).to.equal(true);
        });

        it("then `chicken` middleware is called once", function() {
          expect(chickenMiddlewareStub.calledOnce).to.equal(true);
        });
      });

    });

  });

});
