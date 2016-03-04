function Controller(context) {
  if (!context) {
    throw new Error("Controller contructor requires a context");
  }

  this.context = context;
}

module.exports = Controller;
