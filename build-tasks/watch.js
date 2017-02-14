var env = require("./env");

module.exports = {
  build: {
    files: ["dist/**/*.js", "test/**/*.js"],
    options: {
      livereload: env.livereloadPortNumber
    }
  }
};
