import ChatApp from "./ChatApp";
import { Row, Col } from "react-bootstrap";
import { Github, Stars, PersonBadge } from "react-bootstrap-icons";
import "./App.css";

function App() {
  return (
    <div className="App" style={{ margin: "20px", padding: "20px" }}>
      <div className="d-flex justify-content-center align-items-center mb-3">
        <img
          src="https://img.freepik.com/premium-vector/cute-business-llama-icon-illustration-alpaca-mascot-cartoon-character-animal-icon-concept-isolated_138676-989.jpg?w=1060"
          alt="Brand Logo 1"
          style={{ width: "100px", marginRight: "10px" }}
        />
        <img
          src="https://i.pinimg.com/736x/9b/4e/e0/9b4ee057076232fb57c48cf80947f8a7.jpg"
          alt="Brand Logo 2"
          style={{ width: "100px", marginRight: "10px" }}
        />
        <img
          src="https://i.pinimg.com/736x/28/70/d2/2870d28de38259d5c500562fe9f334b9.jpg"
          alt="Brand Logo 3"
          style={{ width: "100px" }}
        />
      </div>

      <ChatApp />

      <Row className="mt-4">
        <Col md={12}>
          <small>🧠 Base Model: deepseek-r1:1.5b</small>
        </Col>
        <Col md={12}>
          <small>
            <Github /> GitHub:{" "}
            <a
              href="https://github.com/Priom7/deekseek-React-Chat-App"
              target="_blank"
              rel="noopener noreferrer"
            >
              Priom7/deekseek-React-Chat-App
            </a>{" "}
            ⭐ <Stars /> (Feel Free to Star if you like it)
          </small>
        </Col>
        <Col md={12}>
          <small>
            <PersonBadge /> Developed by: <strong>Md Sharif Alam</strong> 🚀
          </small>
        </Col>
      </Row>
    </div>
  );
}

export default App;
