module.exports = {
  build: {
    options: {
      preserveComments: "some",
      sourceMap: true
    },
    files: {
      "dist/<%= pkg.name %>.min.js": ["<%= browserify.build.dest %>"]
    }
  }
};
