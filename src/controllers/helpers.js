function ensureRegisteredState(context, moduleMeta, state) {
  var id = moduleMeta && moduleMeta.id;

  return (
    context.controllers.registry.hasModule(id) &&
    context.controllers.registry.getModuleState(id) === state
  );
}

function setState(context, newState) {
  return function(moduleMeta) {
    return context.controllers.registry.hasModule(moduleMeta.id) ?
      context.controllers.registry.setModule(moduleMeta, newState) :
      moduleMeta;
  };
}

function runService(context, currentState, nextState, service, moduleMeta) {
  return ensureRegisteredState(context, moduleMeta, currentState) ?
    service.runAsync(moduleMeta).then(setState(context, nextState)) :
    Promise.resolve(moduleMeta);
}

function runServiceSync(context, currentState, nextState, service, moduleMeta) {
  return ensureRegisteredState(context, moduleMeta, currentState) ?
    setState(context, nextState)(service.runSync(moduleMeta)) :
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
