import { GoogleGenAI } from "@google/genai";

const geminiAIConfig = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export default geminiAIConfig;