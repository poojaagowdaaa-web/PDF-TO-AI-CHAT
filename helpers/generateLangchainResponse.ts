import { createStuffDocumentsChain } from "@langchain/classic/chains/combine_documents";
import { createHistoryAwareRetriever } from "@langchain/classic/chains/history_aware_retriever";
import { createRetrievalChain } from "@langchain/classic/chains/retrieval";
import type { Document } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { BaseRetriever } from "@langchain/core/retrievers";
import type { PineconeStore } from "@langchain/pinecone";

import { model } from "@/lib/langchain";
import fetchMessagesFromDB from "./fetchMessagesFromDB";
import { generateEmbeddingsInPineconeVectorStore } from "./generateEmbeddingsInPVS";

class FilteredRetriever extends BaseRetriever {
  lc_namespace = ["custom", "filtered_retriever"];

  private retriever: BaseRetriever;

  constructor(retriever: BaseRetriever) {
    super();
    this.retriever = retriever;
  }

  async _getRelevantDocuments(query: string): Promise<Document[]> {
    if (!query || typeof query !== "string") {
      console.warn("Invalid query received, using empty string");
      query = "";
    }

    const docs = await this.retriever.invoke(query);

    return docs.filter(
      (doc: Document) =>
        doc?.pageContent &&
        typeof doc.pageContent === "string" &&
        doc.pageContent.trim().length > 0,
    );
  }
}

async function generateLangchainResponse(docId: string, question: string) {
  if (
    !question ||
    typeof question !== "string" ||
    question.trim().length === 0
  ) {
    throw new Error("Question must be a non-empty string");
  }

  const pineconeVectorStore: PineconeStore =
    await generateEmbeddingsInPineconeVectorStore(docId);

  if (!pineconeVectorStore) {
    throw new Error("Pinecone vector store not found");
  }

  console.log("---Creating a retrieval chain---");
  const baseRetriever = await pineconeVectorStore.asRetriever({
    k: 4,
  });

  const retriever = new FilteredRetriever(baseRetriever);

  const chatHistory = await fetchMessagesFromDB(docId);

  const validChatHistory = chatHistory.filter(
    (msg) =>
      msg?.content &&
      (typeof msg.content === "string" || Array.isArray(msg.content)),
  );

  console.log("---Creating a Prompt Template ---");
  const historyAwarePrompt = ChatPromptTemplate.fromMessages([
    ...validChatHistory,
    ["user", "{input}"],
    [
      "user",
      "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation.",
    ],
  ]);

  console.log("---Create a history aware retrieval chain---");
  const historyAwareRetrieverChain = await createHistoryAwareRetriever({
    llm: model,
    retriever,
    rephrasePrompt: historyAwarePrompt,
  });

  console.log("---Defining a prompt template for answering questions---");

  const historyAwareAnswerPrompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are a helpful assistant that can answer questions based on the below provided context:\n\n{context}",
    ],

    ...validChatHistory,

    ["user", "{input}"],
  ]);

  console.log("---Creating a document combining chain---");
  const historyAwareCombineDocsChain = await createStuffDocumentsChain({
    llm: model,
    prompt: historyAwareAnswerPrompt,
  });

  console.log("---Creating a final chain---");
  const conversationalRetriervalChain = await createRetrievalChain({
    retriever: historyAwareRetrieverChain,
    combineDocsChain: historyAwareCombineDocsChain,
  });

  console.log("---Running the final sample chain---");
  const reply = await conversationalRetriervalChain.invoke({
    input: question,
  });

  console.log("---Reply generated successfully---");
  return reply.answer;
}

export default generateLangchainResponse;
