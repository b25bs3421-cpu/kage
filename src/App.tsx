import React, { useState } from 'react';
import { Navbar, type ActiveTab } from './components/Navbar';
import { SanctuaryView } from './components/SanctuaryView';
import { DiagnosticTestView } from './components/DiagnosticTestView';
import { ConceptGraphView, type ConceptState } from './components/ConceptGraphView';
import { PracticeSessionView } from './components/PracticeSessionView';
import { FSRSReviewView } from './components/FSRSReviewView';
import { TeacherDashboardView } from './components/TeacherDashboardView';
import { ResearchLabView } from './components/ResearchLabView';
import { ChatTutorDrawer } from './components/ChatTutorDrawer';
import { VoiceAgentModal } from './components/VoiceAgentModal';

import { INITIAL_CONCEPTS } from './lib/physicsData';
import { updateBKT, propagateEvidence } from './lib/bkt';
import { updateElo } from './lib/elo';
import { updateMemoryState, type MemoryState } from './lib/fsrs';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('sanctuary');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [studentTheta, setStudentTheta] = useState<number>(0.2); // Initial Elo ability rating

  // Initialize concepts state
  const [concepts, setConcepts] = useState<Record<string, ConceptState>>(() => {
    const map: Record<string, ConceptState> = {};
    for (const [id, data] of Object.entries(INITIAL_CONCEPTS)) {
      map[id] = {
        id,
        name: data.name,
        unit: data.unit,
        prerequisites: data.prerequisites,
        description: data.description,
        learningObjective: data.learningObjective,
        mastery: data.initialMastery,
        bkt: {
          pL: data.initialMastery,
          g: 0.25,
          s: 0.1,
          t: 0.15,
        },
        misconceptionIds: data.misconceptionIds,
      };
    }
    return map;
  });

  // Initialize FSRS memory states
  const [memoryStates, setMemoryStates] = useState<Record<string, MemoryState>>(() => {
    const map: Record<string, MemoryState> = {};
    const now = Date.now();
    for (const id of Object.keys(INITIAL_CONCEPTS)) {
      map[id] = {
        conceptId: id,
        stability: 4.5,
        difficulty: 5.0,
        lastReviewedAt: now - 1000 * 60 * 60 * 24 * (id === 'E1' ? 1 : id === 'E4' ? 6 : 10),
        nextReviewAt: now + (id === 'E1' ? 4 : id === 'E4' ? -1 : 2) * 24 * 60 * 60 * 1000,
        reps: 2,
        lapses: 0,
      };
    }
    return map;
  });

  // Active concept target for chat / voice context
  const [activeConceptId, setActiveConceptId] = useState<string>('E4');
  const activeConcept = concepts[activeConceptId] || concepts['E4'];

  // Overall mastery calculation
  const totalMasterySum = Object.values(concepts).reduce((sum, c) => sum + c.mastery, 0);
  const masteryPercentage = Math.round((totalMasterySum / Object.keys(concepts).length) * 100);

  // Callback: When student answers any question
  const handleRecordAnswer = (
    conceptId: string,
    isCorrect: boolean,
    difficultyDelta: number,
    misconceptionId?: string
  ) => {
    const currentConcept = concepts[conceptId];
    if (!currentConcept) return;

    // 1. Update BKT
    const newMastery = updateBKT(
      currentConcept.mastery,
      isCorrect,
      currentConcept.bkt.g,
      currentConcept.bkt.s,
      currentConcept.bkt.t
    );

    // 2. Propagate evidence to prerequisites & dependents
    const propagated = propagateEvidence(concepts, conceptId, newMastery);

    setConcepts((prev) => {
      const next = { ...prev };
      for (const [id, val] of Object.entries(propagated)) {
        if (next[id]) {
          next[id] = {
            ...next[id],
            mastery: val,
            bkt: { ...next[id].bkt, pL: val },
          };
        }
      }
      return next;
    });

    // 3. Update Elo
    const eloResult = updateElo(studentTheta, difficultyDelta, isCorrect);
    setStudentTheta(eloResult.newTheta);

    // 4. Update FSRS memory
    const existingMem = memoryStates[conceptId];
    if (existingMem) {
      const grade = isCorrect ? 'good' : 'again';
      const updatedMem = updateMemoryState(existingMem, grade);
      setMemoryStates((prev) => ({
        ...prev,
        [conceptId]: updatedMem,
      }));
    }
  };

  const handleManualMasteryDelta = (conceptId: string, delta: number) => {
    const node = concepts[conceptId];
    if (!node) return;
    const newM = Math.min(0.99, Math.max(0.01, node.mastery + delta));
    const propagated = propagateEvidence(concepts, conceptId, newM);

    setConcepts((prev) => {
      const next = { ...prev };
      for (const [id, val] of Object.entries(propagated)) {
        if (next[id]) {
          next[id] = {
            ...next[id],
            mastery: val,
            bkt: { ...next[id].bkt, pL: val },
          };
        }
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-[#dfe7e0] flex flex-col font-sans selection:bg-[#e0231c] selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openChat={() => setIsChatOpen(true)}
        openVoice={() => setIsVoiceOpen(true)}
        masteryPercentage={masteryPercentage}
      />

      {/* Main Content View Container */}
      <main className="flex-1 pt-16">
        {activeTab === 'sanctuary' && (
          <SanctuaryView
            onNavigate={(tab) => setActiveTab(tab)}
            openChat={() => setIsChatOpen(true)}
            openVoice={() => setIsVoiceOpen(true)}
          />
        )}

        {activeTab === 'diagnostic' && (
          <DiagnosticTestView
            onCompleteDiagnostic={() => {
              setActiveTab('concept_graph');
            }}
            onRecordAnswer={handleRecordAnswer}
          />
        )}

        {activeTab === 'concept_graph' && (
          <ConceptGraphView
            concepts={concepts}
            onSelectConceptToPractice={(cId) => {
              setActiveConceptId(cId);
              setActiveTab('practice');
            }}
            onUpdateManualMastery={handleManualMasteryDelta}
          />
        )}

        {activeTab === 'practice' && (
          <PracticeSessionView
            concepts={concepts}
            studentTheta={studentTheta}
            onRecordAnswer={handleRecordAnswer}
            openSocraticChat={() => setIsChatOpen(true)}
          />
        )}

        {activeTab === 'review' && (
          <FSRSReviewView
            concepts={concepts}
            memoryStates={memoryStates}
            onUpdateMemory={(newStates) => setMemoryStates(newStates)}
          />
        )}

        {activeTab === 'teacher' && <TeacherDashboardView />}

        {activeTab === 'research' && <ResearchLabView />}
      </main>

      {/* Socratic Chatbot Tutor Drawer */}
      <ChatTutorDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        activeConceptName={activeConcept ? `${activeConcept.id}: ${activeConcept.name}` : undefined}
        masteryPercentage={Math.round((activeConcept?.mastery || 0.4) * 100)}
      />

      {/* Live Gemini Voice Agent Modal */}
      <VoiceAgentModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        activeConceptName={activeConcept ? `${activeConcept.id}: ${activeConcept.name}` : undefined}
      />
    </div>
  );
}
