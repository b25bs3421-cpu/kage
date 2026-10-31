import React from 'react';
import { Sparkles, Mic, BookOpen, Network, CheckCircle2, Calendar, Users, FlaskConical, Eye } from 'lucide-react';

export type ActiveTab = 'sanctuary' | 'diagnostic' | 'concept_graph' | 'practice' | 'review' | 'teacher' | 'research';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openChat: () => void;
  openVoice: () => void;
  masteryPercentage: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openChat,
  openVoice,
  masteryPercentage,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#05070a]/90 backdrop-blur-md border-b border-white/10 px-4 md:px-8 flex items-center justify-between transition-all">
      {/* Brand */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('sanctuary')}>
        <div className="relative w-8 h-8 rounded-full bg-[#e0231c] flex items-center justify-center shadow-[0_0_15px_rgba(224,35,28,0.6)]">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3v18M3 12h18M6 8l12 8" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-serif tracking-[0.25em] text-sm font-bold text-[#dfe7e0]">KAGE</span>
          <span className="text-[9px] uppercase tracking-widest text-[#78837c]">Adaptive Physics Tutor</span>
        </div>
      </div>

      {/* Nav Tabs */}
      <nav className="hidden lg:flex items-center gap-1 bg-[#0a0e12]/80 p-1 rounded-full border border-white/5">
        <button
          onClick={() => setActiveTab('sanctuary')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wide flex items-center gap-1.5 transition-all ${
            activeTab === 'sanctuary'
              ? 'bg-[#e0231c] text-white shadow-sm'
              : 'text-[#aab4ad] hover:text-white hover:bg-white/5'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Sanctuary</span>
        </button>

        <button
          onClick={() => setActiveTab('diagnostic')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wide flex items-center gap-1.5 transition-all ${
            activeTab === 'diagnostic'
              ? 'bg-[#e0231c] text-white shadow-sm'
              : 'text-[#aab4ad] hover:text-white hover:bg-white/5'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Diagnostic</span>
        </button>

        <button
          onClick={() => setActiveTab('concept_graph')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wide flex items-center gap-1.5 transition-all ${
            activeTab === 'concept_graph'
              ? 'bg-[#e0231c] text-white shadow-sm'
              : 'text-[#aab4ad] hover:text-white hover:bg-white/5'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>Concept Graph</span>
        </button>

        <button
          onClick={() => setActiveTab('practice')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wide flex items-center gap-1.5 transition-all ${
            activeTab === 'practice'
              ? 'bg-[#e0231c] text-white shadow-sm'
              : 'text-[#aab4ad] hover:text-white hover:bg-white/5'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Practice</span>
        </button>

        <button
          onClick={() => setActiveTab('review')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wide flex items-center gap-1.5 transition-all ${
            activeTab === 'review'
              ? 'bg-[#e0231c] text-white shadow-sm'
              : 'text-[#aab4ad] hover:text-white hover:bg-white/5'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>FSRS Review</span>
        </button>

        <button
          onClick={() => setActiveTab('teacher')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wide flex items-center gap-1.5 transition-all ${
            activeTab === 'teacher'
              ? 'bg-[#e0231c] text-white shadow-sm'
              : 'text-[#aab4ad] hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Teacher</span>
        </button>

        <button
          onClick={() => setActiveTab('research')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wide flex items-center gap-1.5 transition-all ${
            activeTab === 'research'
              ? 'bg-[#e0231c] text-white shadow-sm'
              : 'text-[#aab4ad] hover:text-white hover:bg-white/5'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Research</span>
        </button>
      </nav>

      {/* Action Buttons: Voice Agent & Socratic Tutor */}
      <div className="flex items-center gap-2">
        {/* Overall Mastery Pill */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs">
          <span className="text-[#78837c] text-[10px] uppercase font-mono">Mastery:</span>
          <span className="font-semibold text-emerald-400 font-mono">{masteryPercentage}%</span>
        </div>

        {/* Voice Agent Button */}
        <button
          onClick={openVoice}
          className="relative group px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-600/80 to-[#e0231c] hover:from-amber-500 hover:to-red-600 text-white text-xs font-medium flex items-center gap-1.5 shadow-[0_0_12px_rgba(224,35,28,0.4)] transition-all transform hover:scale-[1.02]"
          title="Open Voice Agent"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-200"></span>
          </span>
          <Mic className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Voice Agent</span>
        </button>

        {/* Chatbot Button */}
        <button
          onClick={openChat}
          className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[#dfe7e0] hover:text-white border border-white/15 text-xs font-medium flex items-center gap-1.5 transition-all"
          title="Open Socratic AI Tutor"
        >
          <Sparkles className="w-3.5 h-3.5 text-red-400" />
          <span className="hidden sm:inline">AI Tutor</span>
        </button>
      </div>
    </header>
  );
};
