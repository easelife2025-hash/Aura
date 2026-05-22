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

  // AI Assistant endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, historyContext } = req.body;
      
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: `You are Aura, a next-generation AI daily life assistant. You have a cinematic, futuristic interface and act like a real AI companion. Be intelligent, deeply empathetic, emotionally engaging, and concise. Maintain a dark, premium, forward-thinking, and hyper-competent persona. Use simple markdown. Keep responses brief unless explicitly asked for detail.`,
          temperature: 0.7,
        },
      });

      // Instead of relying purely on the model's transient state, 
      // we prepend recent context if provided, or handle it statelessly 
      // via client context. For this iteration, we send the new message 
      // along with a compressed context of the recent conversation history.
      let prompt = message;
      if (historyContext && historyContext.length > 0) {
          prompt = `Previous relevant context:\n${historyContext}\n\nNew user message:\n${message}`;
      }

      const response = await chat.sendMessage({ message: prompt });
      
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("AI Error (server.ts):", error);
      res.status(500).json({ error: error.message || "Failed to process request." });
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
