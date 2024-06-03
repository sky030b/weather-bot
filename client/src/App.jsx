import { useEffect, useState, useRef } from "react";
import io from 'socket.io-client';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const socket = useRef(null);

  function addMessage(userId, messageContent) {
    fetch(`http://localhost:4000/users/${userId}`, {
      method: "PATCH",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [...users.find(user => user.id === userId).messages, { id: Date.now(), message: messageContent }]
      })
    })
    .then(response => response.json())
    .then(data => {
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, messages: data.messages } : user
      );
      setUsers(updatedUsers);
      setInputValue('');
    })
  }

  const userNames = users.map((input) => {
    return (
      <div key={input.id} onClick={() => setCurrentUserId(input.id)}>
        {input.user}
      </div>
    );
  });

  const customerMessages = (users.find(user => user.id === currentUserId)?.messages || []).map((input) => {
    return (
      <div key={input.id} className="customer-area">
        <div className="customer-message">
          <p>{input.message}</p>
        </div>
      </div>
    );
  });

  const AlwaysScrollToBottom = () => {
    const elementRef = useRef();
    useEffect(() => elementRef.current.scrollIntoView());
    return <div ref={elementRef} />;
  };

  useEffect(() => {
    fetch("http://localhost:4000/users")
      .then((response) => response.json())
      .then((json) => {
        setUsers(json);
        if (json.length > 0) {
          setCurrentUserId(json[0].id);
        }
      });
  }, []);

  useEffect(() => {
    socket.current = io('http://localhost:3000');

    socket.current.on('connect', () => {
      console.log('Connected to WebSocket server!');
    });

    socket.current.on('messageFromUser', (messageObj) => {
      const userId = messageObj.serId;
      const messageContent = messageObj.message
      addMessage(userId, messageContent);
    });

    return () => {
      socket.current.disconnect();
    };
    // socket.current.on('connect', () => {
    //   console.log('Connected to WebSocket server!');
    // });
    // const roomId = "766314052904943647";
    // socket.emit('joinRoom', roomId);
    // console.log(`Joining room ${roomId}`);

    // socket.current.on('messageFromUser', (messageObj) => {
    //     const userId = messageObj.serId;
    //     const messageContent = messageObj.message
    //     addMessage(userId, messageContent);
    //   });


  }, []);

  return (
    <>
      <div className="container">
        <div className="sidebar">
          <div className="user-info" id="user-info">
            {userNames}
          </div>
          <div className="weather-info">
            <h2>天氣資訊</h2>
            <div id="weather-info">Loading...</div>
          </div>
        </div>
        <div className="main">
          <div className="chat-header">
            {currentUserId ? `客戶聊天視窗 - ${users.find(user => user.id === currentUserId)?.user}` : "客戶聊天視窗"}
          </div>
          <div className="chat-area" id="chat-area">
            {customerMessages}
            <AlwaysScrollToBottom />
          </div>
          <div className="input-area">
            <input
              type="text"
              id="chat-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="打字區..."
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  addMessage(currentUserId, inputValue);
              }} />
            <button id="send-btn" onClick={() => addMessage(currentUserId, inputValue)}>發送</button>
          </div>
        </div>
        <div className="sidebar-right">
          <h2>客服 A</h2>
          <div id="ai-response">Loading...</div>
        </div>
      </div>
    </>
  );
}

export default App;
