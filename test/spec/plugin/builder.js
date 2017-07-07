import { expect } from "chai";
import PluginBuilder from "../../../src/plugin/builder";

describe("bit-plugin-builder test suite", function() {
  describe("When building a plugin configuration", () => {
    var act, config, result;

    beforeEach(() => act = () => result = PluginBuilder(config).build());

    describe("and the configuration is null", () => {
      beforeEach(() => {
        config = null;
        act();
      });

      it("then result is an object", () => {
        expect(result).to.be.an("object");
      });

      it("then result has default settings", () => {
        expect(result).to.deep.equal({});
      });
    });

    describe("and the configuration has an ignore rule", () => {
      beforeEach(() => {
        config = {
          ignores: {
            name: "test"
          }
        };

        act();
      });

      it("then the result contains the ignore rule", () => {
        expect(result.ignores).to.deep.equal({
          name: ["test"]
        });
      });
    });
  });

  describe("When the plugin builder has default settings", () => {
    var act, defaultSettings, config, result;

    beforeEach(() => act = () => result = PluginBuilder.create(defaultSettings).configure(config).build());

    describe("and the default config has a default ignore for path, one transform, and one extension", () => {
      beforeEach(() => {
        defaultSettings = {
          transform: "first transform",
          extensions: "js",
          ignores: {
            name: "test"
          }
        };
      });

      describe("and configuring the plugin with two ignore name rule and one extension", () => {
        beforeEach(() => {
          config = {
            extensions: "jsx",
            ignores: {
              name: ["3", "of course"]
            }
          };

          act();
        });

        it("then the plugin has all aggregated ignore rule", () => {
          expect(result.ignores).to.deep.equal({
            name: ["test", "3", "of course"]
          });
        });

        it("then the plugin has all aggregated extension rule", () => {
          expect(result.extensions).to.deep.equal(["js", "jsx"]);
        });
      });

      describe("and configuring the plugin with two transforms", () => {
        beforeEach(() => {
          config = {
            transform: ["transform 2", {
              handler: "transform 3"
            }]
          };

          act();
        });

        it("then the plugin has the default transform as well as the two new transforms", () => {
          expect(result.transform).to.deep.equal(["first transform", "transform 2", { handler: "transform 3" }]);
        });
      });
    });
  });
});
