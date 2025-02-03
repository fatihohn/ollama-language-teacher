import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false); // New state for recording
  const [audioStream, setAudioStream] = useState(null); // Store the audio stream
  const [mediaRecorder, setMediaRecorder] = useState(null); // Store the media recorder instance
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isThinking]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setIsThinking(false);

    try {
      const response = await fetch(`http://${process.env.REACT_APP_DOMAIN}:11434/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.REACT_APP_AI_MODEL,
          messages: [...messages, userMessage],
          stream: true,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let messageContent = "";
      let reasoningContent = "";
      let jsonString = ""

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        const chunkContent = decoder.decode(value, { stream: true });
        jsonString += chunkContent;

        if (chunkContent.startsWith("<think>")) {
          setIsThinking(true);
          reasoningContent += chunkContent.replace("<think>", "");
        } else if (chunkContent.startsWith("</think>")) {
          setIsThinking(false);
          reasoningContent += chunkContent.replace("</think>", "");
        } else if (isThinking) {
          reasoningContent += chunkContent;
        }
      }

      try {
        const jsonArray = jsonString
          .split('\n')
          .filter(line => line.trim())
          .map(line => JSON.parse(line));

        jsonArray.forEach(data => {
          if (data.message?.content) {
            messageContent += data.message.content;
          }
        });
      } catch (e) {
        console.error("JSON parsing error:", e);
      }

      setMessages((prev) => {
        const assistantMessage = {
          role: "assistant",
          content: messageContent.replace(/<think>.*?<\/think>/gs, ""),
          reasoning: reasoningContent,
        };
        return [...prev, assistantMessage];
      });
    } catch (error) {
      console.error("Error streaming response:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  // Start recording function
  const startRecording = async () => {
    if (isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      recorder.ondataavailable = async (event) => {
        const audioBlob = event.data;
        const audioFile = await blobToArrayBuffer(audioBlob);
        console.log("Audio file:", audioFile);
        sendToWhisper(audioFile);
        // sendToWhisper(audioBlob);
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  // Stop recording function
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      audioStream.getTracks().forEach((track) => track.stop()); // Stop the audio stream
      setIsRecording(false);
    }
  };

  // Convert Blob to ArrayBuffer for sending to backend
  const blobToArrayBuffer = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });
  };

  const sendToWhisper = async (audioBlob) => {
    const formData = new FormData();
    formData.append("audio", new Blob([audioBlob], { type: "audio/wav" }));
    // formData.append("audio", audioBlob, "recording.wav"); // Attach the Blob

    try {
      const response = await fetch(`http://${process.env.REACT_APP_DOMAIN}:5001/transcribe`, {
        method: "POST",
        body: formData, // Send FormData instead of JSON
      });

      if (!response.ok) {
        throw new Error("Failed to transcribe audio");
      }

      const data = await response.json();
      setInput(data.text); // Set the transcription result as input message
    } catch (error) {
      console.error("Error sending audio to Whisper:", error);
    }
  };

  return (
    <div className="container py-4">
      <h1>
        <i className="bi bi-chat-dots-fill"></i> Chat with your Custom agent 🤖
      </h1>

      <Card
        className="shadow-sm mb-4"
        style={{ maxHeight: "40vh", overflowY: "auto", minHeight: "40vh" }}
      >
        <Card.Body>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              className={`d-flex mb-3 ${msg.role === "user"
                  ? "justify-content-end"
                  : "justify-content-start"
                }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className={`p-3 rounded shadow-sm ${msg.role === "user"
                    ? "bg-primary text-white"
                    : "bg-light text-dark"
                  }`}
                style={{ maxWidth: "70%" }}
              >
                <p>{msg.content}</p>
                {msg.reasoning && (
                  <p className="text-secondary">
                    <i className="bi bi-brain"></i> {msg.reasoning}
                  </p>
                )}
              </Card>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              className="d-flex justify-content-start mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-3 rounded bg-light shadow-sm text-secondary">
                <i className="bi bi-three-dots"></i> Typing...
              </Card>
            </motion.div>
          )}
          {isThinking && (
            <motion.div
              className="d-flex justify-content-start mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-3 rounded bg-light shadow-sm text-secondary">
                <i className="bi bi-brain"></i> Thinking...
              </Card>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </Card.Body>
      </Card>

      <div className="input-group">
        <button
          className="btn btn-secondary"
          onClick={isRecording ? stopRecording : startRecording}
        >
          <i className={`bi ${isRecording ? "bi-stop-circle" : "bi-mic"}`}></i>
        </button>
        <input
          type="text"
          className="form-control"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          className="btn btn-primary"
          onClick={sendMessage}
          disabled={!input.trim()}
        >
          <i className="bi bi-send"></i>
        </button>
      </div>
    </div>
  );
}
