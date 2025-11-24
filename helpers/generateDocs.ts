import { auth } from "@clerk/nextjs/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { adminDb } from "@/firebaseAdmin";

export async function generateDocs(docId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  console.log("---Fetching Document from Firestore---");
  const firebaseRef = await adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .doc(docId)
    .get();

  const downloadUrl = firebaseRef.data()?.downloadUrl;
  if (!downloadUrl) {
    throw new Error("Download URL not found");
  }
  console.log("---Download URL fetched successfully---");

  const response = await fetch(downloadUrl);
  const data = await response.blob();
  console.log("---Loading PDF into Langchain Document---");
  const loader = new PDFLoader(data);
  const docs = await loader.load();

  console.log("---Splitting the documents into smaller parts...---");
  const splitter = new RecursiveCharacterTextSplitter();
  const splitDocs = await splitter.splitDocuments(docs);

  console.log(`--- Split into ${splitDocs.length} chunks---`);

  return splitDocs;
}
