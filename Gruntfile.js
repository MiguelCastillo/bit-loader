//
// http://24ways.org/2013/grunt-is-not-weird-and-hard/
//
module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    connect: {
      test: {
        options: {
          port: 8002,
          hostname: 'localhost'
        }
      },
      keepalive: {
        options: {
          port: 8000,
          host: "localhost",
          keepalive: true,
          open: "http://localhost:8000/test/SpecRunner.html"
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
          urls: ["http://localhost:8002/test/SpecRunner.html"]
        }
      }
    },
    watch: {
      test: {
        files: ['src/**/*.js', 'test/**/*.js', '*.js'],
        tasks: ['jshint:all', 'build'],
        options: {
          livereload: true
        }
      }
    },
    jshint: {
      all: {
        options: {
          reporter: require('jshint-stylish')
        },
        src: ['src/**.*.js', 'test/**/*.js', '*.js']
      }
    },
    concurrent: {
      test: {
        tasks: ['connect:keepalive', 'watch:test'],
        options: {
          logConcurrentOutput : true
        }
      }
    },
    browserify: {
      "build-debug": {
        files: {
          "dist/bit-loader.js": ["src/bit-loader.js"]
        },
        options: {
          browserifyOptions: {
            "detectGlobals": false,
            "standalone": "bit-loader"
          }
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-mocha");
  grunt.loadNpmTasks("grunt-concurrent");
  grunt.loadNpmTasks("grunt-contrib-connect");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-browserify");

  grunt.registerTask("build", ["browserify:build-debug"]);
  grunt.registerTask("server", ["connect:keepalive"]);
  grunt.registerTask("test", ["connect:test", "mocha:test"]);
  grunt.registerTask("livereload", ["concurrent:test"]);
};
