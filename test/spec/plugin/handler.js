import { expect } from "chai";
import Handler from "../../../src/plugin/handler";
import Matches from "../../../src/matches";

describe("Plugin Handler suite", () => {
  describe("When creating an empty Handler", () => {
    var handler;

    beforeEach(() => {
      handler = new Handler();
    });

    it("then handle is a Handler instance", () => {
      expect(handler).to.be.instanceof(Handler);
    });

    it("then handler.id is null", () => {
      expect(handler.id).to.be.null;
    });

    it("then handler.handler is null", () => {
      expect(handler.handler).to.be.null;
    });

    it("then handler.matches is an instance of Matches", () => {
      expect(handler.matchers).to.be.instanceof(Matches);
    });

    it("then handler.serialize is an object with default values", () => {
      expect(handler.serialize()).to.deep.equal({
        handler: null,
        id: null,
        options: null,
        matchers: {
          matches: undefined,
          ignores: undefined
        }
      });
    });
  });

  describe("When creating a handler with an id", () => {
    var handler, id;

    beforeEach(() => {
      id = "handler --- id";
      handler = new Handler({
        id: id
      });
    });

    it("then handle is a Handler instance", () => {
      expect(handler).to.be.instanceof(Handler);
    });

    it("then handler.id is properly set", () => {
      expect(handler.id).to.equal(id);
    });

    it("then handler.handler is null", () => {
      expect(handler.handler).to.be.null;
    });

    it("then handler.matches is an instance of Matches", () => {
      expect(handler.matchers).to.be.instanceof(Matches);
    });

    it("then handler.serialize is an object with the correct values", () => {
      expect(handler.serialize()).to.deep.equal({
        handler: null,
        id: id,
        options: null,
        matchers: {
          matches: undefined,
          ignores: undefined
        }
      });
    });
  });

  describe("When creating a handler and later configuring id", () => {
    var handler, id;

    beforeEach(() => {
      id = "handler --- id";
      handler = new Handler().configure({
        id: id
      });
    });

    it("then handle is a Handler instance", () => {
      expect(handler).to.be.instanceof(Handler);
    });

    it("then handler.id is not set", () => {
      expect(handler.id).to.null;
    });

    it("then handler.handler is null", () => {
      expect(handler.handler).to.be.null;
    });

    it("then handler.matches is an instance of Matches", () => {
      expect(handler.matchers).to.be.instanceof(Matches);
    });

    it("then handler.serialize is an object with the correct values", () => {
      expect(handler.serialize()).to.deep.equal({
        handler: null,
        id: null,
        options: null,
        matchers: {
          matches: undefined,
          ignores: undefined
        }
      });
    });
  });

  describe("When creating a handler with a handler string", () => {
    var handler, handlerString;

    beforeEach(() => {
      handlerString = "handler --- string";
      handler = new Handler().configure({
        handler: handlerString
      });
    });

    it("then handle is a Handler instance", () => {
      expect(handler).to.be.instanceof(Handler);
    });

    it("then handler.id is null", () => {
      expect(handler.id).to.be.null;
    });

    it("then handler.handler is set to the input string", () => {
      expect(handler.handler).to.equal(handlerString);
    });

    it("then handler.matches is an instance of Matches", () => {
      expect(handler.matchers).to.be.instanceof(Matches);
    });

    it("then handler.serialize is an object with the correct values", () => {
      expect(handler.serialize()).to.deep.equal({
        handler: handlerString,
        id: null,
        options: null,
        matchers: {
          matches: undefined,
          ignores: undefined
        }
      });
    });
  });

  describe("When creating a handler with a handler function", () => {
    var handler, handlerFunction;

    beforeEach(() => {
      handlerFunction = () => {};
      handler = new Handler().configure({
        handler: handlerFunction
      });
    });

    it("then handle is a Handler instance", () => {
      expect(handler).to.be.instanceof(Handler);
    });

    it("then handler.id is null", () => {
      expect(handler.id).to.be.null;
    });

    it("then handler.handler is properly set to the input function", () => {
      expect(handler.handler).to.equal(handlerFunction);
    });

    it("then handler.matches is an instance of Matches", () => {
      expect(handler.matchers).to.be.instanceof(Matches);
    });

    it("then handler.serialize is an object with the correct values", () => {
      expect(handler.serialize()).to.deep.equal({
        handler: handlerFunction,
        id: null,
        options: null,
        matchers: {
          matches: undefined,
          ignores: undefined
        }
      });
    });
  });

  describe("When creating a handler with ignore, match rules and a handler function", () => {
    var handler, handlerFunction, matchPath, ignoreName;

    beforeEach(() => {
      matchPath = chance.string();
      ignoreName = chance.string();
      handlerFunction = () => {};
      handler = new Handler().configure({
        handler: handlerFunction,
        matchers: {
          matches: {
            path: matchPath
          },
          ignores: {
            name: ignoreName
          }
        }
      });
    });

    it("then handle is a Handler instance", () => {
      expect(handler).to.be.instanceof(Handler);
    });

    it("then handler.id is null", () => {
      expect(handler.id).to.be.null;
    });

    it("then handler.handler is properly set to the input function", () => {
      expect(handler.handler).to.equal(handlerFunction);
    });

    it("then handler.matches is an instance of Matches", () => {
      expect(handler.matchers).to.be.instanceof(Matches);
    });

    it("then handler.serialize is an object with the correct values", () => {
      expect(handler.serialize()).to.deep.equal({
        handler: handlerFunction,
        id: null,
        options: null,
        matchers: {
          matches: {
            path: [matchPath]
          },
          ignores: {
            name: [ignoreName]
          }
        }
      });
    });
  });
});
