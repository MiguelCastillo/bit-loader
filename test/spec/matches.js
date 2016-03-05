import { expect } from "chai";
import chance from "chance";
import Matches from "src/matches";

describe("Matches Test Suite", function() {
  var matches;

  var act = function() {
    matches = new Matches();
  };

  describe("when creating matches instance", function() {
    describe("with no rules configured", function() {
      beforeEach(function() {
        act();
      });

      it("then matching rules are null", function() {
        expect(matches._matches).to.equal(null);
      });

      it("then ignore rules are null", function() {
        expect(matches._ignore).to.equal(null);
      });

      it("then run ignore rules is false", function() {
        expect(matches.runIgnore()).to.equal(false);
      });

      it("then run match rules is true", function() {
        expect(matches.runMatch()).to.equal(true);
      });
    });

    describe("and configuring a matching rule", function() {
      var ruleConfig;

      beforeEach(function() {
        act();

        ruleConfig = { name: chance().string() };

        matches.configure({
          match: ruleConfig
        });
      });

      it("then running matches against the configured value passes validation", function() {
        expect(matches.runMatch(ruleConfig)).to.equal(true);
      });

      it("then running matches against a non-matching value fails validation", function() {
        expect(matches.runMatch( { name: chance().string() } )).to.equal(false);
      });

      it("then running ignore against any value passes validation", function() {
        expect(matches.runIgnore( { name: chance().string() } )).to.equal(false);
      });
    });

    describe("and configuring ignore rules", function() {
      var ruleConfig;

      beforeEach(function() {
        act();

        ruleConfig = { name: chance().string() };

        matches.configure({
          ignore: ruleConfig
        });
      });

      it("then running ignore against the configured value passes validation", function() {
        expect(matches.runIgnore(ruleConfig)).to.equal(true);
      });

      it("then running ignore against a random value fails validation", function() {
        expect(matches.runIgnore({ name: chance().string() })).to.equal(false);
      });
    });

    describe("and configuring a file extension rule", function() {
      var ruleConfig;

      beforeEach(function() {
        act();

        ruleConfig = "js";

        matches.configure({
          extensions: ruleConfig
        });
      });

      it("then matching the configured extension passes validation", function() {
        expect(matches.runMatch( { path: "c:\\path\some.js" } )).to.equal(true);
      });

      it("then matching the configured extension (with different casing) passes validation", function() {
        expect(matches.runMatch( { path: "c:\\path\some.Js" } )).to.equal(true);
      });

      it("then matching a file name that is the dotted extension (.js) validation fails", function() {
        expect(matches.runMatch( { path: "/.js" } )).to.equal(false);
      });

      it("then matching an invalid extension fails validation", function() {
        expect(matches.runMatch( { path: "c:\\path\some.xjs" } )).to.equal(false);
      });
    });

    describe("and configuring multiple file extension rules", function() {
      var ruleConfig;

      beforeEach(function() {
        act();

        ruleConfig = ["js", "json"];

        matches.configure({
          extensions: ruleConfig
        });
      });

      it("then matching the configured extension passes validation", function() {
        expect(matches.runMatch( { path: "c:\\path\some.js" } )).to.equal(true);
      });

      it("then matching the configured extension (with different casing) passes validation", function() {
        expect(matches.runMatch( { path: "c:\\path\some.JSON" } )).to.equal(true);
      });

      it("then matching an invalid extension fails validation", function() {
        expect(matches.runMatch( { path: "c:\\path\some.xjs" } )).to.equal(false);
      });
    });
  });
});
