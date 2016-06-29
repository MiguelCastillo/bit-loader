var types = require("dis-isa");
var utils = require("belty");

function hasItem(items, id) {
  return items && items.hasOwnProperty(id);
}

function getItem(items, id) {
  if (!hasItem(items, id)) {
    throw new Error("`" + id + "` not found");
  }

  return items[id];
}

function findItem(items, criteria) {
  return utils.find(items, criteria);
}

function findAll(items, criteria) {
  return utils.findAll(items, criteria);
}

function deleteItem(items, id) {
  if (!hasItem(items, id)) {
    throw new Error("Item with `" + id + "` cannot be deleted. Item not found");
  }

  delete items[id];
  return items;
}

function setItem(items, id, item) {
  items[id] = item;
  return items;
}

module.exports = {
  hasItem: hasItem,
  getItem: getItem,
  deleteItem: deleteItem,
  setItem: setItem,
  findItem: findItem,
  findAll: findAll
};
