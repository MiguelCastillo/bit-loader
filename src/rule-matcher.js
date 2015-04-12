(function() {
  "use strict";


  /**
   * Rule is a convenience class for encapsulating a rule name and
   * the match criteria to test against.
   *
   * @param {Object} [options={}] - Settings for the rule to be created
   */
  function Rule(options) {
    options = options || {};
    this.settings = options;
    this.name     = Rule.configureName(options.name);
    this.match    = Rule.configureMatch(options.match);
  }


  Rule.prototype.addMatch = function(match) {
    match = Rule.configureMatch(match);
    this.match = this.match.concat(match);
  };


  Rule.id = 0;


  Rule.configureName = function(name) {
    return name || ("rule-" + Rule.id++);
  };


  Rule.configureMatch = function(match) {
    match = match || [];
    return !(match instanceof Array) ? [match] : match;
  };


  /**
   * Rule matching engine
   */
  function RuleMatcher() {
    this._rules = {};
  }


  RuleMatcher.prototype.add = function(config) {
    var rule = this.find(config.name);
    if (rule) {
      rule.addMatch(config.match);
    }
    else {
      rule = new Rule(config);
      this._rules[rule.name] = rule;
    }
    return rule;
  };


  RuleMatcher.prototype.find = function(ruleName) {
    return this._rules[ruleName];
  };


  RuleMatcher.prototype.filter = function(ruleNames) {
    var rules = {};
    for (var rule in ruleNames) {
      if (this.hasRule(ruleNames[rule])) {
        rules[rule] = this.find(rule);
      }
    }
    return rules;
  };


  RuleMatcher.prototype.match = function(criteria, ruleNames) {
    return typeof ruleNames === "string" ?
      this.matchOne(criteria, ruleNames) :
      this.matchAny(criteria, ruleNames);
  };


  RuleMatcher.prototype.matchOne = function(criteria, ruleName) {
    // Make sure the rule exists
    if (!this.hasRule(ruleName)) {
      return false;
    }

    var i, length;
    var rule = this.find(ruleName);
    for (i = 0, length = rule.match.length; i < length; i++) {
      if (~rule.match.indexOf(criteria)) {
        return true;
      }
    }
    return false;
  };


  RuleMatcher.prototype.matchAny = function(criteria, filter) {
    var rules = filter ? this.filter(filter) : this._rules;
    for (var rule in rules) {
      if (this.matchOne(criteria, rules[rule].name)) {
        return true;
      }
    }
    return false;
  };


  RuleMatcher.prototype.matchAll = function(criteria, filter) {
    var rules = filter ? this.filter(filter) : this._rules;
    for (var rule in rules) {
      if (!this.matchOne(criteria, rules[rule].name)) {
        return false;
      }
    }
    return true;
  };


  RuleMatcher.prototype.hasRule = function(ruleName) {
    return this._rules.hasOwnProperty(ruleName);
  };


  RuleMatcher.prototype.ensureRule = function(ruleName) {
    if (!this.hasRule(ruleName)) {
      throw new TypeError("Rule '" + ruleName + "' was not found");
    }
    return true;
  };


  module.exports = RuleMatcher;
})();
