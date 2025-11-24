"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import FileDropzone from "@/components/FileDropzone";
import UploadProgress from "@/components/UploadProgress";
import useUpload from "@/hooks/useUpload";

function UploadPage() {
  const { progress, status, fileId, handleUpload } = useUpload();
  const router = useRouter();

  useEffect(() => {
    if (fileId) {
      router.push(`/dashboard/files/${fileId}`);
    }
  }, [fileId, router]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        await handleUpload(file);
      } else {
        console.error("No file selected");
      }
    },
    [handleUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: { "application/pdf": [".pdf"] },
    disabled: progress !== null && progress <= 100,
  });

  const uploadInProgress = progress !== null && progress <= 100;

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-2xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Upload Document
        </h1>
        <p className="text-muted-foreground">
          Upload a PDF file to start asking questions
        </p>
      </div>
      {uploadInProgress ? (
        <UploadProgress progress={progress} status={status} />
      ) : (
        <FileDropzone
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          isDragActive={isDragActive}
        />
      )}
    </div>
  );
}

export default UploadPage;
