import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Terminal,
  Database,
  Code2,
  ChevronRight,
  Info,
} from 'lucide-react';
import aiApi from '../../api/aiApi';
import { useAuth } from '../../context/AuthContext';

const SUGGESTED_QUESTIONS = [
  {
    category: 'Database Stats',
    icon: Database,
    questions: [
      'How many tasks are there?',
      'How many completed tasks are there?',
      'How many projects are in progress?',
      'How many open bugs are there?',
      'How many developers are there?',
      'How many high priority tasks are there?',
    ],
  },
  {
    category: 'DevPilot Guides',
    icon: HelpCircle,
    questions: [
      'How do I create a task?',
      'How do I create a project?',
      'How do I report a bug?',
      'How do I assign a developer?',
      'How do I update a task?',
      'How do I add documentation?',
    ],
  },
  {
    category: 'Engineering & Errors',
    icon: Code2,
    questions: [
      'How do I fix a NullPointerException?',
      'Why am I getting a 401 error?',
      'Why am I getting a 403 error?',
      'How do I fix a Spring Boot error?',
      'Explain this Java error.',
    ],
  },
];

const INITIAL_WELCOME_MESSAGE = {
  id: 'welcome-msg',
  sender: 'ai',
  text: `Hello! I am DevPilot AI, your project management and engineering copilot.

You can ask me real-time questions about your database (tasks, projects, bugs, users), how to use DevPilot features, or programming errors and solutions.

How can I assist you today?`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

export const AiAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('devpilot_ai_chat');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return [INITIAL_WELCOME_MESSAGE];
  });

  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Sync messages with sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('devpilot_ai_chat', JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  // Scroll to bottom smoothly
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 140)}px`;
    }
  }, [inputQuestion]);

  const handleSendMessage = async (textToSend) => {
    const question = (textToSend || inputQuestion).trim();
    if (!question || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuestion('');
    setErrorMessage(null);
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const aiResponse = await aiApi.ask(question);

      const aiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('AI chat error:', err);
      const friendlyErr =
        err.userMessage ||
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        'Unable to reach DevPilot AI. Please verify the backend service is running.';

      setErrorMessage(friendlyErr);

      const errorAiMessage = {
        id: `error-${Date.now()}`,
        sender: 'ai',
        isError: true,
        text: `Error: ${friendlyErr}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorAiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([INITIAL_WELCOME_MESSAGE]);
    sessionStorage.removeItem('devpilot_ai_chat');
    setErrorMessage(null);
  };

  const handleCopyMessage = (id, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isOnlyWelcome = messages.length <= 1;

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
      {/* AI Assistant Header (Meta AI styled with DevPilot Theme) */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          {/* Animated Gradient Avatar */}
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-brand-500/20 ring-2 ring-brand-500/30">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                DevPilot AI
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-brand-500/15 border border-brand-500/30 text-brand-300 rounded-full">
                Copilot
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isLoading ? (
                <span className="text-brand-400 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-400 animate-ping" />
                  Generating response...
                </span>
              ) : (
                'Always active • Connected to DevPilot context'
              )}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearChat}
            disabled={isOnlyWelcome && !isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400"
            title="Reset Conversation"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Chat Messages Conversation Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-scale-in`}
            >
              {/* AI Avatar */}
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-brand-500/20 mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`group relative max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 shadow-md ${
                  isUser
                    ? 'bg-brand-600 text-white rounded-br-none shadow-brand-600/20'
                    : msg.isError
                    ? 'bg-rose-950/40 border border-rose-800/60 text-rose-200 rounded-bl-none'
                    : 'bg-slate-800/90 border border-slate-700/60 text-slate-200 rounded-bl-none'
                }`}
              >
                {/* Header tag for sender */}
                <div className="flex items-center justify-between gap-4 mb-1">
                  <span
                    className={`text-[11px] font-semibold tracking-wide ${
                      isUser ? 'text-brand-200' : msg.isError ? 'text-rose-400' : 'text-brand-400'
                    }`}
                  >
                    {isUser ? user?.name || 'You' : 'DevPilot AI'}
                  </span>

                  <span
                    className={`text-[10px] ${
                      isUser ? 'text-brand-200/80' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {/* Message Body with preserved line breaks and formatting */}
                <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words font-sans selection:bg-brand-400/30">
                  {msg.text}
                </div>

                {/* Quick Copy button for AI replies */}
                {!isUser && !msg.isError && (
                  <div className="mt-2 pt-1 border-t border-slate-700/40 flex items-center justify-end">
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.text)}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs mt-1">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4 text-slate-400" />}
                </div>
              )}
            </div>
          );
        })}

        {/* WhatsApp/Meta AI style Typing Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3 justify-start animate-fade-in">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-brand-500/20 mt-1">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-slate-800/90 border border-slate-700/60 rounded-2xl rounded-bl-none px-4 py-3 shadow-md flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">DevPilot is thinking</span>
              <div className="flex items-center gap-1 ml-1">
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
              </div>
            </div>
          </div>
        )}

        {/* Suggested Questions Section (Visible on initial state or empty chat) */}
        {isOnlyWelcome && !isLoading && (
          <div className="pt-2 pb-4 space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>Suggested Questions</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {SUGGESTED_QUESTIONS.map((cat, idx) => {
                const IconComponent = cat.icon;
                return (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-2xl space-y-2.5"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                      <IconComponent className="w-4 h-4 text-brand-400" />
                      <span>{cat.category}</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      {cat.questions.map((q, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => handleSendMessage(q)}
                          className="w-full text-left p-2 rounded-xl text-xs text-slate-300 bg-slate-900/80 hover:bg-brand-600/20 hover:text-white border border-slate-800/60 hover:border-brand-500/40 transition-all flex items-center justify-between group"
                        >
                          <span className="truncate">{q}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-300 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Persistent Error Alert (if any) */}
      {errorMessage && (
        <div className="px-4 py-2 bg-rose-950/60 border-t border-rose-800/50 flex items-center justify-between gap-2 text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-white font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input Area (Meta AI / WhatsApp inspired rounded bottom bar) */}
      <div className="p-3 sm:p-4 bg-slate-950/90 border-t border-slate-800/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2 sm:gap-3"
        >
          {/* Multi-line auto-expanding textarea */}
          <div className="relative flex-1 bg-slate-900 border border-slate-750 focus-within:border-brand-500/80 rounded-2xl sm:rounded-3xl shadow-inner transition-colors">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about DevPilot, tasks, bugs, or programming..."
              disabled={isLoading}
              className="w-full px-4 py-3 sm:py-3.5 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none resize-none max-h-36 overflow-y-auto"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputQuestion.trim() || isLoading}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl sm:rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
              inputQuestion.trim() && !isLoading
                ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
            }`}
            title="Send Message (Enter)"
          >
            {isLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5 ml-0.5" />
            )}
          </button>
        </form>

        <div className="mt-2 px-1 flex items-center justify-between text-[11px] text-slate-400">
          <span>Press Enter to send • Shift + Enter for new line</span>
          <span className="hidden sm:inline">Powered by Spring AI & Ollama</span>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;
