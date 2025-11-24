"use client";

import {
  AlertCircle,
  CheckCircle2,
  Database,
  Loader2,
  Sparkles,
} from "lucide-react";
import { UploadStatus, type UploadStatusType } from "@/hooks/useUpload";

interface UploadProgressProps {
  progress: number | null;
  status: UploadStatusType | null;
}

function UploadProgress({ progress, status }: UploadProgressProps) {
  const getStatusIcon = () => {
    if (status === UploadStatus.ABORTED) {
      return <AlertCircle className="size-6 text-destructive" />;
    }
    if (status === UploadStatus.UPLOADED || status === UploadStatus.SAVING) {
      return <CheckCircle2 className="size-6 text-green-500" />;
    }
    if (status === UploadStatus.GENERATING) {
      return <Sparkles className="size-6 text-blue-500 animate-pulse" />;
    }
    return <Loader2 className="size-6 text-primary animate-spin" />;
  };

  const getStatusColor = () => {
    if (status === UploadStatus.ABORTED) {
      return "bg-destructive";
    }
    if (status === UploadStatus.UPLOADED || status === UploadStatus.SAVING) {
      return "bg-green-500";
    }
    if (status === UploadStatus.GENERATING) {
      return "bg-blue-500";
    }
    return "bg-primary";
  };

  return (
    <div className="flex flex-col gap-6 p-8 border rounded-lg bg-card">
      <div className="flex items-center gap-4">
        {getStatusIcon()}
        <div className="flex flex-col gap-1 flex-1">
          <h2 className="text-xl font-semibold">
            {status === UploadStatus.UPLOADING && "Uploading your file"}
            {status === UploadStatus.UPLOADED && "File uploaded"}
            {status === UploadStatus.SAVING && "Saving to database"}
            {status === UploadStatus.GENERATING && "Generating embeddings"}
            {status === UploadStatus.ABORTED && "Upload failed"}
          </h2>
          <p className="text-sm text-muted-foreground">{status as string}</p>
        </div>
        {progress !== null && status === UploadStatus.UPLOADING && (
          <span className="text-2xl font-bold text-primary">
            {Math.round(progress)}%
          </span>
        )}
      </div>

      {progress !== null &&
        (status === UploadStatus.UPLOADING ||
          status === UploadStatus.UPLOADED ||
          status === UploadStatus.SAVING ||
          status === UploadStatus.GENERATING) && (
          <div className="flex flex-col gap-2">
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${getStatusColor()} transition-all duration-300 ease-out rounded-full`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {status === UploadStatus.UPLOADING && "Uploading..."}
                {status === UploadStatus.UPLOADED && "Upload complete"}
                {status === UploadStatus.SAVING && "Processing..."}
                {status === UploadStatus.GENERATING && "Processing..."}
              </span>
              <span>{Math.round(progress)}% complete</span>
            </div>
          </div>
        )}

      {status === UploadStatus.SAVING && (
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
          <Database className="size-5 text-muted-foreground animate-pulse" />
          <span className="text-sm">Saving file metadata to database...</span>
        </div>
      )}

      {status === UploadStatus.GENERATING && (
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
          <Sparkles className="size-5 text-blue-500 animate-pulse" />
          <span className="text-sm">
            Generating embeddings for your document...
          </span>
        </div>
      )}

      {status === UploadStatus.ABORTED && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">
            The upload failed. Please try again.
          </p>
        </div>
      )}
    </div>
  );
}

export default UploadProgress;

