var Promise       = require("bit-loader").Promise;
var StringDecoder = require("string_decoder").StringDecoder;


function pstream(stream) {
  return pstream.toPromise(stream);
}


pstream.toPromise = function(stream) {
  return new Promise(function(resolve, reject) {
    var decoder = new StringDecoder("utf8");
    var buffer  = "";

    stream.on("data", function onData(chunk) {
      if (chunk !== null) {
        buffer += decoder.write(chunk);
      }
    })
    .on("end", function onEnd() {
      resolve(buffer);
    })
    .on("error", function onError(error) {
      console.error(error);
      reject(error);
    });
  });
};


module.exports = pstream;
