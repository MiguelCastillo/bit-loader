var livereloadPortNumber = generatePortNumber();
var keepalivePortNumber = generatePortNumber();
var testPortNumber = generatePortNumber();

module.exports = {
  "livereloadPortNumber": 12423, //livereloadPortNumber,
  "keepalivePortNumber": 12323, //keepalivePortNumber,
  "testPortNumber": 54232 //testPortNumber
};

function generatePortNumber() {
  return (Math.floor((Math.random() * 10000)) + 10000) % 65535;
}
