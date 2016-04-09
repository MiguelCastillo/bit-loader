var types   = require("dis-isa");
var utils   = require("belty");
var inherit = require("../inherit");
var Matches = require("../matches");


var id = 0;


/**
 * Plugin class definition
 */
function Handler(handler) {
  Matches.call(this);

  this.handler = handler;

  if (types.isString(handler)) {
    this.id = handler;
  }
  else {
    this.id = "handler-" + id++;
  }
}


inherit.base(Handler).extends(Matches);


/**
 * Factory method to create Plugins
 *
 * @handler {string|function} - Plugin handler. Can be a module name to be lodaded,
 *  or a function.
 * @options {object} - Options.
 *
 * @returns {Handler} New Handler instance
 */
Handler.create = function(handler, options) {
  handler = new Handler(handler);
  return options ? handler.configure(options) : handler;
};


Handler.prototype.isDynamic = function() {
  return types.isString(this.handler);
};


/**
 * Configures handler with the provided options.
 */
Handler.prototype.configure = function(options) {
  Matches.prototype.configure.call(this, options);

  this.options = utils.merge({}, [this.options, options]);
  return utils.merge(this, utils.pick(options, ["handler", "name", "id"]));
};


Handler.prototype.run = function(data, cancel) {
  if (!this.canExecute(data)) {
    return Promise.resolve(data);
  }

  return Promise.resolve(this.handler(data, this.options, cancel));
};


module.exports = Handler;
