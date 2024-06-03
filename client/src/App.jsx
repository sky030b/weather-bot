import { useEffect, useState, useRef } from "react";
import io from 'socket.io-client';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const socket = useRef(null);

  // function addMessage(userId, messageContent) {
  //   console.log(userId, messageContent);
  //   console.log(123, users);
  //   console.log(users.find(user => user.id === userId));
  //   console.log(users.find(user => user.id === userId).messages);
  //   fetch(`http://localhost:4000/users/${userId}`, {
  //     method: "PATCH",
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify({
  //       messages: [...users.find(user => user.id === userId).messages, { id: Date.now(), message: messageContent }]
  //     })
  //   })
  //   .then(response => response.json())
  //   .then(data => {
  //     const updatedUsers = users.map(user => 
  //       user.id === userId ? { ...user, messages: data.messages } : user
  //     );
  //     console.log(updatedUsers);
  //     setUsers(updatedUsers);
  //     setInputValue('');
  //   })
  // }

  function addMessage(userId, messageContent) {
    const newMessage = {
      messages: [...users.find(user => user.id === userId).messages, { id: Date.now(), message: messageContent }]
    }
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, messages: newMessage.messages } : user
    );
    setUsers(updatedUsers);
    setInputValue('');

    // 新增：將消息發送到 WebSocket
    const messageObj = {
      roomId: userId,
      message: messageContent,
    };
    socket.current.emit('sendMessageToUser', messageObj);

    const roomId = userId;
  
    socket.current.emit('joinRoom', roomId);
    console.log(`Joining room ${roomId}`);
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
      <div key = {input.id} className = {(!input.username  || input.username === "weather-bot") ? "customer-area" : "user-area" }>
        <div className={(!input.username  || input.username === "weather-bot") ? "customer-message" : "user-message"}>
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

      socket.current = io('http://localhost:3000');
      socket.current.on('connect', () => {
        console.log('Connected to WebSocket server!');
      });
  }, []);

  useEffect(() => {
    if (!socket.current) return;

    const handleMessageFromUser = (messageObj) => {
      const userId = messageObj.userId;
      const messageContent = messageObj.message;

      const user = users.find(user => user.id === userId);

      if (!user) {
        console.error(`未找到ID為 ${userId} 的用戶`);
        return;
      }

      const newMessage = {
        messages: [...user.messages, { 
          id: Date.now(), 
          message: messageContent, 
          username:messageObj.username 
        }]
      }
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, messages: newMessage.messages } : user
      );
      setUsers(updatedUsers);
      setInputValue('');
    };

    socket.current.on('messageFromUser', handleMessageFromUser);

    return () => {
      socket.current.off('messageFromUser', handleMessageFromUser);
    };
  }, [users]);

  // useEffect(() => {

  //   // return () => {
  //   //   socket.current.disconnect();
  //   // };

  //   socket.current.on('messageFromUser', (messageObj) => {
  //     const userId = messageObj.userId;
  //     const messageContent = messageObj.message;
  //     console.log(userId,messageContent);
      
  //     const newMessage = {
  //       messages: [...users.find(user => user.id === userId).messages, { id: Date.now(), message: messageContent }]
  //     }
  //     const updatedUsers = users.map(user => 
  //       user.id === userId ? { ...user, messages: newMessage.messages } : user
  //     );
  //     console.log(updatedUsers);
  //     setUsers(updatedUsers);
  //     setInputValue('');

  //     console.log(123456);
  //   });

  // }, [users]);

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
