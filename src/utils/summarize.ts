import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const summarizeText = async (text: string) => {
  const response = await client.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "Summarize the following assignment clearly and concisely." },
      { role: "user", content: text }
    ],
  });
  
  return response.choices[0].message?.content ?? "";
};