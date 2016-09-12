var logger     = require("loggero").create("controllers/fetcher");
var types      = require("dis-isa");
var inherit    = require("../inherit");
var helpers    = require("./helpers");
var Module     = require("../module");
var Controller = require("../controller");
var Pipeline   = require("then-pipeline");
var utils      = require("belty");

function Fetcher(context) {
  Controller.call(this, context);

  this.inProgress = {};

  this.pipeline = new Pipeline([
    fetch(context),
    pretransform(context),
    transform(context),
    dependency(context),
    precompile(context)
  ]);
}


inherit.base(Fetcher).extends(Controller);


Fetcher.prototype.fetch = function(names, referrer) {
  var fetcher = this;

  return resolveNames(this, utils.toArray(names), referrer)
    .then(function(moduleMetas) {
      return Promise.all(moduleMetas.map(fetchModuleMeta(fetcher)));
    })
    .then(function(moduleMetas) {
      return types.isArray(names) ? moduleMetas : moduleMetas[0];
    });
};


Fetcher.prototype.fetchOnly = function(names, referrer) {
  var fetcher = this;

  return resolveNames(this, utils.toArray(names), referrer)
    .then(function(result) {
      return Promise.all(result.map(fetch(fetcher.context)));
    })
    .then(function(result) {
      return types.isArray(names) ? result : result[0];
    });
};


function resolveNames(fetcher, names, referrer) {
  return Promise.all(
    names
      .map(createModuleMeta(fetcher, referrer))
      .map(resolveMetaModule(fetcher))
  );
}


function fetchPipeline(fetcher) {
  return function(moduleMeta) {
    logger.info(moduleMeta.name, moduleMeta);

    if (fetcher.inProgress.hasOwnProperty(moduleMeta.id)) {
      return fetcher.inProgress[moduleMeta.id].then(function() { return moduleMeta; });
    }

    if (fetcher.context.controllers.registry.hasModule(moduleMeta.id)) {
      var state = fetcher.context.controllers.registry.getModuleState(moduleMeta.id);

      if (state !== Module.State.RESOLVE) {
        return Promise.resolve(moduleMeta);
      }
    }

    return runPipeline(fetcher, moduleMeta).then(function() { return moduleMeta; });
  };
}


function createModuleMeta(fetcher, referrer) {
  referrer = referrer || {};

  return function(config) {
    if (types.isString(config)) {
      config = {
        name: config
      };
    }
    else if (config instanceof Module) {
      return config.merge({ referrer: referrer });
    }

    return new Module(utils.merge({}, config, { referrer: {
      name: referrer.name,
      path: referrer.path,
      id: referrer.id
    } }));
  };
}


function resolveMetaModule(fetcher) {
  var context = fetcher.context;

  return function(moduleMeta) {
    if (context.isExcluded(moduleMeta.name)) {
      moduleMeta = moduleMeta.configure({
        id: moduleMeta.name,
        path: null,
        source: "",
        state: Module.State.LOADED
      });

      context.controllers.registry.setModule(moduleMeta);
      return Promise.resolve(moduleMeta);
    }
    else {
      return context.services.resolve
        .runAsync(moduleMeta)
        .then(configureModuleId)
        .then(function(moduleMeta) {
          return fetcher.context.controllers.registry.hasModule(moduleMeta.id) ?
            moduleMeta :
            fetcher.context.controllers.registry.setModule(moduleMeta.withState(Module.State.RESOLVE));
        });
    }
  };
}


function fetchModuleMeta(fetcher) {
  return function fetchModuleMetaDelegate(moduleMeta) {
    return fetchPipeline(fetcher)(moduleMeta).then(fetchDependencies(fetcher));
  };
}


function configureModuleId(moduleMeta) {
  var result = {};

  if (!moduleMeta.path && moduleMeta.url) {
    result.path = moduleMeta.url && moduleMeta.url.href;
  }

  if (!moduleMeta.hasOwnProperty("id") && moduleMeta.path) {
    result.id = moduleMeta.path;
  }

  return moduleMeta.configure(result);
}


function fetch(context) {
  return helpers.serviceRunner(context, Module.State.RESOLVE, Module.State.FETCH, context.services.fetch);
}


function pretransform(context) {
  return helpers.serviceRunner(context, Module.State.FETCH, Module.State.PRETRANSFORM, context.services.pretransform);
}


function transform(context) {
  return helpers.serviceRunner(context, Module.State.PRETRANSFORM, Module.State.TRANSFORM, context.services.transform);
}


function dependency(context) {
  return helpers.serviceRunner(context, Module.State.TRANSFORM, Module.State.DEPENDENCY, context.services.dependency);
}


function precompile(context) {
  return helpers.serviceRunner(context, Module.State.DEPENDENCY, Module.State.LOADED, context.services.precompile);
}


function fetchDependencies(fetcher) {
  return function fetchDependenciesDelegate(moduleMeta) {
    var mod = fetcher.context.controllers.registry.getModule(moduleMeta.id);

    if (!mod.deps.length) {
      return Promise.resolve(moduleMeta);
    }

    return resolveNames(fetcher, mod.deps, mod)
      .then(function(result) {
        return Promise
          .all(result.map(function(dependency) {
            if (fetcher.inProgress.hasOwnProperty(dependency.id)) {
              return fetcher.inProgress[dependency.id].then(function() { return dependency; });
            }

            if (fetcher.context.controllers.registry.hasModule(dependency.id)) {
              var state = fetcher.context.controllers.registry.getModuleState(dependency.id);

              if (state !== Module.State.RESOLVE) {
                return dependency;
              }
            }

            return fetchModuleMeta(fetcher)(dependency);
          }))
          .then(function(dependencies) {
            fetcher.context.controllers.registry.updateModule(mod.configure({ deps: dependencies }));
            return moduleMeta;
          });
      });
  };
}


function runPipeline(fetcher, moduleMeta) {
  function deleteInProgress() {
    delete fetcher.inProgress[moduleMeta.id];
  };

  var inProgress = fetcher.pipeline.runAsync(moduleMeta);
  inProgress.then(deleteInProgress, deleteInProgress);
  fetcher.inProgress[moduleMeta.id] = inProgress;
  return fetcher.inProgress[moduleMeta.id];
}


module.exports = Fetcher;
