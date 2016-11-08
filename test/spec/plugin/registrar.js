import { expect } from "chai";
import chanceFactory from "chance";
import Registrar from "src/plugin/registrar";

var chance = chanceFactory();

describe("Plugin Registrar Test Suite", () => {
  var registrarMock, serviceName;

  describe("Given a Plugin Registrar with no options", () => {
    beforeEach(() => {
      registrarMock = new Registrar();
      registrarMock.getServiceNames = sinon.stub().returns([serviceName]);
    });

    describe("and configuring a plugin", () => {
      var act;

      beforeEach(() => {
        act = () => {
          registrarMock.configurePlugin(chance.string(), {
            [serviceName]: () => {}
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
        registrarMock.configurePlugin(chance.string(), {
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

  });
});
