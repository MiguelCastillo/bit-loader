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
    return { names: file };
  }
  else if (types.isArray(file.src) && file.src.length) {
    return { names: file.src };
  }
  else if (types.isString(file.contents) || types.isBuffer(file.contents)) {
    return { contents: file.contents.toString(), path: file.path };
  }
  else if (types.isString(file.source) || types.isBuffer(file.source)) {
    return { contents: file.source.toString(), path: file.path };
  }
};

module.exports = File;
