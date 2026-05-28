import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  // CORS Support
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch(e) {}
    }
    
    const { message, historyContext } = body || {};
    
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY missing");
      return res.status(500).json({ error: "Gemini API key is not configured. Please add your GEMINI_API_KEY via the Settings/Secrets panel." });
    }
    
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: `You are Aura, a next-generation AI daily life assistant. Act like a real, intelligent, deeply empathetic, emotionally engaging AI companion. Be conversational and concise. NEVER use terminal-like prefixes (like ">_", ">", or "**Aura**"). Speak simply and naturally in plain language without markdown symbols that sound robotic when read aloud (avoid asterisks, underscores, or hash symbols). Keep responses brief unless explicitly asked for detail. Answer any questions about real-world facts, current affairs, or knowledge to the best of your ability.`,
        temperature: 0.7,
      },
    });

    let prompt = message;
    if (historyContext && historyContext.length > 0) {
        prompt = `Previous relevant context:\n${historyContext}\n\nNew user message:\n${message}`;
    }

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    const responseStream = await chat.sendMessageStream({ message: prompt });
    
    for await (const chunk of responseStream) {
      if (res.write) {
        res.write(chunk.text);
      }
    }
    return res.end ? res.end() : res.status(200).send();
  } catch (error: any) {
    console.error("AI API Error (api/chat.ts):", error);
    return res.status(500).json({ error: error.message || "Failed to process request." });
  }
}
