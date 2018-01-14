var Matches  = require("./matches");
var Pipeline = require("then-pipeline");


function Service(context) {
  if (!context) {
    throw new Error("Service constructor requires a context");
  }

  this.context = context;
  this.transforms = [];
  this.matchers = new Matches();
}


Service.prototype.withPre = function(service) {
  this.pre = service;
  return this;
};


Service.prototype.withPost = function(service) {
  this.post = service;
  return this;
};


Service.prototype.provider = function(provider) {
  this._provider = provider;
  return this;
};


Service.prototype.use = function(handler) {
  this.transforms.push(handler);
  return this;
};


Service.prototype.ignore = function(prop, ignores) {
  this.matchers = this.matchers.ignore(prop, ignores);
  return this;
};


Service.prototype.match = function(prop, matches) {
  this.matchers = this.matchers.match(prop, matches);
  return this;
};


Service.prototype.validate = function(moduleMeta) {
  return this.matchers.canExecute(moduleMeta) && this.canProcess(moduleMeta);
};


Service.prototype.canProcess = function(/*moduleMeta*/) {
  return true;
};


Service.prototype.runAsync = function(moduleMeta) {
  if (!this.validate(moduleMeta)) {
    return Promise.resolve(moduleMeta);
  }

  return Promise.resolve(moduleMeta)
    .then(runPipelineAsync(this.pre))
    .then(runPipelineAsync(this))
    .then(runProviderAsync(this))
    .then(runPipelineAsync(this.post))
    .then(logIt(this));
};


Service.prototype.runSync = function(moduleMeta) {
  if (!this.validate(moduleMeta)) {
    return moduleMeta;
  }

  return [
    runPipelineSync(this.pre),
    runPipelineSync(this),
    runProviderSync(this),
    runPipelineSync(this.post),
    logIt(this)
  ].reduce(function(data, handler) {
    return handler(data);
  }, moduleMeta);
};


Service.prototype.processResult = function(moduleMeta, result) {
  return result && moduleMeta !== result ? moduleMeta.configure(result) : moduleMeta;
};


function logIt(service) {
  return function(moduleMeta) {
    service._logger && service._logger.log(moduleMeta.name, moduleMeta);
    return moduleMeta;
  };
}


function runPipelineAsync(service) {
  return function runPipelineDelegate(moduleMeta) {
    if (!service) {
      return Promise.resolve(moduleMeta);
    }

    return Pipeline
      .runAsync(moduleMeta, service.transforms)
      .then(processResult(service, moduleMeta));
  };
}


function runProviderAsync(service) {
  return function runProviderDelegate(moduleMeta) {
    if (!canRunProvider(service, moduleMeta)) {
      return moduleMeta;
    }

    return Promise
      .resolve(service._provider(moduleMeta))
      .then(processResult(service, moduleMeta));
  };
}


function runPipelineSync(service) {
  return function runPipelineDelegate(moduleMeta) {
    if (!service) {
      return moduleMeta;
    }

    return processResult(service, moduleMeta)(Pipeline.runSync(moduleMeta, service.transforms));
  };
}


function runProviderSync(service) {
  return function runProviderDelegate(moduleMeta) {
    if (!canRunProvider(service, moduleMeta)) {
      return moduleMeta;
    }

    return processResult(service, moduleMeta)(service._provider(moduleMeta));
  };
}


function processResult(service, moduleMeta) {
  return function mergeResultSync(result) {
    return service.processResult(moduleMeta, result);
  };
}


function canRunProvider(service, moduleMeta) {
  return service._provider && service.canProcess(moduleMeta);
}


Service.create = function(context, services) {
  return Object.keys(services).reduce(function(result, key) {
    var service = new services[key](context)
      .withPre(new Service(context))
      .withPost(new Service(context));

    result["pre" + key] = service.pre;
    result["post" + key] = service.post;
    result[key] = service;

    return result;
  }, {});
};


module.exports = Service;
