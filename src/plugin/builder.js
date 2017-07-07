var utils = require("belty");

var defaults = {};

function Builder(options) {
  if (!(this instanceof Builder)) {
    return new Builder(options);
  }

  this.settings = utils.merge({}, defaults);
  this.merge(options);
}

Builder.prototype.merge = Builder.prototype.configure = function(options) {
  options = options || {};
  var settings = utils.assign(this.settings, utils.omit(options, ["match", "matches", "ignore", "ignores"]), arrayMergeTransform);

  if (options.match || options.matches) {
    settings.matches = utils.assign(settings.matches, options.match, options.matches, arrayMergeTransform);
  }

  if (options.ignore || options.ignores) {
    settings.ignores =  utils.assign(settings.ignores, options.ignore, options.ignores, arrayMergeTransform);
  }

  this.settings = settings;
  return this;
};

Builder.prototype.build = function() {
  return utils.merge({}, this.settings);
};

Builder.create = function(options) {
  return new Builder(options);
};

function arrayMergeTransform(target, source) {
 return (target || []).concat(utils.toArray(source));
}

module.exports = Builder;
