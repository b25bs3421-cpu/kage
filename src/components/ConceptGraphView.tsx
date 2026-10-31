import React, { useState } from 'react';
import { Network, ArrowRight, AlertTriangle, ShieldCheck, Zap, Sun, Info, Sliders } from 'lucide-react';
import { getMasteryCategory } from '../lib/bkt';
import { MISCONCEPTIONS, type Misconception } from '../lib/physicsData';

export interface ConceptState {
  id: string;
  name: string;
  unit: 'Electricity' | 'Light';
  prerequisites: string[];
  description: string;
  learningObjective: string;
  mastery: number; // 0 to 1
  bkt: {
    pL: number;
    g: number;
    s: number;
    t: number;
  };
  misconceptionIds: string[];
}

interface ConceptGraphViewProps {
  concepts: Record<string, ConceptState>;
  onSelectConceptToPractice: (conceptId: string) => void;
  onUpdateManualMastery: (conceptId: string, delta: number) => void;
}

export const ConceptGraphView: React.FC<ConceptGraphViewProps> = ({
  concepts,
  onSelectConceptToPractice,
  onUpdateManualMastery,
}) => {
  const [selectedConceptId, setSelectedConceptId] = useState<string>('E4');
  const [activeUnitFilter, setActiveUnitFilter] = useState<'All' | 'Electricity' | 'Light'>('All');

  const selectedConcept = concepts[selectedConceptId] || concepts['E4'];

  const electricityList = Object.values(concepts).filter((c) => c.unit === 'Electricity');
  const lightList = Object.values(concepts).filter((c) => c.unit === 'Light');

  const getStatusColor = (mastery: number) => {
    const category = getMasteryCategory(mastery);
    switch (category) {
      case 'Strong':
        return {
          bg: 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          indicator: 'bg-emerald-400',
        };
      case 'Developing':
        return {
          bg: 'bg-amber-950/40 border-amber-500/60 text-amber-200',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          indicator: 'bg-amber-400',
        };
      case 'Weak':
        return {
          bg: 'bg-red-950/40 border-red-500/60 text-red-200',
          badge: 'bg-red-500/20 text-red-300 border-red-500/30',
          indicator: 'bg-red-400',
        };
      default:
        return {
          bg: 'bg-slate-900/40 border-slate-700/60 text-slate-300',
          badge: 'bg-slate-700/30 text-slate-400 border-slate-700',
          indicator: 'bg-slate-500',
        };
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#05070a] text-[#dfe7e0] p-4 md:p-8">
      {/* Header & Research Summary */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-red-400 font-mono mb-2">
            <Network className="w-4 h-4" />
            <span>Section 4: Domain Model &amp; Prerequisite DAG</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-light text-white">
            CBSE Class 10 Physics Concept Graph
          </h1>
          <p className="text-sm text-[#aab4ad] mt-1 max-w-2xl">
            A directed acyclic graph (DAG) maintaining continuous Bayesian Knowledge Tracing. Evidence on a concept propagates to its prerequisites and dependents with damping.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Strong (≥75%)
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> Developing (40-74%)
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950/60 border border-red-500/40 text-red-300">
            <span className="w-2 h-2 rounded-full bg-red-400"></span> Weak (&lt;40%)
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span> Unassessed
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: DAG Chain Visualizers */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Unit Switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveUnitFilter('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeUnitFilter === 'All' ? 'bg-[#e0231c] text-white' : 'bg-white/5 text-[#aab4ad] hover:bg-white/10'
              }`}
            >
              All Concepts (16)
            </button>
            <button
              onClick={() => setActiveUnitFilter('Electricity')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeUnitFilter === 'Electricity' ? 'bg-[#e0231c] text-white' : 'bg-white/5 text-[#aab4ad] hover:bg-white/10'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Electricity (E1-E9)</span>
            </button>
            <button
              onClick={() => setActiveUnitFilter('Light')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeUnitFilter === 'Light' ? 'bg-[#e0231c] text-white' : 'bg-white/5 text-[#aab4ad] hover:bg-white/10'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-blue-400" />
              <span>Light &amp; Optics (L1-L7)</span>
            </button>
          </div>

          {/* Electricity Prerequisite Chain */}
          {(activeUnitFilter === 'All' || activeUnitFilter === 'Electricity') && (
            <div className="bg-[#0a0e12]/80 border border-white/10 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h3 className="font-serif text-lg font-medium text-white">Unit 1: Electricity Prerequisite Chain</h3>
                </div>
                <span className="text-xs font-mono text-[#78837c]">9 Concepts</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {electricityList.map((concept) => {
                  const style = getStatusColor(concept.mastery);
                  const isSelected = selectedConceptId === concept.id;
                  const category = getMasteryCategory(concept.mastery);

                  return (
                    <div
                      key={concept.id}
                      onClick={() => setSelectedConceptId(concept.id)}
                      className={`cursor-pointer border rounded-xl p-3.5 transition-all relative ${style.bg} ${
                        isSelected ? 'ring-2 ring-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'hover:scale-[1.01]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs font-bold text-white bg-black/40 px-1.5 py-0.5 rounded">
                          {concept.id}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${style.badge}`}>
                          {(concept.mastery * 100).toFixed(0)}% • {category}
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-white leading-snug mb-1">{concept.name}</h4>
                      <div className="text-[11px] text-[#aab4ad] truncate">
                        {concept.prerequisites.length > 0 ? (
                          <span>Prereqs: {concept.prerequisites.join(', ')}</span>
                        ) : (
                          <span className="text-emerald-400/80">Foundational Root</span>
                        )}
                      </div>

                      {concept.misconceptionIds.length > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{concept.misconceptionIds.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Light Prerequisite Chain */}
          {(activeUnitFilter === 'All' || activeUnitFilter === 'Light') && (
            <div className="bg-[#0a0e12]/80 border border-white/10 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-blue-400" />
                  <h3 className="font-serif text-lg font-medium text-white">Unit 2: Light &amp; Optics Chain</h3>
                </div>
                <span className="text-xs font-mono text-[#78837c]">7 Concepts</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {lightList.map((concept) => {
                  const style = getStatusColor(concept.mastery);
                  const isSelected = selectedConceptId === concept.id;
                  const category = getMasteryCategory(concept.mastery);

                  return (
                    <div
                      key={concept.id}
                      onClick={() => setSelectedConceptId(concept.id)}
                      className={`cursor-pointer border rounded-xl p-3.5 transition-all relative ${style.bg} ${
                        isSelected ? 'ring-2 ring-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'hover:scale-[1.01]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs font-bold text-white bg-black/40 px-1.5 py-0.5 rounded">
                          {concept.id}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${style.badge}`}>
                          {(concept.mastery * 100).toFixed(0)}% • {category}
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-white leading-snug mb-1">{concept.name}</h4>
                      <div className="text-[11px] text-[#aab4ad] truncate">
                        {concept.prerequisites.length > 0 ? (
                          <span>Prereqs: {concept.prerequisites.join(', ')}</span>
                        ) : (
                          <span className="text-emerald-400/80">Foundational Root</span>
                        )}
                      </div>

                      {concept.misconceptionIds.length > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{concept.misconceptionIds.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Node Inspector & BKT Parameters */}
        <div className="lg:col-span-4">
          <div className="sticky top-20 bg-[#0a0e12] border border-white/15 rounded-2xl p-5 shadow-2xl flex flex-col gap-5">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-red-300">
                  Concept Node {selectedConcept.id}
                </span>
                <span className="text-xs text-[#78837c] font-mono">{selectedConcept.unit}</span>
              </div>
              <h3 className="text-xl font-serif font-light text-white">{selectedConcept.name}</h3>
            </div>

            {/* Description & Objective */}
            <div className="space-y-2 text-xs text-[#aab4ad] leading-relaxed">
              <p>{selectedConcept.description}</p>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                <strong className="text-white block mb-0.5">Learning Objective:</strong>
                {selectedConcept.learningObjective}
              </div>
            </div>

            {/* BKT State & Math Breakdown */}
            <div className="border-t border-white/10 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-white flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-red-400" />
                  <span>Bayesian Mastery P(L)</span>
                </span>
                <span className="font-mono text-sm font-bold text-white">
                  {(selectedConcept.mastery * 100).toFixed(1)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 transition-all duration-500"
                  style={{ width: `${selectedConcept.mastery * 100}%` }}
                ></div>
              </div>

              {/* Mathematical BKT Parameters */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="text-[#78837c] block">Guess (g)</span>
                  <span className="text-white font-bold">{selectedConcept.bkt.g}</span>
                </div>
                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="text-[#78837c] block">Slip (s)</span>
                  <span className="text-white font-bold">{selectedConcept.bkt.s}</span>
                </div>
                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="text-[#78837c] block">Transit (T)</span>
                  <span className="text-white font-bold">{selectedConcept.bkt.t}</span>
                </div>
              </div>

              {/* Interactive test knobs for inspection */}
              <div className="flex items-center justify-between text-[11px] text-[#78837c]">
                <span>Simulate Response:</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => onUpdateManualMastery(selectedConcept.id, -0.15)}
                    className="px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 font-mono transition-all"
                  >
                    - Fail
                  </button>
                  <button
                    onClick={() => onUpdateManualMastery(selectedConcept.id, +0.20)}
                    className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-mono transition-all"
                  >
                    + Pass
                  </button>
                </div>
              </div>
            </div>

            {/* Linked Misconceptions */}
            {selectedConcept.misconceptionIds.length > 0 && (
              <div className="border-t border-white/10 pt-4">
                <span className="text-xs font-medium text-amber-300 flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Linked Misconceptions ({selectedConcept.misconceptionIds.length})</span>
                </span>
                <div className="space-y-2">
                  {selectedConcept.misconceptionIds.map((mId) => {
                    const misc = MISCONCEPTIONS[mId];
                    if (!misc) return null;
                    return (
                      <div key={mId} className="bg-amber-950/20 border border-amber-500/30 rounded-lg p-2.5 text-xs">
                        <div className="font-semibold text-amber-200">{mId}: {misc.title}</div>
                        <p className="text-[11px] text-[#aab4ad] mt-0.5">{misc.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Direct Practice CTA */}
            <button
              onClick={() => onSelectConceptToPractice(selectedConcept.id)}
              className="w-full py-2.5 rounded-xl bg-[#e0231c] hover:bg-red-700 text-white font-medium text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              <span>Practice Questions for {selectedConcept.id}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
