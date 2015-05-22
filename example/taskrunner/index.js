var taskRunner = require("./src/taskrunner");


/**
 * JavaScript pipeline
 */
function jsPipeline() {
  this
    .load(__dirname + "/index.js")
    .then(function(moduleMeta) {
      console.log(moduleMeta);
    })
    .then(function(moduleMeta) {
      console.log(moduleMeta);
    });
}


/**
 * CoffeeScript pipeline
 */
function coffeePipeline() {
  this
    .load(__dirname + "/src/taskrunner.js")
    .then(function(moduleMeta) {
      console.log(moduleMeta);
    });
}


/**
 * Minify pipeline
 */
function minifyPipeline() {
  this
    .load(__dirname + "/../.jshintrc")
    .then(function(moduleMeta) {
      console.log(moduleMeta);
    });
}


taskRunner
  .register("javascript", ["coffeescript", "minify"], jsPipeline)
  .register("coffeescript", coffeePipeline)
  .register("minify", minifyPipeline)
  .run("minify")
  .run("javascript");
