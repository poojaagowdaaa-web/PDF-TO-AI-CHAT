import { type HandleUploadBody, handleUpload } from "@vercel/blob/client";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = (await request.json()) as HandleUploadBody;

    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: ["application/pdf"],
          maximumSizeInBytes: 10 * 1024 * 1024, // 10MB
        };
      },
    });

    return Response.json(result);
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
