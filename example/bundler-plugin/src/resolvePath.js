var path = require("path");

function resolvePath(moduleMeta) {
  return resolve(moduleMeta, {baseUrl: __dirname});
}


resolvePath.configure = function(options) {
  options = options || {};
  return function resolver(moduleMeta) {
    return resolve(moduleMeta, options);
  };
};


/**
 * Convert module name to full module path
 */
function resolve(moduleMeta, options) {
  var parent = moduleMeta.parent;
  var filePath;

  if (path.isAbsolute(moduleMeta.name)) {
    filePath = moduleMeta.name;
  }
  else {
    filePath = path.join((parent && path.dirname(parent.path)) || options.baseUrl,  moduleMeta.name);
  }

  moduleMeta.configure({
    path: filePath
  });
}


module.exports = resolvePath;
