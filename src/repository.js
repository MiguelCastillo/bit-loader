var types = require("dis-isa");

/**
 * Generic repository for data.
 */
function Repository(options) {
  options = options || {};
  this.items = options.items || {};
}

Repository.prototype.clear = function() {
  delete this.items;
  this.items = {};
  return this;
};

Repository.prototype.hasItem = function(id) {
  return this.items.hasOwnProperty(id);
};

Repository.prototype.getItem = function(id) {
  if (!this.hasItem(id)) {
    throw new Error("`" + id + "` not found");
  }

  return this.items[id];
};

Repository.prototype.deleteItem = function(id) {
  if (!this.hasItem(id)) {
    throw new Error("Item with `" + id + "` cannot be deleted. Item not found");
  }

  var item = this.items[id];
  delete this.items[id];
  return item;
};

Repository.prototype.setItem = function(id, item) {
  return (this.items[id] = item);
};

Repository.prototype.findAll = function(criteria) {
  if (this.hasItem(criteria)) {
    return [this.getItem(criteria)];
  }

  var result = [];
  var items = this.items;

  for (var item in items) {
    if (matchPattern(criteria, items[item])) {
      result.push(items[item]);
    }
  }

  return result;
};

Repository.prototype.findFirst = function(criteria) {
  if (this.hasItem(criteria)) {
    return [this.getItem(criteria)];
  }

  var items = this.items;

  for (var item in items) {
    if (matchPattern(criteria, items[item])) {
      return items[item];
    }
  }
};

function matchPattern(criteria, item) {
  if (criteria === item) {
    return true;
  }

  if (!criteria || !item) {
    return false;
  }

  for (var prop in criteria) {
    if (!criteria.hasOwnProperty(prop)) {
      continue;
    }

    if (criteria[prop] !== item[prop]) {
      if (criteria[prop] && (types.isArray(criteria[prop]) || types.isObject(criteria[prop]))) {
        return matchPattern(criteria[prop], item[prop]);
      }
      else {
        return false;
      }
    }
  }

  return true;
}

module.exports = Repository;
