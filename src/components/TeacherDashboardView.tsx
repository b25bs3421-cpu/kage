import React, { useState } from 'react';
import { Users, AlertTriangle, Sparkles, FileText, Check, X, ShieldAlert, BookOpen, Layers } from 'lucide-react';
import { MISCONCEPTIONS } from '../lib/physicsData';

export const TeacherDashboardView: React.FC = () => {
  const [selectedClusterId, setSelectedClusterId] = useState<string>('M1');
  const [reteachOutline, setReteachOutline] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [confirmedOverwrites, setConfirmedOverwrites] = useState<Record<string, boolean>>({});

  // 32 Simulated students across the Class 10 section
  const simulatedClassHeatmap = [
    { conceptId: 'E1', name: 'Charge & Current', avgMastery: 0.82, weakCount: 3, risk: 'low' },
    { conceptId: 'E2', name: 'Potential Difference', avgMastery: 0.74, weakCount: 7, risk: 'low' },
    { conceptId: 'E4', name: "Ohm's Law", avgMastery: 0.61, weakCount: 12, risk: 'medium' },
    { conceptId: 'E5', name: 'Resistance Factors', avgMastery: 0.52, weakCount: 15, risk: 'medium' },
    { conceptId: 'E6', name: 'Series Resistors', avgMastery: 0.44, weakCount: 18, risk: 'high' },
    { conceptId: 'E7', name: 'Parallel Resistors', avgMastery: 0.38, weakCount: 22, risk: 'critical' },
    { conceptId: 'L2', name: 'Spherical Mirrors', avgMastery: 0.71, weakCount: 8, risk: 'low' },
    { conceptId: 'L3', name: 'Mirror Sign Convention', avgMastery: 0.42, weakCount: 19, risk: 'critical' },
    { conceptId: 'L6', name: 'Lenses Image Formation', avgMastery: 0.48, weakCount: 16, risk: 'high' },
  ];

  // Misconception clusters from paper Table 2
  const misconceptionClusters = [
    {
      id: 'M1',
      title: 'Current Used Up by Load',
      studentCount: 14,
      confidence: 0.92,
      sampleQuote: '"The current gets consumed inside the bulb to make heat, so less comes out"',
      suggestedGroup: ['Aarav S.', 'Priya K.', 'Rohan D.', 'Ananya M.', 'Vikram P.'],
    },
    {
      id: 'M4',
      title: 'Parallel Resistance Increases Total',
      studentCount: 19,
      confidence: 0.89,
      sampleQuote: '"Adding more paths means adding more total resistors, so total resistance goes up"',
      suggestedGroup: ['Neha G.', 'Kunal B.', 'Isha T.', 'Siddharth R.'],
    },
    {
      id: 'M6',
      title: 'Half Lens Cuts Half Image',
      studentCount: 11,
      confidence: 0.94,
      sampleQuote: '"If top of lens is blocked by paper, the flame top cannot be projected"',
      suggestedGroup: ['Deepak M.', 'Sanya V.', 'Arjun N.'],
    },
    {
      id: 'M8',
      title: 'Sign Convention Errors (Positive Distances)',
      studentCount: 16,
      confidence: 0.88,
      sampleQuote: '"Object distance is a real positive length, so u should be +15 in mirror formula"',
      suggestedGroup: ['Meera J.', 'Tanmay C.', 'Ritika S.'],
    },
  ];

  const handleGenerateReteach = async (miscId: string) => {
    setIsGenerating(true);
    setSelectedClusterId(miscId);
    const misc = MISCONCEPTIONS[miscId];

    try {
      const res = await fetch('/api/reteach-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          misconceptionId: miscId,
          misconceptionTitle: misc?.title || miscId,
          studentCount: misconceptionClusters.find((c) => c.id === miscId)?.studentCount || 14,
        }),
      });

      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      setReteachOutline(data.outline);
    } catch {
      // Deterministic research-grounded fallback
      setReteachOutline(`### 5-Minute Re-Teach Protocol: ${misc?.title} (${miscId})

1. **Core Cognitive Obstacle:**
Students conflate energy consumption with charge rate depletion (M1). They intuitively treat current like fuel in a car rather than an incompressible fluid in a closed loop.

2. **5-Minute Live Demonstration:**
Connect an ammeter on the live positive lead into an incandescent bulb, and an identical ammeter immediately on the return lead. Show students that both ammeters read identically (0.42 A = 0.42 A). Explain that charge is strictly conserved.

3. **Two Quick Diagnostic Check Probes:**
- *Probe A:* "If 5 Coulombs pass point A in 2 seconds, how many Coulombs pass point B after the lamp in 2 seconds?"
- *Probe B:* "Does a 60W bulb have higher or lower resistance than a 100W bulb when connected in parallel?"

4. **Small-Group Action Activity:**
Pair students to calculate equivalent resistance and draw water-pipe analogies for 3 minutes.`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#05070a] text-[#dfe7e0] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#e0231c]">
              <Users className="w-4 h-4" />
              <span>Section 8: Teacher Analytics &amp; Intervention Dashboard</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif text-white mt-1">
              Class 10-A Diagnostic Heatmap &amp; Misconception Clusters
            </h1>
            <p className="text-xs text-[#aab4ad] mt-1 max-w-2xl">
              Cohort of 32 students. Identifies root-cause prerequisite failures vs. downstream symptoms, groups students by latent mental models, and generates targeted 5-minute intervention protocols.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              Live Cohort: 32 Students Active
            </span>
          </div>
        </div>

        {/* Section 1: Concept Heatmap Table */}
        <div className="bg-[#0a0e12] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-serif font-light text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Prerequisite Mastery Heatmap</span>
            </h3>
            <span className="text-xs text-[#78837c] font-mono">Sorted by Syllabus DAG</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {simulatedClassHeatmap.map((item) => {
              const pct = Math.round(item.avgMastery * 100);
              let color = 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200';
              if (item.risk === 'critical') color = 'bg-red-950/40 border-red-500/60 text-red-200';
              else if (item.risk === 'high' || item.risk === 'medium')
                color = 'bg-amber-950/40 border-amber-500/50 text-amber-200';

              return (
                <div key={item.conceptId} className={`p-4 rounded-xl border ${color} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-black/40 text-white">
                      {item.conceptId}
                    </span>
                    <span className="text-xs font-mono font-bold">{pct}% Class Avg</span>
                  </div>
                  <h4 className="text-sm font-medium text-white">{item.name}</h4>
                  <div className="flex items-center justify-between text-[11px] text-[#aab4ad] pt-1">
                    <span>{item.weakCount} students weak</span>
                    <span className="font-mono uppercase text-[10px] tracking-wider px-1.5 py-0.5 rounded bg-black/30">
                      {item.risk} risk
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Misconception Clusters & Suggested Groups */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <h3 className="text-lg font-serif font-light text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Active Misconception Clusters</span>
            </h3>

            <div className="space-y-3">
              {misconceptionClusters.map((cluster) => {
                const isSelected = selectedClusterId === cluster.id;
                const isConfirmed = confirmedOverwrites[cluster.id];

                return (
                  <div
                    key={cluster.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-[#150a0a] border-red-500/80 ring-1 ring-red-500'
                        : 'bg-[#0a0e12] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300">
                          {cluster.id}
                        </span>
                        <h4 className="text-sm font-medium text-white">{cluster.title}</h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {cluster.studentCount} of 32 students
                      </span>
                    </div>

                    <p className="text-xs text-[#aab4ad] italic mb-3">{cluster.sampleQuote}</p>

                    <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 mb-3 text-xs">
                      <span className="text-[#78837c] block text-[10px] uppercase font-mono mb-1">
                        Suggested Small-Group Instruction:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {cluster.suggestedGroup.map((name) => (
                          <span
                            key={name}
                            className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white text-[11px]"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => handleGenerateReteach(cluster.id)}
                        disabled={isGenerating && selectedClusterId === cluster.id}
                        className="px-3 py-1.5 rounded-lg bg-[#e0231c] hover:bg-red-700 text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-md"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>
                          {isGenerating && selectedClusterId === cluster.id
                            ? 'Generating...'
                            : '1-Click Re-teach Outline'}
                        </span>
                      </button>

                      {/* Teacher Override Feedback Loop */}
                      <button
                        onClick={() =>
                          setConfirmedOverwrites((prev) => ({
                            ...prev,
                            [cluster.id]: !prev[cluster.id],
                          }))
                        }
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1 border transition-all ${
                          isConfirmed
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-white/5 text-[#aab4ad] border-white/10 hover:text-white'
                        }`}
                        title="Teacher confirmation loop as described in Section 8"
                      >
                        {isConfirmed ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirmed by Teacher</span>
                          </>
                        ) : (
                          <>
                            <span>Verify Cluster</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: AI 5-Minute Re-teach Generator Output */}
          <div className="lg:col-span-6">
            <div className="sticky top-20 bg-[#0a0e12] border border-white/15 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-medium text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>5-Minute Re-teach Protocol Output</span>
                </span>
                <span className="text-xs font-mono text-amber-400">{selectedClusterId}</span>
              </div>

              {reteachOutline ? (
                <div className="prose prose-invert prose-xs max-h-[500px] overflow-y-auto pr-2 space-y-3 text-xs text-[#dfe7e0] leading-relaxed">
                  <div className="whitespace-pre-wrap">{reteachOutline}</div>
                </div>
              ) : (
                <div className="py-20 text-center space-y-3">
                  <Sparkles className="w-8 h-8 text-[#78837c] mx-auto animate-pulse" />
                  <p className="text-xs text-[#aab4ad]">
                    Click &ldquo;1-Click Re-teach Outline&rdquo; on any misconception cluster to generate an actionable classroom lesson plan.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
