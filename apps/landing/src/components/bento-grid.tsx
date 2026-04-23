import {
  Crop,
  Droplets,
  FileType,
  LayoutGrid,
  SlidersHorizontal,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";
import { FadeIn } from "./fade-in";

const categories = [
  {
    name: "Essentials",
    count: 5,
    tools: "Resize, Crop, Rotate, Convert, Compress",
    color: "#3B82F6",
    icon: Crop,
    span: "md:col-span-1 md:row-span-1",
  },
  {
    name: "AI Tools",
    count: 14,
    tools: "Background Removal, Upscaling, OCR, Face Detection, Colorization, Object Eraser",
    color: "#F59E0B",
    icon: Sparkles,
    span: "md:col-span-1 md:row-span-2",
  },
  {
    name: "Optimization",
    count: 6,
    tools: "Web Optimize, Metadata, Bulk Rename, Favicon",
    color: "#10B981",
    icon: Zap,
    span: "md:col-span-1 md:row-span-1",
  },
  {
    name: "Adjustments",
    count: 3,
    tools: "Colors, Sharpening, Replace Color",
    color: "#8B5CF6",
    icon: SlidersHorizontal,
    span: "md:col-span-1 md:row-span-1",
  },
  {
    name: "Watermark & Overlay",
    count: 4,
    tools: "Text Watermark, Image Watermark, Text Overlay, Composition",
    color: "#EF4444",
    icon: Droplets,
    span: "md:col-span-1 md:row-span-1",
  },
  {
    name: "Utilities",
    count: 7,
    tools: "Image Info, Compare, Duplicates, Color Palette, QR Code",
    color: "#6366F1",
    icon: Wrench,
    span: "md:col-span-1 md:row-span-1",
  },
  {
    name: "Layout & Composition",
    count: 4,
    tools: "Collage, Stitch, Split, Border & Frame",
    color: "#EC4899",
    icon: LayoutGrid,
    span: "md:col-span-1 md:row-span-1",
  },
  {
    name: "Format & Conversion",
    count: 4,
    tools: "SVG to Raster, Vectorize, GIF Tools, PDF to Image",
    color: "#14B8A6",
    icon: FileType,
    span: "md:col-span-1 md:row-span-1",
  },
];

export function BentoGrid() {
  return (
    <section id="features" className="px-6 py-24 md:py-36">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need. Nothing you don&apos;t.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-lg text-muted">
            50+ tools organized into 8 categories. From basic edits to AI-powered transformations.
          </p>
        </FadeIn>

        <div className="mt-16 grid gap-4 md:auto-rows-[minmax(160px,auto)] md:grid-cols-3">
          {categories.map((cat, i) => (
            <FadeIn key={cat.name} delay={i * 0.05} className={cat.span}>
              <div
                className="group h-full rounded-2xl border border-border bg-background p-6 transition-all hover:shadow-lg"
                style={{ borderLeftColor: cat.color, borderLeftWidth: "3px" }}
              >
                <div className="flex items-center gap-3">
                  <cat.icon size={20} style={{ color: cat.color }} />
                  <h3 className="font-semibold">{cat.name}</h3>
                  <span
                    className="ml-auto rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: `${cat.color}15`,
                      color: cat.color,
                    }}
                  >
                    {cat.count}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted">{cat.tools}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
