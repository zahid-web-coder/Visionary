import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import { Link } from 'react-router-dom';

const Chatbot = ({ detectedEmotion }) => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi there! I\'m MindMirror, your AI therapist. How are you feeling today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of chat whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Analyze text emotion
  const analyzeTextEmotion = async (message) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/analyze_text_emotion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      
      const data = await response.json();
      return data.emotion || 'neutral';
    } catch (error) {
      console.error('Error analyzing text emotion:', error);
      return 'neutral';
    }
  };

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    // Add user message to chat
    const userMessage = { sender: 'user', text: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Clear input field
    const userInput = input;
    setInput('');
    
    // Show loading indicator
    setIsLoading(true);

    try {
      // First, analyze the text for emotion
      const textEmotion = await analyzeTextEmotion(userInput);
      
      // Use either the detected emotion from props or the text emotion
      const currentEmotion = detectedEmotion || textEmotion;
      
      // Send message to chatbot API
      const response = await fetch('http://127.0.0.1:5001/chatbot', {//------------------------------------------------
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
          emotion: currentEmotion
        }),
      });

      const data = await response.json();

      // Add response to chat
      if (data.reply) {
        setTimeout(() => {
          setMessages(prevMessages => [
            ...prevMessages,
            { sender: 'bot', text: data.reply }
          ]);
          setIsLoading(false);
        }, 500); // Add slight delay for better UX
      } else {
        throw new Error('No reply from server');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prevMessages => [
        ...prevMessages,
        { sender: 'bot', text: 'Sorry, I encountered an error. Please try again.' }
      ]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const getEmotionEmoji = (emotion) => {
    switch(emotion) {
      case 'happy':
        return '😊';
      case 'sad':
        return '😢';
      case 'angry':
        return '😠';
      case 'surprise':
        return '😮';
      case 'fear':
        return '😨';
      case 'disgust':
        return '🤢';
      default:
        return '😐';
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <Link to="/" className="back-button">
          ← Back
        </Link>
        <h1>MindMirror</h1>
        {detectedEmotion && (
          <div className="emotion-indicator">
            Detected mood: {getEmotionEmoji(detectedEmotion)}
          </div>
        )}
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            <div className="message-bubble">
              {message.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot">
            <div className="message-bubble typing">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;