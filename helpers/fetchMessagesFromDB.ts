import { auth } from "@clerk/nextjs/server";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { adminDb } from "@/firebaseAdmin";

async function fetchMessagesFromDB(docId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User Not found");
  }
  console.log("---Fetching chat history---");

  const chats = await adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .doc(docId)
    .collection("chat")
    .orderBy("createdAt", "desc")
    .get();

  const chatHistory = chats.docs
    .filter((doc) => doc.data().message)
    .map((doc) =>
      doc.data().role === "human"
        ? new HumanMessage(doc.data().message)
        : new AIMessage(doc.data().message),
    )
    .reverse();
  console.log(`---fetched last ${chatHistory.length} messages successfully---`);
  return chatHistory;
}

export default fetchMessagesFromDB;
