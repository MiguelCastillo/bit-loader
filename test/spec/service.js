import { expect } from "chai";
import chanceFactory from "chance";
import Service from "../../src/service";

var chance = chanceFactory();

describe("Service Test Suite", () => {
  describe("Given a Service created with the Service factory", () => {
    var services, serviceConfig, serviceContext, createService, postpreHooks;

    beforeEach(() => {
      createService = () => services = Service.create(serviceContext, serviceConfig, postpreHooks);
    });

    describe("and an empty services config is provided", () => {
      beforeEach(() => {
        serviceContext = {};
        serviceConfig = {};
        createService();
      });

      it("then services is an object", () => {
        expect(services).to.be.an("object");
      });

      it("then services is empty", () => {
        expect(Object.keys(services)).to.have.lengthOf(0);
      });
    });

    describe("and a service config with one service is provided and no preposthooks", () => {
      beforeEach(() => {
        serviceContext = {};
        serviceConfig = {
          tupac: Service
        };

        createService();
      });

      it("then services is an object", () => {
        expect(services).to.be.an("object");
      });

      it("then one service is created", () => {
        expect(Object.keys(services)).to.have.lengthOf(1);
      });

      it("then the service name is `tupac`", () => {
        expect(services.tupac).to.be.instanceof(Service);
      });
    });

    describe("and a service config with one service is provided and preposthooks", () => {
      beforeEach(() => {
        postpreHooks = true;
        serviceContext = {};
        serviceConfig = {
          tupac: Service
        };

        createService();
      });

      it("then services is an object", () => {
        expect(services).to.be.an("object");
      });

      it("then three services are created", () => {
        expect(Object.keys(services)).to.have.lengthOf(3);
      });

      it("then one service name is `tupac`", () => {
        expect(services.tupac).to.be.instanceof(Service);
      });

      it("then one service name is `pretupac`", () => {
        expect(services.pretupac).to.be.instanceof(Service);
      });

      it("then one service name is `posttupac`", () => {
        expect(services.posttupac).to.be.instanceof(Service);
      });

      describe("and registering a plugin in pretupac and posttupac service", () => {
        var pretupacPlugin, posttupacPlugin, result, input;

        beforeEach(() => {
          input = {};
          input.configure = sinon.stub();
          pretupacPlugin = sinon.stub();
          posttupacPlugin = sinon.stub();
          services.pretupac.use(pretupacPlugin);
          services.posttupac.use(posttupacPlugin);
        });

        describe("and running the tupac service async", () => {
          beforeEach(() => {
            return services.tupac.runAsync(input).then(re => result = re);
          });

          it("then the `pretupac` plugin is called", () => {
            sinon.assert.called(pretupacPlugin);
          });

          it("then the `posttupac` plugin is called", () => {
            sinon.assert.called(posttupacPlugin);
          });

          it("then result is the object passed in", () => {
            expect(result).to.equal(input);
          });
        });

        describe("and running the tupac service sync", () => {
          beforeEach(() => {
            result = services.tupac.runSync(input);
          });

          it("then the `pretupac` plugin is called", () => {
            sinon.assert.called(pretupacPlugin);
          });

          it("then the `posttupac` plugin is called", () => {
            sinon.assert.called(posttupacPlugin);
          });

          it("then result is the object passed in", () => {
            expect(result).to.equal(input);
          });
        });
      });
    });
  });

  describe("Given a Service instance with an empty context", () => {
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
