// src/app/page.js
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';

const API_URL = 'http://localhost:3001';
const MAX_MESSAGES = 20;
const STORAGE_KEY = 'ollama-chat-history';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: "instant",
        block: "end",
      });
    }
  };

  // Load messages from localStorage on initial render
  useEffect(() => {
    const savedMessages = localStorage.getItem(STORAGE_KEY);
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Error loading chat history:', e);
      }
    }
  }, []);

  // Save messages to localStorage when they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  // Add mutation observer for scroll handling
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length || mutation.type === 'characterData') {
          requestAnimationFrame(() => {
            scrollToBottom();
          });
        }
      }
    });

    const messagesContainer = document.querySelector('.space-y-4');
    if (messagesContainer) {
      observer.observe(messagesContainer, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }

    return () => observer.disconnect();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check server connection
  useEffect(() => {
    fetch(`${API_URL}/api/test`)
      .then(res => res.json())
      .then(() => {
        console.log('Connected to backend successfully');
        setServerStatus('connected');
      })
      .catch((error) => {
        console.error('Backend connection error:', error);
        setServerStatus('error');
      });
  }, []);

  const clearConversation = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Add user message to chat
    const newUserMessage = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, newUserMessage]);
    
    // Add an empty assistant message that we'll stream into
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          history: messages
            .slice(-MAX_MESSAGES)
            .concat(newUserMessage)
            .filter(msg => msg.content.trim() !== '')
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let currentContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // Add this timeout to ensure focus happens after all updates
          setTimeout(() => {
            inputRef.current?.focus();
          }, 100);
          break;
        }
      
        const text = decoder.decode(value);
        const lines = text.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              currentContent += data.content;
              
              // Update the last message with the accumulated content
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = currentContent;
                requestAnimationFrame(() => {
                  scrollToBottom();
                });
                return newMessages;
              });
            } catch (e) {
              console.error('Error parsing SSE:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: `Error: ${error.message}`
      }]);
    }
    inputRef.current?.focus();  // Re-focus the input field
    setLoading(false);
  };

  if (serverStatus === 'checking') {
    return <div className="flex min-h-screen items-center justify-center">
      <p>Connecting to server...</p>
    </div>;
  }

  if (serverStatus === 'error') {
    return <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-red-500">Could not connect to the backend server.</p>
        <p>Please make sure:</p>
        <ul className="list-disc text-left inline-block">
          <li>The backend server is running on port 3001 (node server.js)</li>
          <li>Ollama is running (ollama serve)</li>
          <li>The llama3.2 model is loaded</li>
        </ul>
      </div>
    </div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <div className="w-full max-w-4xl flex flex-col" style={{minHeight: '94vh'}}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">AI Chat</h1>
            {messages.length > 0 && (
              <span className="text-sm text-gray-500">
                {Math.ceil(messages.length / 2)} / {MAX_MESSAGES / 2} conversations
              </span>
            )}
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearConversation}
              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
              Clear Chat
            </button>
          )}
        </div>

        {messages.length > (MAX_MESSAGES * 0.8) && (
          <div className="text-xs text-amber-600 mt-1 mb-2">
            Approaching conversation limit. Older messages will be removed.
          </div>
        )}
        
        <div className="flex-1 overflow-auto bg-gray-50 rounded-lg mb-4 p-4" style={{maxHeight: '84vh'}}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : message.role === 'system'
                      ? 'bg-red-100 text-red-900'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap">
                    {formatMessage(message.content)}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-900 rounded-lg p-3">
                  <p>Thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            ref={inputRef}  // Add this line
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
          >
            <Send className="w-6 h-6" />
          </button>
        </form>
      </div>
    </main>
  );
}


const formatMessage = (content) => {
  // First split by code blocks
  const parts = content.split(/(```[a-z]*\n[\s\S]*?\n```)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('```')) {
      // Handle code blocks
      const [firstLine, ...rest] = part.split('\n');
      const language = firstLine.slice(3);
      const code = rest.slice(0, -1).join('\n');
      
      return (
        <pre key={index} className="my-2 p-4 bg-gray-800 text-gray-100 rounded-lg overflow-x-auto">
          {language && (
            <div className="text-xs text-gray-400 mb-2">{language}</div>
          )}
          <code>{code}</code>
        </pre>
      );
    }

    // Split content into lines
    const lines = part.split('\n');
    let currentListItems = [];
    const formattedContent = [];

    lines.forEach((line, lineIndex) => {
      // Check if line is a list item
      if (line.trim().match(/^[\*\-\•]\s/)) {
        // Add to current list items
        currentListItems.push(
          <li key={`li-${lineIndex}`} className="ml-4">
            {line.trim().replace(/^[\*\-\•]\s/, '')}
          </li>
        );
      } else {
        // If we have list items waiting, add the list first
        if (currentListItems.length > 0) {
          formattedContent.push(
            <ul key={`ul-${lineIndex}`} className="list-disc my-2 space-y-1">
              {currentListItems}
            </ul>
          );
          currentListItems = [];
        }

        // Handle non-list line with markdown
        if (line.trim()) {
          formattedContent.push(
            <span key={`text-${lineIndex}`}>
              {line.split(/(\*\*.*?\*\*)|(\*.*?\*)|(__.*?__)|(_.*?_)|(`.*?`)/g).map((text, i) => {
                if (!text) return null;
                
                // Bold
                if (text.startsWith('**') && text.endsWith('**')) {
                  return <strong key={i}>{text.slice(2, -2)}</strong>;
                }
                if (text.startsWith('__') && text.endsWith('__')) {
                  return <strong key={i}>{text.slice(2, -2)}</strong>;
                }
                
                // Italic
                if (text.startsWith('*') && text.endsWith('*') && !text.startsWith('**')) {
                  return <em key={i}>{text.slice(1, -1)}</em>;
                }
                if (text.startsWith('_') && text.endsWith('_')) {
                  return <em key={i}>{text.slice(1, -1)}</em>;
                }
                
                // Inline code
                if (text.startsWith('`') && text.endsWith('`')) {
                  return <code key={i} className="bg-gray-200 px-1 rounded">{text.slice(1, -1)}</code>;
                }
                
                return text;
              })}
              {lineIndex < lines.length - 1 && <br />}
            </span>
          );
        }
      }
    });

    // Add any remaining list items
    if (currentListItems.length > 0) {
      formattedContent.push(
        <ul key={`ul-final`} className="list-disc my-2 space-y-1">
          {currentListItems}
        </ul>
      );
    }

    return <div key={index}>{formattedContent}</div>;
  });
};