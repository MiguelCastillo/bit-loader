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
  /** @type { number }
   *  @description Initial state of a module
   */
  REGISTERED: 0,

  /**
   * @type { number }
   * @description When the module is being resolved
   */
  RESOLVE: 1,

  /**
   * @type { number }
   * @description When the module is being fetched
   */
  FETCH:  2,

  /**
   * @type { number }
   * @description When the module is going through the transform pipeline
   */
  TRANSFORM: 3,

  /**
   * @type { number }
   * @description When the moule is getting all the dependencies resolved
   */
  DEPENDENCY: 4,

  /**
   * @type { number }
   * @description When the module and all its dependencies have finished loading
   */
  LOADED: 5,

  /**
   * @type { number }
   * @description When the module is being compiled or evaled
   */
  COMPILE: 6,

  /**
   * @type { number }
   * @description When the module is recursively instantiating all dependencies so that the
   *  module has them available when it is executed
   */
  LINK: 7,

  /**
   * @type { number }
   * @description When the module is all built and the host application can make use of it
   */
  READY: 8
};


/**
 * Entity that contains the executable code consumed by the host application.
 *
 * @class
 *
 * @property {string} id - Module id
 * @property {string} name - Module name
 * @property {string[]} deps - Array of module dependencies
 * @property {function} factory - Function that generates the data a particular module exports
 * @property {any} exports - Data exported by the module
 * @property {Meta} meta - Meta instance that contains all the information used by the pipelines
 *  the create the Module instance.
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
 * Intermediate representation of a Module which contains the information that is processed
 * in the different pipelines in order to generate a Module instance.
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
  return this.directory || "";
};


/**
 * Returns the file name of the file path.
 */
Meta.prototype.getFileName = function() {
  return this.fileName || "";
};


/**
 * Returns the file path, which is the full path for the file in storage.
 */
Meta.prototype.getFilePath = function() {
  return this.path || "";
};


/**
 * Safely merges data into instances of module meta. This returns a new instance
 * to keep module meta objects from causing side effects.
 *
 * @param {object} options - Options to merge into the module meta instance.
 *
 * @returns {Meta} New module meta instance with the aggregated options merged in.
 */
Meta.prototype.configure = function(options) {
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
 * already been compiled and that it has a `source` property that can be compiled.
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
  options = options || {};
  var result = utils.extend(moduleMeta, options);

  if (options.deps) {
    result.deps = options.deps.slice(0);
  }

  if (options.path) {
    result.directory = parseDirectoryFromPath(options.path);
    result.fileName = parseFileNameFromPath(options.path);
  }

  return result;
}


function parseDirectoryFromPath(path) {
  return (path || "").replace(/([^/\\]+)$/gmi, "");
}


function parseFileNameFromPath(path) {
  var fileName = /[^/\\]+$/gmi.exec(path || "");
  return fileName ? fileName[0] : "";
}


Module.Meta  = Meta;
Module.Type  = Type;
Module.State = State;
module.exports = Module;
