import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import Chat from "@/components/Chat";
import PdfViewer from "@/components/PdfViewer";
import { Button } from "@/components/ui/button";
import { adminDb } from "@/firebaseAdmin";

async function ChatFilePage({ params }: { params: Promise<{ id: string }> }) {
  await auth.protect();
  const { id } = await params;
  const { userId } = await auth();

  const ref = await adminDb
    .collection("users")
    .doc(userId as string)
    .collection("files")
    .doc(id)
    .get();

  if (!ref.exists) {
    return (
      <div className="flex flex-col gap-6 items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <FileText className="size-8 text-destructive" />
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold">File not found</p>
            <p className="text-sm text-muted-foreground mt-1">
              The document you're looking for doesn't exist or has been deleted.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <ArrowLeft className="size-4" />
              <span className="sr-only">Back to Documents</span>
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const fileData = ref.data();
  const url = fileData?.downloadUrl;
  const fileName = fileData?.name || "Document";

  return (
    <div className="flex flex-col overflow-hidden bg-background fixed inset-0 top-16 w-screen z-40">
      <div className="shrink-0 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="flex items-center gap-4 px-4 md:px-6 lg:px-8 py-3">
          <Button asChild variant="ghost" size="icon" className="shrink-0">
            <Link href="/dashboard">
              <ArrowLeft className="size-4" />
              <span className="sr-only">Back to Documents</span>
            </Link>
          </Button>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="size-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold truncate">{fileName}</h1>
              <p className="text-xs text-muted-foreground">
                Chat with your document
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-5 flex-1 min-h-0 overflow-hidden">
        <div className="col-span-5 lg:col-span-2 overflow-hidden border-r flex flex-col">
          <Chat id={id} />
        </div>
        <div className="col-span-5 bg-muted/30 lg:col-span-3 lg:-order-1 overflow-auto">
          <PdfViewer url={url} />
        </div>
      </div>
    </div>
  );
}

export default ChatFilePage;
