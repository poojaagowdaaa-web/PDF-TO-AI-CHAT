"use client";

import { Download, FileText, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import formatBytes from "@/helpers/formatBytes";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface DocumentCardProps {
  id: string;
  name: string;
  size: number;
}

function DocumentCard({ id, name, size }: DocumentCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/files/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete file");
      }

      setIsDialogOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting file:", error);
      setIsDeleting(false);
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await fetch(`/api/files/${id}/download`);
      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file. Please try again.");
    }
  };

  return (
    <>
      <div className="group relative h-full w-full">
        <Button
          asChild
          variant="outline"
          className="h-full w-full flex flex-col items-center justify-center gap-4 hover:bg-accent transition-all duration-300 p-6 border-border hover:border-primary/50 hover:shadow-md"
        >
          <Link href={`/dashboard/files/${id}`}>
            <div className="size-20 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <FileText className="size-10" />
            </div>
            <p className="text-lg font-semibold mt-2 text-center line-clamp-2">
              {name}
            </p>
            <p className="text-sm text-muted-foreground">{formatBytes(size)}</p>
          </Link>
        </Button>
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Button
            size="icon-sm"
            variant="secondary"
            onClick={handleDownload}
            className="h-8 w-8 shadow-md hover:shadow-lg transition-shadow"
            title="Download"
            aria-label="Download document"
          >
            <Download className="size-4" />
          </Button>
          <Button
            size="icon-sm"
            variant="destructive"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="h-8 w-8 shadow-md hover:shadow-lg transition-shadow"
            title="Delete"
            aria-label="Delete document"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{name}&quot;? This action
              cannot be undone. The document will be permanently removed from
              all storage locations.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default DocumentCard;
