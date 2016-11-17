var Rule = require("roolio");
var utils = require("belty");
var blueprint = require("./blueprint");
var inherit = require("./inherit");


var MatchesBlueprint = blueprint({
  matches: null,
  ignores: null
});


function Matches(options) {
  MatchesBlueprint.call(this);
  return this.merge(Matches.configure({}, options));
}


inherit.base(Matches).extends(MatchesBlueprint);


Matches.prototype.configure = function(options) {
  return this.merge(Matches.configure(this, options));
};


/**
 * Method for adding matching rules used for determining whether or
 * not data should be processed by the handler.
 *
 * @prop {string} - Name of the property to test for matches.
 * @matches {array<string>|srting} - Matching rule pattern
 *
 * @returns {Plugin}
 */
Matches.prototype.match = function(prop, matches) {
  var options = {};
  options[prop] = matches;

  return this.merge({
    matches: Matches.mergeMatcher(this.matches, options)
  });
};


/**
 * Add ignore rules to prevent certain data from being processed
 * by the handler.
 */
Matches.prototype.ignore = function(prop, ignores) {
  var options = {};
  options[prop] = ignores;

  return this.merge({
    ignores: Matches.mergeMatcher(this.ignores, options)
  });
};


Matches.prototype.runMatch = function(data) {
  return !!Matches.runMatchers(this.matches, data);
};


Matches.prototype.runIgnore = function(data) {
  return !!(this.ignores && Matches.runMatchers(this.ignores, data));
};


Matches.prototype.canExecute = function(data) {
  if (this.runIgnore(data)) {
    return false;
  }

  return this.runMatch(data);
};


Matches.prototype.serialize = function() {
  return utils.merge({}, {
    ignores: this.ignores,
    matches: this.matches
  });
};


Matches.configure = function(target, options) {
  options = options || {};

  var extensions = Matches.mergeExtensions(target.matches, options.extensions);

  return {
    matches: Matches.mergeMatcher(extensions, options.matches || options.match),
    ignores: Matches.mergeMatcher(target.ignores, options.ignores || options.ignore)
  };
};


/**
 * Method to merge extensions into the container of pattern matching
 * rules.
 */
Matches.mergeExtensions = function(target, extensions) {
  if (extensions) {
    extensions = utils.toArray(extensions).join("|");
  }

  if (!extensions) {
    return target;
  }

  return Matches.mergeMatcher(target, {
    filepath: new RegExp("[\\w]+\\.(" + extensions + ")$", "mi")
  });
};


/**
 * Method that merges matches into an object. This also concatinates
 * all the matcher arrays. Matchers are object with properties for
 * pattern matching against input objects.
 */
Matches.mergeMatcher = function(target, matchers) {
  if (!matchers) {
    return target;
  }

  return Object
    .keys(matchers)
    .reduce(function(target, matcher) {
      if (!target[matcher]) {
        target[matcher] = [];
      }

      target[matcher] = target[matcher].concat(utils.toArray(matchers[matcher]));
      return target;
    }, utils.merge({}, target));
};


Matches.buildMatchers = function(matchers) {
  return Object
    .keys(matchers)
    .reduce(function(target, matcher) {
      if (!target[matcher]) {
        target[matcher] = new Rule();
      }

      target[matcher] = target[matcher].addMatcher(matchers[matcher]);
      return target;
    }, {});
};


/**
 * Checks if the handler can process the input data based on whether
 * or not there are matches to be processed and if any of the matches
 * do match.
 */
Matches.runMatchers = function(configuration, data) {
  if (!configuration) {
    return true;
  }

  var matchers = Matches.buildMatchers(configuration);
  return Object.keys(matchers).some(function(prop) {
    return matchers[prop].match(data[prop]);
  });
};


module.exports = Matches;
