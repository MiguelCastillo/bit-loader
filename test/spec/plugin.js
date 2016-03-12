import { expect } from "chai";
import chance from "chance";
import Plugin from "src/plugin/plugin";
import Registrar from "src/plugin/registrar";
import Module from "src/module";

describe("Plugin Test Suite", () => {
  var plugin, createPlugin, registrarMock;

  beforeEach(() => {
    createPlugin = () => plugin = new Plugin(registrarMock);
  });

  describe("When creating a plugin", () => {
    beforeEach(() => {
      registrarMock = null;
      createPlugin();
    });

    it("then `plugin` is an instance of `Plugin`", () => {
      expect(plugin).to.be.an.instanceof(Plugin);
    });

    describe("and running the plugin", () => {
      var act, result, data;

      beforeEach(() => {
        act = () => {
          return plugin.run(data).then((r) => {
            result = r;
            return result;
          });
        };
      });

      it("then the correct result is generated", () => {
         expect(result).to.be.undefined;
      });

      describe("with a random string as data with no registered handlers", () => {
        beforeEach(() => {
          data = chance().string();

          registrarMock = {
            loadHandlers: sinon.stub().returns(Promise.resolve())
          };

          createPlugin();
          return act();
        });

        it("then plugin will attempt to load all dynamic plugins", () => {
          sinon.assert.calledOnce(registrarMock.loadHandlers);
        });

        it("then final result is equal to the input - input does not change", () => {
          expect(result).to.equal(data);
        });
      });

      describe("with one registered handler function", () => {
        var handler, handlerResult;

        beforeEach(() => {
          data = new Module.Meta("modulename").configure({ "source": chance().string() });
          handlerResult = { "source": chance().string() };
          handler = sinon.stub().returns(handlerResult);
          registrarMock = new Registrar();

          createPlugin();
          plugin.configure(handler);
          return act();
        });

        it("then handler is called once", () => {
          sinon.assert.calledOnce(handler);
        });

        it("then handler is called with the input data", () => {
          sinon.assert.calledWith(handler, data);
        });

        it("then result is not the same reference as the input", () => {
          expect(result).to.not.equal(handlerResult);
        });

        it("then result is returned from the handler", () => {
          expect(result).to.include(handlerResult);
        });
      });
    });
  });

  describe("When creating a plugin with a module loader", () => {
    describe("and running the plugin", () => {
      var act, result, data;

      beforeEach(() => {
        act = () => {
          return plugin.run(data).then((r) => {
            result = r;
            return result;
          });
        };
      });

      describe("with one registered handler string", () => {
        var handler, handlerResult, handlerName, importStub, loader;

        beforeEach(() => {
          handlerName = chance().string();
          data = new Module.Meta("modulename").configure({ "source": chance().string() });
          handlerResult = { "source": chance().string() };
          handler = sinon.stub().returns(handlerResult);
          importStub = sinon.stub();
          importStub.withArgs([handlerName]).returns(Promise.all([handler]));

          loader = {};
          loader.import = importStub;
          loader.config = sinon.stub().returns(loader);
          registrarMock = new Registrar(loader);
          createPlugin();
          plugin.configure(handlerName);
          return act();
        });

        it("then module is imported via the module loader", () => {
          sinon.assert.calledOnce(loader.import);
        });

        it("then module loader is called with the plugin name", () => {
          sinon.assert.calledWithExactly(loader.import, [handlerName]);
        });

        it("then handler is called once", () => {
          sinon.assert.calledOnce(handler);
        });

        it("then handler is called with the input data", () => {
          sinon.assert.calledWith(handler, data);
        });

        it("then the final result is not the same reference as the input", () => {
          expect(result).to.not.equal(handlerResult);
        });

        it("then the final result is returned from the handler", () => {
          expect(result).to.include(handlerResult);
        });
      });

      describe("with two registered handlers and the first handler is a dynamically loaded", () => {
        var handler1, handler2, handlerResult1, handlerResult2, handlerName, importStub, loader;

        beforeEach(() => {
          data = new Module.Meta("modulename").configure({ "source": chance().string() });
          handlerResult1 = { "source": chance().string() };
          handlerResult2 = { "source": chance().string() };
          handler1 = sinon.stub().returns(handlerResult1);
          handler2 = sinon.stub().returns(handlerResult2);
          handlerName = chance().string();
          importStub = sinon.stub();
          importStub.withArgs([handlerName]).returns(Promise.all([handler1]));

          loader = {};
          loader.import = importStub;
          loader.config = sinon.stub().returns(loader);
          registrarMock = new Registrar(loader);
          createPlugin();
          plugin.configure([handlerName, handler2]);
          return act();
        });

        it("then module loader is only called once", () => {
          sinon.assert.calledOnce(loader.import);
        });

        it("then first handler is imported", () => {
          sinon.assert.calledWithExactly(loader.import, [handlerName]);
        });

        it("then first handler is called once", () => {
          sinon.assert.calledOnce(handler1);
        });

        it("then first handler is called with initial data", () => {
          sinon.assert.calledWith(handler1, data);
        });

        it("then second handler is called once", () => {
          sinon.assert.calledOnce(handler2);
        });

        it("then second handler is called with the result from first handler", () => {
          sinon.assert.calledWith(handler2, sinon.match(handlerResult1));
        });

        it("then the final result is the output from the second handler", () => {
          expect(result).to.include(handlerResult2);
        });
      });

      describe("with two registered handlers and the first handler with dynamically loaded and has an ignore rule", () => {
        var handler1, handler2, handlerResult1, handlerResult2, handlerName, moduleName, importStub, loader;

        beforeEach(() => {
          moduleName = chance().string();
          data = new Module.Meta(moduleName).configure({ "source": chance().string() });
          handlerResult1 = { "source": chance().string() };
          handlerResult2 = { "source": chance().string() };
          handler1 = sinon.stub().returns(handlerResult1);
          handler2 = sinon.stub().returns(handlerResult2);
          handlerName = chance().string();
          importStub = sinon.stub();
          importStub.withArgs([handlerName]).returns(Promise.all([handler1]));

          loader = {};
          loader.import = importStub;
          loader.config = sinon.stub().returns(loader);
          registrarMock = new Registrar(loader);
          createPlugin();

          plugin.configure([{
            handler: handlerName,
            ignore: {
              name: moduleName
            }
          }, handler2]);

          return act();
        });

        it("then the first handler is never called", () => {
          sinon.assert.notCalled(handler1);
        });

        it("then then first handler is loaded", () => {
          sinon.assert.calledWithExactly(loader.import, [handlerName]);
        });

        it("then second handler is called once", () => {
          sinon.assert.calledOnce(handler2);
        });

        it("then second handler is called with the initial data", () => {
          sinon.assert.calledWith(handler2, sinon.match(data));
        });

        it("then the final result is the output from the second handler", () => {
          expect(result).to.include(handlerResult2);
        });
      });

      describe("with two registered dynamically loading plugin handlers", () => {
        var handler1, handler2, handlerResult1, handlerResult2, handler1Name, handler2Name, moduleName, importStub, loader;

        beforeEach(() => {
          moduleName = chance().string();
          data = new Module.Meta(moduleName).configure({ "source": chance().string() });
          handlerResult1 = { "source": chance().string() };
          handlerResult2 = { "source": chance().string() };
          handler1 = sinon.stub().returns(handlerResult1);
          handler2 = sinon.stub().returns(handlerResult2);
          handler1Name = chance().string();
          handler2Name = chance().string();
          importStub = sinon.stub();
          importStub.withArgs([handler1Name, handler2Name]).returns(Promise.all([handler1, handler2]));

          loader = {};
          loader.import = importStub;
          loader.config = sinon.stub().returns(loader);
          registrarMock = new Registrar(loader);
          createPlugin();
          plugin.configure([handler1Name, handler2Name]);
          return act();
        });

        it("then then first and second handlers are loaded", () => {
          sinon.assert.calledWithExactly(loader.import, [handler1Name, handler2Name]);
        });

        it("then the first handler is called once", () => {
          sinon.assert.calledOnce(handler1);
        });

        it("then the first handler is called", () => {
          sinon.assert.calledWith(handler1, sinon.match(data));
        });

        it("then second handler is called once", () => {
          sinon.assert.calledOnce(handler2);
        });

        it("then second handler is called with output from the previous handler", () => {
          sinon.assert.calledWith(handler2, sinon.match(handlerResult1));
        });

        it("then the final result is the output from the last handler", () => {
          expect(result).to.include(handlerResult2);
        });
      });
    });
  });

  describe("When creating a Plugin Registrar with no options", () => {
    beforeEach(() => {
      registrarMock = new Registrar();
    });

    describe("and configuring a `transform` plugin", () => {
      var act;

      beforeEach(() => {
        act = () => {
          registrarMock.configure(chance().string(), {
            transform: () => {}
          });
        };
      });

      it("then an exception is thrown because services to register plugins with are not configured", () => {
        expect(act).to.throw(TypeError, "Unable to register plugin. Services have not been configured");
      });
    });
  });

  describe("When creating a Plugin Registrar with transform services", () => {
    var transformService, transformPlugin;

    beforeEach(() => {
      transformService = sinon.stub();
      transformPlugin = sinon.stub();
      registrarMock = new Registrar(null, {
        transform: {
          use: transformService
        }
      });
    });

    describe("and registering a transform plugin", () => {
      beforeEach(() => {
        registrarMock.configure(chance().string(), {
          transform: transformPlugin
        });
      });

      it("then the transform service is called to register the plugin", () => {
        sinon.assert.calledOnce(transformService);
      });

      it("then the trasform service is called to register a function", () => {
        sinon.assert.calledWith(transformService, sinon.match.func);
      });
    });

    describe("and registering a plugin with a service that does not exist", () => {
      var act, serviceName;

      beforeEach(() => {
        serviceName = chance().string();

        act = () => {
          registrarMock.configure(chance().string(), {
            [serviceName]: () => {}
          });
        };
      });

      it("then the plugin registration throw an error", () => {
        expect(act).to.throw(TypeError, "Unable to register plugin. '" + serviceName + "' service does not exist");
      });
    });
  });
});
