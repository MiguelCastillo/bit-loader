(function() {
  "use strict";

  function StatefulItems(items) {
    this.items = items || {};
  }


  /**
   * Helper methods for CRUD operations on `items` map for based on their StateTypes
   */
  StatefulItems.prototype.isState = function(state, name) {
    return this.items[name] && this.items[name].state === state;
  };


  StatefulItems.prototype.getItem = function(state, name) {
    if (!this.isState(state, name)) {
      throw new TypeError("`" + name + "` is not " + state);
    }

    return this.items[name].item;
  };


  StatefulItems.prototype.setItem = function(state, name, item) {
    return (this.items[name] = {item: item, state: state}).item;
  };


  StatefulItems.prototype.removeItem = function(name) {
    if (!this.items.hasOwnProperty(name)) {
      throw new TypeError("`" + name + "` cannot be removed - not found");
    }

    var item = this.items[name];
    delete this.items[name];
    return item.item;
  };


  module.exports = StatefulItems;
})();
