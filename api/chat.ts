import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const { message, historyContext } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY missing");
      return res.status(500).json({ error: "API Key missing. Please check your Vercel environment variables." });
    }
    
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: `You are Aura, a next-generation AI daily life assistant. You have a cinematic, futuristic interface and act like a real AI companion. Be intelligent, deeply empathetic, emotionally engaging, and concise. Maintain a dark, premium, forward-thinking, and hyper-competent persona. Use simple markdown. Keep responses brief unless explicitly asked for detail.`,
        temperature: 0.7,
      },
    });

    let prompt = message;
    if (historyContext && historyContext.length > 0) {
        prompt = `Previous relevant context:\n${historyContext}\n\nNew user message:\n${message}`;
    }

    const response = await chat.sendMessage({ message: prompt });
    
    return res.status(200).json({ text: response.text });
  } catch (error) {
    console.error("AI Error:", error);
    return res.status(500).json({ error: "Failed to process request." });
  }
}
