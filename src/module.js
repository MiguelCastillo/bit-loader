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
  /** @type { string }
   *  @description Initial state of a module
   */
  REGISTERED: "registered",

  /**
   * @type { string }
   * @description When the module is being resolved
   */
  RESOLVE: "resolve",

  /**
   * @type { string }
   * @description When the module is being fetched
   */
  FETCH: "fetch",

  /**
   * @type { string }
   * @description When the module is going through the transform pipeline
   */
  TRANSFORM: "transform",

  /**
   * @type { string }
   * @description When the moule is getting all the dependencies resolved
   */
  DEPENDENCY: "dependency",

  /**
   * @type { string }
   * @description When the module and all its dependencies have finished loading
   */
  LOADED: "loaded",

  /**
   * @type { string }
   * @description When the module is being compiled or evaled
   */
  COMPILE: "compile",

  /**
   * @type { string }
   * @description When the module is recursively instantiating all dependencies so that the
   *  module has them available when it is executed
   */
  LINK: "link",

  /**
   * @type { string }
   * @description When the module is all built and the host application can make use of it
   */
  READY: "ready"
};



/**
 * Intermediate representation of a Module which contains the information that is processed
 * in the different pipelines in order to generate a Module instance.
 *
 * @class
 * @memberof Module
 *
 * @property {string} id - Module id
 * @property {string} name - Module name
 * @property {string[]} deps - Array of module dependencies
 * @property {function} factory - Function that generates the data a particular module exports
 * @property {any} exports - Data exported by the module
 *
 */
function Module(options) {
  options = options || {};

  if (types.isString(options)) {
    options = {
      name: options
    };
  }

  if (!types.isString(options.name)) {
    throw new TypeError("Must provide a name, which is used by the resolver to resolve the path for the resource");
  }

  this.deps = options.deps ? options.deps.slice(0) : [];
  this.type = options.type || Type.UNKNOWN;
  return this.merge(utils.omit(options, ["deps", "type"]));
}


/**
 * Safely merges data into the current module. Every merge opertion will create
 * a new instance to prevent unwanted side effects.
 *
 * @param {object} options - Options to merge into the module meta instance.
 *
 * @returns {Module} New module meta instance with the aggregated options merged in.
 */
Module.prototype.merge = Module.prototype.configure = function(options) {
  if (!options || options === this) {
    return this;
  }

  var target = Object.create(Object.getPrototypeOf(this));
  utils.merge(target, utils.omit(this, ["exports"]), utils.omit(options, ["exports"]));

  if (options.path) {
    if (!options.hasOwnProperty("directory")) {
      target.directory = parseDirectoryFromPath(options.path);
    }

    if (!options.hasOwnProperty("fileName")) {
      target.fileName = parseFileNameFromPath(options.path);
    }
  }

  if (this.hasOwnProperty("exports")) {
    target.exports = this.exports;
  }

  if (options.hasOwnProperty("exports")) {
    target.exports = options.exports;
  }

  return target;
};


/**
 * Returns the directory part of a file path.
 */
Module.prototype.getDirectory = function() {
  return this.directory || "";
};


/**
 * Returns the file name of the file path.
 */
Module.prototype.getFileName = function() {
  return this.fileName || "";
};


/**
 * Returns the file path, which is the full path for the file in storage.
 */
Module.prototype.getFilePath = function() {
  return this.path || "";
};


/**
 * Method to set the state of the module
 */
Module.prototype.withState = function(state) {
  return this.merge({ state: state });
};


/**
 * Verifies that a module meta object is either already compiled or can be compiled.
 *
 * @param {Module} moduleMeta - Module meta instance.
 *
 * @returns {boolean}
 */
Module.validate = function(moduleMeta) {
  if (!moduleMeta) {
    throw new TypeError("Must provide options");
  }

  if (!Module.isCompiled(moduleMeta) && !Module.canCompile(moduleMeta)) {
    throw new TypeError("ModuleMeta must provide a `source` string or `exports`.");
  }
};


/**
 * Verifies if a module meta object has dependencies.
 *
 * @param {Module} moduleMeta - Module meta instance.
 *
 * @returns {boolean}
 */
Module.hasDependencies = function(moduleMeta) {
  return moduleMeta.deps.length;
};


/**
 * Checks if the module meta object has a factory method, which is called to
 * initialize a module instance.
 *
 * @para {Module} - moduleMeta - Module meta instance.
 */
Module.hasFactory = function(moduleMeta) {
  return types.isFunction(moduleMeta.factory);
};


/**
 * Checks is module meta object is compiled, which means that it has a `exports`
 * definition.
 *
 * @param {Module} moduleMeta - Module meta instance.
 *
 * @returns {boolean}
 */
Module.isCompiled = function(moduleMeta) {
  return moduleMeta.hasOwnProperty("exports");
};


/**
 * Checks if the module meta object can be compiled by verifying that it has NOT
 * already been compiled and that it has a `source` property that can be compiled.
 *
 * @param {Module} moduleMeta - Module meta instance.
 *
 * @returns {boolean}
 */
Module.canCompile = function(moduleMeta) {
  return !Module.isCompiled(moduleMeta) && types.isString(moduleMeta.source);
};


function parseDirectoryFromPath(path) {
  return (path || "").replace(/([^/\\]+)$/gmi, "");
}


function parseFileNameFromPath(path) {
  var fileName = /[^/\\]+$/gmi.exec(path || "");
  return fileName ? fileName[0] : "";
}


Module.Type  = Type;
Module.State = State;
module.exports = Module;
