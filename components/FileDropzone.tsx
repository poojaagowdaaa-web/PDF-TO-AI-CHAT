"use client";

import { FileText, Upload } from "lucide-react";

interface FileDropzoneProps {
  getRootProps: () => Record<string, unknown>;
  getInputProps: () => Record<string, unknown>;
  isDragActive: boolean;
}

function FileDropzone({
  getRootProps,
  getInputProps,
  isDragActive,
}: FileDropzoneProps) {
  return (
    <div
      {...getRootProps()}
      className={`w-full h-96 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-6 cursor-pointer transition-all duration-300 ${
        isDragActive
          ? "border-primary bg-primary/5 scale-[1.02] shadow-lg"
          : "border-border hover:border-primary/50 hover:bg-accent/50 hover:shadow-md"
      }`}
    >
      <input {...getInputProps()} />
      <div
        className={`p-6 rounded-full transition-colors ${
          isDragActive ? "bg-primary/10" : "bg-muted"
        }`}
      >
        {isDragActive ? (
          <Upload className="size-12 text-primary" />
        ) : (
          <FileText className="size-12 text-muted-foreground" />
        )}
      </div>
      <div className="flex flex-col items-center gap-3 text-center px-4">
        {isDragActive ? (
          <>
            <p className="text-xl font-semibold text-foreground">
              Drop your PDF here
            </p>
            <p className="text-sm text-muted-foreground">Release to upload</p>
          </>
        ) : (
          <>
            <p className="text-xl font-semibold text-foreground">
              Drag & drop your PDF here
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse files
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PDF files only • Max 10MB
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default FileDropzone;

