import { useEffect, useState, useRef } from "react";
import io from 'socket.io-client';
import './App.css';

function getNowTime() {
  const taiwanOffset = 8 * 60 * 60 * 1000;
  return new Date(Date.now() + taiwanOffset).toISOString().slice(0, 19).replace("T", " ");
}

function App() {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const socket = useRef(null);

  function addMessage(userId, messageContent) {
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
      <div key={input.userId} onClick={() => setCurrentUserId(input.userId)}>
        {input.globalName}
      </div>
    );
  });

  const customerMessages = messages.map((messageObj) => {
    return (
      <div key={messageObj.userId} className={messageObj.isBot ? "customer-area" : "user-area"}>
        <div className={messageObj.isBot ? "customer-message" : "user-message"}>
          <p>{messageObj.content}</p>
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
    fetch('/api/users')
      .then((response) => response.json())
      .then((json) => {
        setUsers(json.users);
        if (json.users.length > 0) {
          setCurrentUserId(json.users[0].userId);
        }
      });

    socket.current = io('http://localhost:3000');
    socket.current.on('connect', () => {
      console.log('Connected to WebSocket server!');
    });

    // return () => {
    //   if (socket.current) {
    //     socket.current.disconnect();
    //   }
    // };

  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    fetch(`/api/messages?id=${currentUserId}`)
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        const user = users.find(user => user.userId === currentUserId);
        console.log(user);
        if (user) {
          setMessages(json.messages);
        }
      })
      .catch((error) => console.error('Error fetching messages:', error));
  }, [currentUserId]);

  useEffect(() => {
    console.log(socket.current)
    // if (!socket.current) return;

    const handleMessageFromUser = (messageObj) => {
      console.log(messages, messageObj)
      // setMessages([]);
      const userId = messageObj.userId;
      const content = messageObj.message;

      // const user = users.find(user => user.userId === userId);

      // if (!user) {
      //   console.error(`未找到ID為 ${userId} 的用戶`);
      //   return;
      // }

      const newMessages = [...messages, {
        userId,
        isBot: true,
        globalName: messageObj.username,
        content,
        timestamp: getNowTime()
      }];

      setMessages(newMessages);
      setInputValue('');
    };

    socket.current.on('messageFromUser', handleMessageFromUser);

    return () => {
      socket.current.off('messageFromUser', handleMessageFromUser);
    };
  }, [messages]);

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
            {currentUserId ? `客戶聊天視窗 - ${users.find(user => user.userId === currentUserId).globalName}` : "客戶聊天視窗"}
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
