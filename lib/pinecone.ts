import { Pinecone } from "@pinecone-database/pinecone";

if (!process.env.PINECONE_API_KEY) {
  throw new Error("PINECONE_API_KEY is not set");
}

// Use environment variable or fallback to 'gcp-starter' for the starter environment
const pineconeEnvironment = process.env.PINECONE_ENVIRONMENT || 'gcp-starter';

console.log('Pinecone environment:', pineconeEnvironment);

const pineconeClient = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
  environment: pineconeEnvironment,
});

export default pineconeClient;
