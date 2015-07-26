var types = require("./types");

/**
 * Noop method. You can pass in an argument and it will be returned as is.
 *
 * @param {*} arg - Argument to be returned. This is completely optional
 * @returns {*} This returns whatever is passed in.
 */
function noop(arg) {
  return arg;
}

/**
 * Gracefully handle generating an output from an input. The input can be
 * a function, in which case it is called and whatever is returned is
 * the ouput. Otherwise, the input is returned.
 *
 * @param {*} input - If function, it is called and the result is returned.
 *  Otherwise, input is returned.
 * @param {*} args - Arguments to pass to input when it is a function.
 * @param {*} context - Context used when input is a function.
 *
 * @returns {*} If input is a function, then the result of calling it is
 *  returned. Otherwise input is returned.
 */
function result(input, args, context) {
  if (types.isFunction(input)) {
    return input.apply(context, args||[]);
  }
  return arguments.length === 1 ? input : input[args];
}

/**
 * Converts an input to an array. If the input is an array, then this is a
 * noop. Otherwise the input must be an object, and its values are returned
 * as an array.
 *
 * @param {array | object[]} items - Items to be converted to array
 *
 * @returns {array}
 */
function toArray(items) {
  if (types.isArray(items)) {
    return items;
  }

  return Object.keys(items).map(function(item) {
    return items[item];
  });
}

/**
 * Copies all properties from sources into target object. This is a
 * shallow copy.
 *
 * @param {object} target - Object to copy properties to
 * @param {...*} rest - The rest of the arguements are merged into target
 *
 * @returns {object} Object with all arguments merge in.
 */
function extend(target) {
  var source, length, i;
  target = target || {};

  // Allow n params to be passed in to extend this object
  for (i = 1, length  = arguments.length; i < length; i++) {
    source = arguments[i];
    for (var property in source) {
      if (source.hasOwnProperty(property)) {
        target[property] = source[property];
      }
    }
  }

  return target;
}

/**
 * Deep copy of all properties into target object.
 *
 * @param {object} target - Object to copy properties to
 * @param {...*} rest - The rest of the arguements are deeply merged into target
 *
 * @returns {object} Object with all arguments merge in.
 */
function merge(target) {
  var source, length, i;
  var sources = arguments;
  target = target || {};

  // Allow `n` params to be passed in to extend this object
  for (i = 1, length  = sources.length; i < length; i++) {
    source = sources[i];
    for (var property in source) {
      if (!source.hasOwnProperty(property)) {
        continue;
      }

      if (types.isPlainObject(source[property])) {
        target[property] = merge(target[property], source[property]);
      }
      else {
        target[property] = source[property];
      }
    }
  }

  return target;
}

/**
 * Logs error to the console and makes sure it is only logged once.
 */
function reportError(error) {
  if (error && !error.handled) {
    error.handled = true;
    if (error.stack) {
      console.log(error.stack);
    }
    else {
      console.error(error);
    }
  }

  return error;
}


module.exports = {
  toArray: toArray,
  reportError: reportError,
  noop: noop,
  result: result,
  extend: extend,
  merge: merge
};
