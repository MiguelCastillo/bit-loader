//var logger   = require("loggero").create("controllers/fetch");
var types    = require("dis-isa");
var helpers  = require("./helpers");
var Module   = require("../module");
var Pipeline = require("../pipeline");


function Fecther(manager) {
  if (!manager) {
    throw new TypeError("Must provide a manager");
  }

  this.manager = manager;
  this.inProgress = {};

  this.pipeline = new Pipeline([
    fetch(manager),
    transform(manager),
    dependency(manager),
    fetchDependencies(this),
    helpers.setState(manager, Module.State.LOADED)
  ]);
}


Fecther.prototype.fetch = function(names, referrer) {
  referrer = referrer || {};
  var fetcher = this;

  if (types.isString(names)) {
    return _fetch(fetcher, names, referrer);
  }
  else {
    return Promise.all(names.map(function(name) {
      return _fetch(fetcher, name, referrer);
    }));
  }
};


function _fetch(fetcher, name, referrer) {
  return fetcher.manager.controllers.resolver.resolve(name, {
    name: referrer.name,
    path: referrer.path,
    id: referrer.id
  }).then(tryRunPipeline(fetcher));
}


function fetch(manager) {
  return helpers.serviceRunner(manager, Module.State.RESOLVE, Module.State.FETCH, manager.services.fetch);
}


function transform(manager) {
  return helpers.serviceRunner(manager, Module.State.FETCH, Module.State.TRANSFORM, manager.services.transform);
}


function dependency(manager) {
  return helpers.serviceRunner(manager, Module.State.TRANSFORM, Module.State.DEPENDENCY, manager.services.dependency);
}


function fetchDependencies(fetcher) {
  return function fetchDependenciesDelegate(moduleMeta) {
    return Promise.all(moduleMeta.deps.map(function(name) {
        return fetcher.fetch(name, moduleMeta);
      }))
      .then(function(deps) {
        return moduleMeta.configure({ deps: deps });
      });
  };
}


function tryRunPipeline(fetcher) {
  return function tryRunPipelineDelegate(moduleMeta) {
    if (fetcher.inProgress.hasOwnProperty(moduleMeta.id)) {
      return fetcher.inProgress[moduleMeta.id].then(function() { return moduleMeta; });
    }
    else if (fetcher.manager.controllers.registry.hasModule(moduleMeta.id)) {
      return Promise.resolve(moduleMeta);
    }

    fetcher.manager.controllers.registry.setModule(moduleMeta, Module.State.RESOLVE);
    return runPipeline(fetcher, moduleMeta).then(function() { return moduleMeta; });
  };
}


function runPipeline(fetcher, moduleMeta) {
  function deleteInProgress() {
    delete fetcher.inProgress[moduleMeta.id];
  };

  var inProgress = fetcher.pipeline.run(moduleMeta);
  fetcher.inProgress[moduleMeta.id] = inProgress;
  inProgress.then(deleteInProgress, deleteInProgress);
  return inProgress;
}


module.exports = Fecther;
