import { expect } from "chai";
import chanceFactory from "chance";
import Manager from "src/plugin/manager";

var chance = chanceFactory();

describe("Plugin Manager Test Suite", function() {
  var manager, managerSettings, createManager;

  beforeEach(() => {
    createManager = () => {
      manager = new Manager(managerSettings);
    };
  });

  describe("and creating a manager with an id and no context", () => {
    beforeEach(() => {
      managerSettings = {
        id: chance.string()
      };

      createManager();
    });

    it("then the instance of manager is of type Manager", () => {
      expect(manager).to.be.instanceof(Manager);
    });

    it("then the id is the value provided in the configuration", () => {
      expect(manager.id).to.equal(managerSettings.id);
    });

    it("then the context is the value provided in the configuration", () => {
      expect(manager.context).to.equal(managerSettings.context);
    });

    it("then the plugin container is empty", () => {
      expect(manager.plugins).to.be.empty;
    });

    it("then the plugin container is an object", () => {
      expect(manager.plugins).to.be.an("object");
    });

    describe("and calling configure", () => {
      var configureManager, configuration;

      beforeEach(() => {
        configureManager = () => {
          manager = manager.configure(configuration);
        };
      });

      describe("with an empty object", () => {
        beforeEach(() => {
          configuration = {};
          configureManager();
        });

        it("then the plugin container is empty", () => {
          expect(manager.plugins).to.be.empty;
        });
      });
    });
  });

  describe("and creating a manager with a context", () => {
    var managerContext, canExecuteStub, runPluginStub, getManagerStub, getPluginStub;

    beforeEach(() => {
      canExecuteStub = sinon.stub();
      runPluginStub = sinon.stub();
      getManagerStub = sinon.stub();
      getPluginStub = sinon.stub();

      managerContext = {
        configurePlugin: sinon.stub(),
        registerPluginWithService: sinon.stub(),
        getManager: getManagerStub.returns({
          canExecute: canExecuteStub.returns(true)
        }),
        getPlugin: getPluginStub.returns({
          run: runPluginStub
        })
      };

      managerSettings = {
        context: managerContext
      };

      createManager();
    });

    it("then manager has a context", () => {
      expect(manager.context).to.equal(managerContext);
    });

    it("then the plugin container is empty", () => {
      expect(manager.plugins).to.be.empty;
    });

    describe("and registering a plugin", () => {
      var pluginConfiguration;

      beforeEach(() => {
        pluginConfiguration = {
          transform: sinon.stub()
        };

        manager = manager.configure(pluginConfiguration);
      });

      it("then the plugin container has one item", () => {
        expect(Object.keys(manager.plugins)).to.have.lengthOf(1);
      });

      it("then configurePlugin is called once", () => {
        sinon.assert.calledOnce(managerContext.configurePlugin);
      });

      it("then registerPluginWithService is called once", () => {
        sinon.assert.calledOnce(managerContext.registerPluginWithService);
      });

      describe("and calling the registered plugin with some data", () => {
        var data;

        beforeEach(() => {
          data = {
            source: chance.string()
          };

          var deferreds = Object
            .keys(manager.plugins)
            .map((k) => Manager.pluginRunner(manager, k)(data));

          return Promise.all(deferreds);
        });

        it("then getManager is called once", () => {
          sinon.assert.calledOnce(getManagerStub);
        });

        it("then canExecute is called once", () => {
          sinon.assert.calledWith(canExecuteStub, data);
        });

        it("then getPlugin is called twice", () => {
          sinon.assert.calledTwice(getPluginStub);
        });

        it("then run plugin is called once", () => {
          sinon.assert.calledWith(runPluginStub, data);
        });
      });
    });
  });
});
