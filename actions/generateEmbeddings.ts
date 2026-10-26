"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateEmbeddingsInPineconeVectorStore } from "@/helpers/generateEmbeddingsInPVS";

export async function generateEmbeddings(docId: string) {
  auth.protect();

  await generateEmbeddingsInPineconeVectorStore(docId);

  revalidatePath(`/dashboard/files/${docId}`, "page");

  return { completed: true };
}
