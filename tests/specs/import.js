define(["dist/bit-loader"], function(Bitloader) {
  var Importer = Bitloader.Import;

  describe("Import Suite", function() {

    describe("when importing a module called `no` from options.context", function() {
      var no, importer, loadStub;

      beforeEach(function() {
        var options = {"modules": {"no": {"item": "hello"}}};

        loadStub = sinon.stub();
        importer = new Importer({
          load: loadStub
        });

        return importer.import("no", options)
          .then(function(_no) {
            no = _no;
          });
      });

      it("then `no` is an object", function() {
        expect(no).to.be.an("object");
      });

      it("the `no.item` is a string", function() {
        expect(no.item).to.be.a("string");
      });

      it("then `no.item` is `hello`", function() {
        expect(no.item).to.equal("hello");
      });

      it("then `import.load` is not called", function() {
        expect(loadStub.called).to.equal(false);
      });
    });


    describe("when importing module `no` and `yes` from options.context", function() {
      var no, yes, date, importer, loadStub;
      beforeEach(function() {
        date = new Date();
        var options = {"modules": {"no": {"item": "hello"}, "yes": {"item": date}}};

        loadStub = sinon.stub();
        importer = new Importer({
          load: loadStub
        });

        return importer.import(["no", "yes"], options)
          .then(function(_no, _yes) {
            no = _no;
            yes = _yes;
          });
      });

      describe("and module `no` is loaded", function() {
        it("then module `no` is an object", function() {
          expect(no).to.be.an("object");
        });

        it("then module `no` has a string property `item`", function() {
          expect(no.item).to.be.a("string");
        });

        it("then module `no.item` is `hello`", function() {
          expect(no.item).to.equal("hello");
        });

        it("then `import.load` is not called", function() {
          expect(loadStub.called).to.equal(false);
        });
      });

      describe("and module `yes` is loaded", function() {
        it("then `yes` is an object", function() {
          expect(yes).to.be.an("object");
        });

        it("then `yes.item` is a Date", function() {
          expect(yes.item).to.be.a("date");
        });

        it("then `yes.item` equals date", function() {
          expect(yes.item).to.equal(date);
        });

        it("then `import.load` is not called", function() {
          expect(loadStub.called).to.equal(false);
        });
      });
    });


    describe("when importing modules `no` and `yes` from instance.context", function() {
      var importer, date, no, yes, loadStub;
      beforeEach(function() {
        date = new Date();
        loadStub = sinon.stub();

        importer = new Importer({
          load: loadStub,
          context: {"modules": {"no": {"item": "hello"}, "yes": {"item": date}}}
        });

        return importer.import(["no", "yes"])
          .then(function(_no, _yes) {
            no = _no;
            yes = _yes;
          });
      });

      describe("and module `no` is loaded", function() {
        it("then `no` is an object", function() {
          expect(no).to.be.an("object");
        });

        it("then `no.item` is a string", function() {
          expect(no.item).to.be.a("string");
        });

        it("then `no.item` is `hello`", function() {
          expect(no.item).to.equal("hello");
        });

        it("then `import.load` is not called", function() {
          expect(loadStub.called).to.equal(false);
        });
      });

      describe("and module `yes` is loaded", function() {
        it("then `yes` is an object", function() {
          expect(yes).to.be.an("object");
        });

        it("then `yes.item` is a Date", function() {
          expect(yes.item).to.be.a("date");
        });

        it("then `yes.item` is date", function() {
          expect(yes.item).to.equal(date);
        });

        it("then `import.load` is not called", function() {
          expect(loadStub.called).to.equal(false);
        });
      });

      describe("and module `no` is loaded from options.context", function() {
        var no, yes;
        beforeEach(function() {
          var options = {"modules": {"no": {"item": "overriden"}}};
          return importer.import(["no", "yes"], options)
            .then(function(_no, _yes) {
              no = _no;
              yes = _yes;
            });
        });

        it("then `no` is an object", function() {
          expect(no).to.be.an("object");
        });

        it("then `no.item` is a string", function() {
          expect(no.item).to.be.a("string");
        });

        it("then `no.item` is `overriden`", function() {
          expect(no.item).to.equal("overriden");
        });

        it("then `import.load` is not called", function() {
          expect(loadStub.called).to.equal(false);
        });
      });
    });


    describe("When importing module `yes` using the `load` interface", function() {

      describe("and module defines `code`", function() {
        var importer, yes, modYes, loadStub;
        beforeEach(function() {
          modYes   = new Bitloader.Module({name: 'yes', type: Bitloader.Module.Type.AMD, code: "module code"});
          loadStub = sinon.stub().returns(Bitloader.Promise.resolve(modYes));

          importer = new Importer({
            load: loadStub
          });

          return importer.import("yes")
            .then(function(_yes) {
              yes = _yes;
            });
        });

        it("then `load` is called with `yes`", function() {
          expect(loadStub.calledOnce).to.equal(true);
        });

        it("then `load` is called once", function() {
          expect(loadStub.calledWith('yes')).to.equal(true);
        });

        it("then `yes` is equal to modYes.code", function() {
          expect(yes).to.equal(modYes.code);
        });
      });


      describe("and module defines `factory`", function() {
        var importer, yes, modYes, modFactoryStub, loadStub;
        beforeEach(function() {
          modFactoryStub = sinon.stub().returns("module code");
          modYes   = new Bitloader.Module({name: 'yes', type: Bitloader.Module.Type.AMD, factory: modFactoryStub});
          loadStub = sinon.stub().returns(Bitloader.Promise.resolve(modYes));

          importer = new Importer({
            load: loadStub
          });

          return importer.import("yes")
            .then(function(_yes) {
              yes = _yes;
            });
        });

        it("then `load` is called with `yes`", function() {
          expect(loadStub.calledOnce).to.equal(true);
        });

        it("then `load` is called once", function() {
          expect(loadStub.calledWith('yes')).to.equal(true);
        });

        it("then `yes` is equal to modYes.code", function() {
          expect(yes).to.equal(modYes.code);
        });

        it("then `modYes.factory` is called once", function() {
          expect(modFactoryStub.calledOnce).to.equal(true);
        });
      });


      describe("and module defines `factory` with dependencies `no` and `maybe`", function() {
        var importer, yes, modYes, modFactoryStub, loadStub;
        beforeEach(function() {

          modFactoryStub = sinon.stub().withArgs("module no", "module maybe").returns("module code");

          modYes = new Bitloader.Module({
            name: 'yes',
            type: Bitloader.Module.Type.AMD,
            factory: modFactoryStub,
            deps: ["no", "maybe"]
          });

          loadStub = sinon.stub().returns(Bitloader.Promise.resolve(modYes));

          importer = new Importer({
            load: loadStub,
            context: {
              modules: {
                "no": "module no",
                "maybe": "module maybe"
              }
            }
          });

          return importer.import("yes")
            .then(function(_yes) {
              yes = _yes;
            });
        });

        it("then `load` is called with `yes`", function() {
          expect(loadStub.calledOnce).to.equal(true);
        });

        it("then `load` is called once", function() {
          expect(loadStub.calledWith('yes')).to.equal(true);
        });

        it("then `yes` is equal to modYes.code", function() {
          expect(yes).to.equal(modYes.code);
        });

        it("then `modYes.factory` is called once", function() {
          expect(modFactoryStub.calledOnce).to.equal(true);
        });

        it("then `modYes.factory` is called once with `module no` and `module maybe`", function() {
          expect(modFactoryStub.withArgs("module no", "module maybe").calledOnce).to.equal(true);
        });

        it("then `modYes.factory` returned `module code`", function() {
          expect(modFactoryStub.returnValues[0]).to.equal("module code");
        });
      });

    });

  });
});
