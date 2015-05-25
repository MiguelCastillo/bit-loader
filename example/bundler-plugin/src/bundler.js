var browserPack = require("browser-pack");
var pstream     = require("./pstream");


function bundlerFactory(loader) {
  return function bundlerDelegate(modules) {
    return bundler(loader, modules);
  };
}


/**
 * Bundles up incoming modules
 */
function bundler(loader, modules) {
  var stack = modules.slice(0);
  var mods = [];
  var finished = {};
  var total = 0;

  function processModule(mod) {
    if (finished.hasOwnProperty(mod.name)) {
      return;
    }

    var depsNames = {};
    var moduleMeta = mod.meta;
    var deps = mod.deps;

    // Gather up all dependencies
    var i, length, dep;
    for (i = 0, length = deps.length; i < length; i++) {
      dep = deps[i];
      stack.push(loader.getModule(dep));
      depsNames[dep] = total++;
    };

    var browserpack = {
      id: moduleMeta.name,
      source: moduleMeta.source,
      deps: depsNames
    };

    finished[moduleMeta.name] = browserpack;
    mods.unshift(browserpack);
  }

  // Process all modules
  while (stack.length) {
    processModule(stack.pop());
  }

  var stream  = browserPack();
  var promise = pstream(stream);
  stream.end(JSON.stringify(mods));
  return promise;
}


module.exports = bundlerFactory;
