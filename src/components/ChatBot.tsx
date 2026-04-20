import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatBot() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const currentInput = input.trim();
    const userMsg: Message = { role: 'user', content: currentInput };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: currentInput }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from server');
      }

      const data = await response.json();

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply || 'Tiada jawapan diterima.',
        },
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Ralat sambungan ke server. Sila cuba lagi.',
        },
      ]);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg cyan-glow transition-transform hover:scale-110"
      >
        {open ? (
          <X className="w-5 h-5 text-primary-foreground" />
        ) : (
          <MessageCircle className="w-5 h-5 text-primary-foreground" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-6 z-50 w-80 h-96 glass-panel flex flex-col overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-bold text-foreground">Analyst TEC</p>
              <p className="text-[10px] text-muted-foreground">{t('askAboutTrade')}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
              {messages.length === 0 && (
                <p className="text-xs text-muted-foreground text-center mt-8">
                  {t('askAboutTrade')}
                </p>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`text-xs p-2 rounded-lg max-w-[85%] ${
                    msg.role === 'user'
                      ? 'ml-auto bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {msg.content}
                </div>
              ))}

              {loading && (
                <div className="text-xs p-2 rounded-lg max-w-[85%] bg-secondary text-secondary-foreground">
                  Sedang menaip...
                </div>
              )}
            </div>

            <div className="p-2 border-t border-border flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Tanya soalan..."
                className="flex-1 bg-secondary text-secondary-foreground text-xs rounded-lg px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={handleSend}
                disabled={loading}
                className="p-2 bg-primary rounded-lg text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}