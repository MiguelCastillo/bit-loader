var browserPack = require("browser-pack");
var pstream     = require("p-stream");


/**
 * Convenience factory for specifying the instance of bit loader to bundle up
 */
function bundlerFactory(loader, options) {
  function bundlerDelegate(modules) {
    return bundler(loader, options || {}, modules);
  }

  bundlerDelegate.bundle = function(names) {
    return loader.fetch(names).then(bundlerDelegate);
  };

  return bundlerDelegate;
}


/**
 * Bundles up incoming modules. This will process all dependencies and will create
 * a bundle using browser-pack.
 *
 * @returns {Promise} When resolve, the full bundle buffer is returned
 */
function bundler(loader, options, modules) {
  var stack    = modules.slice(0);
  var mods     = [];
  var finished = {};

  function processModule(mod) {
    if (finished.hasOwnProperty(mod.id)) {
      return;
    }

    mod = loader.getModule(mod.id);

    // browser pack chunk
    var browserpack = {
      id     : mod.id,
      source : mod.source,
      deps   : {}
    };

    // Gather up all dependencies
    var i, length, dep;
    for (i = 0, length = mod.deps.length; i < length; i++) {
      dep = mod.deps[i];
      stack.push(dep);
      browserpack.deps[dep.id] = dep.id;
    }

    finished[mod.id] = browserpack;
    mods.unshift(browserpack);
  }

  // Process all modules
  while (stack.length) {
    processModule(stack.pop());
  }

  var stream = browserPack(options).setEncoding("utf8");
  var promise = pstream(stream);

  stream.end(JSON.stringify(mods));
  return promise;
}


module.exports = bundlerFactory;
