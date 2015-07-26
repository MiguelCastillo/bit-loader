var Bitloader = require("bit-loader");
var utils = Bitloader.utils;
var loader = new Bitloader();

// Register instance we are going to be requesting
loader.register("like1", [], function(){return "Stuff";});
loader.register("like2", [], utils.noop);

loader
  .import(["like1", "like2"])
  .then(function(result) {
    console.log(result);
  });
