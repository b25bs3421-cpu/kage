import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, Sparkles, Loader2, Radio } from 'lucide-react';

interface VoiceAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeConceptName?: string;
}

export const VoiceAgentModal: React.FC<VoiceAgentModalProps> = ({
  isOpen,
  onClose,
  activeConceptName = 'CBSE Class 10 Physics',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [tutorReply, setTutorReply] = useState('');
  const [statusMessage, setStatusMessage] = useState('Tap the microphone and speak your physics question.');

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-IN'; // Indian English / Global English for CBSE

        recognition.onstart = () => {
          setIsListening(true);
          setStatusMessage('Listening to your voice... Speak now.');
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
          setStatusMessage('Microphone access paused. You can also type your question.');
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const handleToggleListening = () => {
    if (isSpeaking) {
      synthRef.current?.cancel();
      setIsSpeaking(false);
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      try {
        recognitionRef.current?.start();
      } catch {
        setStatusMessage('Listening restarted. Speak clearly.');
      }
    }
  };

  const handleProcessVoiceInput = async (spokenText: string) => {
    if (!spokenText.trim()) return;

    setIsThinking(true);
    setStatusMessage('Kage is reflecting on your question...');

    try {
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: spokenText,
          activeConcept: activeConceptName,
        }),
      });

      if (!response.ok) throw new Error('Voice API failed');

      const data = await response.json();
      const reply = data.spokenText || 'I heard your question. Consider the law of conservation of charge.';
      setTutorReply(reply);
      setStatusMessage('Kage is speaking...');

      // Speak reply using SpeechSynthesis if sound is enabled
      if (soundEnabled && synthRef.current) {
        synthRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(reply);
        utterance.rate = 1.0;
        utterance.pitch = 1.05;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          setIsSpeaking(false);
          setStatusMessage('Listening completed. Tap the mic to reply or ask another question.');
        };
        utterance.onerror = () => setIsSpeaking(false);

        synthRef.current.speak(utterance);
      } else {
        setStatusMessage('Response ready. Tap the mic to ask another question.');
      }
    } catch {
      const fallback =
        'Remember that in an electrical circuit, charge is conserved at every junction, and potential difference drives the flow.';
      setTutorReply(fallback);
      setStatusMessage('Response ready.');
    } finally {
      setIsThinking(false);
    }
  };

  // When user finishes speaking, automatically send
  useEffect(() => {
    if (!isListening && transcript.trim().length > 3 && !isThinking && !isSpeaking) {
      handleProcessVoiceInput(transcript);
    }
  }, [isListening]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0a0e12] border border-white/15 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative flex flex-col items-center text-center space-y-6">
        {/* Close Button */}
        <button
          onClick={() => {
            synthRef.current?.cancel();
            setIsSpeaking(false);
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full text-[#78837c] hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-300 text-[10px] font-mono uppercase tracking-widest">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#e0231c]" />
            <span>Gemini Live Voice Agent</span>
          </div>
          <h2 className="text-xl font-serif text-white font-light">Talk with Kage Physics Tutor</h2>
          <p className="text-xs text-[#aab4ad]">{activeConceptName}</p>
        </div>

        {/* Animated Voice Orb & Audio Wave Visualizer */}
        <div className="relative py-6 flex flex-col items-center justify-center">
          {/* Animated concentric pulse rings */}
          <div
            className={`absolute w-36 h-36 rounded-full transition-all duration-700 ${
              isListening
                ? 'bg-red-500/20 scale-125 animate-ping'
                : isSpeaking
                ? 'bg-amber-500/20 scale-110 animate-pulse'
                : 'bg-white/5'
            }`}
          ></div>

          {/* Central Mic Button */}
          <button
            onClick={handleToggleListening}
            className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
              isListening
                ? 'bg-[#e0231c] text-white ring-4 ring-red-400/50 scale-105'
                : isSpeaking
                ? 'bg-gradient-to-tr from-amber-500 to-[#e0231c] text-white ring-4 ring-amber-400/50'
                : 'bg-white/10 hover:bg-white/15 text-[#dfe7e0] border border-white/20'
            }`}
          >
            {isThinking ? (
              <Loader2 className="w-9 h-9 animate-spin" />
            ) : isListening ? (
              <Mic className="w-9 h-9 animate-pulse" />
            ) : (
              <Mic className="w-9 h-9" />
            )}
          </button>

          {/* Audio Wave Bars Visualizer */}
          <div className="flex items-center gap-1.5 mt-6 h-6">
            {[40, 70, 30, 90, 60, 100, 50, 80, 45, 85, 35].map((height, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-200 ${
                  isListening
                    ? 'bg-red-400'
                    : isSpeaking
                    ? 'bg-amber-400'
                    : 'bg-white/20'
                }`}
                style={{
                  height: isListening || isSpeaking ? `${height}%` : '20%',
                  animationDelay: `${i * 0.08}s`,
                }}
              ></div>
            ))}
          </div>

          <span className="text-xs text-[#aab4ad] mt-3 font-mono">{statusMessage}</span>
        </div>

        {/* Live Transcripts / Bubble */}
        <div className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-left space-y-3 min-h-[120px] max-h-[180px] overflow-y-auto">
          {transcript && (
            <div className="text-xs">
              <span className="text-[#78837c] font-mono block text-[10px] uppercase">You Said:</span>
              <p className="text-white mt-0.5">{transcript}</p>
            </div>
          )}

          {tutorReply && (
            <div className="text-xs border-t border-white/5 pt-2">
              <span className="text-red-400 font-mono block text-[10px] uppercase">Kage Voice:</span>
              <p className="text-[#dfe7e0] mt-0.5 leading-relaxed">{tutorReply}</p>
            </div>
          )}

          {!transcript && !tutorReply && (
            <p className="text-xs text-[#78837c] italic text-center py-4">
              Try asking: &ldquo;Why does current stay the same in series?&rdquo; or &ldquo;How do I calculate power in a resistor?&rdquo;
            </p>
          )}
        </div>

        {/* Fallback input field for typing when microphone is unavailable */}
        <div className="w-full flex items-center gap-2">
          <input
            type="text"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleProcessVoiceInput(transcript)}
            placeholder="Or type what you want to say to the voice agent..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-[#78837c] focus:outline-none focus:border-[#e0231c]"
          />
          <button
            onClick={() => handleProcessVoiceInput(transcript)}
            disabled={!transcript.trim() || isThinking}
            className="px-3 py-2 rounded-xl bg-[#e0231c] hover:bg-red-700 disabled:opacity-40 text-white text-xs font-semibold"
          >
            Ask
          </button>
        </div>

        {/* Sound toggle & Mute */}
        <div className="flex items-center justify-between w-full text-xs text-[#78837c] pt-2 border-t border-white/10">
          <button
            onClick={() => {
              if (soundEnabled && synthRef.current) {
                synthRef.current.cancel();
                setIsSpeaking(false);
              }
              setSoundEnabled(!soundEnabled);
            }}
            className="flex items-center gap-1.5 hover:text-white transition-all"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'Speech Audio Enabled' : 'Speech Audio Muted'}</span>
          </button>

          <span className="text-[10px] font-mono">Gemini Voice Agent</span>
        </div>
      </div>
    </div>
  );
};
