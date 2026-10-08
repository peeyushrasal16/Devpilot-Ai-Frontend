import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  X,
  Maximize2,
  Minimize2,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  ChevronRight,
  Database,
  HelpCircle,
  Code2,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import aiApi from '../../api/aiApi';
import { useAuth } from '../../context/AuthContext';

const FLOATING_SUGGESTIONS = [
  'How many tasks are there?',
  'How many projects are in progress?',
  'How many bugs are open?',
  'How do I create a task?',
  'How do I report a bug?',
];

export const FloatingAiWidget = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome-widget',
      sender: 'ai',
      text: 'Hi there! I am DevPilot AI. How can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);

  // If user navigates directly to the dedicated /ai page, don't show floating popup
  if (location.pathname === '/ai') {
    return null;
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = async (customText) => {
    const question = (customText || inputQuestion).trim();
    if (!question || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      const response = await aiApi.ask(question);
      const aiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: typeof response === 'string' ? response : JSON.stringify(response),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const errorMsg =
        err.userMessage ||
        err.response?.data?.message ||
        err.message ||
        'Failed to connect to AI assistant.';

      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          isError: true,
          text: `Error: ${errorMsg}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Button (when closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-500 text-white font-semibold text-sm shadow-xl shadow-brand-600/30 hover:shadow-brand-500/50 hover:scale-105 active:scale-95 transition-all"
          title="Open DevPilot AI Assistant"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-white animate-spin-slow" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
          </div>
          <span className="font-bold tracking-tight">Ask DevPilot AI</span>
        </button>
      )}

      {/* Floating Chat Panel (when opened) */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[550px] max-h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-md shadow-brand-500/20">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white">DevPilot AI</h3>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online Copilot
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setMessages([
                    {
                      id: 'welcome-widget',
                      sender: 'ai',
                      text: 'Hi there! I am DevPilot AI. How can I help you today?',
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ])
                }
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Reset conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-md ${
                      isUser
                        ? 'bg-brand-600 text-white rounded-br-none'
                        : msg.isError
                        ? 'bg-rose-950/40 border border-rose-800/60 text-rose-200 rounded-bl-none'
                        : 'bg-slate-800 border border-slate-700/60 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-[10px] text-slate-400">
                        {isUser ? 'You' : 'DevPilot AI'}
                      </span>
                      <span className="text-[9px] text-slate-400">{msg.timestamp}</span>
                    </div>

                    <div className="whitespace-pre-wrap break-words leading-relaxed">
                      {msg.text}
                    </div>

                    {!isUser && !msg.isError && (
                      <div className="mt-1 pt-1 border-t border-slate-700/40 flex justify-end">
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start gap-2 justify-start">
                <div className="w-6 h-6 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-slate-800 border border-slate-700/60 rounded-2xl rounded-bl-none px-3.5 py-2 flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">Thinking</span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:-0.3s]" />
                  </div>
                </div>
              </div>
            )}

            {/* Quick Suggestions in Floating Panel */}
            {messages.length <= 1 && !isLoading && (
              <div className="pt-2 space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Suggestions:
                </p>
                {FLOATING_SUGGESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(q)}
                    className="w-full text-left p-2 rounded-xl text-xs bg-slate-950/60 hover:bg-brand-600/20 text-slate-300 hover:text-white border border-slate-800 flex items-center justify-between transition-colors group"
                  >
                    <span className="truncate">{q}</span>
                    <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-brand-300 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-slate-950/90 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                placeholder="Ask DevPilot AI..."
                disabled={isLoading}
                className="flex-1 bg-slate-900 border border-slate-800 focus:border-brand-500 px-3 py-2 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputQuestion.trim() || isLoading}
                className={`p-2 rounded-xl text-white transition-all ${
                  inputQuestion.trim() && !isLoading
                    ? 'bg-brand-600 hover:bg-brand-500'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingAiWidget;
