const logger = require("loggero").create("controllers/fetcher");
const types = require("dis-isa");
const inherit = require("../inherit");
const helpers = require("./helpers");
const Module = require("../module");
const Controller = require("../controller");
const utils = require("belty");
const File = require("../file");

var id = 0;

function Fetcher(context) {
  Controller.call(this, context);
  this.inProgress = {};
}


inherit.base(Fetcher).extends(Controller);


Fetcher.prototype.fetch = function(data, referrer, deep) {
  const file = new File(data);
  const services = [fetchService, transformService, dependencyService];

  const fetchFile = (
    file.content ? { id: (file.id || "@anonymous-" + id++), source: file.content, path: file.path } :
    file.path ? file :
    file.src
  );

  if (fetchFile) {
    return this._loadModules(fetchFile, referrer, deep, services);
  }
  else {
    throw new Error("Must provide file path(s) and or content for the fetcher to load");
  }
};


Fetcher.prototype.fetchOnly = function(names, referrer, deep) {
  return this._loadModules(names, referrer, deep, [fetchService]);
};


Fetcher.prototype._buildTree = function(modules, referrer, services) {
  return Promise
    .all(this.resolveModules(modules, referrer, services))
    .then(modules =>
      Promise
        .all(modules
          .filter(mod => !getIfReady(this, mod) && !getInProgress(this, mod))
          .map(mod => runPipeline(this, mod, services))
        )
        .then(modules => Promise.all(
          modules.map(mod => {
            const mod1 = this.context.controllers.registry.getModule(mod.id);
  
            return this
              ._buildTree(mod1.deps, mod1, services)
              .then(deps => this.context.controllers.registry.updateModule(mod1.configure({ deps: deps })))
              .then(() => mod);
          }))
        )
        .then(() => modules)
    );
};


Fetcher.prototype._buildNodes = function(modules, referrer, services) {
  return Promise.all(
    this
      .resolveModules(modules, referrer)
      .map(deferred => deferred.then(mod => getIfReady(this, mod) || getInProgress(this, mod) || runPipeline(this, mod, services)))
  );
};


Fetcher.prototype._loadModules = function(names, referrer, deep, services) {
  services = services.map(service => service(this.context));
  const deferred = deep === false ? this._buildNodes([].concat(names), referrer, services) : this._buildTree([].concat(names), referrer, services);
  return deferred.then((result) => buildResult(this, names, result));
};


Fetcher.prototype.resolveModules = function(modules, referrer) {
  return (
    modules
      .map(configureModuleMeta(this, referrer))
      .map(resolveMetaModule(this))
  );
};


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
  const context = fetcher.context;
  const controllers = context.controllers;

  return function(mod) {
    return context.services.resolve
      .runAsync(mod)
      .then(configureModuleId)
      .then((mod) => (
        controllers.registry.hasModule(mod.id) ? mod :
        mod.state ? controllers.registry.setModule(mod) :
        controllers.registry.setModule(mod.withState(Module.State.RESOLVE))
      ));
  };
}


function configureModuleId(mod) {
  const result = {};

  if (!mod.path && mod.url) {
    result.path = mod.url && mod.url.href;
  }

  if (!mod.hasOwnProperty("id") && mod.path) {
    result.id = mod.path;
  }

  return mod.configure(result);
}


function fetchService(context) {
  return helpers.serviceRunner(context, Module.State.RESOLVE, Module.State.FETCH, context.services.fetch);
}


function transformService(context) {
  return helpers.serviceRunner(context, Module.State.FETCH, Module.State.TRANSFORM, context.services.transform);
}


function dependencyService(context) {
  return helpers.serviceRunner(context, Module.State.TRANSFORM, Module.State.LOADED, context.services.dependency);
}


function getInProgress(fetcher, mod) {
  if (fetcher.inProgress.hasOwnProperty(mod.id)) {
    return fetcher.inProgress[mod.id].then(() => mod);
  }

  if (fetcher.context.controllers.registry.hasModule(mod.id)) {
    const state = fetcher.context.controllers.registry.getModuleState(mod.id);

    if (state !== Module.State.RESOLVE) {
      return Promise.resolve(mod);
    }
  }
}


function getIfReady(fetcher, mod) {
  const state = fetcher.context.controllers.registry.getModuleState(mod.id);

  if (state === Module.State.LOADED || state === Module.State.READY) {
    return Promise.resolve(mod);
  }
}


function runPipeline(fetcher, mod, services) {
  logger.info(mod.name || mod.id, mod);

  function deleteInProgress() {
    delete fetcher.inProgress[mod.id];
  };

  const inProgress = services.reduce((deferred, service) => deferred.then(service), Promise.resolve(mod));
  inProgress.then(deleteInProgress, deleteInProgress);
  return (fetcher.inProgress[mod.id] = inProgress);
}


function buildResult(fetcher, items, modules) {
  const getModule = (mod) => fetcher.context.controllers.registry.getModule(mod.id);
  return Array.isArray(items) ? modules.map(getModule) : getModule(modules[0]);
}


module.exports = Fetcher;
