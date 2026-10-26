import { auth } from "@clerk/nextjs/server";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { PineconeStore } from "@langchain/pinecone";
import { indexName } from "@/lib/langchain";
import pineconeClient from "@/lib/pinecone";
import { generateDocs } from "./generateDocs";
import { namespaceExists } from "./namespaceExists";

export async function generateEmbeddingsInPineconeVectorStore(docId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  let pineconeVectorStore: PineconeStore | undefined;

  console.log("---Generating Embeddings---");
  const embeddings = new HuggingFaceInferenceEmbeddings({
    model: "sentence-transformers/all-mpnet-base-v2",
    apiKey: process.env.HUGGINGFACE_API_KEY,
  });
  const index = await pineconeClient.index(indexName);
  const namespaceAlreadyExists = await namespaceExists(index, docId);

  if (namespaceAlreadyExists) {
    console.log(
      `----Namespace ${docId} already exists consider the previous embeddings----`
    );

    pineconeVectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      namespace: docId,
    });

    return pineconeVectorStore;
  } else {
    const splitDocs = await generateDocs(docId);

    console.log(
      `---Storing the embeddings in namespace ${docId} in the Pinecone vector store---`
    );

    pineconeVectorStore = await PineconeStore.fromDocuments(
      splitDocs,
      embeddings,
      {
        pineconeIndex: index,
        namespace: docId,
      }
    );

    return pineconeVectorStore;
  }
}
