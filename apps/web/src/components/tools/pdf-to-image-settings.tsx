import { Download, FileUp, Loader2, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { formatHeaders } from "@/lib/api";

const DPI_OPTIONS = [
  { value: 72, label: "72 (Screen)" },
  { value: 150, label: "150 (Standard)" },
  { value: 300, label: "300 (Print)" },
  { value: 600, label: "600 (High Quality)" },
];

const FORMAT_OPTIONS = [
  { value: "png", label: "PNG" },
  { value: "jpg", label: "JPEG" },
  { value: "webp", label: "WebP" },
  { value: "avif", label: "AVIF" },
  { value: "tiff", label: "TIFF" },
];

export function PdfToImageSettings() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [format, setFormat] = useState("png");
  const [dpi, setDpi] = useState(150);
  const [pages, setPages] = useState("");
  const [processing, setProcessing] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPageCount = useCallback(async (pdfFile: File) => {
    setLoadingInfo(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", pdfFile);
      const res = await fetch("/api/v1/tools/pdf-to-image/info", {
        method: "POST",
        headers: formatHeaders(),
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed: ${res.status}`);
      }
      const data = await res.json();
      setPageCount(data.pageCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to read PDF");
      setFile(null);
      setPageCount(null);
    } finally {
      setLoadingInfo(false);
    }
  }, []);

  const handleFileChange = useCallback(
    (files: FileList | null) => {
      const pdfFile = files?.[0];
      if (!pdfFile) return;
      setFile(pdfFile);
      setPageCount(null);
      setDownloadUrl(null);
      setError(null);
      fetchPageCount(pdfFile);
    },
    [fetchPageCount],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFileChange(e.dataTransfer.files);
    },
    [handleFileChange],
  );

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setPageCount(null);
    setDownloadUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const getSelectedPageCount = (): number => {
    if (!pageCount) return 0;
    const trimmed = pages.trim();
    if (trimmed === "" || trimmed.toLowerCase() === "all") return pageCount;
    try {
      const nums = new Set<number>();
      for (const seg of trimmed.split(",")) {
        const s = seg.trim();
        if (s.includes("-")) {
          const [a, b] = s.split("-").map((x) => Number(x.trim()));
          for (let i = a; i <= b; i++) nums.add(i);
        } else {
          nums.add(Number(s));
        }
      }
      return nums.size;
    } catch {
      return pageCount;
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setDownloadUrl(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("settings", JSON.stringify({ format, dpi, pages: pages || "all" }));

      const res = await fetch("/api/v1/tools/pdf-to-image", {
        method: "POST",
        headers: formatHeaders(),
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Conversion failed: ${res.status}`);
      }

      const selectedCount = getSelectedPageCount();

      if (selectedCount === 1) {
        const data = await res.json();
        setDownloadUrl(data.downloadUrl);
        setDownloadName(`page.${format === "jpg" ? "jpg" : format}`);
      } else {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setDownloadName("pdf-pages.zip");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed");
    } finally {
      setProcessing(false);
    }
  };

  const selectedCount = getSelectedPageCount();
  const isMultiPage = selectedCount > 1;

  return (
    <div className="space-y-4">
      {/* PDF upload area */}
      {!file ? (
        <div
          role="button"
          tabIndex={0}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          <FileUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Drop a PDF here or click to select</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files)}
          />
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {loadingInfo ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Reading PDF...
                </span>
              ) : pageCount !== null ? (
                `${pageCount} page${pageCount !== 1 ? "s" : ""}`
              ) : null}
            </p>
          </div>
          <button
            type="button"
            onClick={handleRemoveFile}
            className="p-1 hover:bg-background rounded"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Format dropdown */}
      <div>
        <label htmlFor="pdf-format" className="text-xs text-muted-foreground">
          Output Format
        </label>
        <select
          id="pdf-format"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          className="w-full mt-0.5 px-2 py-1.5 rounded border border-border bg-background text-sm text-foreground"
        >
          {FORMAT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* DPI dropdown */}
      <div>
        <label htmlFor="pdf-dpi" className="text-xs text-muted-foreground">
          Resolution (DPI)
        </label>
        <select
          id="pdf-dpi"
          value={dpi}
          onChange={(e) => setDpi(Number(e.target.value))}
          className="w-full mt-0.5 px-2 py-1.5 rounded border border-border bg-background text-sm text-foreground"
        >
          {DPI_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Page range input */}
      <div>
        <label htmlFor="pdf-pages" className="text-xs text-muted-foreground">
          Pages
        </label>
        <input
          id="pdf-pages"
          type="text"
          value={pages}
          onChange={(e) => setPages(e.target.value)}
          placeholder="All pages"
          className="w-full mt-0.5 px-2 py-1.5 rounded border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground"
        />
        {pageCount !== null && (
          <p className="text-xs text-muted-foreground mt-1">
            e.g. 1-3, 5, 8-10 (document has {pageCount} pages)
          </p>
        )}
      </div>

      {/* Error */}
      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Convert button */}
      <button
        type="button"
        data-testid="pdf-to-image-submit"
        onClick={handleProcess}
        disabled={!file || !pageCount || processing}
        className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {processing && <Loader2 className="h-4 w-4 animate-spin" />}
        {processing
          ? "Converting..."
          : `Convert${pageCount ? ` ${selectedCount} page${selectedCount !== 1 ? "s" : ""}` : ""}`}
      </button>

      {/* Download link */}
      {downloadUrl && (
        <a
          href={downloadUrl}
          download={downloadName}
          data-testid="pdf-to-image-download"
          className="w-full py-2.5 rounded-lg border border-primary text-primary font-medium flex items-center justify-center gap-2 hover:bg-primary/5"
        >
          <Download className="h-4 w-4" />
          {isMultiPage ? `Download ZIP (${selectedCount} pages)` : "Download Image"}
        </a>
      )}
    </div>
  );
}
