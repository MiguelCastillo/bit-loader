var types = require("dis-isa");
var utils = require("belty");

function File(options) {
  if (!(this instanceof File)) {
    return new File(options);
  }

  return (
    options instanceof File ?
    utils.assign(this, options) :
    utils.assign(this, configureFile(options))
  );
}

function configureFile(file) {
  if (!file) {
    throw new TypeError("Must provide a valid input. String, Array<String>, { src: Array<String> }, { content: String | Buffer }");
  }

  if (types.isString(file) || types.isArray(file)) {
    return { path: file };
  }
  else {
    const content = file.content || file.source;
    const path = file.path || file.src;

    if (types.isString(content) || types.isBuffer(content)) {
      return { content: content.toString(), path: path };
    }
    else if (path) {
      return { path: path };
    }
  }
};

module.exports = File;
