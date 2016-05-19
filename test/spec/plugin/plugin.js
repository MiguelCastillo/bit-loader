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

  describe("When creating a plugin with no registrar", () => {
    beforeEach(() => {
      registrarMock = null;
      createPlugin();
    });

    it("then plugin is an instance of Plugin", () => {
      expect(plugin).to.be.an.instanceof(Plugin);
    });

    describe("and serializing the plugin", () => {
      var result;

      beforeEach(() => {
        result = plugin.serialize();
      });

      it("then plugin.serialize generate default values", () => {
        expect(result).to.deep.equal({
          "handlers": [],
          "id": null
        });
      });
    });
  });

  describe("When creating a plugin with an empty registrar", () => {
    var configurePlugin, pluginHandler;

    beforeEach(() => {
      configurePlugin = () => plugin = plugin.configure(pluginHandler);
      registrarMock = new Registrar();
      createPlugin();
    });

    describe("and configuring it with one string handler", () => {
      beforeEach(() => {
        pluginHandler = {
          handler: chance.string(),
          id: chance.string()
        };

        configurePlugin();
      });

      describe("and serializing the plugin", () => {
        var result;

        beforeEach(() => {
          result = plugin.serialize();
        });

        it("then result contains the string handler", () => {
          expect(result).to.deep.equal({
            handlers: [{
              handler: pluginHandler.handler,
              id: pluginHandler.id,
              options: null,
              matchers: {
                ignores: undefined,
                matches: undefined
              }
            }],
            id: null
          });
        });
      });
    });

    describe("and configuring it with one function handler, ignore, match rules, and options", () => {
      var handlerOption;

      beforeEach(() => {
        handlerOption = chance.string();

        pluginHandler = {
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
        };

        configurePlugin();
      });

      describe("and serializing the plugin", () => {
        var result;

        beforeEach(() => {
          result = plugin.serialize();
        });

        it("then the result contains the proper data structure", () => {
          expect(result).to.deep.equal({
            handlers: [{
              handler: pluginHandler.handler,
              id: pluginHandler.id,
              options: {
                rounders: handlerOption
              },
              matchers: {
                ignores: {
                  corner: [pluginHandler.matchers.ignores.corner]
                },
                matches: {
                  round: [pluginHandler.matchers.matches.round]
                }
              }
            }],
            id: null
          });
        });
      });
    });
  });

  describe("and running the plugin", () => {
    var runPlugin, result, data;

    beforeEach(() => {
      runPlugin = () => {
        return plugin.run(data).then((r) => {
          result = r;
          return result;
        });
      };
    });

    describe("with a random string as data with no registered handlers", () => {
      beforeEach(() => {
        data = chance.string();

        registrarMock = {
          loadHandlers: sinon.stub().returns(Promise.resolve())
        };

        createPlugin();
        return runPlugin();
      });

      it("then plugin will attempt to load all dynamic plugins", () => {
        sinon.assert.notCalled(registrarMock.loadHandlers);
      });

      it("then final result is equal to the input - input does not change", () => {
        expect(result).to.equal(data);
      });
    });

    describe("with one registered handler function", () => {
      var handler, handlerResult;

      beforeEach(() => {
        data = new Module.Meta("modulename").configure({ "source": chance.string() });
        handlerResult = { "source": chance.string() };
        handler = sinon.stub().returns(handlerResult);
        registrarMock = new Registrar();

        createPlugin();
        plugin = plugin.configure(handler);
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

  describe("When creating a plugin with a module loader", () => {
    describe("and running the plugin", () => {
      var runPlugin, result, data;

      beforeEach(() => {
        runPlugin = () => {
          return plugin.run(data).then((r) => {
            result = r;
            return result;
          });
        };
      });

      describe("with one registered handler string", () => {
        var handler, handlerResult, handlerName, importStub, loader;

        beforeEach(() => {
          handlerName = chance.string();
          data = new Module.Meta("modulename").configure({ "source": chance.string() });
          handlerResult = { "source": chance.string() };
          handler = sinon.stub().returns(handlerResult);
          importStub = sinon.stub();
          importStub.withArgs([handlerName]).returns(Promise.all([handler]));

          loader = {};
          loader.import = importStub;
          loader.config = sinon.stub().returns(loader);
          registrarMock = new Registrar(loader);
          createPlugin();
          plugin = plugin.configure(handlerName);
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
          data = new Module.Meta("modulename").configure({ "source": chance.string() });
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
          createPlugin();
          plugin = plugin.configure([handlerName, handler2]);
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
          data = new Module.Meta(moduleName).configure({ "source": chance.string() });
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
          createPlugin();

          plugin = plugin.configure([{
            handler: handlerName,
            ignores: {
              name: moduleName
            }
          }, handler2]);

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
          data = new Module.Meta(moduleName).configure({ "source": chance.string() });
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
          createPlugin();
          plugin = plugin.configure([handler1Name, handler2Name]);
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
});
