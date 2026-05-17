import { GoogleGenAI, Type } from "@google/genai";

const getAI = (apiKey?: string) => {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("API Key Gemini tidak ditemukan. Silakan masukkan API Key di halaman Pengaturan.");
  }
  return new GoogleGenAI({ apiKey: key });
};

export const chatWithAI = async (message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[], apiKey?: string) => {
  const ai = getAI(apiKey);
  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash-latest",
    contents: [
      ...history,
      { role: 'user', parts: [{ text: message }] }
    ],
    config: {
      systemInstruction: "Anda adalah asisten kesehatan cerdas KABA (Kesehatan Ibu dan Bayi). " +
        "Tugas Anda adalah menjawab pertanyaan seputar kesehatan bayi, ibu hamil, dan parenting. " +
        "Gunakan bahasa yang hangat, menenangkan, dan mendidik dalam bahasa Indonesia. " +
        "PENTING: Selalu tambahkan catatan bahwa saran Anda bukan pengganti dokter profesional. " +
        "Jika gejala terlihat serius (seperti sesak napas, kejang, dehidrasi berat, perdarahan hebat), sarankan segera ke IGD atau hubungi ambulans.",
      temperature: 0.7,
    }
  });

  return response.text;
};

export const analyzeFoodImage = async (base64Image: string, apiKey?: string) => {
  const ai = getAI(apiKey);
  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash-latest",
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image } },
        { text: "Identifikasi jenis makanan bayi ini dan berikan estimasi kandungan gizinya (kalori, protein, karbohidrat, lemak). Kembalikan dalam format JSON murni." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          foodName: { type: Type.STRING },
          nutrition: {
            type: Type.OBJECT,
            properties: {
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER },
            },
            required: ["calories", "protein", "carbs", "fat"]
          },
          summary: { type: Type.STRING }
        },
        required: ["foodName", "nutrition", "summary"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const generateArticle = async (topic: string, apiKey?: string) => {
  const ai = getAI(apiKey);
  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash-latest",
    contents: `Buatlah sebuah artikel kesehatan parenting atau bayi tentang: ${topic}. Gunakan panduan medis yang valid. Sertakan judul, estimasi waktu baca, dan konten dalam format Markdown.`,
    config: {
      systemInstruction: "Anda adalah penulis artikel kesehatan profesional di aplikasi KABA. Tulis dengan nada empatik dan informatif.",
    }
  });

  return response.text;
};
