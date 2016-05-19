import { expect } from "chai";
import chanceFactory from "chance";
import Registrar from "src/plugin/registrar";

var chance = chanceFactory();

describe("Plugin Registrar Test Suite", () => {
  var registrarMock;

  describe("When creating a Plugin Registrar with no options", () => {
    beforeEach(() => {
      registrarMock = new Registrar();
    });

    describe("and configuring a `transform` plugin", () => {
      var act;

      beforeEach(() => {
        act = () => {
          registrarMock.configureManager(chance.string(), {
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
        registrarMock.configureManager(chance.string(), {
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
        serviceName = chance.string();

        act = () => {
          registrarMock.configureManager(chance.string(), {
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
