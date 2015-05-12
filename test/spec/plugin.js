define(['dist/bit-loader'], function(Bitloader) {

  describe("Plugin Test Suite", function() {
    var bitloader;

    describe("When creating a puglin", function() {
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
          matchingRules = ["**.js", "1.js"];
          plugin.addMatchingRules(ruleName, matchingRules);
        });

        it("then `rules` are added to the plugin", function() {
          expect(plugin._matches[ruleName]).to.be.an.instanceof(Bitloader.RuleMatcher);
        });
      });
    });


    describe("When creating a plugin with services", function() {
      var plugin, pluginName, services, transformStub, dependencyStub;
      beforeEach(function() {
        transformStub = sinon.stub();
        dependencyStub = sinon.stub();
        pluginName = "testName";

        services = {
          'transform': {
            use: transformStub
          },
          'dependency': {
            use: dependencyStub
          }
        };

        plugin = new Bitloader.Plugin(pluginName, {services: services});
      });


      describe("and adding a single function handler calling `addHandlers'", function() {
        var handlerStub;
        beforeEach(function() {
          handlerStub = sinon.stub();
          plugin.addHandlers('transform', handlerStub);
        });

        it("then plugin delegate handler is registered `transform` service", function() {
          expect(transformStub.calledWith(sinon.match({name: pluginName}))).to.equal(true);
        });

        it("then plugin delegate handler is NOT registered for `dependency` service", function() {
          expect(dependencyStub.called).to.equal(false);
        });

        it("then expect plugin handlers to be an `array`", function() {
          expect(plugin._handlers.transform).to.be.an('array');
        });

        it("then there is only one plugin handler", function() {
          expect(plugin._handlers.transform.length).to.equal(1);
        });

        it("then expect plugin handlers `array` to contain the handler regsitered", function() {
          expect(plugin._handlers.transform[0].handler === handlerStub).to.equal(true);
        });
      });


      describe("and adding function handlers calling `addHandlers'", function() {
        var handlerStub1, handlerStub2;
        beforeEach(function() {
          handlerStub1 = sinon.stub();
          handlerStub2 = sinon.stub();
          plugin.addHandlers('transform', handlerStub1);
          plugin.addHandlers('transform', handlerStub2);
        });

        it("then plugin delegate handler is registered `transform` service only once", function() {
          expect(transformStub.calledOnce).to.equal(true);
        });

        it("then plugin delegate handler is registered `transform` service", function() {
          expect(transformStub.calledWith(sinon.match({name: pluginName}))).to.equal(true);
        });

        it("then expect plugin handlers to be an `array`", function() {
          expect(plugin._handlers.transform).to.be.an('array');
        });

        it("then there is only one plugin handler", function() {
          expect(plugin._handlers.transform.length).to.equal(1);
        });

        it("then expect plugin handlers `array` to NOT contain the first handler registered", function() {
          expect(plugin._handlers.transform[0].handler === handlerStub1).to.equal(false);
        });

        it("then expect plugin handlers `array` to contain the second handler regsitered", function() {
          expect(plugin._handlers.transform[0].handler === handlerStub2).to.equal(true);
        });
      });


      describe("and adding an array of two function handlers calling `addHandlers'", function() {
        var handlerStub1, handlerStub2;
        beforeEach(function() {
          handlerStub1 = sinon.stub();
          handlerStub2 = sinon.stub();
          plugin.addHandlers('transform', [handlerStub1, handlerStub2]);
        });

        it("then plugin delegate handler is registered `transform` service only once", function() {
          expect(transformStub.calledOnce).to.equal(true);
        });

        it("then plugin delegate handler is registered `transform` service", function() {
          expect(transformStub.calledWith(sinon.match({name: pluginName}))).to.equal(true);
        });

        it("then expect plugin handlers to be an `array`", function() {
          expect(plugin._handlers.transform).to.be.an('array');
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
            plugin.addHandlers('transform', [null, handlerStub]);
          }
          catch(ex) {
          }
        });

        it("then plugin delegate handler is registered `transform` service only once", function() {
          expect(transformStub.called).to.equal(false);
        });

        it("then plugin handlers to be an `array`", function() {
          expect(plugin._handlers.transform).to.be.an('undefined');
        });

        it("then an exception to be thrown of type `TypeError`", function() {
          expect(addHandlersSpy.exceptions[0]).to.an.instanceof(TypeError);
        });

        it("then an exception to be thrown", function() {
          expect(addHandlersSpy.exceptions[0].toString()).to.equal(TypeError('Plugin handler must be a string, a function, or an object with a handler that is a string or a function').toString());
        });
      });

    });


    describe("When adding an array of two handlers with options calling `addHandlers'", function() {
      var handlerStub1, handlerStub2, handlerStub1Options, handlerStub2Options, moduleMeta, plugin;
      beforeEach(function() {
        bitloader = new Bitloader();
        handlerStub1Options = {name: "dracular is pretty crazy"};
        handlerStub2Options = {args: "pass it back"};
        handlerStub1 = sinon.stub();
        handlerStub2 = sinon.stub();
        moduleMeta = {"source": ""};

        plugin = bitloader.plugin().addHandlers('transform', [
          {
            handler: handlerStub1,
            options: handlerStub1Options
          }, {
            handler: handlerStub2,
            options: handlerStub2Options
          }
        ]);

        return bitloader.providers.loader._pipelineModuleMeta(moduleMeta);
      });


      it("then expect plugin handlers to be an `array`", function() {
        expect(plugin._handlers.transform).to.be.an('array');
      });

      it("then there is only one plugin handler", function() {
        expect(plugin._handlers.transform.length).to.equal(2);
      });

      it("then plugin handler 1 is called once", function() {
        expect(handlerStub1.calledOnce).to.equal(true);
      });

      it("then plugin handler 1 is called with the appropriate module meta and options", function() {
        expect(handlerStub1.calledWithExactly(moduleMeta, handlerStub1Options)).to.equal(true);
      });

      it("then plugin handler 2 is called once", function() {
        expect(handlerStub2.calledOnce).to.equal(true);
      });

      it("then plugin handler 2 is called with the appropriate module meta and options", function() {
        expect(handlerStub2.calledWithExactly(moduleMeta, handlerStub2Options)).to.equal(true);
      });
    });


    describe("When registering a single `transform` plugin with invalid handler", function() {
      var moduleMeta, pluginSpy;
      beforeEach(function() {
        moduleMeta = {"source": ""};
        bitloader = new Bitloader();
        pluginSpy = sinon.spy(bitloader, 'plugin');

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
        expect(pluginSpy.exceptions[0].toString()).to.equal(TypeError('Plugin handler must be a function or a string').toString());
      });
    });


    describe("When registering a single `transform` plugin", function() {
      var transformStub, moduleMeta;
      beforeEach(function() {
        bitloader = new Bitloader();
        moduleMeta = {"source": ""};
        transformStub = sinon.stub();

        bitloader.plugin({
          "transform": transformStub
        });

        return bitloader.providers.loader._pipelineModuleMeta(moduleMeta);
      });

      it("then the `transform` plugin is called", function() {
        expect(transformStub.calledOnce).to.equal(true);
      });

      it("then the `dependency` handler is called with the appropriate module meta object", function() {
        expect(transformStub.calledWithExactly(moduleMeta, undefined)).to.equal(true);
      });
    });


    describe("When registering a single `dependency` plugin", function() {
      var dependencyStub, moduleMeta;
      beforeEach(function() {
        bitloader = new Bitloader();
        moduleMeta = {"source": ""};
        dependencyStub = sinon.stub();

        bitloader.plugin({
          "dependency": dependencyStub
        });

        return bitloader.providers.loader._pipelineModuleMeta(moduleMeta);
      });

      it("then the `dependency` handler is called once", function() {
        expect(dependencyStub.calledOnce).to.equal(true);
      });

      it("then the `dependency` handler is called with the appropriate module meta object", function() {
        expect(dependencyStub.calledWithExactly(moduleMeta, undefined)).to.equal(true);
      });
    });


    describe("When registering a `transform` and `dependency` plugin", function() {
      var transformStub, dependencyStub, moduleMeta;
      beforeEach(function() {
        bitloader = new Bitloader();
        moduleMeta = {"source":""};
        transformStub = sinon.stub();
        dependencyStub = sinon.stub();

        bitloader.plugin({
          "transform": transformStub,
          "dependency": dependencyStub
        });

        return bitloader.providers.loader._pipelineModuleMeta(moduleMeta);
      });

      it("then the `transform` plugin is called", function() {
        expect(transformStub.calledOnce).to.equal(true);
      });

      it("then then `transform` plugin is called with appropriate module meta", function(){
        expect(transformStub.calledWithExactly(moduleMeta, undefined)).to.equal(true);
      });

      it("then the `dependency` plugin is called", function() {
        expect(dependencyStub.calledOnce).to.equal(true);
      });

      it("then then `dependency` plugin is called with appropriate module meta", function(){
        expect(dependencyStub.calledWithExactly(moduleMeta, undefined)).to.equal(true);
      });
    });


    describe("When registering a `transform` and `dependency` plugin with multiple handlers and match path pattern", function() {
      var transformStub1, transformStub2, transformStub3, dependencyStub1, dependencyStub2, moduleMeta, transformStub1Options, transformStub2Options;
      beforeEach(function() {
        bitloader = new Bitloader();
        moduleMeta = {"path": "test.js", "source":""};
        transformStub1Options = {"some data": "for the win"};
        transformStub2Options = {"race": 1};
        transformStub1  = sinon.stub();
        transformStub2  = sinon.stub();
        transformStub3  = sinon.stub();
        dependencyStub1 = sinon.stub();
        dependencyStub2 = sinon.stub();

        bitloader.plugin({
          "match": {
            "path": ["**/*.js"]
          },
          "transform": [
            {
              handler: transformStub1,
              options: transformStub1Options
            }, {
              handler: transformStub2,
              options: transformStub2Options
            }
          ],
          "dependency": dependencyStub1
        });

        bitloader.plugin({
          "match": {
            "path": ["**/*.jsx"]
          },
          "transform": transformStub3,
          "dependency": dependencyStub2
        });

        return bitloader.providers.loader._pipelineModuleMeta(moduleMeta);
      });

      it("then the `transform` handler1 is called for pattern **/*.js", function() {
        expect(transformStub1.calledOnce).to.equal(true);
      });

      it("then the `transform` handler1 is called for pattern **/*.js with the appropriate module meta and options", function() {
        expect(transformStub1.calledWithExactly(moduleMeta, transformStub1Options)).to.equal(true);
      });

      it("then the `transform` handler2 is called for pattern **/*.js", function() {
        expect(transformStub2.calledOnce).to.equal(true);
      });

      it("then the `transform` handler2 is called for pattern **/*.js with the appropriate module meta and options", function() {
        expect(transformStub2.calledWithExactly(moduleMeta, transformStub2Options)).to.equal(true);
      });

      it("then the `dependency` handler1 is called for pattern **/*.js", function() {
        expect(dependencyStub1.calledOnce).to.equal(true);
      });

      it("then the `dependency` handler1 is called for pattern **/*.js with the appropriate module meta", function() {
        expect(dependencyStub1.calledWithExactly(moduleMeta, undefined)).to.equal(true);
      });

      it("then the `transform` handler3 is NOT called for pattern **/*.jsx", function() {
        expect(transformStub3.called).to.equal(false);
      });

      it("then the `dependency` handler2 is NOT called for pattern **/*.jsx", function() {
        expect(dependencyStub2.called).to.equal(false);
      });
    });


    describe("When registering a named plugin for `transform` and `dependency`", function() {
      var transformStub, dependencyStub;
      beforeEach(function() {
        bitloader = new Bitloader();
        transformStub = sinon.stub();
        dependencyStub = sinon.stub();

        bitloader.plugin("myplugin", {
          "transform": transformStub,
          "dependency": dependencyStub
        });

        return bitloader.providers.loader._pipelineModuleMeta({"source":""});
      });

      it("then the `transform` plugin is called", function() {
        expect(transformStub.calledOnce).to.equal(true);
      });

      it("then the `dependency` plugin is called", function() {
        expect(dependencyStub.calledOnce).to.equal(true);
      });
    });


    describe("When registering plugin `less` for `transform`", function() {
      var lessTransformStub1, lessTransformStub2, textTransformStub;
      beforeEach(function() {
        bitloader = new Bitloader();
        lessTransformStub1 = sinon.stub();
        lessTransformStub2 = sinon.stub();
        textTransformStub  = sinon.stub();

        bitloader.plugin("less", {
          "transform": [lessTransformStub1, lessTransformStub2]
        });

        bitloader.plugin("text", {
          "transform": textTransformStub
        });

        return bitloader.providers.loader._pipelineModuleMeta({"plugins": ["less"], "source":""});
      });

      it("then the `less` plugin handler1 for `transform` is called", function() {
        expect(lessTransformStub1.calledOnce).to.equal(true);
      });

      it("then the `less` plugin handler2 for `transform` is called", function() {
        expect(lessTransformStub2.calledOnce).to.equal(true);
      });

      it("then the `text` plugin for `transform` is NOT called", function() {
        expect(textTransformStub.called).to.equal(false);
      });
    });


    describe("When registering a `less` plugin for `transform` and importing a module", function() {
      var lessTransformStub1, lessTransformStub2, resolveStub, fetchStub, compileStub, moduleMeta, compiledModule;
      beforeEach(function() {
        moduleMeta = new Bitloader.Module.Meta({"name": "test", "plugins": ["less"], "source":""});
        compiledModule = new Bitloader.Module(moduleMeta);
        resolveStub = sinon.stub().returns(moduleMeta);
        fetchStub = sinon.stub();
        compileStub = sinon.stub().returns(compiledModule);
        lessTransformStub1 = sinon.stub();
        lessTransformStub2 = sinon.stub();

        bitloader = new Bitloader({}, {
          resolver: resolverFactory,
          fetcher: fetcherFactory,
          compiler: compilerFactory
        });

        bitloader.plugin("less", {
          "transform": [lessTransformStub1]
        });

        bitloader.plugin("css", {
          "transform": [lessTransformStub2]
        });

        function resolverFactory() {
          return {
            resolve: resolveStub
          };
        }

        function fetcherFactory() {
          return {
            fetch: fetchStub
          };
        }

        function compilerFactory() {
          return {
            compile: compileStub
          };
        }

        return bitloader.import("less!test.less");
      });

      it("then the `less` plugin handler1 for `transform` is called", function() {
        expect(lessTransformStub1.calledOnce).to.equal(true);
      });

      it("then the `less` plugin handler1 for `transform` is called with the appropriate module meta", function() {
        expect(lessTransformStub1.calledWith(sinon.match(moduleMeta))).to.equal(true);
      });

      it("then the `less` plugin handler2 for `transform` is NOT called", function() {
        expect(lessTransformStub2.called).to.equal(false);
      });
    });


    describe("When registering a plugin named `less` for `transform` and `dependency`", function() {
      var lessTransformStub, lessDependencyStub, textTransformStub, textDependencyStub, moduleMeta;
      beforeEach(function() {
        moduleMeta = {"plugins": ["less"], "source":""};
        bitloader = new Bitloader();
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

        return bitloader.providers.loader._pipelineModuleMeta(moduleMeta);
      });

      it("then the `less` plugin for `transform` is called", function() {
        expect(lessTransformStub.calledOnce).to.equal(true);
      });

      it("then the `less` plugin for `transform` is called with the appropriate module meta", function() {
        expect(lessTransformStub.calledWithExactly(moduleMeta, undefined)).to.equal(true);
      });

      it("then the `less` plugin for `dependency` is called", function() {
        expect(lessDependencyStub.calledOnce).to.equal(true);
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


    describe("When registering a plugin for a pipeline that does not exist", function() {
      var tranformStub, bitloaderSpy;
      beforeEach(function() {
        bitloader = new Bitloader();
        tranformStub = sinon.stub();
        bitloaderSpy = sinon.spy(bitloader, "plugin");

        try {
          bitloader.plugin({
            "tranform": tranformStub
          });
        }
        catch(e) {
        }

        return bitloader.providers.loader._pipelineModuleMeta({"source":""});
      });

      it("then an exception is thrown", function() {
        expect(bitloaderSpy.threw()).to.equal(true);
      });

      it("then the `transform` plugin is never called", function() {
        expect(tranformStub.called).to.equal(false);
      });
    });

  });

});
