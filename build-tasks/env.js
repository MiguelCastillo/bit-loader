var livereloadPortNumber = generatePortNumber();
var keepalivePortNumber = generatePortNumber();
var testPortNumber = generatePortNumber();

module.exports = {
  "livereloadPortNumber": livereloadPortNumber,
  "keepalivePortNumber": keepalivePortNumber,
  "testPortNumber": testPortNumber
};

function generatePortNumber() {
  return (Math.floor((Math.random() * 10000)) + 10000) % 65535;
}
