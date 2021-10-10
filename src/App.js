import Content from "./components/Content";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container } from "react-bootstrap";
import "./App.css";
require('dotenv').config();

function App() {
  return (
    <div>
      <Container className="container-main">
            <Content />
      </Container>
      <script src="https://unpkg.com/react/umd/react.production.min.js"></script>

      <script src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"></script>

      <script src="https://unpkg.com/react-bootstrap@next/dist/react-bootstrap.min.js"></script>

      <script>var Alert = ReactBootstrap.Alert;</script>
    </div>
  );
}

export default App;
