module.exports = function(grunt) {
  require("load-grunt-tasks")(grunt);
  var pkg = require("./package.json");
  var taskConfig = require("config-grunt-tasks")(grunt, "./build-tasks");
  taskConfig.pkg = pkg;

  grunt.initConfig(taskConfig);

  grunt.registerTask("build", ["eslint:all", "browserify:build", "uglify:build"]);
  grunt.registerTask("serve", ["build", "concurrent:build"]);
  grunt.registerTask("test", ["connect:test", "mocha:test"]);
  grunt.registerTask("server", ["connect:keepalive"]);
};
