import { Pinecone } from "@pinecone-database/pinecone";

console.log('Pinecone Config - Checking environment variables:');
console.log('PINECONE_API_KEY exists:', !!process.env.PINECONE_API_KEY);

if (!process.env.PINECONE_API_KEY) {
  throw new Error("PINECONE_API_KEY is not set");
}

console.log('Initializing Pinecone client...');

let pineconeClient: Pinecone;
try {
  pineconeClient = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
  });
  
  console.log('Pinecone client initialized successfully');
} catch (error) {
  console.error('Error initializing Pinecone:', error);
  throw error;
}

const client: Pinecone = pineconeClient;
export default client;
