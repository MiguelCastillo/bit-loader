var fs        = require("fs");
var pstream   = require("p-stream");
var Bitloader = require("bit-loader");
var utils     = Bitloader.utils;


/**
 * Function that reads file from disk
 *
 * @param {object} moduleMeta - Module meta with information about the module being loaded
 */
function fileReader(moduleMeta) {
  // Read file from disk and return a module meta
  return pstream(readFile(moduleMeta.path))
    .then(function(text) {
      return {
        source: text
      };
    }, utils.reportError);
}


/**
 * Read file from storage. You can very easily replace this with a routine
 * that loads data using XHR.
 *
 * @private
 *
 * @param {string} filePath - Full path for the file to be read
 *
 * @returns {Promise}
 */
function readFile(filePath) {
  return fs
    .createReadStream(filePath)
    .setEncoding("utf8");
}


module.exports = fileReader;
