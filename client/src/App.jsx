import "./App.css";
import io from "socket.io-client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

const socket = io("http://localhost:4000");

function App() {
  const [nickname, setNickname] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [storedMessages, setStoredMessages] = useState([]);
  const [firstTime, setFirstTime] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [isCurrentUserTyping, setIsCurrentUserTyping] = useState(false);
  const chatRef = useRef(null);
  const url = "http://localhost:4000/api/";

  useEffect(() => {
    const receivedMessage = (message) => {
      setMessages([message, ...messages]);
    };
    socket.on("message", receivedMessage);

    socket.on("typing", (data) => {
      setIsTyping(data.isTyping);
      setTypingUser(data.user);
    });

    return () => {
      socket.off("message", receivedMessage);
      socket.off("typing");
    };
  }, [messages]);

  if (!firstTime) {
    axios.get(url + "messages").then((res) => {
      setStoredMessages(res.data.messages);
    });
    setFirstTime(true);
  }

  const handleNicknameSubmit = (e) => {
    e.preventDefault();
    if (nickname !== "") {
      setDisabled(true);
      socket.emit("nickname", nickname);
    }
  };

  const handleDisconnect = () => {
    setNickname("");
    setDisabled(false);
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    setIsTyping(e.target.value !== "");
    setIsCurrentUserTyping(e.target.value !== "");
    socket.emit("typing", { isTyping: e.target.value !== "", user: nickname });
    if (!e.target.value) {
      socket.emit("typing", { isTyping: false, user: nickname });
    }
  };

  const handleMessageSubmit = (e) => {
    e.preventDefault();

    if (nickname !== "") {
      socket.emit("message", message, nickname);

      const newMessage = {
        body: message,
        from: nickname,
      };
      setMessages([newMessage, ...messages]);
      setMessage("");

      setIsTyping(false);
      setIsCurrentUserTyping(false);

      axios.post(url + "save", {
        message: message,
        from: nickname,
      });
    } else {
      alert("Si no te logeas con un nickname, no vas a poder mandar mensajes");
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-gray-200 px-4 py-2 pt-8">
        <form onSubmit={handleNicknameSubmit} className="mb-3">
          <div className="flex mb-3">
            <input
              type="text"
              className="w-full border rounded-full py-2 px-4 mr-3"
              id="nickname"
              placeholder="¡Escribí tu nickname deseado acá!"
              disabled={disabled}
              onChange={(e) => setNickname(e.target.value)}
              value={nickname}
              required
            />
            {disabled ? (
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-full"
                type="button"
                onClick={handleDisconnect}
              >
                Desloguear
              </button>
            ) : (
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-full"
                type="submit"
                id="btn-nickname"
                disabled={disabled}
              >
                Establecer
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-gray-200 flex-1 overflow-y-scroll" ref={chatRef}>
        <div
          className="px-4 py-2"
          style={{ maxHeight: "calc(100% - 50px)", overflowY: "auto" }}
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg p-4 shadow mb-4 max-w-md ${
                message.from === nickname ? "ml-auto" : ""
              }`}
            >
              <small className={message.from === nickname ? "text-black" : ""}>
                {message.from}: {message.body}
              </small>
            </div>
          ))}

          {storedMessages.map((message, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg p-4 shadow mb-4 max-w-md ${
                message.from === nickname ? "ml-auto" : ""
              }`}
            >
              <small
                className={
                  message.from === nickname ? "text-black" : "text-muted"
                }
              >
                {message.from}: {message.message}
              </small>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-100 px-4 py-2">
        <form onSubmit={handleMessageSubmit}>
          <div className="flex items-center">
            <input
              type="text"
              className="w-full border rounded-full py-2 px-4 mr-2"
              placeholder="Escribí tu mensaje..."
              onChange={handleTyping}
              value={message}
            />
            <div className="text-lg text-gray-500">
              {isTyping &&
                !isCurrentUserTyping &&
                `${typingUser ? typingUser : "Alguien"} está escribiendo...`}
            </div>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-full"
              type="submit"
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;