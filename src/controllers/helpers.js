function verifyCurrentState(context, moduleMeta, currentState) {
  var id = moduleMeta.id;

  return (
    context.controllers.registry.hasModule(id) &&
    context.controllers.registry.getModuleState(id) === currentState
  );
}

function setState(context, currentState, nextState) {
  return function(moduleMeta) {
    if (context.controllers.registry.hasModule(moduleMeta.id)) {
      if (!moduleMeta.state || moduleMeta.state === currentState) {
        moduleMeta = moduleMeta.withState(nextState);
      }

      context.controllers.registry.setModule(moduleMeta);
      return moduleMeta;
    }

    throw new Error("Unable to set state because module does not exist");
  };
}

function runService(context, currentState, nextState, service, moduleMeta) {
  return verifyCurrentState(context, moduleMeta, currentState) ?
    service.runAsync(moduleMeta).then(setState(context, currentState, nextState)) :
    Promise.resolve(moduleMeta);
}

function runServiceSync(context, currentState, nextState, service, moduleMeta) {
  return verifyCurrentState(context, moduleMeta, currentState) ?
    setState(context, currentState, nextState)(service.runSync(moduleMeta)) :
    moduleMeta;
}

function serviceRunner(context, currentState, nextState, service) {
  return function serviceRunnerDelegate(moduleMeta) {
    return runService(context, currentState, nextState, service, moduleMeta);
  };
}

function serviceRunnerSync(context, currentState, nextState, service) {
  return function serviceRunnerSyncDelegate(moduleMeta) {
    return runServiceSync(context, currentState, nextState, service, moduleMeta);
  };
}

module.exports = {
  serviceRunner: serviceRunner,
  serviceRunnerSync: serviceRunnerSync,
  runService: runService,
  runServiceSync: runServiceSync
};
