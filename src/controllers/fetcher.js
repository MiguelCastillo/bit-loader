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
    fetchService(context),
    transformService(context),
    dependencyService(context),
    precompileService(context)
  ]);
}


inherit.base(Fetcher).extends(Controller);


Fetcher.prototype.fetch = function(names, referrer, deep) {
  var fetcher = this;

  return resolveNames(this, utils.toArray(names), referrer)
    .then(function(moduleMetas) {
      return Promise.all(moduleMetas.map(runFetchPipeline(fetcher, deep)));
    })
    .then(function(moduleMetas) {
      return moduleMetas.map(function(moduleMeta) {
        return fetcher.context.controllers.registry.getModule(moduleMeta.id);
      });
    })
    .then(function(modules) {
      return types.isArray(names) ? modules : modules[0];
    });
};


Fetcher.prototype.fetchOnly = function(names, referrer) {
  var fetcher = this;

  return resolveNames(this, utils.toArray(names), referrer)
    .then(function(moduleMetas) {
      return Promise.all(moduleMetas.map(fetchService(fetcher.context)));
    })
    .then(function(moduleMetas) {
      return moduleMetas.map(function(moduleMeta) {
        return fetcher.context.controllers.registry.getModule(moduleMeta.id);
      });
    })
    .then(function(modules) {
      return types.isArray(names) ? modules : modules[0];
    });
};


function resolveNames(fetcher, names, referrer) {
  return Promise.all(
    names
      .map(configureModuleMeta(fetcher, referrer))
      .map(resolveMetaModule(fetcher))
  );
}


function configureModuleMeta(fetcher, referrer) {
  referrer = referrer || {};

  return function(config) {
    if (types.isString(config)) {
      config = {
        name: config
      };
    }
    else if (config instanceof Module) {
      return config.merge({
        referrer: utils.pick(referrer, ["name", "path", "filename", "id"])
      });
    }

    return new Module(utils.merge({}, config, {
      referrer: utils.pick(referrer, ["name", "path", "filename", "id"])
    }));
  };
}


function resolveMetaModule(fetcher) {
  var context = fetcher.context;

  return function(moduleMeta) {
    return context.services.resolve
      .runAsync(moduleMeta)
      .then(configureModuleId)
      .then(function(moduleMeta) {
        return (
          fetcher.context.controllers.registry.hasModule(moduleMeta.id) ? moduleMeta :
          moduleMeta.state ? fetcher.context.controllers.registry.setModule(moduleMeta) :
          fetcher.context.controllers.registry.setModule(moduleMeta.withState(Module.State.RESOLVE))
        );
      });
  };
}


function runFetchPipeline(fetcher, deep) {
  return function runFetchPipelineDelegate(moduleMeta) {
    return deep === false ?
      fetchPipeline(fetcher, moduleMeta) :
      fetchPipeline(fetcher, moduleMeta).then(fetchDependencies(fetcher));
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


function fetchService(context) {
  return helpers.serviceRunner(context, Module.State.RESOLVE, Module.State.FETCH, context.services.fetch);
}


function transformService(context) {
  return helpers.serviceRunner(context, Module.State.FETCH, Module.State.TRANSFORM, context.services.transform);
}


function dependencyService(context) {
  return helpers.serviceRunner(context, Module.State.TRANSFORM, Module.State.DEPENDENCY, context.services.dependency);
}


function precompileService(context) {
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
            return getInProgress(fetcher, dependency) || runFetchPipeline(fetcher)(dependency);
          }))
          .then(function(dependencies) {
            fetcher.context.controllers.registry.updateModule(mod.configure({ deps: dependencies }));
            return moduleMeta;
          });
      });
  };
}


function fetchPipeline(fetcher, moduleMeta) {
  logger.info(moduleMeta.name, moduleMeta);
  return getInProgress(fetcher, moduleMeta) || runPipeline(fetcher, moduleMeta).then(function() { return moduleMeta; });
}


function getInProgress(fetcher, moduleMeta) {
  if (fetcher.inProgress.hasOwnProperty(moduleMeta.id)) {
    return fetcher.inProgress[moduleMeta.id].then(function() { return moduleMeta; });
  }

  if (fetcher.context.controllers.registry.hasModule(moduleMeta.id)) {
    var state = fetcher.context.controllers.registry.getModuleState(moduleMeta.id);

    if (state !== Module.State.RESOLVE) {
      return Promise.resolve(moduleMeta);
    }
  }
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
