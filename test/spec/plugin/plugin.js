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
      registrarMock.services = [serviceName];
      createPlugin();
    });

    describe("and configuring it with one string handler", () => {
      beforeEach(() => {
        pluginOptions = {
          [serviceName]: {
            handler: sinon.stub(),
            id: chance.string()
          }
        };

        configurePlugin();
      });

      describe("and serializing the plugin", () => {
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
          expect(result).to.have.nested.property(`${serviceName}[0].handler`, pluginOptions[serviceName].handler);
        });

        it("then the id is the configured string", () => {
          expect(result).to.have.nested.property(`${serviceName}[0].id`, pluginOptions[serviceName].id);
        });
      });
    });

    describe("and configuring it with one function handler, ignore rules, match rules, and options", () => {
      var handlerOption;

      beforeEach(() => {
        handlerOption = chance.string();

        pluginOptions = {
          [serviceName]: {
            id: chance.string(),
            handler: () => {},
            options: {
              rounders: handlerOption
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
              id: pluginOptions[serviceName].id,
              handler: pluginOptions[serviceName].handler,
              options: {
                rounders: handlerOption
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
        registrarMock.services = ["transform"];

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
});
