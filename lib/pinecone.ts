import { Pinecone } from "@pinecone-database/pinecone";

console.log('Pinecone Config - Checking environment variables:');
console.log('PINECONE_API_KEY exists:', !!process.env.PINECONE_API_KEY);
console.log('PINECONE_ENVIRONMENT:', process.env.PINECONE_ENVIRONMENT || 'Not set, using default');

if (!process.env.PINECONE_API_KEY) {
  throw new Error("PINECONE_API_KEY is not set");
}

// For gcp-starter environment, we need to use 'gcp-starter' as the environment
const pineconeEnvironment = 'gcp-starter';

console.log('Initializing Pinecone with environment:', pineconeEnvironment);

let pineconeClient: Pinecone;
try {
  pineconeClient = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
    environment: pineconeEnvironment,
  });
  
  console.log('Pinecone client initialized successfully');
} catch (error) {
  console.error('Error initializing Pinecone:', error);
  throw error;
}

const client: Pinecone = pineconeClient;
export default client;
