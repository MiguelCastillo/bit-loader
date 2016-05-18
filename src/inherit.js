function Context(Base) {
  this.Base = Base;
}

Context.prototype.extends = function(Extension) {
  Extension = Extension && Extension.prototype ? Extension.prototype : Extension;
  this.Base.prototype = Object.create(Extension);
  this.Base.prototype.constructor = this.Base;
  return this;
};

Context.prototype.mixin = function(Extension) {
  Extension = Extension && Extension.prototype ? Extension.prototype : Extension;
  Object.assign(this.Base.prototype, Extension);
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
