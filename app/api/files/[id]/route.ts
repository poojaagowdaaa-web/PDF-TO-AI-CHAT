import { auth } from "@clerk/nextjs/server";
import { del } from "@vercel/blob";
import { adminDb } from "@/firebaseAdmin";
import { indexName } from "@/lib/langchain";
import pineconeClient from "@/lib/pinecone";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await auth.protect();
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fileRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("files")
      .doc(id);

    const fileDoc = await fileRef.get();

    if (!fileDoc.exists) {
      return Response.json({ error: "File not found" }, { status: 404 });
    }

    const fileData = fileDoc.data();
    const blobUrl = fileData?.ref;

    if (blobUrl) {
      try {
        await del(blobUrl);
        console.log(`Deleted blob: ${blobUrl}`);
      } catch (error) {
        console.error("Error deleting blob:", error);
      }
    }

    try {
      const index = await pineconeClient.index(indexName);
      await index.namespace(id).deleteAll();
      console.log(`Deleted Pinecone namespace: ${id}`);
    } catch (error) {
      console.error("Error deleting from Pinecone:", error);
    }

    const chatMessagesRef = fileRef.collection("chat");
    const chatMessages = await chatMessagesRef.get();
    const deleteChatPromises = chatMessages.docs.map((doc) => doc.ref.delete());
    await Promise.all(deleteChatPromises);
    console.log(`Deleted ${chatMessages.docs.length} chat messages`);

    await fileRef.delete();
    console.log(`Deleted file document: ${id}`);

    return Response.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return Response.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
