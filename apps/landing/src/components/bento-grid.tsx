import {
  Brain,
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

        <div className="mt-16 grid gap-4 md:grid-cols-4 md:grid-rows-3">
          {/* AI Tools — hero card, spans 2 cols + 2 rows */}
          <FadeIn className="md:col-span-2 md:row-span-2">
            <div className="relative h-full overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-8 text-white">
              <div className="absolute -right-8 -bottom-8 opacity-10">
                <Sparkles size={200} strokeWidth={1} />
              </div>
              <div className="relative">
                <div className="flex items-center gap-3">
                  <Brain size={24} />
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                    14 models
                  </span>
                </div>
                <h3 className="mt-4 text-2xl font-bold md:text-3xl">AI Tools</h3>
                <p className="mt-3 max-w-sm text-base leading-relaxed text-white/80">
                  Background removal, upscaling, OCR, face detection, colorization, object eraser,
                  noise removal, and more — all running locally on your hardware.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    "Remove BG",
                    "Upscale",
                    "OCR",
                    "Face Blur",
                    "Colorize",
                    "Denoise",
                    "Restore",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Essentials */}
          <FadeIn delay={0.05}>
            <Card
              name="Essentials"
              count={5}
              tools="Resize, Crop, Rotate, Convert, Compress"
              color="#3B82F6"
              icon={Crop}
            />
          </FadeIn>

          {/* Optimization */}
          <FadeIn delay={0.1}>
            <Card
              name="Optimization"
              count={6}
              tools="Web Optimize, Metadata, Bulk Rename, Favicon"
              color="#10B981"
              icon={Zap}
            />
          </FadeIn>

          {/* Adjustments */}
          <FadeIn delay={0.15}>
            <Card
              name="Adjustments"
              count={3}
              tools="Colors, Sharpening, Replace Color"
              color="#8B5CF6"
              icon={SlidersHorizontal}
            />
          </FadeIn>

          {/* Watermark & Overlay */}
          <FadeIn delay={0.2}>
            <Card
              name="Watermark & Overlay"
              count={4}
              tools="Text & Image Watermark, Text Overlay, Composition"
              color="#EF4444"
              icon={Droplets}
            />
          </FadeIn>

          {/* Utilities — wider card */}
          <FadeIn delay={0.25} className="md:col-span-2">
            <Card
              name="Utilities"
              count={7}
              tools="Image Info, Compare, Find Duplicates, Color Palette, QR Code, Barcode Reader, Base64"
              color="#6366F1"
              icon={Wrench}
            />
          </FadeIn>

          {/* Layout & Composition */}
          <FadeIn delay={0.3}>
            <Card
              name="Layout & Composition"
              count={4}
              tools="Collage, Stitch, Split, Border & Frame"
              color="#EC4899"
              icon={LayoutGrid}
            />
          </FadeIn>

          {/* Format & Conversion */}
          <FadeIn delay={0.35}>
            <Card
              name="Format & Conversion"
              count={4}
              tools="SVG to Raster, Vectorize, GIF Tools, PDF to Image"
              color="#14B8A6"
              icon={FileType}
            />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function Card({
  name,
  count,
  tools,
  color,
  icon: Icon,
}: {
  name: string;
  count: number;
  tools: string;
  color: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
}) {
  return (
    <div className="group h-full rounded-2xl border border-border bg-background p-6 transition-all hover:shadow-lg hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        <span className="text-2xl font-bold tabular-nums" style={{ color }}>
          {count}
        </span>
      </div>
      <h3 className="mt-4 font-semibold">{name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{tools}</p>
    </div>
  );
}
