import { useState } from "react";

function ChatPanel({ chat, onSend }) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSend(message);
    setMessage("");
  };

  return (
    <div className="panel chat-panel">
      <div className="panel-header">
        <div className="panel-title">
          <div className="panel-icon icon-chat"></div>
          Live Chat
        </div>
      </div>

      <div className="chat-list">
        {chat.map((item, i) => (
          <div className="chat-item" key={`${item.createdAt}-${i}`}>
            <div className="chat-item-name">{item.userName}</div>
            <p>{item.message}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="chat-form">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default ChatPanel;
