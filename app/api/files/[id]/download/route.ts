import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/firebaseAdmin";

export const runtime = "nodejs";

export async function GET(
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
    const downloadUrl = fileData?.downloadUrl;
    const fileName = fileData?.name || "document.pdf";

    if (!downloadUrl) {
      return Response.json(
        { error: "Download URL not found" },
        { status: 404 },
      );
    }

    const response = await fetch(downloadUrl);
    if (!response.ok) {
      return Response.json({ error: "Failed to fetch file" }, { status: 500 });
    }

    const blob = await response.blob();

    return new Response(blob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    return Response.json({ error: "Failed to download file" }, { status: 500 });
  }
}
