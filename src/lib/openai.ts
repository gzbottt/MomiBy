import OpenAI from 'openai';

const getOpenAI = (apiKey: string) => {
  if (!apiKey) {
    throw new Error("API Key OpenAI tidak ditemukan. Silakan masukkan API Key di halaman Pengaturan.");
  }
  return new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // This is allowed for the AI Studio preview environment as requested by user
  });
};

export const analyzeFoodImageWithOpenAI = async (base64Image: string, apiKey: string) => {
  const openai = getOpenAI(apiKey);
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Identifikasi jenis makanan bayi ini dan berikan estimasi kandungan gizinya (kalori, protein, karbohidrat, lemak). Berikan hasil dalam format JSON murni dengan struktur: { \"foodName\": \"...\", \"nutrition\": { \"calories\": 0, \"protein\": 0, \"carbs\": 0, \"fat\": 0 }, \"summary\": \"...\" }" },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
            },
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("Gagal mendapatkan respons dari OpenAI");
  
  return JSON.parse(content);
};
