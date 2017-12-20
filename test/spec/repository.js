import Repository from "../../src/repository";
import { expect } from "chai";
import chanceFactory from "chance";
import utils from "belty";

const chance = chanceFactory();

describe("Repository Suite", function() {
  describe("When creating a repository", () => {
    var repository;

    beforeEach(() => {
      repository = new Repository({});
    });

    it("then the instance is a Repository", () => {
      expect(repository).to.be.an.instanceof(Repository);
    });

    it("then there are no items in the repository", () => {
      expect(repository.items).to.be.empty;
    });

    describe("and adding an item", () => {
      var item, id;

      beforeEach(() => {
        item = {
          name: chance.string(),
          street: chance.string()
        };

        id = chance.string();
        repository.setItem(id, item);
      });

      it("then the repository has one item", () => {
        expect(Object.keys(repository.items)).to.have.lengthOf(1);
      });

      describe("and deleting the added item", () => {
        beforeEach(() => {
          repository.deleteItem(id);
        });

        it("then repository is empty", () => {
          expect(repository.items).to.be.empty;
        });
      });

      describe("and getting the added item", () => {
        var readItem;

        beforeEach(() => {
          readItem = repository.getItem(id);
        });

        it("then the retrieved item is what had been added", () => {
          expect(item).to.equal(readItem);
        });
      });

      describe("and finding the all items by matching properties", () => {
        var foundItems;

        beforeEach(() => {
          foundItems = repository.findAll({
            name: item.name,
            street: item.street
          });
        });

        it("then the results has one item", () => {
          expect(foundItems).to.have.lengthOf(1);
        });

        it("then the item in the result set is the item that had been added", () => {
          expect(foundItems[0]).to.equal(item);
        });
      });

      describe("and finding the first item by matching properties", () => {
        var foundItem;

        beforeEach(() => {
          foundItem = repository.findFirst({
            name: item.name,
            street: item.street
          });
        });

        it("then the result is the item that had been added", () => {
          expect(foundItem).to.equal(item);
        });
      });
    });

    describe("and adding multiple items with complex structure", () => {
      var item, unique1, unique2, instance, Constructor;

      beforeEach(() => {
        Constructor = function(val) {
          val = val || chance.string();

          Object.defineProperty(this, "value", {
            enumerable: true,
            set: function() {
              throw new TypeError("Cant set it");
            },
            get: function() {
              return val;
            }
          });
        };

        instance = new Constructor();

        item = {
          agosto: {
            month: {
              hot: chance.string()
            },
            time: {
              ofDay: instance
            },
            year: chance.string()
          }
        };

        unique1 = chance.string();
        unique2 = chance.string();

        repository.setItem(chance.string(), utils.merge({
          some: unique1
        }, item));

        repository.setItem(chance.string(), utils.merge({
          some: unique2
        }, item));

        repository.setItem(chance.string(), {
          displayName: chance.string()
        });
      });

      it("then there are 3 items in the repository", () => {
        expect(Object.keys(repository.items)).to.have.lengthOf(3);
      });

      describe("and finding all items that match the input pattern", () => {
        var act, results, criteria;

        beforeEach(() => {
          act = () => results = repository.findAll(criteria);
        });

        describe("with criteria with no matches", () => {
          beforeEach(() => {
            criteria = {
              random: chance.string()
            };

            act();
          });

          it("then results is empty", () => {
            expect(results).to.be.empty;
          });
        });

        describe("with criteria that matches one item", () => {
          beforeEach(() => {
            criteria = {
              some: unique1
            };

            act();
          });

          it("then results has one item", () => {
            expect(results).to.have.lengthOf(1);
          });

          it("then the result matches the item in the repository", () => {
            expect(results[0]).to.deep.equal(utils.merge({
              some: unique1
            }, item));
          });
        });

        describe("with criteria that matches two items", () => {
          beforeEach(() => {
            criteria = {
              agosto: {
                year: item.agosto.year
              }
            };

            act();
          });

          it("then results has one item", () => {
            expect(results).to.have.lengthOf(2);
          });

          it("then the first result is in the repository", () => {
            expect(results[0]).to.deep.equal(utils.merge({
              some: unique1
            }, item));
          });

          it("then the second result is in the repository", () => {
            expect(results[1]).to.deep.equal(utils.merge({
              some: unique2
            }, item));
          });
        });

        describe("with criteria that has an instance with a value that matches", () => {
          beforeEach(() => {
            criteria = {
              agosto: {
                time: {
                  ofDay: new Constructor(instance.value)
                }
              }
            };

            act();
          });

          it("then there are two results", () => {
            expect(results).to.have.lengthOf(2);
          });

          it("then the first result is in the repository", () => {
            expect(results[0]).to.deep.equal(utils.merge({
              some: unique1
            }, item));
          });

          it("then the second result is in the repository", () => {
            expect(results[1]).to.deep.equal(utils.merge({
              some: unique2
            }, item));
          });
        });
      });

      describe("and running findFirst", () => {
        var act, result, criteria;

        beforeEach(() => {
          act = () => result = repository.findFirst(criteria);
        });

        describe("with criteria with no matches", () => {
          beforeEach(() => {
            criteria = {
              random: chance.string()
            };

            act();
          });

          it("then result is empty", () => {
            expect(result).to.be.empty;
          });
        });

        describe("with criteria that matches one item", () => {
          beforeEach(() => {
            criteria = {
              some: unique1
            };

            act();
          });

          it("then the result matches the item in the repository", () => {
            expect(result).to.deep.equal(utils.merge({
              some: unique1
            }, item));
          });
        });

        describe("with criteria that matches multiple items", () => {
          beforeEach(() => {
            criteria = {
              agosto: {
                year: item.agosto.year
              }
            };

            act();
          });

          it("then the result is in the repository", () => {
            expect(result).to.deep.equal(utils.merge({
              some: unique1
            }, item));
          });
        });
      });
    });
  });
});
