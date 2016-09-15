function Controller(context) {
  if (!context) {
    throw new Error("Controller constructor requires a context");
  }

  this.context = context;
}

module.exports = Controller;
