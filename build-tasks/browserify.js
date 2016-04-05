var date = new Date();
var today = date.toDateString() + " " + date.toLocaleTimeString();
var banner = "/*! <%= pkg.name %> v<%= pkg.version %> - " + today + ". (c) " + date.getFullYear() + " Miguel Castillo. Licensed under MIT */";

module.exports = {
  build: {
    src: ["src/<%= pkg.name %>.js"],
    dest: "dist/<%= pkg.name %>.js",
    options: {
      banner: banner,
      browserifyOptions: {
        detectGlobals: false,
        standalone: "bitloader"
      }
    }
  }
};
