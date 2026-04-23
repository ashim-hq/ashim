"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { FadeIn } from "./fade-in";

const categories = [
  { id: "essentials", name: "Essentials", color: "#3B82F6" },
  { id: "optimization", name: "Optimization", color: "#10B981" },
  { id: "adjustments", name: "Adjustments", color: "#8B5CF6" },
  { id: "watermark", name: "Watermark & Overlay", color: "#EF4444" },
  { id: "utilities", name: "Utilities", color: "#6366F1" },
  { id: "layout", name: "Layout & Composition", color: "#EC4899" },
  { id: "format", name: "Format & Conversion", color: "#14B8A6" },
  { id: "ai", name: "AI Tools", color: "#F59E0B" },
];

const tools = [
  // Essentials
  {
    name: "Resize",
    description: "Resize by pixels, percentage, or social media presets",
    category: "essentials",
  },
  {
    name: "Crop",
    description: "Freeform crop, aspect ratio presets, shape crop",
    category: "essentials",
  },
  {
    name: "Rotate & Flip",
    description: "Rotate, flip, and straighten images",
    category: "essentials",
  },
  { name: "Convert", description: "Convert between image formats", category: "essentials" },
  {
    name: "Compress",
    description: "Reduce file size by quality or target size",
    category: "essentials",
  },
  // Optimization
  {
    name: "Optimize for Web",
    description:
      "Optimize images for web with format conversion, quality control, and live preview",
    category: "optimization",
  },
  {
    name: "Remove Metadata",
    description: "Remove EXIF, GPS, and camera info",
    category: "optimization",
  },
  {
    name: "Edit Metadata",
    description: "Edit EXIF, GPS, and camera info",
    category: "optimization",
  },
  {
    name: "Bulk Rename",
    description: "Rename multiple files with patterns",
    category: "optimization",
  },
  {
    name: "Image to PDF",
    description: "Combine images into a PDF document",
    category: "optimization",
  },
  {
    name: "Favicon Generator",
    description: "Generate all favicon and app icon sizes",
    category: "optimization",
  },
  // Adjustments
  {
    name: "Adjust Colors",
    description: "Brightness, contrast, exposure, saturation, temperature, sharpness, and effects",
    category: "adjustments",
  },
  {
    name: "Sharpening",
    description: "Adaptive, unsharp mask, and high-pass sharpening with presets",
    category: "adjustments",
  },
  {
    name: "Replace & Invert Color",
    description: "Replace specific colors or invert",
    category: "adjustments",
  },
  // AI Tools
  { name: "Remove Background", description: "AI-powered background removal", category: "ai" },
  { name: "Image Upscaling", description: "AI super-resolution enhancement", category: "ai" },
  { name: "Object Eraser", description: "Remove unwanted objects with AI", category: "ai" },
  { name: "OCR / Text Extraction", description: "Extract text from images", category: "ai" },
  {
    name: "Face / PII Blur",
    description: "Auto-detect and blur faces and sensitive info",
    category: "ai",
  },
  {
    name: "Smart Crop",
    description: "Smart subject, face, or trim-based cropping",
    category: "ai",
  },
  {
    name: "Image Enhancement",
    description: "One-click auto-improve with smart analysis",
    category: "ai",
  },
  { name: "Face Enhancement", description: "Restore and enhance faces with AI", category: "ai" },
  {
    name: "AI Colorization",
    description: "Convert B&W photos to full color with AI",
    category: "ai",
  },
  { name: "Noise Removal", description: "AI-powered noise and grain removal", category: "ai" },
  {
    name: "Red Eye Removal",
    description: "AI-detect and fix red eye in flash photos",
    category: "ai",
  },
  {
    name: "Photo Restoration",
    description: "Fix scratches, tears, and damage on old photos with AI",
    category: "ai",
  },
  {
    name: "Passport Photo",
    description: "AI-powered passport and ID photo generator",
    category: "ai",
  },
  // Watermark & Overlay
  { name: "Text Watermark", description: "Add text watermark overlay", category: "watermark" },
  { name: "Image Watermark", description: "Overlay a logo as watermark", category: "watermark" },
  { name: "Text Overlay", description: "Add styled text to images", category: "watermark" },
  {
    name: "Image Composition",
    description: "Layer images with position and opacity",
    category: "watermark",
  },
  // Utilities
  {
    name: "Image Info",
    description: "View all metadata and image properties",
    category: "utilities",
  },
  {
    name: "Image Compare",
    description: "Side-by-side comparison of two images",
    category: "utilities",
  },
  {
    name: "Find Duplicates",
    description: "Detect duplicate and near-duplicate images",
    category: "utilities",
  },
  {
    name: "Color Palette",
    description: "Extract dominant colors from image",
    category: "utilities",
  },
  {
    name: "QR Code Generator",
    description: "Generate styled QR codes with custom colors, patterns, and logos",
    category: "utilities",
  },
  {
    name: "Barcode Reader",
    description: "Scan images for QR codes, barcodes, and 2D codes",
    category: "utilities",
  },
  {
    name: "Image to Base64",
    description: "Convert images to base64 strings for embedding in HTML, CSS, and more",
    category: "utilities",
  },
  // Layout & Composition
  {
    name: "Collage / Grid",
    description: "Combine images into beautiful grid collages with 25+ templates",
    category: "layout",
  },
  {
    name: "Stitch / Combine",
    description: "Join images side by side, stacked, or in a grid",
    category: "layout",
  },
  {
    name: "Image Splitting",
    description: "Split images into grid tiles or by pixel size with live preview",
    category: "layout",
  },
  {
    name: "Border & Frame",
    description: "Add borders, rounded corners, shadows",
    category: "layout",
  },
  // Format & Conversion
  {
    name: "SVG to Raster",
    description: "Convert SVG to PNG, JPEG, WebP, AVIF, TIFF, GIF, or HEIF at custom scale and DPI",
    category: "format",
  },
  { name: "Image to SVG", description: "Vectorize images using tracing", category: "format" },
  {
    name: "GIF Tools",
    description:
      "Resize, optimize, change speed, reverse, extract frames, and rotate animated GIFs",
    category: "format",
  },
  { name: "PDF to Image", description: "Convert PDF pages to images", category: "format" },
];

