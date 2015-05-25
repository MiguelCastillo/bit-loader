import Header from "js/Header.jsx";
import Body from "js/Body.jsx";

class HelloWorld extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div>
        <Header/>
        <Body/>
        <div>Hello World!</div>
      </div>
    );
  }
}

export default HelloWorld;
