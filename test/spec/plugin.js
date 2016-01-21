import { expect } from "chai";
import chance from "chance";
import Bitloader from "src/bit-loader";
import Plugin from "src/plugin";
import Module from "src/module";

describe("Plugin Test Suite", () => {
  describe("When creating a Plugin instance", () => {
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

      describe("with data a random string", () => {
        beforeEach(() => {
          data = chance().string();
          return act();
        });

        it("then result is equal to the input", () => {
          expect(result).to.equal(data);
        });
      });

      describe("with one registered handler", () => {
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

        it("then result is not the same reference as what input", () => {
          expect(result).to.not.equal(handlerResult);
        });

        it("then result is returned from the handler", () => {
          expect(result).to.include(handlerResult);
        });
      });

      describe("with two registered handlers", () => {
        var handler1, handler2, handlerResult1, handlerResult2;

        beforeEach(() => {
          data = new Module.Meta("modulename").configure({ "source": chance().string() });
          handlerResult1 = { "source": chance().string() };
          handlerResult2 = { "source": chance().string() };
          handler1 = sinon.stub().returns(handlerResult1);
          handler2 = sinon.stub().returns(handlerResult2);
          plugin.configure([handler1, handler2]);
          return act();
        });

        it("then handler1 is called once", () => {
          sinon.assert.calledOnce(handler1);
        });

        it("then handler1 was called with initial data", () => {
          sinon.assert.calledWith(handler1, data);
        });

        it("then handler2 is called once", () => {
          sinon.assert.calledOnce(handler2);
        });

        it("then handler2 was called with result from handler1", () => {
          sinon.assert.calledWith(handler2, sinon.match(handlerResult1));
        });

        it("then the final result is the output from handler2", () => {
          expect(result).to.include(handlerResult2);
        });
      });

      describe("with two registered handlers and the first has an ignore matching rule", () => {
        var handler1, handler2, handlerResult1, handlerResult2;

        beforeEach(() => {
          data = new Module.Meta("modulename").configure({ "source": chance().string() });
          handlerResult1 = { "source": chance().string() };
          handlerResult2 = { "source": chance().string() };
          handler1 = sinon.stub().returns(handlerResult1);
          handler2 = sinon.stub().returns(handlerResult2);
          plugin.configure([{
            handler: handler1,
            ignore: {
              name: "modulename"
            }
          }, handler2]);
          return act();
        });

        it("then handler1 is never called", () => {
          sinon.assert.notCalled(handler1);
        });

        it("then handler2 is called once", () => {
          sinon.assert.calledOnce(handler2);
        });

        it("then handler2 was called with the initial data", () => {
          sinon.assert.calledWith(handler2, sinon.match(data));
        });

        it("then the final result is the output from handler2", () => {
          expect(result).to.include(handlerResult2);
        });
      });
    });
  });
});
