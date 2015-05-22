var fs        = require("fs");
var Bitloader = require("bit-loader");
var Utils     = Bitloader.Utils;
var Promise   = Bitloader.Promise;


/**
 * Function that reads file from disk
 *
 * @param {object} moduleMeta - Module meta with information about the module being loaded
 */
function fileReader(moduleMeta) {
  // Read file from disk and return a module meta
  return readFile(moduleMeta.path)
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
        var chunk = stream.read();
        if (chunk !== null) {
          filecontent += chunk;
        }
      })
      .on("end", function() {
        resolve(filecontent);
      })
      .on("error", reject);
  });
}


module.exports = fileReader;
