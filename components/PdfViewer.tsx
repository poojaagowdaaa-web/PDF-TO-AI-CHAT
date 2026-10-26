"use client";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Maximize2,
  Minimize2,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

function PdfViewer({ url }: { url?: string }) {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [file, setFile] = useState<Blob | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageInput, setPageInput] = useState<string>("1");
  const [_documentLoaded, setDocumentLoaded] = useState(false);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setDocumentLoaded(false);
        if (!url) {
          setError("No PDF URL provided");
          setIsLoading(false);
          return;
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to load PDF");
        const file = await response.blob();
        setFile(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load PDF");
        setDocumentLoaded(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFile();
  }, [url]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
    setNumPages(numPages);
    setPageInput("1");
    setDocumentLoaded(true);
  };

  const goToPage = useCallback(
    (page: number) => {
      if (numPages && page >= 1 && page <= numPages) {
        setPageNumber(page);
        setPageInput(page.toString());
      }
    },
    [numPages],
  );

  const handlePageInputChange = (value: string) => {
    setPageInput(value);
    const page = parseInt(value, 10);
    if (!Number.isNaN(page) && numPages && page >= 1 && page <= numPages) {
      setPageNumber(page);
    }
  };

  const handlePageInputBlur = () => {
    if (pageInput !== pageNumber.toString()) {
      setPageInput(pageNumber.toString());
    }
  };

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev * 1.2, 3));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev / 1.2, 0.5));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
  }, []);

  const rotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const previousPage = useCallback(() => {
    if (pageNumber > 1) {
      goToPage(pageNumber - 1);
    }
  }, [pageNumber, goToPage]);

  const nextPage = useCallback(() => {
    if (numPages && pageNumber < numPages) {
      goToPage(pageNumber + 1);
    }
  }, [pageNumber, numPages, goToPage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          previousPage();
          break;
        case "ArrowRight":
          e.preventDefault();
          nextPage();
          break;
        case "+":
        case "=":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            zoomIn();
          }
          break;
        case "-":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            zoomOut();
          }
          break;
        case "0":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            resetZoom();
          }
          break;
        case "r":
        case "R":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            rotate();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previousPage, nextPage, zoomIn, zoomOut, resetZoom, rotate]);

  useEffect(() => {
    setPageInput(pageNumber.toString());
  }, [pageNumber]);
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
        <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <Loader2 className="size-8 text-destructive" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-lg text-destructive">
            Failed to load PDF
          </p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-muted/30">
      <div className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={pageNumber === 1 || isLoading}
              onClick={previousPage}
              className="shrink-0"
            >
              <ChevronLeft className="size-4" />
              <span className="sr-only">Previous page</span>
            </Button>

            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={numPages}
                value={pageInput}
                onChange={(e) => handlePageInputChange(e.target.value)}
                onBlur={handlePageInputBlur}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur();
                  }
                }}
                disabled={!numPages || isLoading}
                className="w-16 text-center h-9 px-2"
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                / {numPages ?? "—"}
              </span>
            </div>

            <Button
              variant="outline"
              size="icon"
              disabled={pageNumber === numPages || !numPages || isLoading}
              onClick={nextPage}
              className="shrink-0"
            >
              <ChevronRight className="size-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1.5 rounded-md bg-muted">
              <Button
                variant="ghost"
                size="icon"
                onClick={zoomOut}
                disabled={scale <= 0.5 || isLoading}
                className="h-7 w-7"
              >
                <ZoomOut className="size-3.5" />
                <span className="sr-only">Zoom out</span>
              </Button>
              <span className="text-xs font-medium min-w-12 text-center text-muted-foreground">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={zoomIn}
                disabled={scale >= 3 || isLoading}
                className="h-7 w-7"
              >
                <ZoomIn className="size-3.5" />
                <span className="sr-only">Zoom in</span>
              </Button>
              {scale !== 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetZoom}
                  className="h-7 w-7 ml-1"
                  title="Reset zoom"
                >
                  {scale > 1 ? (
                    <Minimize2 className="size-3.5" />
                  ) : (
                    <Maximize2 className="size-3.5" />
                  )}
                  <span className="sr-only">Reset zoom</span>
                </Button>
              )}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={rotate}
              disabled={isLoading}
              className="shrink-0"
              title="Rotate (Ctrl+R)"
            >
              <RotateCw className="size-4" />
              <span className="sr-only">Rotate</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading || !file ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading PDF...</p>
          </div>
        ) : (
          <div className="flex justify-center items-start min-h-full py-8 px-4">
            <Document
              loading={
                <div className="flex flex-col items-center justify-center gap-3 py-12">
                  <Loader2 className="size-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Loading document...
                  </p>
                </div>
              }
              file={file}
              rotate={rotation}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(error) => {
                setError(error.message || "Failed to load PDF document");
                setDocumentLoaded(false);
              }}
              className="flex justify-center"
            >
              {numPages && (
                <div className="shadow-2xl rounded-lg overflow-hidden bg-white">
                  <Page
                    scale={scale}
                    pageNumber={pageNumber}
                    loading={
                      <div className="flex items-center justify-center w-[612px] h-[792px] bg-muted">
                        <Loader2 className="size-6 animate-spin text-muted-foreground" />
                      </div>
                    }
                    className="transition-all duration-200"
                  />
                </div>
              )}
            </Document>
          </div>
        )}
      </div>
    </div>
  );
}

export default PdfViewer;
