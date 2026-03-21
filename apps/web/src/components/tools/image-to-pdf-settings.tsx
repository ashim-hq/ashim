import { useState } from "react";
import { useFileStore } from "@/stores/file-store";
import { Download, Loader2 } from "lucide-react";

function getToken(): string {
  return localStorage.getItem("stirling-token") || "";
}

export function ImageToPdfSettings() {
  const { files, processing, error, setProcessing, setError } = useFileStore();
  const [pageSize, setPageSize] = useState<"A4" | "Letter" | "A3" | "A5">("A4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [margin, setMargin] = useState(20);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleProcess = async () => {
    if (files.length === 0) return;

    setProcessing(true);
    setError(null);
    setDownloadUrl(null);

    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append("file", file);
      }
      formData.append("settings", JSON.stringify({ pageSize, orientation, margin }));

      const res = await fetch("/api/v1/tools/image-to-pdf", {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed: ${res.status}`);
      }

      const result = await res.json();
      setDownloadUrl(result.downloadUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF creation failed");
    } finally {
      setProcessing(false);
    }
  };

  const hasFiles = files.length > 0;

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {files.length} image{files.length !== 1 ? "s" : ""} will be combined
        into a PDF, one image per page.
      </p>

      <div>
        <label className="text-xs text-muted-foreground">Page Size</label>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(e.target.value as typeof pageSize)}
          className="w-full mt-0.5 px-2 py-1.5 rounded border border-border bg-background text-sm text-foreground"
        >
          <option value="A4">A4</option>
          <option value="Letter">Letter</option>
          <option value="A3">A3</option>
          <option value="A5">A5</option>
        </select>
      </div>

      <div>
        <label className="text-xs text-muted-foreground">Orientation</label>
        <div className="flex gap-1 mt-1">
          <button
            onClick={() => setOrientation("portrait")}
            className={`flex-1 text-xs py-1.5 rounded ${orientation === "portrait" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            Portrait
          </button>
          <button
            onClick={() => setOrientation("landscape")}
            className={`flex-1 text-xs py-1.5 rounded ${orientation === "landscape" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            Landscape
          </button>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center">
          <label className="text-xs text-muted-foreground">Margin</label>
          <span className="text-xs font-mono text-foreground">{margin}pt</span>
        </div>
        <input type="range" min={0} max={100} value={margin} onChange={(e) => setMargin(Number(e.target.value))} className="w-full mt-1" />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        onClick={handleProcess}
        disabled={!hasFiles || processing}
        className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {processing && <Loader2 className="h-4 w-4 animate-spin" />}
        {processing ? "Creating PDF..." : `Create PDF (${files.length} pages)`}
      </button>

      {downloadUrl && (
        <a href={downloadUrl} download className="w-full py-2.5 rounded-lg border border-primary text-primary font-medium flex items-center justify-center gap-2 hover:bg-primary/5">
          <Download className="h-4 w-4" />
          Download PDF
        </a>
      )}
    </div>
  );
}
