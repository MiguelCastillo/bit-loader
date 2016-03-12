var inherit  = require("./inherit");
var Matches  = require("./matches");
var Pipeline = require("./pipeline");


function Service(context) {
  if (!context) {
    throw new Error("Service contructor requires a context");
  }

  this.context = context;
  this._pipeline = new Pipeline();
}


inherit.base(Service).extends(Matches);


Service.prototype.provider = function(provider) {
  this._provider = provider;
  return this;
};


Service.prototype.use = function(handler) {
  this._pipeline.use(handler);
  return this;
};


Service.prototype.canProcess = function(moduleMeta) {
  return this.canExecute(moduleMeta);
};


Service.prototype.runAsync = function(moduleMeta) {
  this._logger && this._logger.log(moduleMeta.name, moduleMeta);

  if (!this.canProcess(moduleMeta)) {
    return Promise.resolve(moduleMeta);
  }

  return Promise.resolve(moduleMeta)
    .then(processResultAsync(this, runPipelineAsync(this)))
    .then(processResultAsync(this, runProvider(this)));
};


Service.prototype.runSync = function(moduleMeta) {
  this._logger && this._logger.log(moduleMeta.name, moduleMeta);

  if (!this.canProcess(moduleMeta)) {
    return moduleMeta;
  }

  return [
    processResultSync(this, runPipelineSync(this)),
    processResultSync(this, runProvider(this)),
  ].reduce(function(data, handler) {
    return handler(data);
  }, moduleMeta);
};


Service.prototype.processResult = function(moduleMeta, result) {
  return result && moduleMeta !== result ? moduleMeta.configure(result) : moduleMeta;
};


function runProvider(service) {
  return function runProviderDelegate(moduleMeta) {
    if (!service._provider || !service.canProcess(moduleMeta)) {
      return moduleMeta;
    }

    return service._provider(moduleMeta);
  };
}


function runPipelineAsync(service) {
  return function runPipelineDelegate(moduleMeta) {
    return service._pipeline.runAsync(moduleMeta);
  };
}


function runPipelineSync(service) {
  return function runPipelineDelegate(moduleMeta) {
    return service._pipeline.runSync(moduleMeta);
  };
}


function processResultAsync(service, handler) {
  return function mergeResultAsync(moduleMeta) {
    return Promise.resolve(handler(moduleMeta)).then(function(result) {
      return service.processResult(moduleMeta, result);
    });
  };
}


function processResultSync(service, handler) {
  return function mergeResultSync(moduleMeta) {
    return service.processResult(moduleMeta, handler(moduleMeta));
  };
}


module.exports = Service;
