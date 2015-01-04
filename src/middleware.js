(function() {
  "use strict";

  var Promise = require('spromise'),
      Utils   = require('./utils');


  function Middleware() {
    this.handlers = {};
  }


  Middleware.prototype.use = function(name, provider) {
    if (typeof(name) !== "string") {
      throw new TypeError("Must provide a name for the middleware group");
    }

    if (!provider) {
      throw new TypeError("Must provide a providers a middleware handler");
    }

    if (typeof(provider) === "function") {
      provider = {handler: provider};
    }

    this.handlers[name] = provider;
  };


  Middleware.prototype.run = function(names) {
    if (typeof(names) === "string") {
      names = [names];
    }

    if (names instanceof(Array) === false) {
      throw new TypeError("List of handlers must be a string or an array of names");
    }

    var i, length;
    var handlers = [],
        data = Array.prototype.slice.call(arguments, 1);

    for (i = 0, length = names.length; i < length; i++) {
      handlers[i] = this.handlers[names[i]];
    }

    return _runHandlers(handlers, data);
  };


  Middleware.prototype.runAll = function() {
    return _runHandlers(Utils.toArray(this.handlers), arguments);
  };


  function _runHandlers(handlers, data) {
    var cancelled = false;

    return handlers.reduce(function(prev, curr) {
      return prev.then(function() {
        if (arguments.length) {
          cancelled = true;
        }

        if (cancelled) {
          return;
        }

        return curr.handler.apply(curr, data);
      }, function(err) {
        cancelled = true;
        return err;
      });
    }, Promise.resolve());
  }


  module.exports = Middleware;
})();
