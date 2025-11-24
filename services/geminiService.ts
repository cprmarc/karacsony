import { GoogleGenAI } from "@google/genai";

// Biztonságos inicializálás: ha nincs kulcs, nem omlik össze azonnal
const getClient = () => {
  try {
    // @ts-ignore - A vite configban definiáltuk a process.env-t
    const apiKey = process.env.API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
  } catch (e) {
    return null;
  }
};

export const generateChristmasRhyme = async (targetName: string): Promise<string> => {
  const fallback = `Boldog Karácsonyt és sok ajándékot kívánunk ${targetName}-nak!`;
  
  try {
    const ai = getClient();
    if (!ai) {
      console.warn("Nincs Gemini API kulcs beállítva, alapértelmezett üzenet küldése.");
      return fallback;
    }

    const prompt = `Írj egy nagyon rövid (maximum 2 soros), kedves, rímes karácsonyi jókívánságot magyarul kifejezetten ennek a személynek: ${targetName}. Legyen aranyos és ünnepi.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || fallback;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return fallback;
  }
};
