var taskRunner  = require("./src/taskrunner");
var log2console = require("log2console");


/**
 * JavaScript pipeline
 */
function jsPipeline() {
  this
    .load("./index.js")
    .then(log2console, log2console);
}


/**
 * CoffeeScript pipeline
 */
function coffeePipeline() {
  this
    .load("./src/taskrunner.js")
    .then(log2console, log2console);
}


/**
 * Minify pipeline
 */
function minifyPipeline() {
  this
    .load("../.jshintrc")
    .then(log2console, log2console);
}


taskRunner.configure({baseUrl: __filename})
  .register("javascript", ["coffeescript", "minify"], jsPipeline)
  .register("coffeescript", coffeePipeline)
  .register("minify", minifyPipeline)
  .run("minify")
  .run("javascript");
