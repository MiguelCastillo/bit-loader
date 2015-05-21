var fs        = require("fs");
var Bitloader = require("../../dist/bit-loader.js");
var Utils     = Bitloader.Utils;
var Promise   = Bitloader.Promise;


/**
 * FetchFactory provides a fetch interface that is used by bit loader
 * to load files from storage.
 *
 * @private
 *
 * @param {Bitloader} loader - bit loader instance
 */
function fileReader(moduleMeta) {
  // Read file from disk and return a module meta
  return readFile(moduleMeta.name)
    .then(function(text) {
      return {
        source: text
      };
    }, Utils.forwardError);
}


/**
 * Read file from storage.  You can very easily replace this with a routine
 * that loads data using XHR.
 *
 * @private
 *
 * @param {string} fileName - Name of the file to read
 *
 * @returns {Promise}
 */
function readFile(fileName) {
  return new Promise(function(resolve, reject) {
    var filecontent = "";
    var stream = fs
      .createReadStream(__dirname + "/" + fileName)
      .setEncoding("utf8");

    stream
      .on("readable", function() {
        filecontent += stream.read();
      })
      .on("end", function() {
        resolve(filecontent);
      })
      .on("error", reject);
  });
}


module.exports = fileReader;
