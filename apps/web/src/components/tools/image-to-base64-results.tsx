import { Check, ChevronDown, ChevronRight, ClipboardCopy, Download, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import type { Base64Result } from "@/stores/base64-store";
import { useBase64Store } from "@/stores/base64-store";

// -- Snippet generators -----------------------------------------------------

type TabId = "datauri" | "raw" | "html" | "css" | "json" | "markdown";

interface Tab {
  id: TabId;
  label: string;
  generate: (r: Base64Result) => string;
}

const TABS: Tab[] = [
  { id: "datauri", label: "Data URI", generate: (r) => r.dataUri },
  { id: "raw", label: "Raw Base64", generate: (r) => r.base64 },
  {
    id: "html",
    label: "HTML",
    generate: (r) => {
      const alt = r.filename.replace(/\.[^.]+$/, "");
      return `<img src="${r.dataUri}" alt="${alt}" />`;
    },
  },
  {
    id: "css",
    label: "CSS",
    generate: (r) => `background-image: url(${r.dataUri});`,
  },
  {
    id: "json",
    label: "JSON",
    generate: (r) => JSON.stringify({ image: r.dataUri }, null, 2),
  },
  {
    id: "markdown",
    label: "Markdown",
    generate: (r) => {
      const alt = r.filename.replace(/\.[^.]+$/, "");
      return `![${alt}](${r.dataUri})`;
    },
  },
];

// -- Helpers ----------------------------------------------------------------

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// -- CopyButton -------------------------------------------------------------

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <ClipboardCopy className="h-3.5 w-3.5" />}
      {copied ? "Copied!" : (label ?? "Copy")}
    </button>
  );
}

// -- Single file result -----------------------------------------------------

function FileResult({ result }: { result: Base64Result }) {
  const [activeTab, setActiveTab] = useState<TabId>("datauri");
  const tab = TABS.find((t) => t.id === activeTab)!;
  const output = tab.generate(result);

  const handleDownload = useCallback(() => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.filename}.base64.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [output, result.filename]);

  return (
    <div className="flex flex-col h-full">
      {/* Metadata */}
      <div className="flex items-center gap-3 mb-3">
        <img
          src={result.dataUri}
          alt={result.filename}
          className="w-12 h-12 rounded-md object-cover bg-muted flex-shrink-0"
        />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{result.filename}</p>
          <p className="text-[11px] text-muted-foreground">
            {result.width}x{result.height} &middot; {formatBytes(result.originalSize)} &rarr;{" "}
            {formatBytes(result.encodedSize)}{" "}
            <span className={result.overheadPercent > 50 ? "text-amber-500" : ""}>
              (+{result.overheadPercent}%)
            </span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border mb-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`px-3 py-1.5 text-xs whitespace-nowrap transition-colors ${
              activeTab === t.id
                ? "text-primary border-b-2 border-primary font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Code output */}
      <div className="flex-1 min-h-0 bg-muted rounded-md p-3 overflow-auto">
        <pre className="text-[11px] font-mono text-foreground whitespace-pre-wrap break-all leading-relaxed">
          {output}
        </pre>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        <CopyButton text={output} label="Copy to Clipboard" />
        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80 transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Download .txt
        </button>
      </div>
    </div>
  );
}

// -- Batch accordion item ---------------------------------------------------

function BatchItem({
  result,
  expanded,
  onToggle,
}: {
  result: Base64Result;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-border rounded-md overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-3 py-2.5 bg-muted/50 hover:bg-muted/80 transition-colors text-left"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-primary flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
        <span className="text-xs font-medium text-foreground truncate">{result.filename}</span>
        <span className="text-[10px] text-muted-foreground ml-auto flex-shrink-0">
          {result.width}x{result.height} &middot; {formatBytes(result.originalSize)} &rarr;{" "}
          {formatBytes(result.encodedSize)}
        </span>
      </button>
      {expanded && (
        <div className="p-3 border-t border-border">
          <FileResult result={result} />
        </div>
      )}
    </div>
  );
}

// -- Main ResultsPanel ------------------------------------------------------

export function ImageToBase64Results() {
  const { results, errors, processing, expandedIndex, setExpandedIndex } = useBase64Store();

  if (processing) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Converting to base64...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Upload images and click "Convert to Base64" to get started.
          </p>
        </div>
      </div>
    );
  }

  // Single file - show directly
  if (results.length === 1 && errors.length === 0) {
    return (
      <div className="p-4 h-full">
        <FileResult result={results[0]} />
      </div>
    );
  }

  // Batch - accordion view
  return (
    <div className="p-4 space-y-2 overflow-auto h-full">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground">
          {results.length} converted
          {errors.length > 0 ? `, ${errors.length} failed` : ""}
        </p>
        <CopyButton
          text={JSON.stringify(
            results.map((r) => r.dataUri),
            null,
            2,
          )}
          label="Copy All as JSON"
        />
      </div>

      {errors.map((err) => (
        <div
          key={err.filename}
          className="border border-red-500/30 rounded-md px-3 py-2 bg-red-500/5"
        >
          <p className="text-xs text-red-500">
            <span className="font-medium">{err.filename}</span>: {err.error}
          </p>
        </div>
      ))}

      {results.map((result, i) => (
        <BatchItem
          key={result.filename}
          result={result}
          expanded={expandedIndex === i}
          onToggle={() => setExpandedIndex(expandedIndex === i ? -1 : i)}
        />
      ))}
    </div>
  );
}
