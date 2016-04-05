var env = require("./env");

module.exports = {
  build: {
    files: ["src/**/*.js", "test/**/*.js", "*.js"],
    tasks: ["build"],
    options: {
      livereload: env.livereloadPortNumber
    }
  }
};
