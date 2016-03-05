var types = require("dis-isa");
var Rule = require("roolio");


function Matches() {
  this._matches = null;
  this._ignore = null;
}


Matches.prototype.configure = function(options) {
  var prop;

  if (options.extensions) {
    var extensions = types.isArray(options.extensions) ? options.extensions : [options.extensions];
    this.match("path", new RegExp("[\\w]+\\.(" + extensions.join("|") + ")$", "gmi"));
  }

  for (prop in options.match) {
    if (options.match.hasOwnProperty(prop)) {
      this.match(prop, options.match[prop]);
    }
  }

  for (prop in options.ignore) {
    if (options.ignore.hasOwnProperty(prop)) {
      this.ignore(prop, options.ignore[prop]);
    }
  }

  return this;
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
  if (!this._matches) {
    this._matches = {};
  }

  if (!this._matches[prop]) {
    this._matches[prop] = new Rule();
  }

  this._matches[prop].addMatcher(matches);
  return this;
};


/**
 * Add ignore rules to prevent certain data from being processed
 * by the handler.
 */
Matches.prototype.ignore = function(prop, matches) {
  if (!this._ignore) {
    this._ignore = {};
  }

  if (!this._ignore[prop]) {
    this._ignore[prop] = new Rule();
  }

  this._ignore[prop].addMatcher(matches);
  return this;
};


Matches.prototype.runIgnore = function(data) {
  return !!this._ignore && runMatches(this._ignore, data);
};


Matches.prototype.runMatch = function(data) {
  return !!runMatches(this._matches, data);
};


Matches.prototype.canExecute = function(data) {
  if (this.runIgnore(data)) {
    return false;
  }

  return this.runMatch(data);
};


/**
 * Checks if the handler can process the input data based on whether
 * or not there are matches to be processed and if any of the matches
 * do match.
 */
function runMatches(matches, data) {
  return !matches || Object.keys(matches).some(function(match) {
    return matches[match].match(data[match]);
  });
}


module.exports = Matches;
