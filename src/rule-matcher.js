/**
 * Provides functioanlity for aggregating matching rules that can
 * then be compared against a criteria to determine if the criteria
 * is met. The matching rules can be customied beyond simple string
 * comparison. Please take a look at {@link matchers}
 *
 * @class
 *
 * @param {Object} [options={}] - Settings for the rule to be created
 */
function Rule(options) {
  options = options || {};
  this._name  = Rule.configureName(options.name);
  this._match = Rule.configureMatch(options.match);
}


var ruleId = 0;

/**
 * Helper method to generate rule names.
 *
 * @returns {string} Name of the rule
 */
Rule.configureName = function(name) {
  return name || ("rule-" + ruleId++);
};


/**
 * Helper method to generate rules that can be executed to match criteria.
 *
 * @param {*} match - If match is a function, then we just call that function
 *  to do the comparison for us. Provide a function when looking to customize
 *  how criteria are matched to rules. If match is not a function, the rule
 *  matcher is used. The default rule matcher is generally sufficient. But if
 *  it is not, then provide a function.  Furthermore, match can be an array
 *  of matching rules.
 *
 * @returns {Array.<Rule>} array of configured rule matchers.
 */
Rule.configureMatch = function(match) {
  match = match || [];
  match = !(match instanceof Array) ? [match] : match;

  return match.map(function(item) {
    return (item && item.constructor === Function) ? item : matcher(item);
  });
};


/**
 * Method that returns the name of the rule
 *
 * @returns {string} Name of the rule
 */
Rule.prototype.getName = function() {
  return this._name;
};


Rule.prototype.getLength = function() {
  return this._match.length;
};


/**
 * Method to add a match to the list of matching rules
 *
 * @param {*} match - Matching rules to add. Can any type.
 *
 * @returns {Rule} this instance.
 */
Rule.prototype.addMatch = function(match) {
  this._match = this._match.concat(Rule.configureMatch(match));
  return this;
};



/**
 * Method to match only *one* rule
 *
 * @param {string} criteria - Input to test against.
 *
 * @returns {boolean} True if any rule is matched, false otherwise
 */
Rule.prototype.match = Rule.prototype.matchAny = function(criteria) {
  var matches = this._match;
  var i, length;
  for (i = 0, length = matches.length; i < length; i++) {
    if (matches[i](criteria)) {
      return true;
    }
  }
  return false;
};


/**
 * Method to test againt *all* rules
 *
 * @param {string} criteria - Input to test against
 *
 * @returns {boolean} True is *all* rules match, false otherwise
 */
Rule.prototype.matchAll = function(criteria) {
  var matches = this._match;
  var i, length;
  for (i = 0, length = matches.length; i < length; i++) {
    if (!matches[i](criteria)) {
      return false;
    }
  }
  return true;
};


/**
 * Default matching rule with strict comparison. Or if the match is a regex
 * then the comparison is done by calling the `test` method on the regex.
 *
 * @param {*} match - If the input is a regex, then matches will be done using
 *  the regex itself. Otherwise, the comparison is done with strict comparison.
 *
 * @returns {boolean}
 */
function matcher(match) {
  if (match instanceof RegExp) {
    return function(criteria) {
      return match.test(criteria);
    };
  }

  return function(criteria) {
    return criteria === match;
  };
}


/**
 * Matcher for file extensions.
 *
 * @param {string} match - extensions to match. You can provide a pipe delimeted
 *  string to specify multiple extensions.  E.g. "js|jsx" will match js and jsx
 *  file extensions.
 *
 * @returns {function} Predicate that takes the criteria to match and returns
 *  true or false.
 */
matcher.extension = function(match) {
  if (match === "" || typeof match !== "string") {
    throw new TypeError("Matching rule must be a string");
  }

  match = new RegExp("\\.(" + match + ")$");
  return function(criteria) {
    return match.test(criteria);
  };
};


/**
 * Matcher for strings. Use this to do strict comparison on strings.
 *
 * @param {string} match - String to match a criteria against.
 *
 * @returns {function} Predicate that takes the criteria to match and returns
 *  true or false.
 */
matcher.string = function(match) {
  if (typeof match !== "string") {
    throw new TypeError("Match type must be a string");
  }

  return function(criteria) {
    return match === criteria;
  };
};


/**
 * Matcher for regex. Use this to create regex that can be used for matching
 * criteria.
 *
 * @param {string|RegExp} match - The input can be a string, which is converted
 *  to a regex. The input can also be a regex. This matcher will make sure we
 *  are working with regex matching rules.
 *
 * @returns {function} Predicate that takes the criteria to match and returns
 *  true or false.
 */
matcher.regex = function(match) {
  if (match !== "" && typeof match === "string") {
    match = new RegExp(match);
  }

  if (!(match instanceof RegExp)) {
    throw new TypeError("Match type must be a string or a regex");
  }

  return function(criteria) {
    return match.test(criteria);
  };
};


Rule.matcher = matcher;
module.exports = Rule;
