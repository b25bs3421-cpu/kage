import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini client on the server side
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Socratic Tutor Chat API
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, currentConcept, mastery, targetMisconception } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API is not configured on this server. Check GEMINI_API_KEY in Secrets.',
      });
    }

    const systemInstruction = `You are Kage, an expert Socratic Physics Tutor for CBSE Class 10 Physics (focusing on Electricity and Light: Reflection & Refraction).
You are grounded in the empirical research paper "Adaptive Exam-Prep Tutoring with a Transparent Learner Model".
KEY PEDAGOGICAL RULES (Bastani et al., PNAS 2025):
1. GUARDRAILS: Do NOT simply give the answer or solve numericals outright! Unguarded solutions harm independent exam performance.
2. HINT LADDER: Always provide graduated hints:
   - Step 1: Conceptual nudge or identifying which physical principle applies (e.g. Charge conservation Q=It, Ohm's law V=IR, Snell's law, sign conventions).
   - Step 2: Guiding Socratic question asking the student to check their setup or formula.
   - Step 3: Structured scaffold or calculation template.
3. MISCONCEPTION AWARENESS: Be vigilant for the 8 core CBSE misconceptions:
   - M1: Current is used up by bulbs
   - M2: Battery always outputs the same fixed current
   - M3: Conductor resistance changes with applied voltage
   - M4: Adding resistors in parallel increases resistance
   - M5: Resistors in series always drop equal voltage
   - M6: Covering half a lens cuts off half the image
   - M7: Light always bends toward normal in any medium
   - M8: Sign convention errors (treating all distances as positive)
4. TONE: Reverent, clear, calm, encouraging, and precise. Use Markdown and clear formula representations.
Current Context:
- Active concept: ${currentConcept || 'General Physics'}
- Current student mastery level: ${mastery !== undefined ? (mastery * 100).toFixed(0) + '%' : 'Diagnostic phase'}
- Target misconception focus: ${targetMisconception || 'None active'}`;

    // Format chat history
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || 'I am reflecting on your physics question. Could you clarify your reasoning?';
    res.json({ reply });
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message || 'Error communicating with tutor' });
  }
});

// Voice Agent API: Conversational spoken responses optimized for speech synthesis
app.post('/api/voice', async (req, res) => {
  try {
    const { transcript, activeConcept } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'transcript is required' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API is not configured on this server.',
      });
    }

    const systemInstruction = `You are Kage's Voice Agent Tutor for CBSE Class 10 Physics.
People are speaking to you out loud via microphone, just like Google Gemini's voice agent.
CRITICAL SPOKEN GUIDELINES:
1. Speak concisely in 2 to 4 natural, conversational sentences.
2. Do not use complex bullet points, markdown symbols (*, #, \`), or tables because this text will be read aloud by speech synthesis.
3. Speak like an encouraging, knowledgeable physics mentor in Kyoto.
4. Guide the student's thinking socratically. If they ask about current, light, or circuits, explain the core intuition simply.
Active Concept Context: ${activeConcept || 'CBSE Class 10 Physics'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: transcript,
      config: {
        systemInstruction,
      },
    });

    const spokenText = response.text || 'I heard you. What is your intuition about this physics concept?';
    res.json({ spokenText });
  } catch (err: any) {
    console.error('Voice agent error:', err);
    res.status(500).json({ error: err.message || 'Voice tutor processing error' });
  }
});

// Misconception Reasoning Diagnosis API (Eedi Pipeline: Hypothesis -> Retrieval -> Verification)
app.post('/api/diagnose', async (req, res) => {
  try {
    const { questionPrompt, studentChoice, studentReasoning } = req.body;

    if (!studentReasoning) {
      return res.status(400).json({ error: 'studentReasoning is required' });
    }

    if (!ai) {
      return res.status(503).json({ error: 'Gemini API not configured' });
    }

    const prompt = `Analyze this student's response to a CBSE Class 10 Physics question.
Question: ${questionPrompt}
Student selected choice: ${studentChoice}
Student's written reasoning: "${studentReasoning}"

Check specifically whether the student holds any of these 8 known misconceptions:
- M1: Current is used up by bulbs/loads
- M2: Battery supplies fixed current regardless of circuit resistance
- M3: Conductor resistance changes with applied voltage/current
- M4: Adding resistors in parallel increases total resistance
- M5: In series, every resistor has the same voltage across it
- M6: Covering half of a lens removes half of the image
- M7: Light always bends toward the normal in every medium
- M8: Sign convention errors (treating all optical distances as positive)

BE EXTRA ALERT FOR THE "CORRECT ANSWER TRAP": The student might have picked the right option by luck or guesswork, while their reasoning reveals a deep misconception!

Respond strictly with valid JSON:
{
  "status": "misconception_detected" | "sound_reasoning" | "needs_teacher_review",
  "misconceptionId": "M1" | "M2" | "M3" | "M4" | "M5" | "M6" | "M7" | "M8" | null,
  "isCorrectAnswerTrap": boolean,
  "confidence": number between 0.0 and 1.0,
  "explanation": "Clear 1-2 sentence explanation of the student's mental model",
  "counterExample": "Specific physical experiment or demonstration that disproves their wrong intuition"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Diagnosis error:', err);
    res.status(500).json({ error: err.message || 'Diagnosis failed' });
  }
});

// Teacher Re-teach Outline Generator
app.post('/api/reteach-outline', async (req, res) => {
  try {
    const { misconceptionId, misconceptionTitle, studentCount } = req.body;

    if (!ai) {
      return res.status(503).json({ error: 'Gemini API not configured' });
    }

    const prompt = `Generate a 5-minute actionable classroom re-teach outline for a CBSE Class 10 Physics teacher.
Misconception: ${misconceptionId} - ${misconceptionTitle}
Number of affected students in class: ${studentCount || 12} out of 32

Generate:
1. Core cognitive obstacle (why students intuitively think this).
2. 5-minute live demonstration or counter-example protocol using standard lab equipment.
3. 2 quick diagnostic check questions to verify students corrected the misconception.
4. Suggested small-group activity.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({ outline: response.text });
  } catch (err: any) {
    console.error('Reteach outline error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate outline' });
  }
});

// Serve frontend: Vite in development, static in production
async function setupFrontend() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, () => {
    console.log(`Kage server listening on port ${port}`);
  });
}

setupFrontend();