const categoryMap = new Map(categories.map((c) => [c.id, c]));

function getCategoryCount(id: string) {
  return tools.filter((t) => t.category === id).length;
}

export function BentoGrid() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return tools.filter((tool) => {
      if (activeCategory !== "all" && tool.category !== activeCategory) {
        return false;
      }
      if (!q) return true;
      const cat = categoryMap.get(tool.category);
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        (cat?.name.toLowerCase().includes(q) ?? false)
      );
    });
  }, [search, activeCategory]);

  return (
    <section id="features" className="px-6 py-24 md:py-36">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
            50+ tools. Zero cloud dependency.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-lg text-muted">
            Search to find exactly what you need. Every tool runs 100% locally.
          </p>
        </FadeIn>

        {/* Search bar */}
        <div className="mx-auto mt-12 max-w-md">
          <div className="relative">
            <Search size={18} className="absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-background py-3 pr-4 pl-11 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent"
            />
          </div>
        </div>

        {/* Category pills */}
        <div className="mt-6 flex flex-nowrap gap-2 overflow-x-auto pb-2 md:flex-wrap md:justify-center md:overflow-visible">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === "all"
                ? "bg-accent text-accent-foreground"
                : "border border-border hover:bg-background-alt"
            }`}
          >
            All ({tools.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === cat.id
                  ? "bg-accent text-accent-foreground"
                  : "border border-border hover:bg-background-alt"
              }`}
            >
              {cat.name} ({getCategoryCount(cat.id)})
            </button>
          ))}
        </div>

        {/* Result count */}
        <p className="mt-6 text-center text-sm text-muted">
          Showing {filtered.length} of {tools.length} tools
        </p>

        {/* Tool grid */}
        {filtered.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((tool) => {
              const cat = categoryMap.get(tool.category);
              return (
                <div
                  key={tool.name}
                  className="rounded-xl border border-border bg-background p-5 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: cat?.color }}
                    />
                    <span className="font-semibold">{tool.name}</span>
                    {tool.category === "ai" && (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold leading-none text-amber-700">
                        AI
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{tool.description}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-16 text-center text-muted">No tools found. Try a different search.</p>
        )}
      </div>
    </section>
  );
}
