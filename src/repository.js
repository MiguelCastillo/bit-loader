/**
 * Generic repository for data.  Data must be stored with a state.
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


Repository.prototype.findItem = function(data) {
  if (this.hasItem(data)) {
    return this.getItem(data);
  }

  //
  // TODO: Add logic to match properties to find items with a particular shape.
  //
  throw new Error("Item not found");
};


module.exports = Repository;
