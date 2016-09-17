var types = require("dis-isa");
var utils = require("belty");
var inherit = require("../inherit");
var Matches = require("../matches");
var blueprint = require("../blueprint");
var loggerFactory = require("loggero");

var HandlerBlueprint = blueprint({
  context: null,
  handler: null,
  options: null,
  id: null,
  matchers: new Matches()
});


/**
 * Plugin Handler. This is an abstraction for functions that are executed by
 * plugins. It provides a way to also encapsulate information about dynamic
 * handlers that need to be loaded during runtime.
 */
function Handler(options) {
  HandlerBlueprint.call(this);

  options = options || {};

  return this
    .merge(utils.pick(options, ["id", "context"]))
    .configure(options);
}


inherit.base(Handler).extends(HandlerBlueprint);


Handler.prototype.isDynamic = function() {
  return types.isString(this.handler);
};


/**
 * Configures handler with the provided options.
 */
Handler.prototype.configure = function(options) {
  if (types.isFunction(options) || types.isString(options)) {
    options = {
      handler: options
    };
  }

  return this
    .merge(utils.pick(options, ["handler", "options"]))
    .merge({ matchers: this.matchers.configure(options.matchers || options) });
};


Handler.prototype.canExecute = function(data) {
  return this.matchers.canExecute(data);
};


Handler.prototype.run = function(data, cancel) {
  if (!this.canExecute(data)) {
    return Promise.resolve(data);
  }

  return Promise.resolve(this.handler.call((void 0), data, this, cancel));
};


Handler.prototype.getLogger = function(name) {
  return loggerFactory.create(name || this.id);
};


Handler.prototype.serialize = function() {
  return utils.merge({
    matchers: this.matchers.serialize()
  }, utils.pick(this, ["handler", "id", "options"]));
};


module.exports = Handler;
