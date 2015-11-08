var utils = require("belty");
var types = require("dis-isa");


var Type = {
  "UNKNOWN" : "UNKNOWN",
  "AMD"     : "AMD",     //Asynchronous Module Definition
  "CJS"     : "CJS",     //CommonJS
  "IIFE"    : "IIFE"     //Immediately-Invoked Function Expression
};


/**
 * There are three states a module can be in, and each state can be in a different
 * stage. The different states are REGISTERED, LOADED, READY.
 *
 * REGISTERED has four stages before a module can be LOADED.
 *  1. RESOLVE.
 *  2. FETCH.
 *  3. TRANSFORM.
 *  4. DEPENDENCY.
 *
 * LOADED has two stages before a module can be READY.
 *  1. COMPILE.
 *  2. LINK.
 *
 * READY is the final state and has no stages. When a module is READY,
 * it can be consumed by the host application.
 */
var State = {
  REGISTERED: "registered",
    RESOLVE: "resolve",
    FETCH:  "fetch",
    TRANSFORM: "transform",
    DEPENDENCY: "dependency",
  LOADED: "loaded",
    COMPILE: "compile",
    LINK: "link",
  READY: "ready"
};


function Module(options) {
  if (!options) {
    throw new TypeError("Must provide options to create the module");
  }

  if (options.hasOwnProperty("exports")) {
    this.exports = options.exports;
  }

  if (options.hasOwnProperty("factory")) {
    this.factory = options.factory;
  }

  this.type = options.type || Type.UNKNOWN;
  this.id   = options.id || options.name;
  this.name = options.name;
  this.deps = options.deps ? options.deps.slice(0) : [];
}


/**
 * Module meta object
 */
function Meta(options) {
  options = options || {};

  if (types.isString(options)) {
    options = {
      name: options
    };
  }

  if (!types.isString(options.name)) {
    throw new TypeError("Must provide a name, which is used by the resolver to resolve the path for the resource");
  }

  this.deps = [];
  mergeConfiguration(this, options);
}


Meta.prototype.configure = function(options) {
  // Provide immutability to prevent side effects
  return mergeConfiguration(new Meta(this), options);
};


/**
 * Verifies that the module meta object is either already compiled or can be compiled.
 *
 * @returns {boolean}
 */
Meta.validate = function(moduleMeta) {
  if (!moduleMeta) {
    throw new TypeError("Must provide options");
  }

  if (!Meta.isCompiled(moduleMeta) && !Meta.canCompile(moduleMeta)) {
    throw new TypeError("ModuleMeta must provide a `source` string or `exports`.");
  }
};


/**
 * Verifies is the module meta object has dependencies.
 *
 * @returns {boolean}
 */
Meta.hasDependencies = function(moduleMeta) {
  return moduleMeta.deps.length;
};


/**
 * A module meta object is considered compiled if it has a `exports` or `factory` method.
 * That's because those are the two things that the compile step actually generates
 * before creating a Module instance.
 *
 * @returns {boolean}
 */
Meta.isCompiled = function(moduleMeta) {
  return moduleMeta.hasOwnProperty("exports") || types.isFunction(moduleMeta.factory);
};


/**
 * Checks if the module meta object can be compiled by verifying that it has NOT
 * already been compiled and that it has a `source` property that need to be compiled.
 *
 * @returns {boolean}
 */
Meta.canCompile = function(moduleMeta) {
  return !Meta.isCompiled(moduleMeta) && types.isString(moduleMeta.source);
};


/**
 * Merges in options into the module meta object
 */
function mergeConfiguration(moduleMeta, options) {
  var result = utils.extend(moduleMeta, options);

  if (options && options.deps) {
    result.deps = options.deps.slice(0);
  }

  return result;
}


Module.Meta  = Meta;
Module.Type  = Type;
Module.State = State;
module.exports = Module;
