(function() {
  "use strict";

  var Utils = require('./utils');

  var Type = {
    "UNKNOWN" : "UNKNOWN",
    "AMD"     : "AMD",     //Asynchronous Module Definition
    "CJS"     : "CJS",     //CommonJS
    "IEFF"    : "IEFF"     //Immediately Executed Factory Function
  };


  function Module(options) {
    if (!options) {
      throw new TypeError("Must provide options to create the module");
    }

    if (options.hasOwnProperty("code")) {
      this.code = options.code;
    }

    if (options.hasOwnProperty("factory")) {
      this.factory = options.factory;
    }

    this.type     = options.type || Type.UNKNOWN;
    this.name     = options.name;
    this.deps     = options.deps ? options.deps.slice(0) : [];
    this.settings = Utils.extend({}, options);
  }


  function MetaValidation(options) {
    if (!options) {
      throw new TypeError("Must provide options");
    }

    if (!MetaValidation.hasCode(options) && !MetaValidation.canCompile(options)) {
      throw new TypeError("ModuleMeta must provide a `source` string and `compile` interface, or `code`.");
    }
  }


  MetaValidation.hasCode = function(options) {
    return options.hasOwnProperty("code");
  };


  MetaValidation.canCompile = function(options) {
    return typeof(options.source) === "string" && typeof(options.compile) === "function";
  };


  Module.MetaValidation = MetaValidation;
  Module.Type = Type;
  module.exports = Module;
})();
