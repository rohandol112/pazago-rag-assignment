import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Array<{
    year: number;
    document: string;
    relevance: number;
  }>;
}

const BerkshireChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedYear, setSelectedYear] = useState('all');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickQuestions = [
    "What is Warren Buffett's investment philosophy?",
    "How does Berkshire evaluate potential acquisitions?", 
    "What are the key principles for long-term investing?",
    "How does Berkshire approach risk management?"
  ];

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Create placeholder message for streaming
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantMessageId,
        type: 'assistant', 
        content: '',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4111';
      const response = await fetch(`${apiUrl}/api/agents/ragAgent/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(msg => ({
              role: msg.type === 'user' ? 'user' : 'assistant',
              content: msg.content
            })),
            { role: 'user', content: inputValue.trim() }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const finalContent = data.text || 'I apologize, but I encountered an issue processing your request.';
        
        // Extract source information if available
        const sources = data.sources || [];
        
        // Update the message with the final content and sources
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: finalContent, sources }
            : msg
        ));
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I\'m unable to respond right now. Please check that the backend service is running.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Berkshire Intelligence</h1>
            <p className="text-sm text-gray-600 mt-1">AI insights from Warren Buffett's shareholder letters (2019-2024)</p>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Years</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
              <option value="2019">2019</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-4xl mx-auto flex flex-col">
          
          {/* Messages Area - This is scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome to Berkshire Intelligence</h2>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  Ask questions about Warren Buffett's investment philosophy, Berkshire Hathaway's strategy, 
                  and insights from annual shareholder letters.
                </p>
                
                {/* Quick Questions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question)}
                      className="p-4 text-left bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200 group"
                    >
                      <p className="text-sm text-gray-700 group-hover:text-gray-900">{question}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-3xl ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-600 text-white'
                  } ${message.type === 'user' ? 'ml-3' : 'mr-3'}`}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div className={`flex-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block p-4 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}>
                      {message.type === 'user' ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({children}) => <h1 className="text-lg font-bold text-gray-900 mb-2">{children}</h1>,
                              h2: ({children}) => <h2 className="text-base font-semibold text-gray-800 mb-2">{children}</h2>,
                              h3: ({children}) => <h3 className="text-sm font-medium text-gray-700 mb-1">{children}</h3>,
                              p: ({children}) => <p className="mb-2 text-gray-700 leading-relaxed">{children}</p>,
                              ul: ({children}) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                              ol: ({children}) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                              li: ({children}) => <li className="text-gray-700">{children}</li>,
                              strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                              em: ({children}) => <em className="italic text-gray-600">{children}</em>,
                              blockquote: ({children}) => <blockquote className="border-l-3 border-blue-500 pl-3 italic text-gray-600 my-2">{children}</blockquote>,
                              code: ({children}) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                    
                    {/* Source Attribution */}
                    {message.type === 'assistant' && message.sources && message.sources.length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-gray-700">Sources from Shareholder Letters</span>
                        </div>
                        <div className="space-y-1">
                          {message.sources.map((source, index) => (
                            <div key={index} className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">{source.year} Letter - {source.document}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-12 bg-gray-200 rounded-full h-1">
                                  <div 
                                    className="bg-blue-500 h-1 rounded-full" 
                                    style={{ width: `${source.relevance * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-gray-400">{Math.round(source.relevance * 100)}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex max-w-3xl">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center mr-3">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="inline-block p-4 rounded-lg bg-white border border-gray-200">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-gray-500">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Fixed at bottom */}
          <div className="border-t border-gray-200 bg-white p-6 flex-shrink-0">
            <div className="flex space-x-4">
              <div className="flex-1">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about Warren Buffett's investment philosophy..."
                  className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Backend connected</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BerkshireChat;