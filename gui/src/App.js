import ChatApp from "./ChatApp";
import { Row, Col } from "react-bootstrap";
import { Github, Stars, PersonBadge } from "react-bootstrap-icons";
import "./App.css";

function App() {
  return (
    <div className="App" style={{ margin: "20px", padding: "20px" }}>

      <ChatApp />

      <Row className="mt-4">
        <Col md={12}>
          <small>🧠 Base Model: {process.env.REACT_APP_AI_MODEL}</small>
        </Col>
      </Row>
    </div>
  );
}

export default App;
