var env = require("./env");

module.exports = {
  test: {
    options: {
      log: true,
      logErrors: true,
      reporter: "Spec",
      run: false,
      timeout: 10000,
      urls: ["http://localhost:" + env.testPortNumber + "/test/SpecRunner.html"]
    }
  }
};
