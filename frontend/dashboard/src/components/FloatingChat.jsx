import React, { useState, useRef, useEffect } from 'react';
import { HiSparkles } from 'react-icons/hi';
import { FiX, FiSend, FiMinimize2, FiAlertCircle } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import chatService from '../services/chatService';

export default function FloatingChat({ darkMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm VajraShield AI Analyst. I can help you understand transaction decisions, investigate fraud patterns, and monitor system performance. What would you like to know?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('unknown');
  const messagesEndRef = useRef(null);
  const location = useLocation();

  // Check API health on mount
  useEffect(() => {
    checkApiHealth();
  }, []);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Extract transaction ID from URL if on transaction detail page
  const getCurrentTxnId = () => {
    const match = location.pathname.match(/\/transaction\/([^/]+)/);
    return match ? match[1] : null;
  };

  const checkApiHealth = async () => {
    const health = await chatService.checkHealth();
    setApiStatus(health.status === 'healthy' ? 'connected' : 'disconnected');
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMsg = { 
      id: messages.length + 1, 
      text: inputValue, 
      sender: 'user', 
      timestamp: new Date() 
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get transaction context if on transaction page
      const txnId = getCurrentTxnId();
      
      // Send to chatbot API
      const result = await chatService.sendMessage(inputValue, txnId);
      
      // Add bot response
      const botMsg = {
        id: messages.length + 2,
        text: result.response,
        sender: 'bot',
        timestamp: new Date(),
        context: result.context,
      };
      
      setMessages((prev) => [...prev, botMsg]);
      
      // Update API status
      if (!result.error) {
        setApiStatus('connected');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: "I'm having trouble connecting to the backend. Please make sure the chatbot API is running on port 8001.",
          sender: 'bot',
          timestamp: new Date(),
          error: true,
        },
      ]);
      setApiStatus('disconnected');
    } finally {
      setIsLoading(false);
    }
  };

  const windowBg = darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const headerBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200';
  const inputBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200';
  const inputField = darkMode
    ? 'bg-zinc-900 border-zinc-700 text-white placeholder-gray-400 focus:border-emerald-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-500';

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 z-50 ${
          isOpen ? 'bg-zinc-800 hover:bg-zinc-700' : darkMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-black hover:bg-gray-900'
        }`}
      >
        {isOpen
          ? <FiX className="w-5 h-5 text-white" />
          : <HiSparkles className="w-6 h-6 text-white" />
        }
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className={`fixed bottom-24 right-6 w-88 h-[480px] rounded-2xl shadow-2xl flex flex-col border z-50 overflow-hidden ${windowBg}`}
          style={{ width: '360px' }}>
          {/* Header */}
          <div className={`px-4 py-3 border-b flex items-center justify-between flex-shrink-0 ${headerBg}`}>
            <div className="flex items-center space-x-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                darkMode ? 'bg-emerald-600' : 'bg-black'
              }`}>
                <HiSparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>VajraShield AI</h3>
                <p className={`text-xs flex items-center space-x-1 ${
                  apiStatus === 'connected' ? 'text-green-500' : 'text-red-500'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                    apiStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  <span>{apiStatus === 'connected' ? 'Connected' : 'Disconnected'}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-900'}`}
            >
              <FiMinimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm ${
                  msg.error
                    ? 'bg-red-900/20 border border-red-500/30 text-red-400'
                    : msg.sender === 'user'
                    ? darkMode ? 'bg-emerald-600 text-white rounded-br-sm' : 'bg-black text-white rounded-br-sm'
                    : darkMode
                      ? 'bg-zinc-900 text-gray-200 rounded-bl-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                  {msg.error && (
                    <div className="flex items-center space-x-2 mb-2">
                      <FiAlertCircle className="w-4 h-4" />
                      <span className="text-xs font-semibold">Connection Error</span>
                    </div>
                  )}
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender === 'user' ? 'text-gray-200' : darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className={`px-3.5 py-2.5 rounded-2xl text-sm ${
                  darkMode ? 'bg-zinc-900 text-gray-200' : 'bg-gray-100 text-gray-800'
                }`}>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-xs">Analyzing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={`px-4 py-3 border-t flex-shrink-0 ${inputBg}`}>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask JARSH anything..."
                className={`flex-1 px-3 py-2 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${inputField}`}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className={`p-2 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors ${
                  darkMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-black hover:bg-gray-900'
                }`}
              >
                <FiSend className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
