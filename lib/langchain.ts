import { ChatGroq } from "@langchain/groq";

export const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  apiKey: process.env.GROQ_API_KEY,
});

export const indexName = "pdf-to-ai-chat";
