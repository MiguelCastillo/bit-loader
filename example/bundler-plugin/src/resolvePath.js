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
  moduleMeta.configure({
    path: options.baseUrl + "/" + moduleMeta.name
  });
}


module.exports = resolvePath;
