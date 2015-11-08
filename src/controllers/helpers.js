function ensureRegisteredState(manager, id, state) {
  return manager.controllers.registry.hasModule(id) &&
    manager.controllers.registry.getModuleState(id) === state;
}


function setState(manager, state) {
  return function setStateDelegate(moduleMeta) {
    if (manager.controllers.registry.hasModule(moduleMeta.id)) {
      manager.controllers.registry.setModule(moduleMeta, state);
    }

    return moduleMeta;
  };
}


function runService(manager, currentState, nextState, service, moduleMeta) {
  if (!moduleMeta || !ensureRegisteredState(manager, moduleMeta.id, currentState)) {
    return Promise.resolve(moduleMeta);
  }

  return service.run(setState(manager, nextState)(moduleMeta));
}


function runServiceSync(manager, currentState, nextState, service, moduleMeta) {
  if (!moduleMeta || !ensureRegisteredState(manager, moduleMeta.id, currentState)) {
    return moduleMeta;
  }

  return service.runSync(setState(manager, nextState)(moduleMeta));
}


function serviceRunner(manager, currentState, nextState, service) {
  return function serviceRunnerDelegate(moduleMeta) {
    return runService(manager, currentState, nextState, service, moduleMeta);
  };
}


function serviceRunnerSync(manager, currentState, nextState, service) {
  return function serviceRunnerSyncDelegate(moduleMeta) {
    return runServiceSync(manager, currentState, nextState, service, moduleMeta);
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
