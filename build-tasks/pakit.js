module.exports = {
  options: {
    "umd": "bitloader",
    "files": [{
        "src": ["src/bit-loader.js"],
        "dest": "dist/index.js"
    }],
    "builtins": false
  },
  build: {

  },
  dev: {
    watch: true
  }
};
