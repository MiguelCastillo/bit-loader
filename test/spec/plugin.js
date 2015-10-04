define(["dist/bit-loader"], function(Bitloader) {
  var Plugin = Bitloader.Plugin;
  var Rule = Bitloader.Rule;
  var matcher = Rule.matcher;

  describe("Plugin Test Suite", function() {
    describe("When creating Plugin instances", function() {
      var plugin;

      beforeEach(function() {
        plugin = new Plugin();
      });

      it("then `plugin` is an instance of `Plugin`", function() {
        expect(plugin).to.be.an.instanceof(Plugin);
      });

      describe("and defining matching rules for `file` props with `js` extensions and `1.jsx` values", function() {
        var matchingRules, ruleName;

        beforeEach(function() {
          ruleName = "file";
          matchingRules = [matcher.extension("js"), matcher.string("1.jsx")];
          plugin.match(ruleName, matchingRules);
        });

        it("then `matches` rules are added to the plugin", function() {
          expect(plugin._matches[ruleName]).to.be.an.instanceof(Rule);
        });

        it("then plugin can execute `file: 1.jsx`", function() {
          expect(plugin.canExecute({"file": "1.jsx"})).to.equal(true);
        });

        it("then plugin can execute `file: 1.js`", function() {
          expect(plugin.canExecute({"file": "1.js"})).to.equal(true);
        });

        it("then plugin can NOT execute `file: 1.tjs`", function() {
          expect(plugin.canExecute({"file": "1.tjs"})).to.equal(false);
        });

        it("then plugin can NOT execute `odd: 3.134`", function() {
          expect(plugin.canExecute({"odd": "3.134"})).to.equal(false);
        });
      });

      describe("and defining ignore rules for `file` props with `css` extensions and `err.css`", function() {
        var ignoreRules, ruleName;

        beforeEach(function() {
          ruleName = "file";
          ignoreRules = [matcher.extension("css"), matcher.string("err.scss")];
          plugin.ignore(ruleName, ignoreRules);
        });

        it("then `ignore` rules are added to the plugins", function() {
            expect(plugin._ignore[ruleName]).to.be.an.instanceof(Rule);
        });

        it("then plugin can NOT execute `file: app.css`", function() {
          expect(plugin.canExecute({"file": "app.css"})).to.equal(false);
        });

        it("then plugin can NOT execute `file: err.scss`", function() {
          expect(plugin.canExecute({"file": "err.scss"})).to.equal(false);
        });

        describe("then plugin can execute anything else", function() {
          it("plugin can execute `path: 1.js`", function() {
            expect(plugin.canExecute({"file": "1.js"})).to.equal(true);
          });

          it("plugin can execute `path: no.xml.please`", function() {
            expect(plugin.canExecute({"file": "no.xml.please"})).to.equal(true);
          });

          it("plugin can execute `path: app.scss`", function() {
            expect(plugin.canExecute({"file": "app.scss"})).to.equal(true);
          });
        });
      });
    });

    describe("Testing Plugin Manager", function() {
      var pluginManager;

      beforeEach(function() {
        pluginManager = new Plugin.Manager();
      });

      describe("When registering a plugin handler with options", function() {
        describe("and running plugin with no data", function() {
          var pluginHandler, pluginOptions;

          beforeEach(function() {
            pluginOptions = {minify: true};
            pluginHandler = sinon.stub();
            pluginManager.plugin(pluginHandler, pluginOptions);
            return pluginManager.run();
          });

          it("then the plugin is called with no data, with options, and cancel function", function() {
            sinon.assert.calledWithExactly(pluginHandler, undefined, pluginOptions, sinon.match.func);
          });
        });
      });

      describe("When registering two plugin handlers, and only one with options", function() {
        describe("and running plugin with no data", function() {
          var pluginHandler1, pluginHandler2, pluginOptions;

          beforeEach(function() {
            pluginOptions = {minify: true};
            pluginHandler1 = sinon.stub();
            pluginHandler2 = sinon.stub();
            pluginManager.plugin(pluginHandler1, pluginOptions);
            pluginManager.plugin(pluginHandler2);
            return pluginManager.run();
          });

          it("then the first plugin is called with no data, with options, and cancel function", function() {
            sinon.assert.calledWithExactly(pluginHandler1, undefined, pluginOptions, sinon.match.func);
          });

          it("then the second plugin is called with no data, empty options, and cancel function", function() {
            sinon.assert.calledWithExactly(pluginHandler2, undefined, {}, sinon.match.func);
          });
        });
      });

      describe("When registering a plugin handler with no options", function() {
        describe("and running plugin with no data", function() {
          var pluginHandler;

          beforeEach(function() {
            pluginHandler = sinon.stub();
            pluginManager.plugin(pluginHandler);
            return pluginManager.run();
          });

          it("then running plugins executes the plugin handler", function() {
            sinon.assert.calledOnce(pluginHandler);
          });

          it("then the plugin handler is called with no data, empty options, and a cancel function", function() {
            sinon.assert.calledWithExactly(pluginHandler, undefined, {}, sinon.match.func);
          });
        });

        describe("and running plugin with a string", function() {
          var pluginHandler, testData;

          beforeEach(function() {
            testData = "test data";
            pluginHandler = sinon.stub();
            pluginManager.plugin(pluginHandler);
            return pluginManager.run(testData);
          });

          it("then running plugins executes the plugin handler", function() {
            sinon.assert.calledOnce(pluginHandler);
          });

          it("then the plugin handler is called with string, empty options, and a cancel function", function() {
            sinon.assert.calledWithExactly(pluginHandler, testData, {}, sinon.match.func);
          });
        });
      });

      describe("When registering two plugin handlers with no options", function() {
        describe("and running the plugins with no data", function() {
          var pluginHandler1, pluginHandler2;

          beforeEach(function() {
            pluginHandler1 = sinon.stub();
            pluginHandler2 = sinon.stub();

            pluginManager
              .plugin(pluginHandler1)
              .plugin(pluginHandler2);

            return pluginManager.run();
          });

          it("then the first plugin handler is called with no data, empty options, and a cancel function", function() {
            sinon.assert.calledWithExactly(pluginHandler1, undefined, {}, sinon.match.func);
          });

          it("then the second plugin handler is called with no data, empty options, and a cancel function", function() {
            sinon.assert.calledWithExactly(pluginHandler2, undefined, {}, sinon.match.func);
          });
        });

        describe("and running the plugins with an object and the first plugin modifies it", function() {
          var pluginHandler1, pluginHandler2, testData;

          beforeEach(function() {
            testData = {};
            pluginHandler1 = sinon.stub().returns({random: 3.14});
            pluginHandler2 = sinon.stub();

            pluginManager
              .plugin(pluginHandler1)
              .plugin(pluginHandler2);

            return pluginManager.run(testData);
          });

          it("then the first plugin handler is called with data, empty options, and a cancel function", function() {
            sinon.assert.calledWithExactly(pluginHandler1, testData, {}, sinon.match.func);
          });

          it("then the second plugin handler is called with modified data, empty options, and a cancel function", function() {
            sinon.assert.calledWithExactly(pluginHandler2, sinon.match({random: 3.14}), {}, sinon.match.func);
          });
        });

      });

    });
  });
});
