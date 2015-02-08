(function() {
  "use strict";

  var storage = {};

  function Registry() {
  }

  Registry.getById = function(id) {
    if (!id) {
      id = (new Date()).getTime().toString();
    }

    return storage[id] || (storage[id] = {
      _id     : id,
      modules : {}
    });
  };

  Registry.clearById = function(id) {
    var _item;
    if (storage.hasOwnProperty(id)) {
      _item = storage[id];
      delete storage[id];
    }
    return _item;
  };

  module.exports = Registry;
})();
