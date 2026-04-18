import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/client';

interface Message {
  id: number;
  role: 'user' | 'ai';
  text: string;
  time: string;
}

interface ChatSession {
  id: number;
  title: string;
  messages: Message[];
  createdAt: string;
}

const QUICK_QUESTIONS = [
  'Explain closures in JavaScript',
  'Common React interview questions',
  'SQL vs NoSQL differences',
  'What is REST API?',
];

let nextMsgId = 0;
let nextSessionId = Date.now();

function getTimeStr() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'chat' | 'history'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<ChatSession[]>(() => {
    try { const s = localStorage.getItem('chatHistory'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { localStorage.setItem('chatHistory', JSON.stringify(history)); }, [history]);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, loading]);
  useEffect(() => { if (open && view === 'chat' && inputRef.current) inputRef.current.focus(); }, [open, view]);

  const saveCurrentChat = useCallback(() => {
    if (messages.length === 0) return;
    if (activeSessionId !== null) {
      if (isDirty) setHistory((prev) => prev.map((s) => s.id === activeSessionId ? { ...s, messages: [...messages] } : s));
      return;
    }
    const firstUser = messages.find((m) => m.role === 'user');
    const title = firstUser ? firstUser.text.slice(0, 50) + (firstUser.text.length > 50 ? '...' : '') : 'Chat';
    setHistory((prev) => [{ id: nextSessionId++, title, messages: [...messages], createdAt: new Date().toISOString() }, ...prev]);
  }, [messages, activeSessionId, isDirty]);

  const closeChat = () => { saveCurrentChat(); setMessages([]); setActiveSessionId(null); setIsDirty(false); setView('chat'); setOpen(false); };
  const handleNewChat = () => { saveCurrentChat(); setMessages([]); setActiveSessionId(null); setIsDirty(false); setView('chat'); };
  const loadSession = (s: ChatSession) => { saveCurrentChat(); setMessages([...s.messages]); setActiveSessionId(s.id); setIsDirty(false); setView('chat'); };
  const deleteSession = (id: number) => setHistory((prev) => prev.filter((s) => s.id !== id));
  const clearAllHistory = () => setHistory([]);

  const copyText = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  async function send(text?: string) {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    const userMsg: Message = { id: nextMsgId++, role: 'user', text: msg, time: getTimeStr() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsDirty(true);
    setLoading(true);
    try {
      const { data } = await apiClient.post<{ reply: string }>('/chat', {
        message: msg,
        history: messages.map(m => ({ role: m.role, text: m.text })),
      });
      setMessages((prev) => [...prev, { id: nextMsgId++, role: 'ai', text: data.reply, time: getTimeStr() }]);
    } catch {
      setMessages((prev) => [...prev, { id: nextMsgId++, role: 'ai', text: 'Sorry, something went wrong. Please try again.', time: getTimeStr() }]);
    } finally { setLoading(false); }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-colors animate-[pulse-glow_2s_ease-in-out_infinite]"
            aria-label="Open AI chat">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeChat} className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40 backdrop-blur-sm" />

            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[30%] sm:min-w-[380px] flex flex-col bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-700">

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-indigo-600 text-white shrink-0">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="font-semibold">Ask Me Anything</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={handleNewChat} className="p-2 rounded-lg hover:bg-indigo-700 transition-colors" title="New Chat">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button onClick={() => setView(view === 'history' ? 'chat' : 'history')}
                    className={`p-2 rounded-lg transition-colors ${view === 'history' ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`} title="History">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button onClick={closeChat} className="p-2 rounded-lg hover:bg-indigo-700 transition-colors" aria-label="Close">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {view === 'history' ? (
                /* History View */
                <div className="flex-1 overflow-y-auto">
                  <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Chat History</h3>
                    {history.length > 0 && <button onClick={clearAllHistory} className="text-xs text-red-500 hover:text-red-600">Clear All</button>}
                  </div>
                  {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-500 gap-2">
                      <span className="text-4xl">📭</span>
                      <p className="text-sm">No chat history yet</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                      {history.map((session) => (
                        <li key={session.id} className="relative group">
                          <button onClick={() => loadSession(session)} className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate pr-8">{session.title}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-gray-400">{session.messages.length} messages</span>
                              <span className="text-xs text-gray-400">{new Date(session.createdAt).toLocaleDateString()}</span>
                            </div>
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all">✕</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                /* Chat View */
                <>
                  <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                    {/* Empty state with quick questions */}
                    {messages.length === 0 && !loading && (
                      <div className="flex flex-col items-center justify-center h-full gap-4">
                        <span className="text-5xl">💬</span>
                        <p className="text-sm text-gray-400 dark:text-gray-500">Ask me anything!</p>
                        <div className="flex flex-wrap gap-2 justify-center max-w-[90%]">
                          {QUICK_QUESTIONS.map((q) => (
                            <button key={q} onClick={() => send(q)}
                              className="text-xs px-3 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Messages */}
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`group relative max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                          msg.role === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-sm'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm'
                        }`}>
                          {msg.text}
                          {/* Copy button for AI messages */}
                          {msg.role === 'ai' && (
                            <button
                              onClick={() => copyText(msg.id, msg.text)}
                              className="absolute -bottom-6 left-0 opacity-0 group-hover:opacity-100 text-xs text-gray-400 hover:text-indigo-500 transition-all flex items-center gap-1"
                            >
                              {copiedId === msg.id ? '✓ Copied' : '📋 Copy'}
                            </button>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 dark:text-gray-600 mt-1 px-1">{msg.time}</span>
                      </div>
                    ))}

                    {/* Loading */}
                    {loading && (
                      <div className="flex flex-col items-start">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                          <div className="flex gap-1">
                            <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                            <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                            <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
                          </div>
                          <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">AI is thinking...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-2.5 bg-white dark:bg-gray-900 shrink-0">
                    <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2 items-end">
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        disabled={loading}
                        rows={1}
                        className="flex-1 rounded-2xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none max-h-24 overflow-y-auto"
                        style={{ minHeight: '36px' }}
                        onInput={(e) => {
                          const t = e.target as HTMLTextAreaElement;
                          t.style.height = '36px';
                          t.style.height = Math.min(t.scrollHeight, 96) + 'px';
                        }}
                      />
                      <button type="submit" disabled={loading || !input.trim()}
                        className="h-9 w-9 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0">
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                      </button>
                    </form>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
