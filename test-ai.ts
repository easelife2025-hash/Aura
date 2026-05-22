import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function test() {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
    
    console.log("Initialized AI");
    
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: "test",
        temperature: 0.7,
      },
    });
    
    console.log("Created Chat");
    
    const response = await chat.sendMessage({ message: "Hello" });
    
    console.log("Response:", response.text);
  } catch (e: any) {
    console.error("Error:", e.message);
  }
}

test();
