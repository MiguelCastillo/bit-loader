(function() {
  "use strict";

  function noop() {}

  function isNull(item) {
    return item === null || item === undefined;
  }

  function isArray(item) {
    return item instanceof(Array);
  }

  function isObject(item) {
    return typeof(item) === "object";
  }

  function isPlainObject(item) {
    return !!(item && (item).toString() === "[object Object]");
  }

  function isFunction(item) {
    return !isNull(item) && item.constructor === Function;
  }

  function isDate(item) {
    return item instanceof(Date);
  }

  function result(input, args, context) {
    if (isFunction(input) === "function") {
      return input.apply(context, args||[]);
    }
    return input[args];
  }

  /**
   * Copies all properties from sources into target
   */
  function extend(target) {
    var source, length, i;
    var sources = Array.prototype.slice.call(arguments, 1);
    target = target || {};

    // Allow n params to be passed in to extend this object
    for (i = 0, length  = sources.length; i < length; i++) {
      source = sources[i];
      for (var property in source) {
        if (source.hasOwnProperty(property)) {
          target[property] = source[property];
        }
      }
    }

    return target;
  }

  /**
   * Deep copy of all properties in sources into target
   */
  function merge(target) {
    var source, length, i;
    var sources = Array.prototype.slice.call(arguments, 1);
    target = target || {};

    // Allow `n` params to be passed in to extend this object
    for (i = 0, length  = sources.length; i < length; i++) {
      source = sources[i];
      for (var property in source) {
        if (source.hasOwnProperty(property) && !(target.hasOwnProperty(property) && target[property] === undefined)) {
          if (isPlainObject(source[property])) {
            target[property] = merge(target[property], source[property]);
          }
          else {
            target[property] = source[property];
          }
        }
      }
    }

    return target;
  }

  module.exports = {
    isNull: isNull,
    isArray: isArray,
    isObject: isObject,
    isPlainObject: isPlainObject,
    isFunction: isFunction,
    isDate: isDate,
    noop: noop,
    result: result,
    extend: extend,
    merge: merge
  };
})();
