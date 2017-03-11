function Controller(context) {
  if (!context) {
    throw new Error("Controller constructor requires a context");
  }

  this.context = context;
}

Controller.create = function(context, controllers) {
  return Object
    .keys(controllers)
    .reduce(function(result, controller) {
      result[controller] = new controllers[controller](context);
      return result;
    }, {});
};

module.exports = Controller;
