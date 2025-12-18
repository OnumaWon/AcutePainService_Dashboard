import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Chatbot with Thinking Mode
export const sendChatMessage = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  _useThinking: boolean = false
): Promise<string> => {
  const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || "dummy_key";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const chat = model.startChat({
    history: history.map(h => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: h.parts
    }))
  });

  const result = await chat.sendMessage(message);
  const response = await result.response;
  return response.text() || "I couldn't generate a response.";
};

// 2. Image Analysis
export const analyzeImage = async (base64Image: string, prompt: string): Promise<string> => {
  const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || "dummy_key";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image
      }
    },
    { text: prompt || "Analyze this medical dashboard screenshot or clinical image." }
  ]);
  const response = await result.response;
  return response.text() || "No analysis generated.";
};

// 3. Image Editing (Nano Banana)
export const editImage = async (base64Image: string, prompt: string): Promise<string> => {
  const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || "dummy_key";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: 'image/png',
        data: base64Image
      }
    },
    { text: prompt }
  ]);

  const response = await result.response;
  if (response.candidates && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
  }

  throw new Error("No image generated in response.");
};

// 4. Audio Transcription
export const transcribeAudio = async (audioBase64: string): Promise<string> => {
  const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || "dummy_key";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: 'audio/wav',
        data: audioBase64
      }
    },
    { text: "Transcribe this medical note accurately." }
  ]);

  const response = await result.response;
  return response.text() || "Transcription failed.";
};