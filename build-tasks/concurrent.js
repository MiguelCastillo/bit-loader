module.exports = {
  build: {
    tasks: ["connect:keepalive", "pakit:dev", "watch:build"],
    options: {
      logConcurrentOutput: true
    }
  }
};
