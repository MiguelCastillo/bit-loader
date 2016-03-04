function Context(Base) {
  this.Base = Base;
}

Context.prototype.extends = function(Extension) {
  this.Base.prototype = Object.create(Extension.prototype);
  this.Base.prototype.constructor = this.Base;
  return this;
};

function inherit(Base) {
  return inherit.base(Base);
}

inherit.base = function(Base) {
  return new Context(Base);
};

module.exports = inherit;
