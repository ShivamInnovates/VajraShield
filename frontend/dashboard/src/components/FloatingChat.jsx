import React, { useState } from 'react';
import { HiSparkles } from 'react-icons/hi';
import { FiX, FiSend, FiMinimize2 } from 'react-icons/fi';

export default function FloatingChat({ darkMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm JARSH, your AI Risk Assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: inputValue,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);

      // Simulate bot response
      setTimeout(() => {
        const botResponse = {
          id: messages.length + 2,
          text: "I'm analyzing your request. This feature will soon provide AI-powered risk insights!",
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botResponse]);
      }, 800);

      setInputValue('');
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-110 z-50 ${
          isOpen
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
        }`}
      >
        {isOpen ? (
          <FiX className="w-6 h-6 text-white" />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <HiSparkles className="w-7 h-7 text-white animate-pulse" />
            <div className="absolute w-16 h-16 border-2 border-white rounded-full animate-pulse opacity-50"></div>
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-24 right-6 w-96 h-[500px] rounded-lg shadow-2xl flex flex-col transition-all duration-300 transform z-50 ${
            darkMode
              ? 'bg-gray-900 border border-gray-800'
              : 'bg-white border border-gray-200'
          }`}
        >
          {/* Chat Header */}
          <div className={`p-4 border-b flex items-center justify-between ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <HiSparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-black'}`}>JARSH</h3>
                <p className={`text-xs ${darkMode ? 'text-green-400' : 'text-green-600'}`}>● Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
              }`}
            >
              <FiMinimize2 className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
          </div>

          {/* Messages Area */}
          <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.sender === 'user'
                      ? darkMode
                        ? 'bg-red-600 text-white'
                        : 'bg-red-500 text-white'
                      : darkMode
                      ? 'bg-gray-800 text-gray-200'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.sender === 'user'
                        ? 'text-red-100 opacity-70'
                        : darkMode
                        ? 'text-gray-500'
                        : 'text-gray-500'
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className={`p-4 border-t ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask JARSH..."
                className={`flex-1 px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-black placeholder-gray-500'
                }`}
              />
              <button
                onClick={handleSendMessage}
                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <FiSend className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
