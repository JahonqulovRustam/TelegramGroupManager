
import { GoogleGenAI, Modality } from "@google/genai";

let audioContext: AudioContext | null = null;

export const initAudioContext = async () => {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    return audioContext;
  } catch (error) {
    console.error("AudioContext initialization failed:", error);
    return null;
  }
};

export const getSmartReply = async (messageText: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User message: "${messageText}". 
      Context: This is a message from a Telegram group. I am the bot manager.
      Task: Suggest a professional and helpful reply in Uzbek language.
      Constraints: Keep it short (max 100 characters).`,
      config: { temperature: 0.7 },
    });
    return response.text?.trim() || "Xabar qabul qilindi.";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return "Tushunarli.";
  }
};

export const speakText = async (text: string) => {
  if (!text || text.trim().length === 0) return;

  try {
    const ctx = await initAudioContext();
    if (!ctx) return;
    
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text.trim() }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, 
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const alignedLength = bytes.buffer.byteLength - (bytes.buffer.byteLength % 2);
      if (alignedLength <= 0) return;
      
      const safeBuffer = bytes.buffer.slice(0, alignedLength);
      const dataInt16 = new Int16Array(safeBuffer);
      const frameCount = dataInt16.length;
      
      const buffer = ctx.createBuffer(1, frameCount, 24000);
      const channelData = buffer.getChannelData(0);
      
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
    }
  } catch (error: any) {
    console.error("TTS Error:", error);
  }
};
