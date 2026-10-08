import React, { useState, useEffect, useRef } from 'react';
import { Send, Image, Paperclip, MoreVertical, X, Check, CheckCheck, FileText } from 'lucide-react';
import { io } from 'socket.io-client';
import './ChatRoom.css';

const socket = io(`http://${window.location.hostname}:5000`); // Connect to backend dynamically

const ChatRoom = ({ group, match, onClose }) => {
  const roomId = group ? `group_${group.id}` : `match_${match?.id || 'room'}`;
  const title = group ? group.name : (match?.user || 'Peer Conversation');
  const avatar = group ? group.icon : (match?.avatar || '💬');
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    socket.emit('join_room', roomId);

    socket.on('room_history', (history) => {
      // The history will contain messages sent by this user and others
      // To correctly display "isMe", we rely on the sender name matching "You" in a real scenario,
      // But since "You" is relative, a better approach is attaching a unique socket.id to each message.
      // For simplicity here, we assume any message where sender isn't "You" is from the peer.
      setMessages(history.map(msg => ({
        ...msg,
        isMe: msg.socketId === socket.id
      })));
    });

    socket.on('receive_message', (message) => {
      setMessages((prevMessages) => [...prevMessages, { ...message, isMe: false, status: 'read' }]);
    });

    return () => {
      socket.off('room_history');
      socket.off('receive_message');
    };
  }, [roomId]);

  const handleSend = (e, customText) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    
    const textToSend = typeof customText === 'string' ? customText : inputText;
    
    if (!textToSend || typeof textToSend !== 'string' || !textToSend.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: textToSend,
      sender: "You",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      status: 'sent',
      socketId: socket.id
    };

    // Optimistically add to UI
    setMessages(prev => [...prev, newMessage]);
    
    // Emit to server
    socket.emit('send_message', { roomId, message: newMessage });
    setInputText("");

    // Simulate delivery and read receipts
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: 'delivered' } : m));
    }, 1000);
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: 'read' } : m));
    }, 2000);
  };

  const handleAttachment = () => {
    fileInputRef.current?.click();
  };

  const handleImage = () => {
    imageInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleSend(null, `📎 Attached: ${file.name}`);
      e.target.value = ''; // reset
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleSend(null, `🖼️ Attached Image: ${file.name}`);
      e.target.value = ''; // reset
    }
  };

  return (
    <div className="chat-room-overlay">
      <div className="chat-room">
        <header className="chat-header">
          <div className="chat-header-info">
            <div className="chat-avatar-small" style={match ? { background: 'linear-gradient(135deg, #10B981, #3B82F6)' } : {}}>{avatar}</div>
            <div>
              <h3>{title}</h3>
              <p className="online-status">Online</p>
            </div>
          </div>
          <div className="chat-header-actions" style={{ position: 'relative' }}>
            <button className="icon-btn-small" onClick={() => setShowMenu(!showMenu)}>
              <MoreVertical size={20} />
            </button>
            {showMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                zIndex: 10,
                width: '150px',
                padding: '4px'
              }}>
                <button 
                  style={{ width: '100%', padding: '8px', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px' }} 
                  onClick={() => {
                    setIsMuted(!isMuted);
                    setShowMenu(false);
                  }}
                >
                  {isMuted ? 'Unmute Chat' : 'Mute Chat'}
                </button>
                <button 
                  style={{ width: '100%', padding: '8px', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#ef4444' }} 
                  onClick={() => {
                    setShowMenu(false);
                    alert(`${title} has been blocked and reported.`);
                    onClose();
                  }}
                >
                  Block User
                </button>
              </div>
            )}
            <button className="icon-btn-small" onClick={onClose}><X size={20} /></button>
          </div>
        </header>

        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`message-wrapper ${msg.isMe ? 'sent' : 'received'}`}>
              <div className="message-bubble">
                {!msg.isMe && <span className="message-sender">{title}</span>}
                <p className="message-text">{msg.text}</p>
                <div className="message-footer">
                  <span className="message-time">{msg.time}</span>
                  {msg.isMe && (
                    <span className="message-status">
                      {msg.status === 'sent' && <Check size={14} />}
                      {msg.status === 'delivered' && <CheckCheck size={14} />}
                      {msg.status === 'read' && <CheckCheck size={14} className="status-read" />}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-area" onSubmit={(e) => handleSend(e)}>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileChange}
          />
          <input 
            type="file" 
            accept="image/*" 
            ref={imageInputRef} 
            style={{ display: 'none' }} 
            onChange={handleImageChange}
          />
          <button type="button" className="icon-btn-small" onClick={handleAttachment} title="Upload File"><Paperclip size={20} /></button>
          <input 
            type="text" 
            placeholder="Type a message (or paste Zoom ID)" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />
          <button type="button" className="icon-btn-small" onClick={handleImage} title="Upload Image"><Image size={20} /></button>
          <button type="button" className="send-btn" disabled={!inputText.trim()} onClick={(e) => handleSend(e)}><Send size={20} /></button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;

