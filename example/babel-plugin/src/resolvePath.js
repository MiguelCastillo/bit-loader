var path           = require("path");
var fs             = require("fs");
var browserResolve = require("browser-resolve");
var log2console    = require("log2console");


/**
 * Resolves the path for the moduleMeta object.  It uses process.cwd as the baseUrl
 */
function resolver(moduleMeta) {
  return resolve(moduleMeta, {baseUrl: process.cwd()});
}


/**
 * Configurator for resolver. This will create and return a resolve function to be
 * called with the moduleMeta, which will be processed with the options passed in
 * when configure was called.
 */
resolver.configure = function(options) {
  options = options || {};

  if (!options.hasOwnProperty("baseUrl")) {
    options.baseUrl = process.cwd();
  }

  return function resolveDelegate(moduleMeta) {
    return resolve(moduleMeta, options);
  };
};


/**
 * Convert module name to full module path
 */
function resolve(moduleMeta, options) {
  function setPath(path) {
    return {
      path: path
    };
  }

  return resolvePath(moduleMeta, options).then(setPath, log2console);
}


/**
 * Figures out the path for the moduleMeta so that the module file can be loaded from storage.
 *
 * We use browser-resolve to do the heavy lifting for us, so all this module is really doing
 * is wrapping browser-resolve so that it can be used by bit loader in a convenient way.
 */
function resolvePath(moduleMeta, options) {
  var parentPath = getParentPath(moduleMeta, options);

  var filePath = path.resolve(path.dirname(options.baseUrl), moduleMeta.name);
  if (fs.existsSync(filePath)) {
    return Promise.resolve(filePath);
  }

  return new Promise(function(resolve, reject) {
    browserResolve(moduleMeta.name, {filename: parentPath}, function(err, path) {
      if (err) {
        reject(err);
      }
      else {
        resolve(path);
      }
    });
  });
}


/**
 * Gets the path for the module requesting the moduleMeta being resolved. This is what
 * happens when a dependency is loaded.
 */
function getParentPath(moduleMeta, options) {
  var referrer = moduleMeta.referrer;
  return (referrer && moduleMeta !== referrer) ? referrer.path : options.baseUrl;
}


module.exports = resolver;
