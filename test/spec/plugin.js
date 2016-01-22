import { expect } from "chai";
import chance from "chance";
import Plugin from "src/plugin";
import Module from "src/module";

describe("Plugin Test Suite", () => {

  describe("When creating a plugin with no options", () => {
    var plugin;

    beforeEach(() => {
      plugin = new Plugin();
    });

    it("then `plugin` is an instance of `Plugin`", () => {
      expect(plugin).to.be.an.instanceof(Plugin);
    });

    it("then `plugin` has no name", () => {
      expect(plugin.name).to.be.undefined;
    });

    it("then `plugin` has no loader", () => {
      expect(plugin.loader).to.be.undefined;
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

      describe("with a random string as data with no registered handlers", () => {
        beforeEach(() => {
          data = chance().string();
          return act();
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
    var createPlugin, plugin, loader;

    beforeEach(() => {
      createPlugin = () => plugin = new Plugin(null, loader);
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

      describe("with one registered handler string", () => {
        var handler, handlerResult, name;

        beforeEach(() => {
          name = chance().string();
          data = new Module.Meta("modulename").configure({ "source": chance().string() });
          handlerResult = { "source": chance().string() };
          handler = sinon.stub().returns(handlerResult);

          loader = { import: sinon.stub().returns(Promise.resolve(handler)) };
          createPlugin();
          plugin.configure(name);
          return act();
        });

        it("then module is imported via the module loader", () => {
          sinon.assert.calledOnce(loader.import);
        });

        it("then module loader is called with the plugin name", () => {
          sinon.assert.calledWith(loader.import, name);
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

      describe("with two registered handlers and the first handler is a string", () => {
        var handler1, handler2, handlerResult1, handlerResult2, name;

        beforeEach(() => {
          data = new Module.Meta("modulename").configure({ "source": chance().string() });
          handlerResult1 = { "source": chance().string() };
          handlerResult2 = { "source": chance().string() };
          handler1 = sinon.stub().returns(handlerResult1);
          handler2 = sinon.stub().returns(handlerResult2);
          name = chance().string();

          loader = { import: sinon.stub().returns(Promise.resolve(handler1)) };
          createPlugin();
          plugin.configure([name, handler2]);
          return act();
        });

        it("then first handler is imported", () => {
          sinon.assert.calledWith(loader.import, name);
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

      describe("with two registered handlers and the first handler has an ignore matching rule and is a string name", () => {
        var handler1, handler2, handlerResult1, handlerResult2, name, moduleName;

        beforeEach(() => {
          moduleName = chance().string();
          data = new Module.Meta(moduleName).configure({ "source": chance().string() });
          handlerResult1 = { "source": chance().string() };
          handlerResult2 = { "source": chance().string() };
          handler1 = sinon.stub().returns(handlerResult1);
          handler2 = sinon.stub().returns(handlerResult2);
          name = chance().string();

          loader = { import: sinon.stub().returns(Promise.resolve(handler1)) };
          createPlugin();

          plugin.configure([{
            handler: name,
            ignore: {
              name: moduleName
            }
          }, handler2]);

          return act();
        });

        it("then the first handler is never called", () => {
          sinon.assert.notCalled(handler1);
        });

        it("then then first handler is never loaded by the module loader", () => {
          sinon.assert.notCalled(loader.import);
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
    });
  });
});
