var types = require("dis-isa");

function blueprint(configuration) {
  function Immutable() {
    buildImmutable(this, configuration);
  }

  Immutable.prototype = Object.create(BaseImmutable.prototype);
  Immutable.prototype.constructor = Immutable;
  return Immutable;
}

function BaseImmutable() {}

BaseImmutable.prototype.merge = function(value, updater) {
  if (value === null || value === undefined || this === value) {
    return this;
  }

  var updates = buildUpdateTree(this, value, updater || identity);

  if (updates === this) {
    return this;
  }

  return buildImmutable(Object.create(Object.getPrototypeOf(this)), updates);
};

function buildImmutable(target, configuration) {
  if (types.isBuffer(configuration)) {
    return Object.freeze(configuration);
  }
  if (configuration && configuration.constructor === Object) {
    return Object.freeze(immutableObject(target, configuration));
  }
  else if (types.isArray(configuration)) {
    return Object.freeze(immutableArray(target, configuration));
  }
  else {
    return configuration;
  }
}

function immutableObject(target, configuration) {
  var proto = Object
    .keys(configuration)
    .reduce(function(container, item) {
      container[item] = {
        get: lazyRead(configuration[item]),
        set: protectedSet(item),
        enumerable: true
      };

      return container;
    }, {});

  Object.defineProperties(target, proto);
  return target;
}

function immutableArray(target, configuration) {
  return configuration.map(function(value) {
    return buildImmutable(value, value);
  });
}

function lazyRead(value) {
  var init, cache;

  return function read() {
    if (!init) {
      cache = isFrozen(value) ? value : buildImmutable(value, value);
      init = true;
    }

    return cache;
  };
}

function protectedSet(prop) {
  return function(value) {
    throw new Error("Unable to set " + JSON.stringify(prop) + " to " + JSON.stringify(value) + ". FYI - Immutable structures are readonly.");
  };
}

function buildUpdateTree(target, value, updater) {
  if (!target || (!(value && value.constructor === Object) && !types.isArray(value))) {
    return value;
  }

  return getAllKeys(target, value)
    .reduce(function(container, item) {
      container[item] = value.hasOwnProperty(item) && target[item] !== value[item] ?
        buildUpdateTree(target[item], updater(value[item], item, target), identity) :
        target[item];
      return container;
    }, types.isArray(target) ? target.slice(0) : {});
}

function getAllKeys(target, value) {
  var allKeys = []
    .concat(Object.keys(target))
    .concat(Object.keys(value))
    .reduce(function(container, key) {
      container[key] = true;
      return container;
    }, {});

  return Object.keys(allKeys);
}

function isFrozen(value) {
  if (value && (value.constructor === Object || types.isArray(value))) {
    return Object.isFrozen(value);
  }

  return true;
}

function identity(i) { return i; }
blueprint.buildImmutable = buildImmutable;
blueprint.buildUpdateTree = buildUpdateTree;
blueprint.BaseImmutable = BaseImmutable;
module.exports = blueprint;
