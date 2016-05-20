import { expect } from "chai";
import chanceFactory from "chance";
import Service from "../../src/service";

var chance = chanceFactory();

describe("Service Test Suite", () => {
  describe("When instantiating a Service with an empty context", () => {
    var service;

    beforeEach(() => {
      service = new Service({});
    });

    it("then the instance is a Service", () => {
      expect(service).to.be.an.instanceof(Service);
    });

    describe("And configuring a provider", () => {
      var providerStub, configureProvider;
      beforeEach(() => {
        configureProvider = () => service.provider(providerStub);
      });

      describe("and the provider does not return anything", () => {
        beforeEach(() => {
          providerStub = sinon.stub().returns(null);
          configureProvider();
        });

        it("then the service has the provider registered", () => {
          expect(service._provider).to.equal(providerStub);
        });

        describe("and running the service Async", () => {
          var meta, mergedData, result;

          beforeEach(() => {
            mergedData = {
              source: chance.string()
            };

            meta = {
              configure: sinon.stub().returns(mergedData)
            };

            return service.runAsync(meta).then(r => result = r);
          });

          it("then meta.configure is never called", () => {
            sinon.assert.notCalled(meta.configure);
          });

          it("then result does not have any data merged", () => {
            expect(result).to.eql(meta);
          });
        });

        describe("and running the service Sync", () => {
          var meta, mergedData, result;

          beforeEach(() => {
            mergedData = {
              source: chance.string()
            };

            meta = {
              configure: sinon.stub().returns(mergedData)
            };

            result = service.runSync(meta);
          });

          it("then meta.configure is never called", () => {
            sinon.assert.notCalled(meta.configure);
          });

          it("then result does not have any data merged", () => {
            expect(result).to.eql(meta);
          });
        });
      });

      describe("and the provider returns an object", () => {
        var providerReturn;
        beforeEach(() => {
          providerReturn = {
            rejtiak: chance.string()
          };

          providerStub = sinon.stub().returns(providerReturn);
          configureProvider();
        });

        it("then the service has the provider registered", () => {
          expect(service._provider).to.equal(providerStub);
        });

        describe("and running the service Async", () => {
          var meta, mergedData, result;

          beforeEach(() => {
            mergedData = {
              source: chance.string()
            };

            meta = {
              configure: sinon.stub().returns(mergedData)
            };

            return service.runAsync(meta).then(r => result = r);
          });

          it("then meta.configure is called with the meta object", () => {
            sinon.assert.calledWith(meta.configure, providerReturn);
          });

          it("then result constains the data merged in", () => {
            expect(result).to.eql(mergedData);
          });
        });

        describe("and running the service sync", () => {
          var meta, mergedData, result;

          beforeEach(() => {
            mergedData = {
              source: chance.string()
            };

            meta = {
              configure: sinon.stub().returns(mergedData)
            };

            result = service.runSync(meta);
          });

          it("then meta.configure is called with the meta object", () => {
            sinon.assert.calledWith(meta.configure, providerReturn);
          });

          it("then result constains the data merged in", () => {
            expect(result).to.eql(mergedData);
          });
        });
      });
    });

    describe("And configuring a transform", () => {
      var transformStub, transformReturn;

      beforeEach(() => {
        transformReturn = {
          ikton: chance.string()
        };

        transformStub = sinon.stub().returns(transformReturn);
        service.use(transformStub);
      });

      it("then the service has the transform registered", () => {
        expect(service.transforms).to.include(transformStub);
      });

      describe("and running the service Async", () => {
        var meta, mergedData, result;

        beforeEach(() => {
          mergedData = {
            source: chance.string()
          };

          meta = {
            configure: sinon.stub().returns(mergedData)
          };

          return service.runAsync(meta).then(r => result = r);
        });

        it("then meta.configure is called with the meta object", () => {
          sinon.assert.calledWith(meta.configure, transformReturn);
        });

        it("then result constains the data merged in", () => {
          expect(result).to.eql(mergedData);
        });
      });

      describe("and running the service sync", () => {
        var meta, mergedData, result;

        beforeEach(() => {
          mergedData = {
            source: chance.string()
          };

          meta = {
            configure: sinon.stub().returns(mergedData)
          };

          result = service.runSync(meta);
        });

        it("then meta.configure is called with the meta object", () => {
          sinon.assert.calledWith(meta.configure, transformReturn);
        });

        it("then result constains the data merged in", () => {
          expect(result).to.eql(mergedData);
        });
      });
    });

    describe("And configuring a transform and a provider", () => {
      var transformStub, transformReturn, transformMergeResult;
      var providerStub, providerReturn, providerMergeResult;
      var initialData, metaConfigure;

      beforeEach(() => {
        metaConfigure = sinon.stub();

        initialData = {
          source: chance.string(),
          configure: metaConfigure
        };

        transformMergeResult = {
          rrrumtee: chance.string(),
          configure: metaConfigure
        };

        providerMergeResult = {
          jjkitenka: chance.string(),
          configure: metaConfigure
        };

        transformReturn = {
          ikton: chance.string()
        };

        providerReturn = {
          rejtiak: chance.string()
        };

        metaConfigure.withArgs(transformReturn).returns(transformMergeResult);
        metaConfigure.withArgs(providerReturn).returns(providerMergeResult);

        transformStub = sinon.stub().returns(transformReturn);
        providerStub = sinon.stub().returns(providerReturn);

        service.provider(providerStub).use(transformStub);
      });

      it("then the service has the transform registered", () => {
        expect(service.transforms).to.include(transformStub);
      });

      it("then the service has the provider registered", () => {
        expect(service._provider).to.equal(providerStub);
      });

      describe("and running the service Async", () => {
        var result;

        beforeEach(() => {
          return service.runAsync(initialData).then(r => result = r);
        });

        it("then the transform is called with the initial data", () => {
          sinon.assert.calledWith(transformStub, initialData);
        });

        it("then the provider is called with the data from the transform", () => {
          sinon.assert.calledWith(providerStub, transformMergeResult);
        });

        it("then the final result is what the provider generated", () => {
          expect(result).to.eql(providerMergeResult);
        });
      });

      describe("and running the service Sync", () => {
        var result;

        beforeEach(() => {
          result = service.runSync(initialData);
        });

        it("then the transform is called with the initial data", () => {
          sinon.assert.calledWith(transformStub, initialData);
        });

        it("then the provider is called with the data from the transform", () => {
          sinon.assert.calledWith(providerStub, transformMergeResult);
        });

        it("then the final result is what the provider generated", () => {
          expect(result).to.eql(providerMergeResult);
        });
      });
    });
  });
});
