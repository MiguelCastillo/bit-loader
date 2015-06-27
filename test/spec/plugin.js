define(["dist/bit-loader"], function(Bitloader) {
  var matcher = Bitloader.Rule.matcher;

  describe("Plugin Test Suite", function() {
    var bitloader;

    describe("When creating an anonymous puglin", function() {
      var plugin;
      beforeEach(function() {
        plugin = new Bitloader.Plugin();
      });

      it("then `plugin` is an instance of `Plugin`", function() {
        expect(plugin).to.be.an.instanceof(Bitloader.Plugin);
      });

      describe("and adding a rule calling `addMatchingRule'", function() {
        var matchingRules, ruleName;
        beforeEach(function() {
          ruleName = "test";
          matchingRules = [matcher.extension("js"), matcher.string("1.js")];
          plugin.addMatchingRules(ruleName, matchingRules);
        });

        it("then `rules` are added to the plugin", function() {
          expect(plugin._matches[ruleName]).to.be.an.instanceof(Bitloader.Rule);
        });
      });
    });


    describe("When creating a plugin with name `testName`", function() {
      var plugin, pluginName;
      beforeEach(function() {
        pluginName = "testName";
        plugin = new Bitloader.Plugin(pluginName);
      });

      describe("and adding a service with `addService`", function() {
        var services, transformHandlerStub, dependencyHandlerStub, transformStub, dependencyStub;

        beforeEach(function() {
          transformHandlerStub = sinon.stub();
          dependencyHandlerStub = sinon.stub();
          transformStub = sinon.stub();
          dependencyStub = sinon.stub();

          services = {
            "transform": {
              use: transformStub
            },
            "dependency": {
              use: dependencyStub
            }
          };

          plugin
            .addService("transform", services.transform)
            .addService("dependency", services.dependency)
            .addHandlers("transform", transformHandlerStub)
            .addHandlers("dependency", dependencyHandlerStub);
        });

        it("then plugin delegate handler is registered `transform` service", function() {
          sinon.assert.calledWith(transformStub, sinon.match({name: pluginName}));
        });

        it("then plugin delegate handler is registered `dependency` service", function() {
          sinon.assert.calledWith(dependencyStub, sinon.match({name: pluginName}));
        });
      });
    });


    describe("When creating a plugin with services", function() {
      var plugin, pluginName, services, transformStub, dependencyStub;
      beforeEach(function() {
        pluginName = "testName";
        transformStub = sinon.stub();
        dependencyStub = sinon.stub();

        services = {
          "transform": {
            use: transformStub
          },
          "dependency": {
            use: dependencyStub
          }
        };

        plugin = new Bitloader.Plugin(pluginName, {services: services});
      });


      describe("and adding a single function handler calling `addHandlers'", function() {
        var handlerStub;
        beforeEach(function() {
          handlerStub = sinon.stub();
          plugin.addHandlers("transform", handlerStub);
        });

        it("then plugin delegate handler is registered `transform` service", function() {
          expect(transformStub.calledWith(sinon.match({name: pluginName}))).to.equal(true);
        });

        it("then plugin delegate handler is NOT registered for `dependency` service", function() {
          expect(dependencyStub.called).to.equal(false);
        });

        it("then expect plugin handlers to be an `array`", function() {
          expect(plugin._handlers.transform).to.be.an("array");
        });

        it("then there is only one plugin handler", function() {
          expect(plugin._handlers.transform.length).to.equal(1);
        });

        it("then expect plugin handlers `array` to contain the handler regsitered", function() {
          expect(plugin._handlers.transform[0].handler === handlerStub).to.equal(true);
        });
      });


      describe("and adding 2 function handlers calling `addHandlers'", function() {
        var handlerStub1, handlerStub2;
        beforeEach(function() {
          handlerStub1 = sinon.stub();
          handlerStub2 = sinon.stub();
          plugin.addHandlers("transform", handlerStub1);
          plugin.addHandlers("transform", handlerStub2);
        });

        it("then plugin delegate handler is registered `transform` service only once", function() {
          expect(transformStub.callCount).to.equal(1);
        });

        it("then plugin delegate handler is registered `transform` service", function() {
          expect(transformStub.calledWith(sinon.match({name: pluginName}))).to.equal(true);
        });

        it("then expect plugin handlers to be an `array`", function() {
          expect(plugin._handlers.transform).to.be.an("array");
        });

        it("then there are two plugin handler", function() {
          expect(plugin._handlers.transform.length).to.equal(2);
        });

        it("then plugin handlers `array` contain the first handler registered", function() {
          expect(plugin._handlers.transform[0].handler === handlerStub1).to.equal(true);
        });

        it("then plugin handlers `array` contain the second handler regsitered", function() {
          expect(plugin._handlers.transform[1].handler === handlerStub2).to.equal(true);
        });
      });


      describe("and adding an array of two function handlers calling `addHandlers'", function() {
        var handlerStub1, handlerStub2;
        beforeEach(function() {
          handlerStub1 = sinon.stub();
          handlerStub2 = sinon.stub();
          plugin.addHandlers("transform", [handlerStub1, handlerStub2]);
        });

        it("then plugin delegate handler is registered `transform` service only once", function() {
          expect(transformStub.callCount).to.equal(1);
        });

        it("then plugin delegate handler is registered `transform` service", function() {
          expect(transformStub.calledWith(sinon.match({name: pluginName}))).to.equal(true);
        });

        it("then expect plugin handlers to be an `array`", function() {
          expect(plugin._handlers.transform).to.be.an("array");
        });

        it("then there is only one plugin handler", function() {
          expect(plugin._handlers.transform.length).to.equal(2);
        });

        it("then plugin handlers `array` to contains the first handler registered", function() {
          expect(plugin._handlers.transform[0].handler === handlerStub1).to.equal(true);
        });

        it("then plugin handlers `array` to contains the second handler regsitered", function() {
          expect(plugin._handlers.transform[1].handler === handlerStub2).to.equal(true);
        });
      });


      describe("and adding a NULL as a handler calling `addHandlers'", function() {
        var handlerStub, addHandlersSpy;
        beforeEach(function() {
          handlerStub = sinon.stub();
          addHandlersSpy = sinon.spy(plugin, "addHandlers");

          try {
            plugin.addHandlers("transform", [null, handlerStub]);
          }
          catch(ex) {
          }
        });

        it("then plugin delegate handler is registered `transform` service only once", function() {
          expect(transformStub.called).to.equal(false);
        });

        it("then plugin handlers to be an `array`", function() {
          expect(plugin._handlers.transform).to.be.an("undefined");
        });

        it("then an exception to be thrown of type `TypeError`", function() {
          expect(addHandlersSpy.exceptions[0]).to.an.instanceof(TypeError);
        });

        it("then an exception to be thrown", function() {
          expect(addHandlersSpy.exceptions[0].toString()).to.equal(TypeError("Plugin handler must be a string, a function, or an object with a handler that is a string or a function").toString());
        });
      });

    });


    describe("When adding an array of two handlers with options calling `addHandlers' and running the processing `pipelines`", function() {
      var handlerStub1, handlerStub2, handlerStub1Options, handlerStub2Options, moduleMeta, plugin;
      beforeEach(function() {
        bitloader = new Bitloader();
        moduleMeta = new Bitloader.Module.Meta({
          name: "name",
          source: ""
        });

        handlerStub1Options = {name: "dracular is pretty crazy"};
        handlerStub2Options = {args: "pass it back"};
        handlerStub1 = sinon.stub();
        handlerStub2 = sinon.stub();

        plugin = bitloader.plugin().addHandlers("transform", [
          {
            handler: handlerStub1,
            options: handlerStub1Options
          }, {
            handler: handlerStub2,
            options: handlerStub2Options
          }
        ]);

        return bitloader.providers.loader.runPipeline(moduleMeta);
      });


      it("then expect plugin handlers to be an `array`", function() {
        expect(plugin._handlers.transform).to.be.an("array");
      });

      it("then there is only one plugin handler", function() {
        expect(plugin._handlers.transform.length).to.equal(2);
      });

      it("then plugin handler 1 is called once", function() {
        expect(handlerStub1.callCount).to.equal(1);
      });

      it("then plugin handler 1 is called with the appropriate module meta and options", function() {
        expect(handlerStub1.calledWithExactly(moduleMeta, handlerStub1Options)).to.equal(true);
      });

      it("then plugin handler 2 is called once", function() {
        expect(handlerStub2.callCount).to.equal(1);
      });

      it("then plugin handler 2 is called with the appropriate module meta and options", function() {
        expect(handlerStub2.calledWithExactly(moduleMeta, handlerStub2Options)).to.equal(true);
      });
    });


    describe("When registering a single `transform` plugin with invalid handler", function() {
      var pluginSpy;
      beforeEach(function() {
        bitloader = new Bitloader();
        pluginSpy = sinon.spy(bitloader, "plugin");

        try {
          bitloader.plugin({
            "transform": {
              handler: true
            }
          });
        }
        catch(ex) {
        }
      });

      it("then an exception to be thrown of type `TypeError`", function() {
        expect(pluginSpy.exceptions[0]).to.an.instanceof(TypeError);
      });

      it("then an exception to be thrown", function() {
        expect(pluginSpy.exceptions[0].toString()).to.equal(TypeError("Plugin handler must be a function or a string").toString());
      });
    });


    describe("When registering a single `transform` plugin and running the processing `pipeline`", function() {
      var transformStub, moduleMeta;
      beforeEach(function() {
        bitloader = new Bitloader();
        moduleMeta = new Bitloader.Module.Meta({
          "name": "name",
          "source": ""
        });

        transformStub = sinon.stub();

        bitloader.plugin({
          "transform": transformStub
        });

        return bitloader.providers.loader.runPipeline(moduleMeta);
      });

      it("then the `transform` plugin is called", function() {
        expect(transformStub.callCount).to.equal(1);
      });

      it("then the `dependency` handler is called with the appropriate module meta object", function() {
        expect(transformStub.calledWithExactly(moduleMeta, undefined)).to.equal(true);
      });
    });


    describe("When registering a single `dependency` plugin and running the processing pipeline", function() {
      var dependencyStub, moduleMeta;
      beforeEach(function() {
        bitloader = new Bitloader();
        moduleMeta = new Bitloader.Module.Meta({
          "name": "name",
          "source": ""
        });

        dependencyStub = sinon.stub();

        bitloader.plugin({
          "dependency": dependencyStub
        });

        return bitloader.providers.loader.runPipeline(moduleMeta);
      });

      it("then the `dependency` handler is called once", function() {
        expect(dependencyStub.callCount).to.equal(1);
      });

      it("then the `dependency` handler is called with the appropriate module meta object", function() {
        expect(dependencyStub.calledWithExactly(moduleMeta, undefined)).to.equal(true);
      });
    });


    describe("When registering a `resolve`, `fetch`, `transform`, `dependency`, and `compile` plugin and running the processing `pipeline`", function() {
      var resolveStub, fetchStub, transformStub, dependencyStub, compileStub, moduleMeta;
      beforeEach(function() {
        bitloader  = new Bitloader();
        moduleMeta = new Bitloader.Module.Meta({
          "name": "name"
        });

        resolveStub    = sinon.spy(function(moduleMeta) {moduleMeta.path = "some path";});
        fetchStub      = sinon.spy(function(moduleMeta) {moduleMeta.source = "some source";});
        transformStub  = sinon.spy(function(moduleMeta) {moduleMeta.source = "transformed source";});
        dependencyStub = sinon.spy(function(moduleMeta) {moduleMeta.deps = [];});
        compileStub    = sinon.spy(function(moduleMeta) {moduleMeta.code = "compiled code";});

        var pluginDefinition = {
          "resolve":    resolveStub,
          "fetch":      fetchStub,
          "transform":  transformStub,
          "dependency": dependencyStub,
          "compile":    compileStub
        };

        bitloader.plugin(pluginDefinition);
        return bitloader.providers.loader.runPipeline(moduleMeta);
      });

      it("then the `resolve` handler is called once", function() {
        expect(resolveStub.callCount).to.equal(1);
      });

      it("then then `resolve` handler is called with appropriate module meta", function(){
        expect(resolveStub.calledWithExactly(moduleMeta, undefined)).to.equal(true);
      });

      it("then the `fetch` handler is called once", function() {
        expect(fetchStub.callCount).to.equal(1);
      });

      it("then then `fetch` handler is called with appropriate module meta", function(){
        expect(fetchStub.calledWithExactly(moduleMeta, undefined)).to.equal(true);
      });

      it("then the `transform` handler is called once", function() {
        expect(transformStub.callCount).to.equal(1);
      });

      it("then then `transform` handler is called with appropriate module meta", function(){
        expect(transformStub.calledWithExactly(moduleMeta, undefined)).to.equal(true);
      });

      it("then the `dependency` handler is called once", function() {
        expect(dependencyStub.callCount).to.equal(1);
      });

      it("then then `dependency` handler is called with appropriate module meta", function(){
        expect(dependencyStub.calledWithExactly(moduleMeta, undefined)).to.equal(true);
      });

      it("then the `compile` handler is called once", function() {
        expect(compileStub.callCount).to.equal(1);
      });

      it("then then `compile` handler is called with appropriate module meta", function(){
        expect(compileStub.calledWithExactly(moduleMeta, undefined)).to.equal(true);
      });
    });


    describe("When registering a plugin with multiple `resolve`, `fetch`, `transform`, `dependency`, and `compile` handlers and match path pattern and running the processing `pipeline`", function() {
      var resolveStub1, fetchStub1, fetchStub2, transformStub1, transformStub2, transformStub3, dependencyStub1, dependencyStub2, compileStub1, compileStub2, moduleMeta, transformStub1Options, transformStub2Options;
      beforeEach(function() {
        bitloader = new Bitloader();
        moduleMeta = new Bitloader.Module.Meta({
          "name": "name"
        });

        transformStub1Options = {"some data": "for the win"};
        transformStub2Options = {"race": 1};
        resolveStub1    = sinon.spy(function(moduleMeta){moduleMeta.path = "test.js";});
        fetchStub1      = sinon.spy(function(moduleMeta){moduleMeta.source = "fetch 1";});
        fetchStub2      = sinon.spy(function(moduleMeta){moduleMeta.source = "fetch 2";});
        transformStub1  = sinon.spy(function(moduleMeta){moduleMeta.source = "transform 1";});
        transformStub2  = sinon.spy(function(moduleMeta){moduleMeta.source = "transform 2";});
        transformStub3  = sinon.spy(function(moduleMeta){moduleMeta.source = "transform 3";});
        dependencyStub1 = sinon.spy(function(moduleMeta){moduleMeta.deps = [];});
        dependencyStub2 = sinon.spy(function(moduleMeta){moduleMeta.deps = [];});
        compileStub1    = sinon.spy(function(moduleMeta){moduleMeta.code = "compile 1";});
        compileStub2    = sinon.spy(function(moduleMeta){moduleMeta.code = "compile 2";});

        bitloader.plugin({
          "match": {
            "path": [matcher.extension("js")]
          },
          "resolve": [resolveStub1],
          "fetch": [
            fetchStub1, fetchStub2
          ],
          "transform": [
            {
              handler: transformStub1,
              options: transformStub1Options
            }, {
              handler: transformStub2,
              options: transformStub2Options
            }
          ],
          "dependency": dependencyStub1,
          "compile": [compileStub1]
        });

        bitloader.plugin({
          "match": {
            "path": [matcher.extension("jsx")]
          },
          "transform": transformStub3,
          "dependency": dependencyStub2,
          "compile": compileStub2
        });

        return bitloader.providers.loader.runPipeline(moduleMeta);
      });

      it("then the `resolve` handler1 is called for pattern **/*.js", function() {
        expect(resolveStub1.callCount).to.equal(1);
      });

      it("then the `resolve` handler1 is called for pattern **/*.js with the appropriate module meta and options", function() {
        expect(resolveStub1.calledWithExactly(moduleMeta, undefined)).to.equal(true);
      });

      it("then the `fetch` handler1 is called for pattern **/*.js", function() {
        expect(fetchStub1.callCount).to.equal(1);
      });

      it("then the `fetch` handler1 is called for pattern **/*.js with the appropriate module meta and options", function() {
        expect(fetchStub1.calledWithExactly(moduleMeta, undefined)).to.equal(true);
      });

      it("then the `fetch` handler2 is called for pattern **/*.js", function() {
        expect(fetchStub2.callCount).to.equal(1);
      });

      it("then the `fetch` handler2 is called for pattern **/*.js with the appropriate module meta and options", function() {
        expect(fetchStub2.calledWithExactly(moduleMeta, undefined)).to.equal(true);
      });

      it("then the `transform` handler1 is called for pattern **/*.js", function() {
        expect(transformStub1.callCount).to.equal(1);
      });

      it("then the `transform` handler1 is called for pattern **/*.js with the appropriate module meta and options", function() {
        expect(transformStub1.calledWithExactly(moduleMeta, transformStub1Options)).to.equal(true);
      });

      it("then the `transform` handler2 is called for pattern **/*.js", function() {
        expect(transformStub2.callCount).to.equal(1);
      });

      it("then the `transform` handler2 is called for pattern **/*.js with the appropriate module meta and options", function() {
        expect(transformStub2.calledWithExactly(moduleMeta, transformStub2Options)).to.equal(true);
      });

      it("then the `dependency` handler1 is called for pattern **/*.js", function() {
        expect(dependencyStub1.callCount).to.equal(1);
      });

      it("then the `dependency` handler1 is called for pattern **/*.js with the appropriate module meta", function() {
        expect(dependencyStub1.calledWithExactly(moduleMeta, undefined)).to.equal(true);
      });

      it("then the `compile` handler1 is called for pattern **/*.js", function() {
        expect(compileStub1.callCount).to.equal(1);
      });

      it("then the `compile` handler1 is called for pattern **/*.js with the appropriate module meta and options", function() {
        expect(compileStub1.calledWithExactly(moduleMeta, undefined)).to.equal(true);
      });

      it("then the `transform` handler3 is NOT called for pattern **/*.jsx", function() {
        expect(transformStub3.called).to.equal(false);
      });

      it("then the `dependency` handler2 is NOT called for pattern **/*.jsx", function() {
        expect(dependencyStub2.called).to.equal(false);
      });

      it("then the `compile` handler2 is NOT called for pattern **/*.jsx", function() {
        expect(compileStub2.called).to.equal(false);
      });
    });


    describe("When registering a named plugin for `transform` and `dependency` and running the processing `pipeline`", function() {
      var moduleMeta, transformStub, dependencyStub;
      beforeEach(function() {
        bitloader = new Bitloader();
        moduleMeta = new Bitloader.Module.Meta({
          "name": "name",
          "source": ""
        });

        transformStub = sinon.stub();
        dependencyStub = sinon.stub();

        bitloader.plugin("myplugin", {
          "transform": transformStub,
          "dependency": dependencyStub
        });

        return bitloader.providers.loader.runPipeline(moduleMeta);
      });

      it("then the `transform` plugin is called", function() {
        expect(transformStub.callCount).to.equal(1);
      });

      it("then the `dependency` plugin is called", function() {
        expect(dependencyStub.callCount).to.equal(1);
      });
    });


    describe("When registering plugin `less` for `transform` and running the processing `pipeline`", function() {
      var moduleMeta, lessTransformStub1, lessTransformStub2, textTransformStub;
      beforeEach(function() {
        bitloader = new Bitloader();
        moduleMeta = new Bitloader.Module.Meta({
          "name": "name",
          "source": "",
          "plugins": ["less"]
        });

        lessTransformStub1 = sinon.stub();
        lessTransformStub2 = sinon.stub();
        textTransformStub  = sinon.stub();

        bitloader.plugin("less", {
          "transform": [lessTransformStub1, lessTransformStub2]
        });

        bitloader.plugin("text", {
          "transform": textTransformStub
        });

        return bitloader.providers.loader.runPipeline(moduleMeta);
      });

      it("then the `less` plugin handler1 for `transform` is called", function() {
        expect(lessTransformStub1.callCount).to.equal(1);
      });

      it("then the `less` plugin handler2 for `transform` is called", function() {
        expect(lessTransformStub2.callCount).to.equal(1);
      });

      it("then the `text` plugin for `transform` is NOT called", function() {
        expect(textTransformStub.called).to.equal(false);
      });
    });


    describe("When registering a `less` plugin for `transform` and importing a module", function() {
      var lessTransformStub1, lessTransformStub2, resolveStub, fetchStub, compileStub, moduleMeta;
      beforeEach(function() {
        moduleMeta = new Bitloader.Module.Meta({
          "name": "test",
          "plugins": ["less"],
          "source":""
        });

        resolveStub = sinon.stub().returns(moduleMeta);
        fetchStub = sinon.stub();
        compileStub = sinon.stub().returns({code: "whatever"});
        lessTransformStub1 = sinon.stub();
        lessTransformStub2 = sinon.stub();

        bitloader = new Bitloader({
          resolve: resolveStub,
          fetch: fetchStub,
          compile: compileStub
        });

        bitloader.plugin("less", {
          "transform": [lessTransformStub1]
        });

        bitloader.plugin("css", {
          "transform": [lessTransformStub2]
        });

        return bitloader.import("less!test.less");
      });

      it("then the `less` plugin handler1 for `transform` is called", function() {
        expect(lessTransformStub1.callCount).to.equal(1);
      });

      it("then the `less` plugin handler1 for `transform` is called with the appropriate module meta", function() {
        expect(lessTransformStub1.calledWith(sinon.match(moduleMeta))).to.equal(true);
      });

      it("then the `less` plugin handler2 for `transform` is NOT called", function() {
        expect(lessTransformStub2.called).to.equal(false);
      });
    });


    describe("When registering a plugin named `less` for `transform` and `dependency` and running the processing `pipeline`", function() {
      var lessTransformStub, lessDependencyStub, textTransformStub, textDependencyStub, moduleMeta;
      beforeEach(function() {
        bitloader = new Bitloader();
        moduleMeta = new Bitloader.Module.Meta({
          "name": "name",
          "source": "",
          "plugins": ["less"]
        });

        lessTransformStub  = sinon.stub();
        lessDependencyStub = sinon.stub();
        textTransformStub  = sinon.stub();
        textDependencyStub = sinon.stub();

        bitloader.plugin("less", {
          "transform": lessTransformStub,
          "dependency": lessDependencyStub
        });

        bitloader.plugin("text", {
          "transform": textTransformStub,
          "dependency": textDependencyStub
        });

        return bitloader.providers.loader.runPipeline(moduleMeta);
      });

      it("then the `less` plugin for `transform` is called", function() {
        expect(lessTransformStub.callCount).to.equal(1);
      });

      it("then the `less` plugin for `transform` is called with the appropriate module meta", function() {
        expect(lessTransformStub.calledWithExactly(moduleMeta, undefined)).to.equal(true);
      });

      it("then the `less` plugin for `dependency` is called", function() {
        expect(lessDependencyStub.callCount).to.equal(1);
      });

      it("then the `less` plugin for `dependency` is called with the appropriate module meta", function() {
        expect(lessDependencyStub.calledWithExactly(moduleMeta, undefined)).to.equal(true);
      });

      it("then the `text` plugin for `transform` is NOT called", function() {
        expect(textTransformStub.called).to.equal(false);
      });

      it("then the `text` plugin for `dependency` is NOT called", function() {
        expect(textDependencyStub.called).to.equal(false);
      });
    });


    describe("When registering a plugin for a pipeline that does not exist and running the processing `pipeline`", function() {
      var moduleMeta, tranformStub, bitloaderSpy;
      beforeEach(function() {
        bitloader = new Bitloader();
        moduleMeta = new Bitloader.Module.Meta({
          "name": "name",
          "source": ""
        });

        tranformStub = sinon.stub();
        bitloaderSpy = sinon.spy(bitloader, "plugin");

        try {
          bitloader.plugin({
            "tranform": tranformStub
          });
        }
        catch(e) {
        }

        return bitloader.providers.loader.runPipeline(moduleMeta);
      });

      it("then an exception is thrown", function() {
        expect(bitloaderSpy.threw()).to.equal(true);
      });

      it("then the `transform` plugin is never called", function() {
        expect(tranformStub.called).to.equal(false);
      });
    });


    describe("When registering dynamic plugins with the `plugin` method", function() {
      var transformHandlers, ignoreSpy;
      beforeEach(function() {
        transformHandlers = ["test1", "test2"];

        bitloader = new Bitloader();
        ignoreSpy = sinon.spy(bitloader, "ignore");

        return new Promise(function(resolve) {
          bitloader
            .plugin()
            .on("added", resolve)
            .configure({
              transform: transformHandlers
            });
        });
      });

      it("then the `ignore` method is called", function() {
        expect(ignoreSpy.called).to.equal(true);
      });

      it("then the plugins are added to the ignore list", function() {
        sinon.assert.calledWith(ignoreSpy, transformHandlers);
      });
    });


    describe("When registering dynamic plugins with `addHandlers` and registering `added` events", function() {
      var transformHandlers, transformStub, eventHandlerStub, plugin, services;
      beforeEach(function() {
        transformHandlers = ["test1", "test2"];
        transformStub = sinon.stub();
        eventHandlerStub = sinon.stub();

        services = {
          "transform": {
            use: transformStub
          }
        };

        plugin = new Bitloader.Plugin("js", {services: services});

        return new Promise(function(resolve) {
          plugin
            .on("added", resolve)
            .on("added", eventHandlerStub)
            .addHandlers("transform", transformHandlers);
        });
      });

      it("then the event handler is called once", function() {
        sinon.assert.calledOnce(eventHandlerStub);
      });

      it("then the event handler is called with handler settings for `test1` and `test2`", function() {
        sinon.assert.calledWith(eventHandlerStub, sinon.match([
          sinon.match({deferredName: "test1"}),
          sinon.match({deferredName: "test2"})
        ]));
      });
    });


    describe("When importing a plugin", function() {
      var plugin, pluginFactoryStub, loaderStub, transformServiceStub, importStub, transformHandlerStub, addedEventHandlerStub;

      beforeEach(function() {
        transformServiceStub = sinon.stub();
        transformHandlerStub = sinon.stub();
        importStub = sinon.stub();
        addedEventHandlerStub = sinon.stub();
        pluginFactoryStub = sinon.stub();

        pluginFactoryStub.returns({
          "transform": [transformHandlerStub, "transformHandler2"]
        });

        // Setup return
        importStub
          .withArgs("test-plugin")
          .returns(Promise.resolve(pluginFactoryStub));

        loaderStub = {
          important: importStub,
          services: {
            transform: {
              use: transformServiceStub
            }
          }
        };

        plugin = new Bitloader.Plugin("js-plugin", loaderStub);

        return new Promise(function(resolve) {
          plugin
            .on("added", resolve)
            .on("added", addedEventHandlerStub)
            .import("test-plugin");
        });
      });

      it("then `important` method is called once", function() {
        sinon.assert.calledOnce(importStub);
      });

      it("then `important` method is called with `test-plugin`", function() {
        sinon.assert.calledWithExactly(importStub, "test-plugin");
      });

      it("then the `added` event handler is called twice", function() {
        sinon.assert.calledTwice(addedEventHandlerStub);
      });

      it("then the `added` event handler is called with the plugin being loaded", function() {
        sinon.assert.calledWith(addedEventHandlerStub, [
          sinon.match({deferredName: "test-plugin"})
        ]);
      });

      it("then the `added` event handler is called with the plugin handlers", function() {
        sinon.assert.calledWith(addedEventHandlerStub, [
          sinon.match({handler: sinon.match.func}),
          sinon.match({deferredName: "transformHandler2"})
        ]);
      });

      it("then the handler is registered with the `transform` service", function() {
        sinon.assert.calledWith(transformServiceStub, sinon.match({name: "js-plugin", handler: sinon.match.func}));
      });

      it("then the `pluginFactory` is called once", function() {
        sinon.assert.calledOnce(pluginFactoryStub);
      });

      it("then the `pluginFactory` is called with the corresponding plugin", function() {
        sinon.assert.calledWithExactly(pluginFactoryStub, sinon.match.object, plugin);
      });
    });

  });
});
