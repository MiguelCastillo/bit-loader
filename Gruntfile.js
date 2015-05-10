//
// http://24ways.org/2013/grunt-is-not-weird-and-hard/
//
module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    connect: {
      test: {
        options: {
          port: 8052,
          hostname: 'localhost'
        }
      },
      keepalive: {
        options: {
          port: 8050,
          host: "localhost",
          keepalive: true,
          open: "http://localhost:8050/test/SpecRunner.html"
        }
      }
    },
    mocha: {
      test: {
        options: {
          log: true,
          logErrors: true,
          reporter: "Spec",
          run: false,
          timeout: 10000,
          urls: ["http://localhost:8052/test/SpecRunner.html"]
        }
      }
    },
    watch: {
      test: {
        files: ['src/**/*.js', 'test/**/*.js', '*.js'],
        tasks: ['build'],
        options: {
          livereload: 32000
        }
      }
    },
    jshint: {
      all: {
        options: {
          jshintrc: true,
          reporter: require('jshint-stylish')
        },
        src: ['src/**/*.js', 'test/**/*.js', '*.js']
      }
    },
    concurrent: {
      test: {
        tasks: ['connect:keepalive', 'watch:test'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    browserify: {
      "build": {
        src: ["src/<%= pkg.name %>.js"],
        dest: "dist/<%= pkg.name %>.js",
        options: {
          browserifyOptions: {
            "detectGlobals": false,
            "standalone": "bitloader"
          }
        }
      }
    },
    uglify: {
      "build": {
        options: {
          sourceMap: true
        },
        files: {
          "dist/<%= pkg.name %>.min.js": ["<%= browserify.build.dest %>"]
        }
      }
    },
    release: {
      options: {
        tagName: 'v<%= version %>',
        tagMessage: 'Version <%= version %>',
        commitMessage: 'Release v<%= version %>',
        afterBump: ['build']
      }
    },
    usebanner: {
      "build": {
        options: {
          position: 'top',
          banner: "/** <%= pkg.name %> v<%= pkg.version %> - <%= grunt.template.today('yyyy-mm-dd') %>. (c) <%= grunt.template.today('yyyy') %> Miguel Castillo. Licensed under MIT */",
          linebreak: true
        },
        files: {
          src: ['dist/**.js']
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-mocha");
  grunt.loadNpmTasks("grunt-release");
  grunt.loadNpmTasks("grunt-banner");
  grunt.loadNpmTasks("grunt-concurrent");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-connect");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-browserify");

  grunt.registerTask("build", ["jshint:all", "browserify:build", "uglify:build", "usebanner:build"]);
  grunt.registerTask("server", ["connect:keepalive"]);
  grunt.registerTask("test", ["connect:test", "mocha:test"]);
  grunt.registerTask("dev", ["concurrent:test"]);
};
