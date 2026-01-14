
import { GoogleGenAI, Type } from "@google/genai";
import { InvoiceItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const parseItemsFromText = async (text: string): Promise<InvoiceItem[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Extract billing items from this description: "${text}". 
    Return a list of items with description, quantity, and unit price. 
    Standardize the units if mentioned.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            quantity: { type: Type.NUMBER },
            price: { type: Type.NUMBER }
          },
          required: ["description", "quantity", "price"]
        }
      }
    }
  });

  try {
    const rawItems = JSON.parse(response.text);
    return rawItems.map((item: any) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9)
    }));
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return [];
  }
};

export const generateProfessionalNote = async (details: { clientName: string, total: string, docType: string }): Promise<string> => {
  const prompt = details.docType === 'Quotation' 
    ? `Write a professional and encouraging quotation proposal for ${details.clientName}. The total estimated amount is ${details.total}. Keep it polite, inviting for questions, and under 3 sentences.`
    : `Write a short, professional and polite thank you note for an invoice to ${details.clientName}. The total is ${details.total}. Keep it under 3 sentences.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });

  return response.text.trim();
};
