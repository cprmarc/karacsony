import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateChristmasRhyme = async (targetName: string): Promise<string> => {
  if (!apiKey) {
    return `Kellemes Ünnepeket kívánunk ${targetName}-nak!`;
  }

  try {
    const prompt = `Írj egy nagyon rövid (maximum 2 soros), kedves, rímes karácsonyi jókívánságot magyarul kifejezetten ennek a személynek: ${targetName}. Legyen aranyos és ünnepi.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Boldog Karácsonyt és sok ajándékot kívánunk ${targetName}-nak!`;
  }
};
