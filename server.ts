import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Text-to-Speech proxy for ElevenLabs
  app.post("/api/tts", async (req, res) => {
    try {
      const { text } = req.body;
      const apiKey = process.env.ELEVENLABS_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "ElevenLabs API key is missing. Please add ELEVENLABS_API_KEY in the environment variables." });
      }

      // "Adam" - Deep, confident, professional male voice
      const voiceId = "pNInz6obpgDQGcFmaJcg"; 
      
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "xi-api-key": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`ElevenLabs Error: ${errText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      res.setHeader("Content-Type", "audio/mpeg");
      res.send(Buffer.from(arrayBuffer));
    } catch (error: any) {
      console.error("TTS Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // AI Assistant endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, historyContext } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
         return res.status(500).json({ error: "Gemini API key is not configured. Please add your GEMINI_API_KEY via the Settings/Secrets panel." });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: `You are Aura... (system prompt). Be conversational and concise. NEVER use terminal-like prefixes (like ">_", ">", or "**Aura**"). Speak simply and naturally in plain language without markdown symbols that sound robotic when read aloud (avoid asterisks, underscores, or hash symbols). Keep responses brief unless explicitly asked for detail. For informational queries, adopt a highly authoritative, fact-based tone.`,
          temperature: 0.7,
        },
      });

      let prompt = message;
      if (historyContext && historyContext.length > 0) {
          prompt = `Previous relevant context:\n${historyContext}\n\nNew user message:\n${message}`;
      }

      const responseStream = await chat.sendMessageStream({ message: prompt });
      
      for await (const chunk of responseStream) {
        if (!res.headersSent) {
          res.setHeader('Content-Type', 'text/plain');
          res.setHeader('Transfer-Encoding', 'chunked');
        }
        res.write(chunk.text);
      }
      res.end();
    } catch (error: any) {
      console.error("AI Error (server.ts):", error);
      if (!res.headersSent) {
        if (error.status === 429 || (error.message && error.message.includes('429'))) {
          res.status(429).json({ error: "AI Quota Exceeded. You have hit the Gemini API free tier rate limit. Please wait a minute and try again." });
        } else {
          res.status(500).json({ error: error.message || "Failed to process request." });
        }
      } else {
        res.end(`\n\n[System Error: ${error.message}]`);
      }
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
