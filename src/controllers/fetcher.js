//var logger   = require("loggero").create("controllers/fetch");
var types      = require("dis-isa");
var inherit    = require("../inherit");
var helpers    = require("./helpers");
var Module     = require("../module");
var Pipeline   = require("../pipeline");
var Controller = require("../controller");

function Fetcher(context) {
  Controller.call(this, context);

  this.inProgress = {};
  this.pipeline = new Pipeline([
    fetch(context),
    transform(context),
    dependency(context),
    fetchDependencies(this),
    helpers.setState(context, Module.State.LOADED)
  ]);
}


inherit.base(Fetcher).extends(Controller);


Fetcher.prototype.fetch = function(names, referrer) {
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
  if (fetcher.context._exclude.indexOf(name) !== -1) {
    var moduleMeta = new Module.Meta({
      id: name,
      name: name,
      path: null,
      source: ""
    });

    fetcher.context.controllers.registry.setModule(moduleMeta, Module.State.LOADED);
    return Promise.resolve(moduleMeta);
  }

  return fetcher.context.controllers.resolver.resolve(name, {
    name: referrer.name,
    path: referrer.path,
    id: referrer.id
  }).then(tryRunPipeline(fetcher));
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
    else if (fetcher.context.controllers.registry.hasModule(moduleMeta.id)) {
      return Promise.resolve(moduleMeta);
    }

    fetcher.context.controllers.registry.setModule(moduleMeta, Module.State.RESOLVE);
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


module.exports = Fetcher;
