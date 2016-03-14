var utils = require("belty");
var types = require("dis-isa");


/**
 * Module types.
 *
 * @deprecated
 * @ignore
 */
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
 * <pre>
 * REGISTERED has four stages before a module can be LOADED.
 *  1. RESOLVE.
 *  2. FETCH.
 *  3. TRANSFORM.
 *  4. DEPENDENCY.
 *
 * LOADED has two stages before a module can be READY.
 *  1. COMPILE.
 *  2. LINK.
 * </pre>
 *
 * READY is the final state and has no stages. When a module is READY,
 * it can be consumed by the host application.
 *
 * @enum
 * @memberof Module
 */
var State = {
  REGISTERED: 0,
    RESOLVE: 1,
    FETCH:  2,
    TRANSFORM: 3,
    DEPENDENCY: 4,
  LOADED: 5,
    COMPILE: 6,
    LINK: 7,
  READY: 8
};


/**
 * Module class definition. This contains all information used in the processed
 * of creating the module as well as the data the host application consumes. Perhaps
 * the single most important piece of information is `exports`, which is ultimately
 * the piece of data that the host application consumes.
 *
 * @class
 *
 * @property {string} id - Module id
 * @property {string} name - Module name
 * @property {string[]} deps - Array of module dependencies
 * @property {function} factory - Function that generates the data a particular module exports
 * @property {any} exports - Data exported by a module
 */
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
  this.id = options.id || options.name;
  this.name = options.name;
  this.deps = options.deps ? options.deps.slice(0) : [];
}


/**
 * Module meta class definition. This is an intermediary representation of the processed
 * module information before a proper Module instance is created. This is what all pipelines
 * interact with before the build stage creates a Module instance.
 *
 * @class
 * @memberof Module
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


/**
 * Returns the directory part of a file path.
 */
Meta.prototype.getDirectory = function() {
  return this.getFilePath().replace(/([^/\\]+)$/gmi, "");
};


/**
 * Returns the file name of the file path.
 */
Meta.prototype.getFileName = function() {
  var name = /[^/\\]+$/gmi.exec(this.getFilePath());
  return name ? name[0] : "";
};


/**
 * Returns the file path, which is the full path for the file in storage.
 */
Meta.prototype.getFilePath = function() {
  return this.path || "";
};


/**
 * Safely merges data into the instance of module meta. This returns a new instance
 * to keep the module meta object as immutable as possible.
 *
 * @param {object} options - Options to merge into the module meta instance.
 *
 * @returns {Meta} New module meta instance with the aggregated options merged in.
 */
Meta.prototype.configure = function(options) {
  // Provide immutability to prevent side effects
  return mergeConfiguration(new Meta(this), options);
};


/**
 * Verifies that a module meta object is either already compiled or can be compiled.
 *
 * @param {Meta} moduleMeta - Module meta instance.
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
 * Verifies if a module meta object has dependencies.
 *
 * @param {Meta} moduleMeta - Module meta instance.
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
 * @param {Meta} moduleMeta - Module meta instance.
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
 * @param {Meta} moduleMeta - Module meta instance.
 *
 * @returns {boolean}
 */
Meta.canCompile = function(moduleMeta) {
  return !Meta.isCompiled(moduleMeta) && types.isString(moduleMeta.source);
};


/**
 * Merges in options into a module meta object
 *
 * @ignore
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
