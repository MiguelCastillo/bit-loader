import HelloWorld from "./HelloWorld.jsx";

class Name {
  constructor(name) {
    this._name = name;
    this._helloWorld = new HelloWorld();
  }

  name() {
    return this._name;
  }
}

export default Name;
