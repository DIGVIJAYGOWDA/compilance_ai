import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Shield } from 'lucide-react';
import { chatWithAI } from '../../services/geminiService';
import { useDemo } from '../../context/DemoContext';
import ReactMarkdown from 'react-markdown';

const SUGGESTED = [
  'What licenses do I need for my restaurant?',
  'What happens if my Fire NOC expires?',
  'How do I renew my FSSAI license?',
  'What is my total penalty exposure today?',
];

export default function ChatBot({ business, licenses, isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const { demoBusiness, isDemo } = useDemo();
  const bottomRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || streaming) return;
    const userMsg = { role: 'user', content: text };
    const aiPlaceholder = { role: 'model', content: '' };
    setMessages(prev => [...prev, userMsg, aiPlaceholder]);
    setInput('');
    setStreaming(true);

    let aiText = '';
    const activeBusiness = isDemo ? demoBusiness : business;
    await chatWithAI(text, activeBusiness, licenses, messages, (chunk) => {
      aiText += chunk;
      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { role: 'model', content: aiText };
        return next;
      });
    });
    setStreaming(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop on mobile */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
            onClick={onClose}
          />
          {/* Chat panel — fixed to bottom-right, above everything */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
            style={{ height: 520 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                  <Shield size={18} className="text-white" />
                </div>
                <div>
                  <div className="text-white font-bold text-sm">ComplianceAI Assistant</div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    <span className="text-blue-200 text-xs">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 text-blue-200 hover:text-white rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-center text-sm text-gray-400 py-4">Ask me anything about business compliance!</p>
                  {SUGGESTED.map((q, i) => (
                    <button key={i} onClick={() => sendMessage(q)}
                      className="w-full text-left text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl px-4 py-2.5 transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                  {msg.role === 'model' && (
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Shield size={13} className="text-white" />
                    </div>
                  )}
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-sm'}`}>
                    {msg.content ? (
                      <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'text-white' : 'text-gray-800 prose-p:my-1 prose-ul:my-1 prose-li:my-0'}`}>
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      streaming && i === messages.length - 1 && (
                        <span className="flex gap-1 items-center h-4 py-1">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                      )
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-gray-100 flex-shrink-0">
              <div className="flex gap-2 items-center bg-gray-50 rounded-2xl px-4 py-2.5 border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <input
                  type="text" value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                  placeholder="Ask about licenses, penalties..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400"
                />
                <button onClick={() => sendMessage(input)} disabled={!input.trim() || streaming}
                  className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white disabled:opacity-40 hover:bg-blue-700 transition-colors flex-shrink-0">
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
