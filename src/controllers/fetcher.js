var logger     = require("loggero").create("controllers/fetcher");
var types      = require("dis-isa");
var inherit    = require("../inherit");
var helpers    = require("./helpers");
var Module     = require("../module");
var Controller = require("../controller");
var Pipeline   = require("then-pipeline");

function Fetcher(context) {
  Controller.call(this, context);

  this.inProgress = {};

  this.pipeline = new Pipeline([
    fetch(context),
    transform(context),
    dependency(context),
    fetchDependencies(this),
    precompile(context)
  ]);
}


inherit.base(Fetcher).extends(Controller);


Fetcher.prototype.fetch = function(names, referrer) {
  return this.resolveNames(names, referrer, fetchPipeline(this));
};


Fetcher.prototype.fetchOnly = function(names, referrer) {
  return this.resolveNames(names, referrer, fetch(this.context));
};


Fetcher.prototype.resolveNames = function(names, referrer, cb) {
  return types.isString(names) ?
    resolveMetaModule(this)(createModuleMeta(this, referrer)(names)).then(cb) :
    Promise.all(
      names
        .map(createModuleMeta(this, referrer))
        .map(resolveMetaModule(this))
        .map(function(d) { return d.then(cb); })
    );
};


function fetchPipeline(fetcher) {
  return function(moduleMeta) {
    logger.info(moduleMeta.name, moduleMeta);

    if (fetcher.inProgress.hasOwnProperty(moduleMeta.id)) {
      return fetcher.inProgress[moduleMeta.id].then(function() { return moduleMeta; });
    }
    else if (fetcher.context.controllers.registry.hasModule(moduleMeta.id)) {
      var state = fetcher.context.controllers.registry.getModuleState(moduleMeta.id);

      if (state !== Module.State.LOADED && state !== Module.State.READY) {
        return runPipeline(fetcher, moduleMeta).then(function() { return moduleMeta; });
      }
    }

    return Promise.resolve(moduleMeta);
  };
}


function createModuleMeta(fetcher, referrer) {
  referrer = referrer || {};

  return function(name) {
    return new Module({
      name: name,
      state: Module.State.REGISTERED,
      referrer: {
        name: referrer.name,
        path: referrer.path,
        id: referrer.id
      }
    });
  };
}


function resolveMetaModule(fetcher) {
  var context = fetcher.context;

  return function(moduleMeta) {
    if (context.isExcluded(moduleMeta.name)) {
      moduleMeta = moduleMeta.configure({
        id: moduleMeta.name,
        path: null,
        source: ""
      });

      moduleMeta = context.controllers.registry.setModule(moduleMeta, Module.State.LOADED);
      return Promise.resolve(moduleMeta);
    }
    else {
      return context.services.resolve
        .runAsync(moduleMeta)
        .then(function(moduleMeta) {
          return fetcher.context.controllers.registry.hasModule(moduleMeta.id) ?
            moduleMeta :
            fetcher.context.controllers.registry.setModule(moduleMeta, Module.State.RESOLVE);
        });
    }
  };
}


function fetch(context) {
  return helpers.serviceRunner(context, Module.State.RESOLVE, Module.State.FETCH, context.services.fetch);
}


function transform(context) {
  return helpers.serviceRunner(context, Module.State.FETCH, Module.State.TRANSFORM, context.services.transform);
}


function dependency(context) {
  return helpers.serviceRunner(context, Module.State.TRANSFORM, Module.State.DEPENDENCY, context.services.dependency);
}


function precompile(context) {
  return helpers.serviceRunner(context, Module.State.DEPENDENCY, Module.State.LOADED, context.services.precompile);
}


function fetchDependencies(fetcher) {
  return function fetchDependenciesDelegate(moduleMeta) {
    return fetcher
      .fetch(moduleMeta.deps, moduleMeta)
      .then(function(deps) {
        return moduleMeta.configure({ deps: deps });
      });
  };
}


function runPipeline(fetcher, moduleMeta) {
  function deleteInProgress() {
    delete fetcher.inProgress[moduleMeta.id];
  };

  var inProgress = fetcher.pipeline.runAsync(moduleMeta);
  fetcher.inProgress[moduleMeta.id] = inProgress;
  inProgress.then(deleteInProgress, deleteInProgress);
  return inProgress;
}


module.exports = Fetcher;
