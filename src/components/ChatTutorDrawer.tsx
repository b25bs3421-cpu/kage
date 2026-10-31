import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, Lightbulb, Shield, AlertTriangle } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatTutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeConceptName?: string;
  masteryPercentage?: number;
}

export const ChatTutorDrawer: React.FC<ChatTutorDrawerProps> = ({
  isOpen,
  onClose,
  activeConceptName = 'General Physics (Electricity & Light)',
  masteryPercentage = 45,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Greetings. I am Kage, your Socratic Physics Tutor for CBSE Class 10.
Following empirical research on intelligent tutoring, I will never spoil solutions outright. Instead, ask me any doubt, and I will guide you through the physical principles with calibrated hints.

What physics question or concept are you exploring today?`,
      timestamp: 'Just now',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const quickPrompts = [
    'Why is electric current not used up by a bulb?',
    'What happens when you cover half of a convex lens?',
    'How does Snell\'s law explain light bending?',
    'Why does parallel resistance decrease total resistance?',
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query.trim(),
      timestamp: 'Now',
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          currentConcept: activeConceptName,
          mastery: (masteryPercentage || 40) / 100,
        }),
      });

      if (!response.ok) {
        throw new Error('Chat API returned error');
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || 'Let us reflect on the core physical definition here. What does conservation of charge tell us?',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      // Socratic fallback
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Let us break down this question socratically:
1. **Identify the conserved quantity:** In closed circuits, electric charge cannot be destroyed ($I = Q/t$).
2. **Apply the governing law:** What does Ohm's Law ($V = IR$) or Snell's Law ($n_1 \\sin i = n_2 \\sin r$) tell you about the relationship between these variables?

Tell me what you think happens to the charges as they enter this component!`,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-[#0a0e12] border-l border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,0.9)] flex flex-col transition-all">
      {/* Header */}
      <div className="h-16 px-5 border-b border-white/10 flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#e0231c] flex items-center justify-center text-white shadow-[0_0_12px_rgba(224,35,28,0.5)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white flex items-center gap-1.5">
              <span>Kage Socratic Tutor</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-emerald-300 font-mono">AI</span>
            </h3>
            <span className="text-[10px] text-[#78837c] font-mono">
              Guarded Hint-Ladder Active
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[#78837c] hover:text-white hover:bg-white/10 transition-all"
          aria-label="Close tutor drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Context Badge */}
      <div className="bg-[#10141a] px-5 py-2 border-b border-white/5 flex items-center justify-between text-[11px] font-mono text-[#aab4ad]">
        <span className="truncate max-w-[280px]">Active: {activeConceptName}</span>
        <span className="text-emerald-400 font-bold">Mastery: {masteryPercentage}%</span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 text-xs leading-relaxed ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-[#e0231c]/20 border border-[#e0231c]/40 flex items-center justify-center text-red-300 flex-shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`p-3.5 rounded-2xl max-w-[85%] ${
                msg.role === 'user'
                  ? 'bg-[#e0231c] text-white rounded-br-xs'
                  : 'bg-white/5 border border-white/10 text-[#dfe7e0] rounded-bl-xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>

            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 text-xs items-center text-[#78837c]">
            <div className="w-6 h-6 rounded-full bg-[#e0231c]/20 border border-[#e0231c]/40 flex items-center justify-center text-red-300 animate-pulse">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-[11px] font-mono ml-1">Kage is formulating a Socratic hint...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="px-4 py-2 border-t border-white/5 bg-black/20 flex gap-2 overflow-x-auto no-scrollbar">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[10px] text-[#aab4ad] hover:text-white border border-white/5 transition-all flex-shrink-0"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10 bg-black/40">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question or explain your reasoning..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#78837c] focus:outline-none focus:border-[#e0231c]"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-2.5 rounded-xl bg-[#e0231c] hover:bg-red-700 disabled:opacity-40 text-white transition-all shadow-md"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
