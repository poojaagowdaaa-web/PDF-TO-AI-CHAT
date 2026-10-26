export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/firebaseAdmin";
import DemoDocuments from "./DemoDocuments";
import DocumentCard from "./DocumentCard";

async function Documents() {
  await auth.protect();
  const { userId } = await auth();

  const documentSnapshots = await adminDb
    .collection("users")
    .doc(userId as string)
    .collection("files")
    .get();

  const documents = documentSnapshots.docs;

  return (
    <div className="space-y-6 md:space-y-8 w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          My Documents
        </h1>
        <p className="text-muted-foreground">
          Manage and interact with your uploaded PDF documents
        </p>
      </div>
      {documents.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <DemoDocuments />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              id={doc.id}
              name={doc.data().name}
              size={doc.data().size}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Documents;
