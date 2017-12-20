import { expect } from "chai";
import blueprint from "../../src/blueprint";

describe("blueprint test suite", function() {
  describe("when setting up an empty blueprint", () => {
    var Blueprint, instance;

    beforeEach(() => {
      Blueprint = class Definition extends blueprint() {};
      instance = new Blueprint();
    });

    it("then the Blueprint instance has Blueprint's prototype", () => {
      expect(instance).to.be.an.instanceof(Blueprint);
    });

    it("then the Blueprint instance has BaseBlueprint's prototype", () => {
      expect(instance).to.be.an.instanceof(blueprint.BaseImmutable);
    });
  });

  describe("when setting up a blueprint with one property", () => {
    var Blueprint, instance;

    beforeEach(() => {
      Blueprint = class Definition extends blueprint({
        somePropertyName: "tanto"
      }) {};

      instance = new Blueprint();
    });

    it("then the Blueprint instance has the property with the default value", () => {
      expect(instance.somePropertyName).to.equal("tanto");
    });

    describe("and setting the instance property to a value", () => {
      var result;

      beforeEach(() => {
        try {
          instance.somePropertyName = "new value";
        }
        catch(ex) {
          result = ex;
        }
      });

      it("then the value is not set", () => {
        expect(instance.somePropertyName).to.equal("tanto");
      });

      it("then an exception is thrown", () => {
        expect(result).to.be.an("error");
      });
    });

    describe("and setting a new property in the instance", () => {
      var result;

      beforeEach(() => {
        try {
          instance.someNewPropertyName = "new value";
        }
        catch(ex) {
          result = ex;
        }
      });

      it("then the value is not set", () => {
        expect(instance.someNewPropertyName).to.be.undefined;
      });

      it("then an exception is thrown", () => {
        expect(result).to.be.an("error");
      });

      it("then the exception has a message", () => {
        expect(result.message).to.not.be.empty;
      });
    });

    describe("and merging a new value into the instance", () => {
      var result, value;
      var act = () => { result = instance.merge(value); };

      describe("and the value being merge is a valid JSON", () => {
        beforeEach(() => {
          value = { somePropertyName: "new value" };
          act();
        });

        it("then the original instance does not have the value set", () => {
          expect(instance.somePropertyName).to.equal("tanto");
        });

        it("then merging the value returns a new instance", () => {
          expect(result).to.not.equal(instance);
        });

        it("then the new value is set", () => {
          expect(result.somePropertyName).to.equal("new value");
        });
      });

      describe("and the value being merge is NULL", () => {
        beforeEach(() => {
          value = null;
          act();
        });

        it("then the original instance does not have the value set", () => {
          expect(instance.somePropertyName).to.equal("tanto");
        });

        it("then merging null returns the same instance", () => {
          expect(result).to.equal(instance);
        });
      });

      describe("and the value being merge is undefined", () => {
        beforeEach(() => {
          value = undefined;
          act();
        });

        it("then the original instance does not have the value set", () => {
          expect(instance.somePropertyName).to.equal("tanto");
        });

        it("then merging undefined returns the same instance", () => {
          expect(result).to.equal(instance);
        });
      });
    });
  });

  describe("when setting up a Blueprint with multiple properties with nested objects", () => {
    var Blueprint, instance;

    beforeEach(() => {
      Blueprint = class Definition extends blueprint({
        prop1: {
          first: "tanto",
          second: {
            prefix: "Hungry",
            last: "Hippo"
          }
        },
        prop2: {
          first: "Robot",
          second: {
            prefix: "Mr",
            last: "Noob"
          }
        }
      }) {};

      instance = new Blueprint();
    });

    describe("and creating two instances of the same blueprint", () => {
      var instance2;

      beforeEach(() => {
        instance2 = new Blueprint();
      });

      it("then both instances are different references", () => {
        expect(instance).to.not.equal(instance2);
      });

      it("then both instances point to the same first property", () => {
        expect(instance.prop1).to.equal(instance2.prop1);
      });

      it("then both instances point to the same second property", () => {
        expect(instance.prop2).to.equal(instance2.prop2);
      });
    });

    describe("and merging a structure with partial update into prop2", () => {
      var result;

      beforeEach(() => {
        result = instance.merge({
          prop2: {
            first: "Ramirez"
          }
        });
      });

      it("then the result and the initial immutable are NOT the same reference", () => {
        expect(result).to.not.equal(instance);
      });

      it("then the prop1 structure remains unchanged", () => {
        expect(result.prop1).to.equal(instance.prop1);
      });

      it("then a sub structure of the prop1 structure remains unchanged", () => {
        expect(result.prop1.second).to.equal(instance.prop1.second);
      });

      it("then a sub property of the prop1 structure remains unchanged", () => {
        expect(result.prop1.second.prefix).to.equal(instance.prop1.second.prefix);
      });

      it("then the prop2 structure is a new reference", () => {
        expect(result.prop2).to.not.equal(instance.prop2);
      });

      it("then a sub structure of the prop2 structure not affected by the partial update remains unchanged", () => {
        expect(result.prop2.second).to.equal(instance.prop2.second);
      });
    });

    describe("and merging a structure with the same data", () => {
      var result;

      beforeEach(() => {
        result = instance.merge({
          prop2: {
            first: "Robot"
          }
        });
      });

      it("then the result and the initial immutable are NOT the same reference", () => {
        expect(result).to.not.equal(instance);
      });

      it("then the prop1 structure remains unchanged", () => {
        expect(result.prop1).to.equal(instance.prop1);
      });

      it("then a sub structure of the prop1 structure remains unchanged", () => {
        expect(result.prop1.second).to.equal(instance.prop1.second);
      });

      it("then a sub property of the prop1 structure remains unchanged", () => {
        expect(result.prop1.second.prefix).to.equal(instance.prop1.second.prefix);
      });

      it("then the changed prop2 structure is a new reference", () => {
        expect(result.prop2).to.not.equal(instance.prop2);
      });

      it("then a sub structure of the prop2 structure not affected by the partial update remains unchanged", () => {
        expect(result.prop2.second).to.equal(instance.prop2.second);
      });
    });
  });

  describe("and creating an empty structure with two null properties", () => {
    var Blueprint, instance;

    beforeEach(() => {
      Blueprint = class Definition extends blueprint({
        prop1: null,
        prop2: null
      }) {};

      instance = new Blueprint();
    });

    describe("and merging in a structure with an array", () => {
      var result, arrContent;

      beforeEach(() => {
        arrContent = ["value"];

        result = instance.merge({
          prop1: {
            name: arrContent
          }
        });
      });

      it("then the newly added structure is immutable", () => {
        expect(Object.isFrozen(result.prop1)).to.be.true;
      });

      it("then the newly added structure has an array", () => {
        expect(result.prop1.name).to.be.instanceof(Array);
      });

      it("then the newly added array to the structure is immutable", () => {
        expect(Object.isFrozen(result.prop1.name)).to.be.true;
      });

      it("then the newly added structure contains the array", () => {
        expect(result.prop1).to.deep.equal({name: ["value"]});
      });
    });

    describe("and calling merge twice to merge two different structures", () => {
      var result, name1, name2;

      beforeEach(() => {
        name1 = "name -- 1";
        name2 = "name -- 2";

        result = instance
          .merge({
            prop1: {
              name: name1
            }
          })
          .merge({
            prop2: {
              name: name2
            }
          });
      });

      it("then the first structure is merged", () => {
        expect(result.prop1).to.contain({
          name: name1
        });
      });

      it("then the second structure is merged", () => {
        expect(result.prop2).to.contain({
          name: name2
        });
      });
    });
  });

  describe("When creating a blueprint with a property that is an instance of a class", () => {
    var Blueprint, PropClass, instance;

    beforeEach(() => {
      PropClass = class PropKlass{
        get hello() {
          return "world";
        }
      };

      Blueprint = class Definition extends blueprint({
        prop: new PropClass()
      }) {};

      instance = new Blueprint();
    });

    it("then the instance is an instance of the Blueprint", () => {
      expect(instance).to.be.instanceof(Blueprint);
    });

    it("then the prop is an instance of PropClass", () => {
      expect(instance.prop).to.be.instanceof(PropClass);
    });
  });
});
