import { expect } from "chai";
import chanceFactory from "chance";
import Plugin from "src/plugin/plugin";
import Registrar from "src/plugin/registrar";
import Module from "src/module";

var chance = chanceFactory();

describe("Plugin Test Suite", function() {
  var plugin, createPlugin, pluginSettings, registrarMock;

  beforeEach(() => {
    createPlugin = () => {
      pluginSettings = {
        context: registrarMock
      };

      plugin = new Plugin(pluginSettings);
    };
  });

  describe("Given no registrar", () => {
    var error;

    beforeEach(() => {
      registrarMock = null;

      try {
        createPlugin();
      }
      catch(ex) {
        error = ex;
      }
    });

    it("then creating a plugin throws an exception", () => {
      expect(error).to.be.an.instanceof(Error);
    });
  });

  describe("Given a plugin with an empty registrar", () => {
    var configurePlugin, pluginOptions, serviceName;

    beforeEach(() => {
      serviceName = chance.word();
      configurePlugin = () => plugin = plugin.configure(pluginOptions);
      registrarMock = new Registrar();
      registrarMock.getServiceNames = sinon.stub().returns([serviceName]);
      registrarMock.registerPluginWithService = sinon.stub();
      createPlugin();
    });

    describe("and configuring it with one string handler", () => {
      beforeEach(() => {
        pluginOptions = {
          [serviceName]: {
            handler: chance.string(),
            id: chance.string()
          }
        };

        configurePlugin();
      });

      describe("and serializing it", () => {
        var result;

        beforeEach(() => {
          result = plugin.serialize();
        });

        it("then the plugin has one handler", () => {
          expect(result[serviceName]).to.have.length(1);
        });

        it("then the plugin has a null id", () => {
          expect(result).to.have.property("id", null);
        });

        it("then the handler is the configured string", () => {
          expect(result).to.have.deep.property(`${serviceName}[0].handler`, pluginOptions[serviceName].handler);
        });

        it("then the id is the configured string", () => {
          expect(result).to.have.deep.property(`${serviceName}[0].id`, pluginOptions[serviceName].id);
        });

        it("then options is null", () => {
          expect(result).to.have.deep.property(`${serviceName}[0].options`, null);
        });

        it("then matchers has undefined ignore rules", () => {
          expect(result).to.have.deep.property(`${serviceName}[0].matchers.ignores`, undefined);
        });

        it("then matchers has undefined match rules", () => {
          expect(result).to.have.deep.property(`${serviceName}[0].matchers.matches`, undefined);
        });
      });
    });

    describe("and configuring it with one function handler, ignore rules, match rules, and options", () => {
      var handlerOption;

      beforeEach(() => {
        handlerOption = chance.string();

        pluginOptions = {
          [serviceName]: {
            handler: () => {},
            options: {
              rounders: handlerOption
            },
            id: chance.string(),
            matchers: {
              ignores: {
                corner: chance.string()
              },
              matches: {
                round: chance.string()
              }
            }
          }
        };

        configurePlugin();
      });

      describe("and serializing the plugin", () => {
        var result;

        beforeEach(() => {
          result = plugin.serialize();
        });

        it("then the result contains the expected data structure", () => {
          expect(result).to.deep.equal({
            id: null,
            [serviceName]: [{
              handler: pluginOptions[serviceName].handler,
              id: pluginOptions[serviceName].id,
              options: {
                rounders: handlerOption
              },
              matchers: {
                ignores: {
                  corner: [pluginOptions[serviceName].matchers.ignores.corner]
                },
                matches: {
                  round: [pluginOptions[serviceName].matchers.matches.round]
                }
              }
            }]
          });
        });
      });
    });
  });

  describe("Given an empty plugin", () => {
    var runPlugin, result, data;

    beforeEach(() => {
      runPlugin = () => {
        return plugin.run("transform", data).then((r) => {
          result = r;
          return result;
        });
      };
    });

    describe("and running it with a random string as data with no registered handlers", () => {
      var error;

      beforeEach(() => {
        data = chance.string();

        registrarMock = new Registrar();
        registrarMock.loadHandlers = sinon.stub().returns(Promise.resolve());

        createPlugin();

        try {
          return runPlugin();
        }
        catch(ex) {
          error = ex;
        }
      });

      it("then an exception is thrown", () => {
        expect(error).to.be.an.instanceof(Error);
      });
    });

    describe("with one registered handler function", () => {
      var handler, handlerResult;

      beforeEach(() => {
        data = new Module("modulename").configure({ "source": chance.string() });
        handlerResult = { "source": chance.string() };
        handler = sinon.stub().returns(handlerResult);
        registrarMock = new Registrar();
        registrarMock.getServiceNames = sinon.stub().returns(["transform"]);
        registrarMock.registerPluginWithService = sinon.stub();

        createPlugin();

        plugin = plugin.configure({
          transform: handler
        });

        return runPlugin();
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

  describe("Given a plugin with a module loader", () => {
    var runPlugin, result, data;

    beforeEach(() => {
      runPlugin = () => {
        return plugin.run("transform", data).then((r) => {
          result = r;
          return result;
        });
      };
    });

    describe("and running the plugin with one registered handler string", () => {
      var handler, handlerResult, handlerName, importStub, loader;

      beforeEach(() => {
        handlerName = chance.string();
        data = new Module("modulename").configure({ "source": chance.string() });
        handlerResult = { "source": chance.string() };
        handler = sinon.stub().returns(handlerResult);
        importStub = sinon.stub();
        importStub.withArgs([handlerName]).returns(Promise.all([handler]));

        loader = {};
        loader.import = importStub;
        loader.config = sinon.stub().returns(loader);
        registrarMock = new Registrar(loader);
        registrarMock.getServiceNames = sinon.stub().returns(["transform"]);
        registrarMock.registerPluginWithService = sinon.stub();

        createPlugin();

        plugin = plugin.configure({
          transform: handlerName
        });

        return runPlugin();
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
        data = new Module("modulename").configure({ "source": chance.string() });
        handlerResult1 = { "source": chance.string() };
        handlerResult2 = { "source": chance.string() };
        handler1 = sinon.stub().returns(handlerResult1);
        handler2 = sinon.stub().returns(handlerResult2);
        handlerName = chance.string();
        importStub = sinon.stub();
        importStub.withArgs([handlerName]).returns(Promise.all([handler1]));

        loader = {};
        loader.import = importStub;
        loader.config = sinon.stub().returns(loader);
        registrarMock = new Registrar(loader);
        registrarMock.getServiceNames = sinon.stub().returns(["transform"]);
        registrarMock.registerPluginWithService = sinon.stub();

        createPlugin();

        plugin = plugin.configure({
          transform: [handlerName, handler2]
        });

        return runPlugin();
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
        moduleName = chance.string();
        data = new Module(moduleName).configure({ "source": chance.string() });
        handlerResult1 = { "source": chance.string() };
        handlerResult2 = { "source": chance.string() };
        handler1 = sinon.stub().returns(handlerResult1);
        handler2 = sinon.stub().returns(handlerResult2);
        handlerName = chance.string();
        importStub = sinon.stub();
        importStub.withArgs([handlerName]).returns(Promise.all([handler1]));

        loader = {};
        loader.import = importStub;
        loader.config = sinon.stub().returns(loader);
        registrarMock = new Registrar(loader);
        registrarMock.getServiceNames = sinon.stub().returns(["transform"]);
        registrarMock.registerPluginWithService = sinon.stub();

        createPlugin();

        plugin = plugin.configure({
          transform: [{
            handler: handlerName,
            ignores: {
              name: moduleName
            }
          }, handler2]
        });

        return runPlugin();
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
        moduleName = chance.string();
        data = new Module(moduleName).configure({ "source": chance.string() });
        handlerResult1 = { "source": chance.string() };
        handlerResult2 = { "source": chance.string() };
        handler1 = sinon.stub().returns(handlerResult1);
        handler2 = sinon.stub().returns(handlerResult2);
        handler1Name = chance.string();
        handler2Name = chance.string();
        importStub = sinon.stub();
        importStub.withArgs([handler1Name, handler2Name]).returns(Promise.all([handler1, handler2]));

        loader = {};
        loader.import = importStub;
        loader.config = sinon.stub().returns(loader);
        registrarMock = new Registrar(loader);
        registrarMock.getServiceNames = sinon.stub().returns(["transform"]);
        registrarMock.registerPluginWithService = sinon.stub();

        createPlugin();

        plugin = plugin.configure({
          transform: [handler1Name, handler2Name]
        });

        return runPlugin();
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
