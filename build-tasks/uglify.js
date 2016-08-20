module.exports = {
  build: {
    options: {
      preserveComments: /(?:^!|@(?:license|preserve|cc_on))/,
      sourceMap: true
    },
    files: {
      "dist/<%= pkg.name %>.min.js": ["<%= browserify.build.dest %>"]
    }
  }
};
