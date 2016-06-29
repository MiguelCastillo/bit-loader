function ensureRegisteredState(context, id, state) {
  return context.controllers.registry.hasModule(id) &&
    context.controllers.registry.getModuleState(id) === state;
}


function setState(context, state) {
  return function setStateDelegate(moduleMeta) {
    if (context.controllers.registry.hasModule(moduleMeta.id)) {
      return context.controllers.registry.setModule(moduleMeta, state);
    }

    return moduleMeta;
  };
}


function runService(context, currentState, nextState, service, moduleMeta) {
  if (!moduleMeta || !ensureRegisteredState(context, moduleMeta.id, currentState)) {
    return Promise.resolve(moduleMeta);
  }

  return service.runAsync(setState(context, nextState)(moduleMeta));
}


function runServiceSync(context, currentState, nextState, service, moduleMeta) {
  if (!moduleMeta || !ensureRegisteredState(context, moduleMeta.id, currentState)) {
    return moduleMeta;
  }

  return service.runSync(setState(context, nextState)(moduleMeta));
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
  ensureRegisteredState: ensureRegisteredState,
  serviceRunner: serviceRunner,
  serviceRunnerSync: serviceRunnerSync,
  runService: runService,
  runServiceSync: runServiceSync,
  setState: setState
};
