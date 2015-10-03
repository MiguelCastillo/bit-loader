function compile(moduleMeta) {
  return {
    code: moduleMeta.source
  };
}

module.exports = compile;
