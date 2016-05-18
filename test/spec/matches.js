import { expect } from "chai";
import chance from "chance";
import Matches from "../../src/matches";


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
        expect(matches.matches).to.be.undefined;
      });

      it("then ignore rules are null", function() {
        expect(matches.ignores).to.be.undefined;
      });

      it("then run ignore rules is false", function() {
        expect(matches.runIgnore()).to.equal(false);
      });

      it("then run match rules is true", function() {
        expect(matches.runMatch()).to.equal(true);
      });
    });

    describe("and configuring a matching rule", function() {
      var ruleValue;

      beforeEach(function() {
        act();

        ruleValue = chance().string();

        matches = matches.configure({
          matches: {
            name: ruleValue
          }
        });
      });

      it("then matches contain the new rule added", function() {
        expect(matches.matches).to.deep.equal({name: [ruleValue]});
      });

      it("then running matches against the configured value passes validation", function() {
        expect(matches.runMatch( { name: ruleValue } )).to.equal(true);
      });

      it("then running matches against a non-matching value fails validation", function() {
        expect(matches.runMatch( { name: chance().string() } )).to.equal(false);
      });

      it("then running ignore against any value passes validation", function() {
        expect(matches.runIgnore( { name: chance().string() } )).to.equal(false);
      });
    });

    describe("and configuring ignore rules", function() {
      var ruleValue;

      beforeEach(function() {
        act();

        ruleValue = chance().string();

        var matches1 = matches.configure({
          ignores: {
             name: ruleValue
          }
        });

        matches = matches1;
      });

      it("then running ignore against the configured value passes validation", function() {
        expect(matches.runIgnore({ name: ruleValue })).to.equal(true);
      });

      it("then running ignore against a random value fails validation", function() {
        expect(matches.runIgnore({ name: chance().string() })).to.equal(false);
      });
    });

    describe("and configuring a file extension rule", function() {
      var ruleValue;

      beforeEach(function() {
        act();

        ruleValue = "js";

        matches = matches.configure({
          extensions: ruleValue
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
      var ruleValue;

      beforeEach(function() {
        act();

        ruleValue = ["js", "json"];

        matches = matches.configure({
          extensions: ruleValue
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
