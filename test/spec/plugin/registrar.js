import { expect } from "chai";
import chanceFactory from "chance";
import sinon from "sinon";
import Registrar from "../../../src/plugin/registrar";

var chance = chanceFactory();

describe("Plugin Registrar Test Suite", () => {
  var registrarMock, serviceName;

  describe("Given a Plugin Registrar with no options", () => {
    beforeEach(() => {
      registrarMock = new Registrar();
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

      sinon.spy(registrarMock, "registerPluginWithService");
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

      it("then the transform plugin is NOT called", () => {
        sinon.assert.notCalled(transformPlugin);
      });

      it("then the registrar should register the plugin with the service", () => {
        sinon.assert.calledOnce(registrarMock.registerPluginWithService)
      });
    });

    describe("and registering two separate transform plugins", () => {
      beforeEach(() => {
        var pluginName = chance.string();

        registrarMock.configurePlugin(pluginName, {
          transform: transformPlugin
        });

        registrarMock.configurePlugin(pluginName, {
          transform: sinon.spy()
        });
      });

      it("then the transform service is called to register the plugin", () => {
        sinon.assert.calledOnce(transformService);
      });

      it("then the trasform service is called to register a function", () => {
        sinon.assert.calledWith(transformService, sinon.match.func);
      });

      it("then there are two registered transforms", () => {
        var plugins = registrarMock.getPlugins();
        var plugin = plugins[0];
        expect(plugin.handlers["transform"]).to.have.lengthOf(2);
      });

      it("then the registrar should register the plugin with the service", () => {
        sinon.assert.calledOnce(registrarMock.registerPluginWithService)
      });
    });

    describe("and registering a transform plugin via a function and the plugin builder", () => {
      var pluginCallback;

      beforeEach(() => {
        pluginCallback = sinon.spy((builder) => builder.configure({
          transform: transformPlugin
        }));

        registrarMock.configurePlugin(chance.string(), pluginCallback);
      });

      it("then the transform service is called to register the plugin", () => {
        sinon.assert.calledOnce(transformService);
      });

      it("then the trasform service is called to register a function", () => {
        sinon.assert.calledWith(transformService, sinon.match.func);
      });

      it("then the plugin callback function is called", () => {
        sinon.assert.calledOnce(pluginCallback);
      })
    });
  });
});
