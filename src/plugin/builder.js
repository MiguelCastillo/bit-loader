var utils = require("belty");

var defaults = {
  extensions: []
};

function Builder(options) {
  if (!(this instanceof Builder)) {
    return new Builder(options);
  }

  this._configuration = merge(utils.merge({}, defaults), options);
}

Builder.prototype.configure = function(options) {
  merge(this._configuration, options);
  return this;
};

Builder.prototype.build = function() {
  return utils.merge({}, this._configuration);
};

Builder.create = function(options) {
  return new Builder(options);
};

function merge(pluginConfig, options) {
  options = options || {};
  utils.extend(pluginConfig, mergeState(pluginConfig, utils.omit(options, ["match", "matches", "ignore", "ignores"])));

  var matches = options.match || options.matches;
  if (matches) {
    pluginConfig.matches = mergeState(pluginConfig.matches, matches);
  }

  var ignores = options.ignore || options.ignores;
  if (ignores) {
    pluginConfig.ignores = mergeState(pluginConfig.ignores, ignores);
  }

  return pluginConfig;
};

function mergeState(currentState, newState) {
  currentState = currentState || {};

  return Object
    .keys(newState)
    .reduce(function(result, key) {
      result[key] = (currentState[key] || []).concat(utils.toArray(newState[key]));
      return result;
    }, {});
}

module.exports = Builder;
