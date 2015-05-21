(function() {
  "use strict";

  var Promise = require("../promise");
  var Module  = require("../module");
  var Utils   = require("../utils");
  var logger  = require("../logger").factory("Meta/Resolve");


  function MetaResolve() {
  }


  MetaResolve.resolve = function(manager, name, parentMeta) {
    logger.log(name);

    var moduleMeta = new Module.Meta(name);

    return Promise.resolve(manager.resolve(moduleMeta, parentMeta))
      .then(function(meta) {
        meta = meta || {};
        if (!meta.cname) {
          meta.cname = meta.name || meta.path;
        }

        delete meta.name;
        return moduleMeta.configure(meta);
      }, Utils.reportError);
  };


  module.exports = MetaResolve;
})();
