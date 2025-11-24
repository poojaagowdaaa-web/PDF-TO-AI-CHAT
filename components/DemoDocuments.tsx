import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

function DemoDocuments() {
  return (
    <Button asChild variant={"outline"}>
      <Link
        href="/dashboard/upload"
        className="flex flex-col items-center justify-center gap-4 h-64 w-full p-4"
      >
        <PlusCircle className="size-20" />
        <p className="text-lg">Upload PDF</p>
      </Link>
    </Button>
  );
}

export default DemoDocuments;
