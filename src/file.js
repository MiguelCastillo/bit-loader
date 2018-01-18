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

/**
 * file has a couple of relevant fields.
 * 
 * - content, which is a string or buffer that is the actual file content. Sometime
 *   this field comes along with a path in order to properly resolve the paths for
 *   any dependencies relative to the given path.
 * - path, which is a fully qualified path for the file. This does not get resolved
 *   by bit-loader.
 * - src, which is an array of files to be loaded. These gets resolved by bit-loader.
 */
function configureFile(file) {
  if (!file) {
    throw new TypeError("Must provide a valid input. String, Array<String>, { src: Array<String> }, { content: String | Buffer }");
  }

  if (types.isString(file) || types.isArray(file)) {
    return { src: file };
  }
  else {
    const content = file.content || file.source;

    if (types.isString(content) || types.isBuffer(content)) {
      return { content: content.toString(), path: file.path };
    }

    return file;
  }
};

module.exports = File;
