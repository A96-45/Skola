import React, { useState } from 'react';
import { MessageCircle, Menu, Send, Search, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const StudentChatbot = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputValue(''); // Clear input after sending
    
    // Simulate bot response (you can replace this with actual API call)
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm processing your request...",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
    }, 500);
  };

  return (
    <div className="flex flex-col h-screen bg-[#1A1A1A] text-white">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="ml-2 text-xl font-medium">StudyBuddy</span>
        </div>
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/student/dashboard')}
            className="p-2 rounded-lg hover:bg-gray-800"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="ml-4 w-8 h-8 rounded-full bg-[#A855F7] flex items-center justify-center">
            <span className="text-white font-medium">
              {user?.name?.[0]?.toLowerCase() || 's'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-6">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-3">
              <h1 className="text-4xl font-semibold text-[#E5E7EB]">
                Good evening, {user?.name?.split(' ')[0] || 'student'}.
              </h1>
              <p className="text-xl text-[#9CA3AF]">How can I help you today?</p>
            </div>
          </div>
        ) : (
          <div className="max-w-[850px] mx-auto py-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500'
                      : 'bg-[#2D2D2D]'
                  }`}
                >
                  <p className="text-[#E5E7EB]">{message.text}</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Input Area */}
      <div className="px-6 pb-6">
        <div className="bg-[#2D2D2D] rounded-2xl p-3 flex items-center gap-3 max-w-[850px] mx-auto">
          <span className="text-xl pl-1">🎤</span>
          <input
            type="text"
            placeholder="What do you want to know?"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent text-[#9CA3AF] placeholder-[#6B7280] outline-none text-lg font-normal tracking-wide"
            style={{ caretColor: '#9CA3AF' }}
          />
          <button className="flex items-center gap-1.5 bg-[#4B5563] text-[#E5E7EB] px-3 py-1.5 rounded-lg text-sm font-medium shadow-md shadow-[#4B5563]/30 transform hover:scale-105 active:scale-95 transition-all duration-300 animate-[pulse_4s_infinite]">
            <Search className="w-4 h-4 animate-[spin_4s_linear_infinite]" /> DeepSearch
          </button>
          <button className="flex items-center gap-1.5 bg-[#4B5563] text-[#E5E7EB] px-3 py-1.5 rounded-lg text-sm font-medium shadow-md shadow-[#4B5563]/30 transform hover:scale-105 active:scale-95 transition-all duration-300 animate-[pulse_4s_infinite]">
            <Lightbulb className="w-4 h-4 animate-[pulse_2s_infinite]" /> Think
          </button>
          <div className="flex items-center gap-1.5 bg-[#4B5563] text-[#E5E7EB] px-3 py-1.5 rounded-lg text-sm font-medium shadow-md shadow-[#4B5563]/30 transform hover:scale-105 active:scale-95 transition-all duration-300 animate-[pulse_4s_infinite] cursor-pointer">
            AI v1 <span className="text-xs animate-[bounce_2s_infinite]">▼</span>
          </div>
          <button 
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className={`p-2 rounded-full transition-all duration-300 shadow-lg transform hover:scale-110 active:scale-95 ${
              inputValue.trim() 
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 shadow-purple-500/30 animate-[pulse_3s_infinite]' 
                : 'bg-[#4B5563] opacity-50 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5 text-white animate-[bounce_2s_infinite]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentChatbot;