var utils       = require("belty");
var log2console = require("log2console");
var Bitloader   = require("bit-loader");

var loader = new Bitloader();

// Register instance we are going to be requesting
loader.register("like1", [], function(){return "Stuff";});
loader.register("like2", [], utils.noop);

loader
  .import(["like1", "like2"])
  .then(log2console, log2console);
