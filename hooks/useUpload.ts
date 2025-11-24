"use client";

import { useUser } from "@clerk/nextjs";
import { getDownloadUrl } from "@vercel/blob";
import { upload } from "@vercel/blob/client";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { generateEmbeddings } from "@/actions/generateEmbeddings";
import { db } from "@/firebase";

export enum UploadStatus {
  UPLOADING = "uploading your file",
  UPLOADED = "uploaded your file",
  SAVING = "saving your file to the database",
  GENERATING = "generating embeddings for your file",
  ABORTED = "upload aborted",
}

export type UploadStatusType = UploadStatus[keyof UploadStatus];

function useUpload() {
  const [progress, setProgress] = useState<number | null>(null);
  const [status, setStatus] = useState<UploadStatusType | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const { user } = useUser();

  const handleUpload = async (file: File) => {
    if (!file || !user) return;

    setProgress(0);
    setStatus(null);
    setFileId(null);

    try {
      const fileIdToUploadTo = uuidv4();
      const blob = await upload(
        `${user.id}/files/${fileIdToUploadTo}.pdf`,
        file,
        {
          access: "public",
          handleUploadUrl: `/api/upload`,
          contentType: "application/pdf",
          onUploadProgress: (progress) => {
            setStatus(UploadStatus.UPLOADING);
            setProgress(progress.percentage);
          },
        },
      );
      setProgress(100);
      setStatus(UploadStatus.UPLOADED);
      const downloadUrl = await getDownloadUrl(blob.url);
      setStatus(UploadStatus.SAVING);

      await setDoc(doc(db, "users", user.id, "files", fileIdToUploadTo), {
        name: file.name,
        size: file.size,
        type: file.type,
        downloadUrl: downloadUrl,
        ref: blob.url,
        createdAt: serverTimestamp(),
      });

      setStatus(UploadStatus.GENERATING);

      await generateEmbeddings(fileIdToUploadTo);

      setFileId(fileIdToUploadTo);
    } catch (error) {
      console.error(error);
      setStatus(UploadStatus.ABORTED);
    }
  };
  return { progress, status, fileId, handleUpload };
}

export default useUpload;
