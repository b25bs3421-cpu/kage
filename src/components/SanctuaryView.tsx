import React from 'react';
import { KageLandingPage } from '../shaders/landing-pages/LandingPages';
import '../shaders/threeui.css';
import { Sparkles, Mic, ArrowRight, Network, CheckCircle2 } from 'lucide-react';
import type { ActiveTab } from './Navbar';

interface SanctuaryViewProps {
  onNavigate: (tab: ActiveTab) => void;
  openChat: () => void;
  openVoice: () => void;
}

export const SanctuaryView: React.FC<SanctuaryViewProps> = ({
  onNavigate,
  openChat,
  openVoice,
}) => {
  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-[#05070a]">
      {/* Authored ThreeUI KageLandingPage Component from exact source */}
      <div className="absolute inset-0 z-0">
        <KageLandingPage
          headingFont="onest"
          bodyFont="onest"
          headingWeight="400"
          bodyWeight="300"
          primaryColor="#e0231c"
          headingSize={46}
          bodySize={17}
          headingLetterSpacing={-0.012}
        />
      </div>

      {/* Subtle Floating Japanese-aesthetic Overlay Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[92%] max-w-4xl bg-[#0a0e12]/85 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#e0231c] shadow-[0_0_8px_#e0231c] animate-pulse"></div>
          <div>
            <h4 className="text-sm font-medium text-[#dfe7e0] tracking-wide flex items-center gap-2">
              <span>Kage Adaptive Engine</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-emerald-300 font-mono">
                CBSE Class 10 Physics
              </span>
            </h4>
            <p className="text-xs text-[#aab4ad]">
              Transparent learner model driven by Bayesian Knowledge Tracing &amp; FSRS-5.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => onNavigate('diagnostic')}
            className="px-3.5 py-2 rounded-xl bg-[#e0231c] hover:bg-red-700 text-white text-xs font-medium tracking-wide flex items-center gap-1.5 transition-all shadow-md"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Take Diagnostic</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onNavigate('concept_graph')}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#dfe7e0] text-xs font-medium tracking-wide flex items-center gap-1.5 transition-all"
          >
            <Network className="w-3.5 h-3.5 text-amber-400" />
            <span>Concept Graph</span>
          </button>

          <button
            onClick={openVoice}
            className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-200 text-xs font-medium tracking-wide flex items-center gap-1.5 transition-all"
          >
            <Mic className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Voice Agent</span>
          </button>

          <button
            onClick={openChat}
            className="px-3 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-200 text-xs font-medium tracking-wide flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Socratic Tutor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
