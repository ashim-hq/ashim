# Phase 1: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working Docker container that serves Stirling-Image with login, a sidebar tool grid, dropzone, theme toggle, settings skeleton, and a Fastify API with auth — the foundation all tools build on.

**Architecture:** Turborepo monorepo with two apps (Vite React SPA + Fastify API) and three packages (shared types, image-engine stub, ai stub). Fastify serves both the API and the built SPA in production. SQLite via Drizzle ORM for persistence. Better-Auth for authentication. Single Docker container with multi-arch support.

**Tech Stack:** TypeScript, Vite 6, React 19, Tailwind CSS 4, shadcn/ui, Fastify 5, Drizzle ORM, better-sqlite3, Better-Auth, Turborepo, pnpm, Docker

**Spec:** `docs/superpowers/specs/2026-03-22-stirling-image-design.md`

---

## File Structure

```
stirling-image/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── main.tsx                    # React entry point
│   │   │   ├── App.tsx                     # Root with router + providers
│   │   │   ├── lib/
│   │   │   │   ├── api.ts                  # Fetch wrapper for API calls
│   │   │   │   ├── auth-client.ts          # Better-Auth React client
│   │   │   │   └── utils.ts               # cn() helper for tailwind
│   │   │   ├── hooks/
│   │   │   │   ├── use-theme.ts            # Theme toggle hook
│   │   │   │   └── use-auth.ts             # Auth state hook
│   │   │   ├── stores/
│   │   │   │   └── theme-store.ts          # Zustand theme store
│   │   │   ├── components/
│   │   │   │   ├── ui/                     # shadcn/ui components (Button, Input, etc.)
│   │   │   │   ├── layout/
│   │   │   │   │   ├── app-layout.tsx      # Main layout wrapper (sidebar + content)
│   │   │   │   │   ├── sidebar.tsx         # Left icon sidebar (Tools, Reader, Automate, etc.)
│   │   │   │   │   ├── tool-panel.tsx      # Scrollable tool list with search + categories
│   │   │   │   │   ├── navbar.tsx          # Top bar with search + view toggle
│   │   │   │   │   └── footer.tsx          # Bottom bar (theme, language)
│   │   │   │   ├── common/
│   │   │   │   │   ├── dropzone.tsx        # Global file dropzone
│   │   │   │   │   ├── tool-card.tsx       # Individual tool card (icon + name + fav)
│   │   │   │   │   └── search-bar.tsx      # Tool search input
│   │   │   │   └── settings/
│   │   │   │       └── settings-dialog.tsx # Settings modal skeleton
│   │   │   ├── pages/
│   │   │   │   ├── login-page.tsx          # Login page (split layout)
│   │   │   │   ├── home-page.tsx           # Tool grid home page
│   │   │   │   └── tool-page.tsx           # Generic tool page template
│   │   │   └── styles/
│   │   │       └── globals.css             # Tailwind imports + CSS variables
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   ├── postcss.config.js
│   │   └── package.json
│   │
│   └── api/
│       ├── src/
│       │   ├── index.ts                    # Fastify server entry point
│       │   ├── config.ts                   # Environment variable loading + validation
│       │   ├── db/
│       │   │   ├── schema.ts              # Drizzle schema (users, sessions, settings, jobs)
│       │   │   ├── migrate.ts             # Migration runner
│       │   │   └── index.ts               # DB connection (singleton, WAL mode)
│       │   ├── plugins/
│       │   │   ├── auth.ts                # Better-Auth Fastify plugin
│       │   │   ├── cors.ts                # CORS plugin (dev only)
│       │   │   ├── static.ts              # Serve SPA in production
│       │   │   └── rate-limit.ts          # Per-IP rate limiting
│       │   ├── routes/
│       │   │   ├── health.ts              # GET /api/v1/health
│       │   │   └── config.ts              # GET /api/v1/config/formats, presets
│       │   └── lib/
│       │       ├── cleanup.ts             # Temp file cleanup cron
│       │       └── env.ts                 # Typed env var schema
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── shared/
│   │   ├── src/
│   │   │   ├── types.ts                   # Shared types (Tool, Category, Format, etc.)
│   │   │   ├── constants.ts               # Tool definitions, format lists, presets
│   │   │   └── index.ts                   # Re-exports
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── image-engine/                      # Stub for Phase 2
│   │   ├── src/
│   │   │   └── index.ts                   # Export placeholder
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── ai/                                # Stub for Phase 4
│       ├── src/
│       │   └── index.ts                   # Export placeholder
│       ├── tsconfig.json
│       └── package.json
│
├── docker/
│   ├── Dockerfile                         # Multi-stage, multi-arch
│   └── .dockerignore
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json                           # Root package.json
├── tsconfig.base.json                     # Shared TS config
├── .gitignore
├── .env.example
└── README.md
```

---

## Task 1: Initialize Monorepo

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `.gitignore`, `.env.example`

- [ ] **Step 1: Initialize root package.json**

```bash
cd /Users/sidd/Desktop/Personal/Projects/Stirling-Image
```

Create `package.json`:
```json
{
  "name": "stirling-image",
  "private": true,
  "packageManager": "pnpm@9.15.4",
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "clean": "turbo clean",
    "typecheck": "turbo typecheck"
  },
  "devDependencies": {
    "turbo": "^2.4.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: Create pnpm-workspace.yaml**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 3: Create turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

- [ ] **Step 4: Create tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

- [ ] **Step 5: Create .gitignore**

```
node_modules/
dist/
.turbo/
*.db
*.db-journal
*.db-wal
.env
.env.local
.DS_Store
*.png
*.jpg
*.jpeg
!apps/web/public/**
.playwright-mcp/
```

- [ ] **Step 6: Create .env.example**

```bash
PORT=1349
AUTH_ENABLED=true
DEFAULT_USERNAME=admin
DEFAULT_PASSWORD=admin
STORAGE_MODE=local
FILE_MAX_AGE_HOURS=24
CLEANUP_INTERVAL_MINUTES=30
MAX_UPLOAD_SIZE_MB=100
MAX_BATCH_SIZE=200
CONCURRENT_JOBS=3
MAX_MEGAPIXELS=100
RATE_LIMIT_PER_MIN=100
DB_PATH=./data/stirling.db
WORKSPACE_PATH=./tmp/workspace
DEFAULT_THEME=light
DEFAULT_LOCALE=en
APP_NAME=Stirling Image
```

- [ ] **Step 7: Install root dependencies and verify**

```bash
pnpm install
```

Expected: `pnpm-lock.yaml` created, `node_modules/` populated.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: initialize Turborepo monorepo with pnpm workspaces"
```

---

## Task 2: Create Shared Package

**Files:**
- Create: `packages/shared/package.json`, `packages/shared/tsconfig.json`, `packages/shared/src/types.ts`, `packages/shared/src/constants.ts`, `packages/shared/src/index.ts`

- [ ] **Step 1: Create packages/shared/package.json**

```json
{
  "name": "@stirling-image/shared",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: Create packages/shared/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 3: Create packages/shared/src/types.ts**

```typescript
export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string;
  route: string;
  shortcut?: string;
  disabled?: boolean;
  alpha?: boolean;
}

export type ToolCategory =
  | "essentials"
  | "optimization"
  | "adjustments"
  | "ai"
  | "watermark"
  | "utilities"
  | "layout"
  | "format"
  | "automation";

export interface CategoryInfo {
  id: ToolCategory;
  name: string;
  icon: string;
  color: string;
}

export type ImageFormat =
  | "jpg"
  | "png"
  | "webp"
  | "avif"
  | "tiff"
  | "bmp"
  | "gif"
  | "svg"
  | "heic"
  | "jxl"
  | "ico"
  | "raw"
  | "pdf";

export interface SocialMediaPreset {
  platform: string;
  name: string;
  width: number;
  height: number;
}

export interface AppConfig {
  appName: string;
  version: string;
  defaultTheme: "light" | "dark";
  defaultLocale: string;
  maxUploadSizeMb: number;
  maxBatchSize: number;
  maxMegapixels: number;
  authEnabled: boolean;
}

export interface ApiError {
  error: string;
  code: string;
  details?: Record<string, unknown>;
}

export interface HealthResponse {
  status: "healthy" | "degraded";
  version: string;
  uptime: string;
  storage: { mode: string; available: string };
  queue: { active: number; pending: number };
  ai: Record<string, string>;
}

export interface JobProgress {
  jobId: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  currentFile?: string;
  totalFiles?: number;
  downloadUrl?: string;
  error?: string;
}
```

- [ ] **Step 4: Create packages/shared/src/constants.ts**

```typescript
import type { CategoryInfo, SocialMediaPreset, Tool } from "./types.js";

export const CATEGORIES: CategoryInfo[] = [
  { id: "essentials", name: "Essentials", icon: "Layers", color: "#3B82F6" },
  { id: "optimization", name: "Optimization", icon: "Zap", color: "#10B981" },
  { id: "adjustments", name: "Adjustments", icon: "SlidersHorizontal", color: "#8B5CF6" },
  { id: "ai", name: "AI Tools", icon: "Sparkles", color: "#F59E0B" },
  { id: "watermark", name: "Watermark & Overlay", icon: "Stamp", color: "#EF4444" },
  { id: "utilities", name: "Utilities", icon: "Wrench", color: "#6366F1" },
  { id: "layout", name: "Layout & Composition", icon: "LayoutGrid", color: "#EC4899" },
  { id: "format", name: "Format & Conversion", icon: "FileType", color: "#14B8A6" },
  { id: "automation", name: "Automation", icon: "Workflow", color: "#F97316" },
];

export const TOOLS: Tool[] = [
  // Essentials
  { id: "resize", name: "Resize", description: "Resize by pixels, percentage, or social media presets", category: "essentials", icon: "Maximize2", route: "/resize" },
  { id: "crop", name: "Crop", description: "Freeform crop, aspect ratio presets, shape crop", category: "essentials", icon: "Crop", route: "/crop" },
  { id: "rotate", name: "Rotate & Flip", description: "Rotate, flip, and straighten images", category: "essentials", icon: "RotateCw", route: "/rotate" },
  { id: "convert", name: "Convert", description: "Convert between image formats", category: "essentials", icon: "FileOutput", route: "/convert" },
  { id: "compress", name: "Compress", description: "Reduce file size by quality or target size", category: "essentials", icon: "Minimize2", route: "/compress" },
  // Optimization
  { id: "strip-metadata", name: "Strip Metadata", description: "Remove EXIF, GPS, and camera info", category: "optimization", icon: "ShieldOff", route: "/strip-metadata" },
  { id: "bulk-rename", name: "Bulk Rename", description: "Rename multiple files with patterns", category: "optimization", icon: "FileEdit", route: "/bulk-rename" },
  { id: "image-to-pdf", name: "Image to PDF", description: "Combine images into a PDF document", category: "optimization", icon: "FileText", route: "/image-to-pdf" },
  { id: "favicon", name: "Favicon Generator", description: "Generate all favicon and app icon sizes", category: "optimization", icon: "Globe", route: "/favicon" },
  // Adjustments
  { id: "brightness-contrast", name: "Brightness & Contrast", description: "Adjust brightness and contrast levels", category: "adjustments", icon: "Sun", route: "/brightness-contrast" },
  { id: "saturation", name: "Saturation & Exposure", description: "Adjust color saturation and exposure", category: "adjustments", icon: "Palette", route: "/saturation" },
  { id: "color-channels", name: "Color Channels", description: "Adjust individual R, G, B channels", category: "adjustments", icon: "CircleDot", route: "/color-channels" },
  { id: "color-effects", name: "Color Effects", description: "Grayscale, Sepia, Invert, Tint", category: "adjustments", icon: "Paintbrush", route: "/color-effects" },
  { id: "replace-color", name: "Replace & Invert Color", description: "Replace specific colors or invert", category: "adjustments", icon: "Pipette", route: "/replace-color" },
  // AI Tools
  { id: "remove-background", name: "Remove Background", description: "AI-powered background removal", category: "ai", icon: "Eraser", route: "/remove-background" },
  { id: "upscale", name: "Image Upscaling", description: "AI super-resolution enhancement", category: "ai", icon: "ZoomIn", route: "/upscale" },
  { id: "erase-object", name: "Object Eraser", description: "Paint over unwanted elements", category: "ai", icon: "Wand2", route: "/erase-object" },
  { id: "ocr", name: "OCR / Text Extraction", description: "Extract text from images", category: "ai", icon: "ScanText", route: "/ocr" },
  { id: "blur-faces", name: "Face / PII Blur", description: "Auto-detect and blur faces and sensitive info", category: "ai", icon: "EyeOff", route: "/blur-faces" },
  { id: "smart-crop", name: "Smart Crop", description: "AI detects subject and crops optimally", category: "ai", icon: "Focus", route: "/smart-crop" },
  // Watermark & Overlay
  { id: "watermark-text", name: "Text Watermark", description: "Add text watermark overlay", category: "watermark", icon: "Type", route: "/watermark-text" },
  { id: "watermark-image", name: "Image Watermark", description: "Overlay a logo as watermark", category: "watermark", icon: "Image", route: "/watermark-image" },
  { id: "text-overlay", name: "Text Overlay", description: "Add styled text to images", category: "watermark", icon: "TextCursorInput", route: "/text-overlay" },
  { id: "compose", name: "Image Composition", description: "Layer images with position and opacity", category: "watermark", icon: "Layers", route: "/compose" },
  // Utilities
  { id: "info", name: "Image Info", description: "View all metadata and image properties", category: "utilities", icon: "Info", route: "/info" },
  { id: "compare", name: "Image Compare", description: "Side-by-side comparison of two images", category: "utilities", icon: "Columns2", route: "/compare" },
  { id: "find-duplicates", name: "Find Duplicates", description: "Detect duplicate and near-duplicate images", category: "utilities", icon: "Copy", route: "/find-duplicates" },
  { id: "color-palette", name: "Color Palette", description: "Extract dominant colors from image", category: "utilities", icon: "Palette", route: "/color-palette" },
  { id: "qr-generate", name: "QR Code Generator", description: "Generate QR codes from text or URLs", category: "utilities", icon: "QrCode", route: "/qr-generate" },
  { id: "barcode-read", name: "Barcode Reader", description: "Read QR codes and barcodes from images", category: "utilities", icon: "ScanLine", route: "/barcode-read" },
  // Layout & Composition
  { id: "collage", name: "Collage / Grid", description: "Combine images into a grid layout", category: "layout", icon: "LayoutGrid", route: "/collage" },
  { id: "split", name: "Image Splitting", description: "Split image into grid parts", category: "layout", icon: "Grid3x3", route: "/split" },
  { id: "border", name: "Border & Frame", description: "Add borders, rounded corners, shadows", category: "layout", icon: "Frame", route: "/border" },
  // Format & Conversion
  { id: "svg-to-raster", name: "SVG to Raster", description: "Convert SVG to PNG/JPG at custom resolution", category: "format", icon: "FileImage", route: "/svg-to-raster" },
  { id: "vectorize", name: "Image to SVG", description: "Vectorize images using tracing", category: "format", icon: "PenTool", route: "/vectorize" },
  { id: "gif-tools", name: "GIF Tools", description: "Resize/crop/convert animated GIFs", category: "format", icon: "Film", route: "/gif-tools" },
  // Automation
  { id: "pipeline", name: "Pipeline Builder", description: "Chain multiple tools into a workflow", category: "automation", icon: "Workflow", route: "/pipeline" },
  { id: "batch", name: "Batch Processing", description: "Apply any tool to multiple images", category: "automation", icon: "FolderInput", route: "/batch" },
];

export const SOCIAL_MEDIA_PRESETS: SocialMediaPreset[] = [
  { platform: "Instagram", name: "Post (Square)", width: 1080, height: 1080 },
  { platform: "Instagram", name: "Story / Reel", width: 1080, height: 1920 },
  { platform: "Instagram", name: "Profile Picture", width: 320, height: 320 },
  { platform: "Instagram", name: "Landscape Post", width: 1080, height: 566 },
  { platform: "Instagram", name: "Portrait Post", width: 1080, height: 1350 },
  { platform: "Twitter/X", name: "Post Image", width: 1200, height: 675 },
  { platform: "Twitter/X", name: "Header", width: 1500, height: 500 },
  { platform: "Twitter/X", name: "Profile Picture", width: 400, height: 400 },
  { platform: "Facebook", name: "Post Image", width: 1200, height: 630 },
  { platform: "Facebook", name: "Cover Photo", width: 820, height: 312 },
  { platform: "Facebook", name: "Profile Picture", width: 170, height: 170 },
  { platform: "Facebook", name: "Event Cover", width: 1920, height: 1005 },
  { platform: "YouTube", name: "Thumbnail", width: 1280, height: 720 },
  { platform: "YouTube", name: "Channel Banner", width: 2560, height: 1440 },
  { platform: "YouTube", name: "Profile Picture", width: 800, height: 800 },
  { platform: "LinkedIn", name: "Post Image", width: 1200, height: 627 },
  { platform: "LinkedIn", name: "Banner", width: 1584, height: 396 },
  { platform: "LinkedIn", name: "Profile Picture", width: 400, height: 400 },
  { platform: "TikTok", name: "Video Cover", width: 1080, height: 1920 },
  { platform: "TikTok", name: "Profile Picture", width: 200, height: 200 },
  { platform: "WhatsApp", name: "Profile Picture", width: 500, height: 500 },
  { platform: "Pinterest", name: "Pin", width: 1000, height: 1500 },
  { platform: "Threads", name: "Post Image", width: 1080, height: 1080 },
];

export const SUPPORTED_INPUT_FORMATS = [
  "jpg", "jpeg", "png", "webp", "avif", "tiff", "tif",
  "bmp", "gif", "svg", "heic", "heif", "jxl", "ico",
  "cr2", "nef", "arw", "dng", "orf", "rw2",
] as const;

export const SUPPORTED_OUTPUT_FORMATS = [
  "jpg", "png", "webp", "avif", "tiff", "gif", "jxl", "svg", "ico", "pdf",
] as const;

export const DEFAULT_OUTPUT_FORMAT = "jpg" as const;

export const APP_VERSION = "0.1.0";
```

- [ ] **Step 5: Create packages/shared/src/index.ts**

```typescript
export * from "./types.js";
export * from "./constants.js";
```

- [ ] **Step 6: Install dependencies and verify typecheck**

```bash
pnpm install
pnpm --filter @stirling-image/shared typecheck
```

Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add packages/shared/
git commit -m "feat: add shared package with types, tool definitions, and constants"
```

---

## Task 3: Create Stub Packages (image-engine, ai)

**Files:**
- Create: `packages/image-engine/package.json`, `packages/image-engine/tsconfig.json`, `packages/image-engine/src/index.ts`
- Create: `packages/ai/package.json`, `packages/ai/tsconfig.json`, `packages/ai/src/index.ts`, `packages/ai/python/requirements.txt`

- [ ] **Step 1: Create packages/image-engine/package.json**

```json
{
  "name": "@stirling-image/image-engine",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@stirling-image/shared": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: Create packages/image-engine/tsconfig.json and src/index.ts**

tsconfig.json:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

src/index.ts:
```typescript
// Image engine - implements in Phase 2
export const IMAGE_ENGINE_VERSION = "0.0.1";
```

- [ ] **Step 3: Create packages/ai with same structure**

packages/ai/package.json:
```json
{
  "name": "@stirling-image/ai",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@stirling-image/shared": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.7.0"
  }
}
```

packages/ai/tsconfig.json:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

packages/ai/src/index.ts:
```typescript
// AI package - implements in Phase 4
export const AI_VERSION = "0.0.1";
```

packages/ai/python/requirements.txt:
```
rembg[cpu]==2.0.62
realesrgan==0.3.0
lama-cleaner==1.2.5
paddleocr==2.9.1
paddlepaddle==3.0.0
mediapipe==0.10.21
onnxruntime==1.20.1
numpy==1.26.4
Pillow==11.1.0
opencv-python-headless==4.10.0.84
```

- [ ] **Step 4: Run pnpm install and typecheck all**

```bash
pnpm install
pnpm typecheck
```

Expected: All packages pass.

- [ ] **Step 5: Commit**

```bash
git add packages/image-engine/ packages/ai/
git commit -m "feat: add image-engine and ai stub packages"
```

---

## Task 4: Fastify API Server

**Files:**
- Create: `apps/api/package.json`, `apps/api/tsconfig.json`, `apps/api/src/index.ts`, `apps/api/src/config.ts`, `apps/api/src/lib/env.ts`

- [ ] **Step 1: Create apps/api/package.json**

```json
{
  "name": "@stirling-image/api",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@stirling-image/shared": "workspace:*",
    "fastify": "^5.2.0",
    "@fastify/static": "^8.1.0",
    "@fastify/multipart": "^9.0.0",
    "@fastify/cors": "^11.0.0",
    "@fastify/rate-limit": "^10.2.0",
    "@fastify/swagger": "^9.4.0",
    "@fastify/swagger-ui": "^5.2.0",
    "dotenv": "^16.4.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "tsx": "^4.19.0",
    "@types/node": "^22.0.0"
  }
}
```

- [ ] **Step 2: Create apps/api/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "lib": ["ES2022"],
    "module": "ESNext",
    "target": "ES2022"
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 3: Create apps/api/src/lib/env.ts**

```typescript
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(1349),
  AUTH_ENABLED: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  DEFAULT_USERNAME: z.string().default("admin"),
  DEFAULT_PASSWORD: z.string().default("admin"),
  STORAGE_MODE: z.enum(["local", "s3"]).default("local"),
  FILE_MAX_AGE_HOURS: z.coerce.number().default(24),
  CLEANUP_INTERVAL_MINUTES: z.coerce.number().default(30),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().default(100),
  MAX_BATCH_SIZE: z.coerce.number().default(200),
  CONCURRENT_JOBS: z.coerce.number().default(3),
  MAX_MEGAPIXELS: z.coerce.number().default(100),
  RATE_LIMIT_PER_MIN: z.coerce.number().default(100),
  DB_PATH: z.string().default("./data/stirling.db"),
  WORKSPACE_PATH: z.string().default("./tmp/workspace"),
  DEFAULT_THEME: z.enum(["light", "dark"]).default("light"),
  DEFAULT_LOCALE: z.string().default("en"),
  APP_NAME: z.string().default("Stirling Image"),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  return envSchema.parse(process.env);
}
```

- [ ] **Step 4: Create apps/api/src/config.ts**

```typescript
import "dotenv/config";
import { loadEnv } from "./lib/env.js";

export const env = loadEnv();
```

- [ ] **Step 5: Create apps/api/src/index.ts**

```typescript
import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { env } from "./config.js";
import { APP_VERSION } from "@stirling-image/shared";

const app = Fastify({
  logger: true,
  bodyLimit: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024,
});

// Plugins
await app.register(cors, { origin: true });
await app.register(rateLimit, {
  max: env.RATE_LIMIT_PER_MIN,
  timeWindow: "1 minute",
});

// Health check
app.get("/api/v1/health", async () => ({
  status: "healthy",
  version: APP_VERSION,
  uptime: process.uptime().toFixed(0) + "s",
  storage: { mode: env.STORAGE_MODE, available: "N/A" },
  queue: { active: 0, pending: 0 },
  ai: {},
}));

// Start
try {
  await app.listen({ port: env.PORT, host: "0.0.0.0" });
  console.log(`Stirling Image API running on port ${env.PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
```

- [ ] **Step 6: Install dependencies and test server starts**

```bash
pnpm install
cd apps/api && pnpm dev
```

In another terminal:
```bash
curl http://localhost:1349/api/v1/health
```

Expected: JSON response with `"status": "healthy"`.

- [ ] **Step 7: Commit**

```bash
git add apps/api/
git commit -m "feat: add Fastify API server with health check and env config"
```

---

## Task 5: SQLite Database with Drizzle ORM

**Files:**
- Create: `apps/api/src/db/schema.ts`, `apps/api/src/db/index.ts`, `apps/api/src/db/migrate.ts`
- Modify: `apps/api/package.json` (add drizzle deps)
- Modify: `apps/api/src/index.ts` (init DB on startup)

- [ ] **Step 1: Add Drizzle dependencies**

Add to `apps/api/package.json` dependencies:
```json
"drizzle-orm": "^0.38.0",
"better-sqlite3": "^11.7.0"
```
Add to devDependencies:
```json
"drizzle-kit": "^0.30.0",
"@types/better-sqlite3": "^7.6.0"
```

Run `pnpm install`.

- [ ] **Step 2: Create apps/api/src/db/schema.ts**

```typescript
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "user"] }).notNull().default("user"),
  mustChangePassword: integer("must_change_password", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  status: text("status", { enum: ["queued", "processing", "completed", "failed"] }).notNull().default("queued"),
  progress: real("progress").notNull().default(0),
  inputFiles: text("input_files").notNull(), // JSON array
  outputPath: text("output_path"),
  settings: text("settings"), // JSON
  error: text("error"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});

export const apiKeys = sqliteTable("api_keys", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  keyHash: text("key_hash").notNull(),
  name: text("name").notNull().default("Default API Key"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  lastUsedAt: integer("last_used_at", { mode: "timestamp" }),
});
```

- [ ] **Step 3: Create apps/api/src/db/index.ts**

```typescript
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { env } from "../config.js";
import * as schema from "./schema.js";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

// Ensure data directory exists
mkdirSync(dirname(env.DB_PATH), { recursive: true });

const sqlite = new Database(env.DB_PATH);

// Critical SQLite pragmas for reliability
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("busy_timeout = 5000");
sqlite.pragma("synchronous = NORMAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
export { schema };
```

- [ ] **Step 4: Create apps/api/src/db/migrate.ts**

```typescript
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "./index.js";

export function runMigrations() {
  migrate(db, { migrationsFolder: "./drizzle" });
}
```

- [ ] **Step 5: Create drizzle.config.ts**

Create `apps/api/drizzle.config.ts`:
```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DB_PATH || "./data/stirling.db",
  },
});
```

- [ ] **Step 6: Generate initial migration and update server startup**

```bash
cd apps/api
pnpm drizzle-kit generate
```

Update `apps/api/src/index.ts` to init DB before starting:
```typescript
// Add at the top after imports:
import { db } from "./db/index.js";
import { runMigrations } from "./db/migrate.js";

// Add before plugins:
runMigrations();
console.log("Database initialized");
```

- [ ] **Step 7: Test database initializes on server start**

```bash
pnpm dev
```

Expected: "Database initialized" in logs, `./data/stirling.db` file created.

- [ ] **Step 8: Commit**

```bash
git add apps/api/
git commit -m "feat: add SQLite database with Drizzle ORM schema and migrations"
```

---

## Task 6: Authentication with Better-Auth

**Files:**
- Modify: `apps/api/package.json` (add better-auth)
- Create: `apps/api/src/plugins/auth.ts`
- Modify: `apps/api/src/index.ts` (register auth plugin)
- Modify: `apps/api/src/db/schema.ts` (add better-auth tables if needed)

- [ ] **Step 1: Add better-auth dependency**

```bash
cd apps/api
pnpm add better-auth
```

- [ ] **Step 2: Create apps/api/src/plugins/auth.ts**

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index.js";
import { env } from "../config.js";
import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { hash } from "better-auth/crypto";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "sqlite" }),
  emailAndPassword: { enabled: true },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,     // 1 day
  },
});

export async function ensureDefaultAdmin() {
  // Check if any user exists
  const existingUsers = await db.query.users.findFirst();
  if (!existingUsers) {
    const passwordHash = await hash(env.DEFAULT_PASSWORD);
    await db.insert(require("../db/schema.js").users).values({
      id: randomUUID(),
      username: env.DEFAULT_USERNAME,
      passwordHash,
      role: "admin",
      mustChangePassword: true,
    });
    console.log(`Default admin user '${env.DEFAULT_USERNAME}' created`);
  }
}

export async function registerAuth(app: FastifyInstance) {
  // Mount better-auth handler
  app.all("/api/auth/*", async (request, reply) => {
    const response = await auth.handler(request.raw as any);
    reply.raw.writeHead(response.status, Object.fromEntries(response.headers.entries()));
    reply.raw.end(response.body ? await response.text() : undefined);
  });
}
```

Note: Better-Auth's exact API may vary. This will be refined during implementation based on the actual library version. The core pattern (adapter → ensureDefaultAdmin → mount handler) is correct.

- [ ] **Step 3: Register auth in server startup**

Update `apps/api/src/index.ts`:
```typescript
import { registerAuth, ensureDefaultAdmin } from "./plugins/auth.js";

// After migrations:
await ensureDefaultAdmin();

// After plugins:
await registerAuth(app);
```

- [ ] **Step 4: Test auth endpoints exist**

```bash
pnpm dev
curl -X POST http://localhost:1349/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"admin","password":"admin"}'
```

Expected: Auth response (success or error depending on better-auth API shape).

- [ ] **Step 5: Commit**

```bash
git add apps/api/
git commit -m "feat: add Better-Auth authentication with default admin user"
```

---

## Task 7: Vite + React SPA Setup

**Files:**
- Create: `apps/web/package.json`, `apps/web/tsconfig.json`, `apps/web/vite.config.ts`, `apps/web/tailwind.config.ts`, `apps/web/postcss.config.js`, `apps/web/index.html`, `apps/web/src/main.tsx`, `apps/web/src/App.tsx`, `apps/web/src/styles/globals.css`, `apps/web/src/lib/utils.ts`

- [ ] **Step 1: Create apps/web/package.json**

```json
{
  "name": "@stirling-image/web",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@stirling-image/shared": "workspace:*",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.1.0",
    "zustand": "^5.0.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.6.0",
    "lucide-react": "^0.469.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "typescript": "^5.7.0",
    "vite": "^6.0.0"
  }
}
```

- [ ] **Step 2: Create config files**

apps/web/tsconfig.json:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"]
}
```

apps/web/vite.config.ts:
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:1349",
    },
  },
});
```

apps/web/postcss.config.js:
```javascript
export default {};
```

- [ ] **Step 3: Create HTML entry and React root**

apps/web/index.html:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Stirling Image</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

apps/web/src/styles/globals.css:
```css
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  --color-primary-foreground: #ffffff;
  --color-background: #ffffff;
  --color-foreground: #0f172a;
  --color-muted: #f1f5f9;
  --color-muted-foreground: #64748b;
  --color-border: #e2e8f0;
  --color-card: #ffffff;
  --color-card-foreground: #0f172a;
  --color-sidebar: #f8fafc;
  --color-sidebar-foreground: #334155;
  --color-accent: #3b82f6;
  --color-destructive: #ef4444;
}

.dark {
  --color-background: #0f172a;
  --color-foreground: #f8fafc;
  --color-muted: #1e293b;
  --color-muted-foreground: #94a3b8;
  --color-border: #334155;
  --color-card: #1e293b;
  --color-card-foreground: #f8fafc;
  --color-sidebar: #1e293b;
  --color-sidebar-foreground: #cbd5e1;
}
```

apps/web/src/lib/utils.ts:
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

apps/web/src/main.tsx:
```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

apps/web/src/App.tsx:
```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div className="p-8 text-2xl font-bold">Stirling Image</div>} />
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 4: Install deps and verify dev server starts**

```bash
pnpm install
cd apps/web && pnpm dev
```

Open http://localhost:5173 — should see "Stirling Image" text.

- [ ] **Step 5: Commit**

```bash
git add apps/web/
git commit -m "feat: add Vite + React SPA with Tailwind CSS and routing"
```

---

## Task 8: Theme System

**Files:**
- Create: `apps/web/src/stores/theme-store.ts`, `apps/web/src/hooks/use-theme.ts`
- Modify: `apps/web/src/App.tsx` (wrap with theme provider)

- [ ] **Step 1: Create theme store**

apps/web/src/stores/theme-store.ts:
```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: "system",
      resolvedTheme: getSystemTheme(),
      setTheme: (theme) => {
        const resolved = theme === "system" ? getSystemTheme() : theme;
        document.documentElement.classList.toggle("dark", resolved === "dark");
        set({ theme, resolvedTheme: resolved });
      },
    }),
    { name: "stirling-image-theme" }
  )
);
```

- [ ] **Step 2: Create theme hook**

apps/web/src/hooks/use-theme.ts:
```typescript
import { useEffect } from "react";
import { useThemeStore } from "../stores/theme-store";

export function useTheme() {
  const { theme, resolvedTheme, setTheme } = useThemeStore();

  useEffect(() => {
    const resolved = theme === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }, [theme]);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return { theme, resolvedTheme, setTheme, toggleTheme };
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/stores/ apps/web/src/hooks/
git commit -m "feat: add theme system with dark/light/system support and persistence"
```

---

## Task 9: Layout Components (Sidebar + Tool Panel + Dropzone)

**Files:**
- Create: `apps/web/src/components/layout/app-layout.tsx`, `apps/web/src/components/layout/sidebar.tsx`, `apps/web/src/components/layout/tool-panel.tsx`, `apps/web/src/components/layout/footer.tsx`
- Create: `apps/web/src/components/common/dropzone.tsx`, `apps/web/src/components/common/tool-card.tsx`, `apps/web/src/components/common/search-bar.tsx`
- Create: `apps/web/src/pages/home-page.tsx`
- Modify: `apps/web/src/App.tsx`

- [ ] **Step 1: Create sidebar**

apps/web/src/components/layout/sidebar.tsx:
```tsx
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutGrid, BookOpen, Workflow, FolderOpen,
  HelpCircle, Settings, type LucideIcon
} from "lucide-react";

interface SidebarItem {
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
}

const topItems: SidebarItem[] = [
  { icon: LayoutGrid, label: "Tools", href: "/" },
  { icon: BookOpen, label: "Reader", href: "/reader" },
  { icon: Workflow, label: "Automate", href: "/automate" },
  { icon: FolderOpen, label: "Files", href: "/files" },
];

const bottomItems: SidebarItem[] = [
  { icon: HelpCircle, label: "Help", href: "/help" },
  { icon: Settings, label: "Settings" },
];

interface SidebarProps {
  onSettingsClick: () => void;
}

export function Sidebar({ onSettingsClick }: SidebarProps) {
  const location = useLocation();

  const renderItem = (item: SidebarItem, isActive: boolean) => {
    const content = (
      <div
        className={cn(
          "flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <item.icon className="h-6 w-6" />
        <span className="text-[10px] font-medium">{item.label}</span>
      </div>
    );

    if (item.label === "Settings") {
      return (
        <button key={item.label} onClick={onSettingsClick} className="w-full">
          {content}
        </button>
      );
    }

    return (
      <Link key={item.label} to={item.href || "/"}>
        {content}
      </Link>
    );
  };

  return (
    <aside className="flex flex-col items-center w-16 bg-sidebar border-r border-border py-3 gap-1">
      <div className="flex flex-col gap-1 flex-1">
        {topItems.map((item) => renderItem(item, location.pathname === item.href))}
      </div>
      <div className="border-t border-border w-10 my-2" />
      <div className="flex flex-col gap-1">
        {bottomItems.map((item) => renderItem(item, false))}
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Create tool panel with search and categories**

apps/web/src/components/common/search-bar.tsx:
```tsx
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = "Search tools..." }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
```

apps/web/src/components/common/tool-card.tsx:
```tsx
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import * as icons from "lucide-react";
import type { Tool } from "@stirling-image/shared";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const IconComponent = (icons as Record<string, React.ComponentType<{ className?: string }>>)[tool.icon] || icons.FileImage;

  return (
    <div className="group flex items-center gap-3 relative">
      <button
        className="opacity-0 group-hover:opacity-100 transition-opacity absolute -left-5"
        title="Add to favourites"
      >
        <Star className="h-3 w-3 text-muted-foreground hover:text-yellow-500" />
      </button>
      <Link
        to={tool.route}
        className={cn(
          "flex items-center gap-3 py-2 px-3 rounded-lg w-full transition-colors",
          "hover:bg-muted",
          tool.disabled && "opacity-50 pointer-events-none"
        )}
      >
        <IconComponent className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-medium">{tool.name}</span>
        {tool.alpha && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-600 font-medium">
            Alpha
          </span>
        )}
      </Link>
    </div>
  );
}
```

apps/web/src/components/layout/tool-panel.tsx:
```tsx
import { useState, useMemo } from "react";
import { TOOLS, CATEGORIES } from "@stirling-image/shared";
import { SearchBar } from "../common/search-bar";
import { ToolCard } from "../common/tool-card";

export function ToolPanel() {
  const [search, setSearch] = useState("");

  const filteredTools = useMemo(() => {
    if (!search) return TOOLS;
    const q = search.toLowerCase();
    return TOOLS.filter(
      (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    );
  }, [search]);

  const groupedTools = useMemo(() => {
    const groups = new Map<string, typeof TOOLS>();
    for (const tool of filteredTools) {
      const list = groups.get(tool.category) || [];
      list.push(tool);
      groups.set(tool.category, list);
    }
    return groups;
  }, [filteredTools]);

  return (
    <div className="w-72 border-r border-border bg-background overflow-y-auto flex flex-col">
      <div className="p-3 sticky top-0 bg-background z-10">
        <SearchBar value={search} onChange={setSearch} />
      </div>
      <div className="px-3 pb-4 flex-1">
        {CATEGORIES.filter((cat) => groupedTools.has(cat.id)).map((category) => (
          <div key={category.id} className="mb-4">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">
              {category.name}
            </h3>
            <div className="space-y-0.5">
              {groupedTools.get(category.id)!.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>
        ))}
        {filteredTools.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No tools found</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create dropzone**

apps/web/src/components/common/dropzone.tsx:
```tsx
import { useCallback, useState, type DragEvent } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropzoneProps {
  onFiles?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
}

export function Dropzone({ onFiles, accept, multiple = true }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) onFiles?.(files);
    },
    [onFiles]
  );

  const handleClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = multiple;
    if (accept) input.accept = accept;
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0) onFiles?.(files);
    };
    input.click();
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={handleClick}
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors cursor-pointer min-h-[400px] mx-auto max-w-2xl",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
      )}
    >
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="text-3xl font-bold text-muted-foreground/30">
          Stirling <span className="text-primary/30">Image</span>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-primary text-primary hover:bg-primary/5 transition-colors text-sm font-medium">
          <Upload className="h-4 w-4" />
          Upload from computer
        </button>
        <p className="text-sm text-muted-foreground">
          Drop files here or click the upload button
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create footer**

apps/web/src/components/layout/footer.tsx:
```tsx
import { Moon, Sun, Globe } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export function Footer() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 z-50">
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg bg-card border border-border hover:bg-muted transition-colors"
        title="Toggle Theme"
      >
        {resolvedTheme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </button>
      <button
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-card border border-border hover:bg-muted transition-colors text-sm"
        title="Language"
      >
        <Globe className="h-4 w-4" />
        English
      </button>
    </div>
  );
}
```

- [ ] **Step 5: Create app layout**

apps/web/src/components/layout/app-layout.tsx:
```tsx
import { useState } from "react";
import { Sidebar } from "./sidebar";
import { ToolPanel } from "./tool-panel";
import { Footer } from "./footer";
import { Dropzone } from "../common/dropzone";

interface AppLayoutProps {
  children?: React.ReactNode;
  showToolPanel?: boolean;
}

export function AppLayout({ children, showToolPanel = true }: AppLayoutProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar onSettingsClick={() => setSettingsOpen(true)} />
      {showToolPanel && <ToolPanel />}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          {children || <Dropzone />}
        </div>
        <div className="text-center text-xs text-muted-foreground py-2 border-t border-border">
          Privacy Policy
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 6: Create home page and wire up App.tsx**

apps/web/src/pages/home-page.tsx:
```tsx
import { AppLayout } from "@/components/layout/app-layout";

export function HomePage() {
  return <AppLayout />;
}
```

Update apps/web/src/App.tsx:
```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/home-page";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 7: Test the full layout renders**

```bash
cd apps/web && pnpm dev
```

Open http://localhost:5173 — should see the Stirling-PDF-style layout: sidebar (left icons), tool panel (categorized list with search), and dropzone (main area).

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/
git commit -m "feat: add Stirling-PDF-style layout with sidebar, tool panel, dropzone, and theme toggle"
```

---

## Task 10: Login Page

**Files:**
- Create: `apps/web/src/pages/login-page.tsx`
- Modify: `apps/web/src/App.tsx` (add login route and auth guard)

- [ ] **Step 1: Create login page (split layout matching Stirling-PDF)**

apps/web/src/pages/login-page.tsx:
```tsx
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password }),
      });
      if (!res.ok) {
        setError("Invalid username or password");
        return;
      }
      navigate("/");
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="text-3xl font-bold">
              Stirling <span className="text-primary">Image</span>
            </h1>
            <h2 className="text-2xl font-bold mt-4">Login</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full py-3 rounded-lg bg-primary/80 text-primary-foreground font-medium hover:bg-primary transition-colors disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
      {/* Right: Branding Panel */}
      <div className="hidden lg:flex flex-1 bg-primary/90 items-center justify-center p-12 text-white">
        <div className="max-w-lg space-y-6 text-center">
          <h2 className="text-3xl font-bold">
            Your one-stop-shop for all your image needs.
          </h2>
          <p className="text-lg text-white/80">
            A privacy-first image suite that lets you resize, compress, convert,
            and process images with 30+ powerful tools.
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add login route to App.tsx**

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/home-page";
import { LoginPage } from "./pages/login-page";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 3: Test login page renders**

Open http://localhost:5173/login — should see split layout with login form and branding panel.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/
git commit -m "feat: add login page with split layout matching Stirling-PDF style"
```

---

## Task 11: Generic Tool Page Template

**Files:**
- Create: `apps/web/src/pages/tool-page.tsx`
- Modify: `apps/web/src/App.tsx` (add dynamic tool route)

- [ ] **Step 1: Create generic tool page**

apps/web/src/pages/tool-page.tsx:
```tsx
import { useParams } from "react-router-dom";
import { useMemo } from "react";
import { TOOLS } from "@stirling-image/shared";
import { AppLayout } from "@/components/layout/app-layout";
import { Dropzone } from "@/components/common/dropzone";
import * as icons from "lucide-react";

export function ToolPage() {
  const { toolId } = useParams<{ toolId: string }>();
  const tool = useMemo(() => TOOLS.find((t) => t.id === toolId), [toolId]);

  if (!tool) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Tool not found
        </div>
      </AppLayout>
    );
  }

  const IconComponent = (icons as Record<string, React.ComponentType<{ className?: string }>>)[tool.icon] || icons.FileImage;

  return (
    <AppLayout>
      <div className="flex h-full gap-0">
        {/* Tool Settings Panel */}
        <div className="w-72 border-r border-border p-4 space-y-4 overflow-y-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <IconComponent className="h-5 w-5" />
            </div>
            <h2 className="font-semibold text-lg">{tool.name}</h2>
          </div>

          {/* Files section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Files</h3>
            <button className="flex items-center gap-2 text-sm text-primary hover:underline">
              <icons.Upload className="h-4 w-4" />
              Upload
            </button>
          </div>

          <div className="border-t border-border" />

          {/* Settings section placeholder */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Settings</h3>
            <p className="text-xs text-muted-foreground">
              Tool settings will appear here once implemented.
            </p>
          </div>

          <div className="border-t border-border" />

          {/* Process button */}
          <button
            disabled
            className="w-full py-2.5 rounded-lg bg-muted text-muted-foreground font-medium disabled:opacity-50"
          >
            {tool.name}
          </button>
        </div>

        {/* Dropzone */}
        <div className="flex-1 flex items-center justify-center p-6">
          <Dropzone />
        </div>
      </div>
    </AppLayout>
  );
}
```

- [ ] **Step 2: Update App.tsx with dynamic tool routes**

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/home-page";
import { LoginPage } from "./pages/login-page";
import { ToolPage } from "./pages/tool-page";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/:toolId" element={<ToolPage />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 3: Test clicking a tool in the sidebar navigates to its page**

Click "Compress" in tool panel — should navigate to `/compress` and show tool page template with settings panel + dropzone.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/
git commit -m "feat: add generic tool page template with settings panel and dropzone"
```

---

## Task 12: Docker Setup (Multi-Stage, Multi-Arch)

**Files:**
- Create: `docker/Dockerfile`, `docker/.dockerignore`, `docker/docker-compose.yml`

- [ ] **Step 1: Create docker/.dockerignore**

```
node_modules
.git
.turbo
dist
*.db
*.db-journal
*.db-wal
.env
.env.local
.DS_Store
.playwright-mcp
*.png
*.jpg
*.jpeg
```

- [ ] **Step 2: Create docker/Dockerfile**

```dockerfile
# ============================================
# Stage 1: Build
# ============================================
FROM node:22-bookworm AS builder

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json turbo.json tsconfig.base.json ./
COPY apps/web/package.json apps/web/tsconfig.json apps/web/vite.config.ts apps/web/postcss.config.js apps/web/index.html ./apps/web/
COPY apps/api/package.json apps/api/tsconfig.json ./apps/api/
COPY packages/shared/package.json packages/shared/tsconfig.json ./packages/shared/
COPY packages/image-engine/package.json packages/image-engine/tsconfig.json ./packages/image-engine/
COPY packages/ai/package.json packages/ai/tsconfig.json ./packages/ai/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build everything
RUN pnpm build

# ============================================
# Stage 2: Production
# ============================================
FROM node:22-bookworm-slim AS production

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip python3-venv \
    imagemagick \
    tesseract-ocr tesseract-ocr-eng \
    libraw-dev \
    potrace \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create Python venv and install ML packages
RUN python3 -m venv /opt/venv
COPY packages/ai/python/requirements.txt /tmp/requirements.txt
RUN /opt/venv/bin/pip install --no-cache-dir -r /tmp/requirements.txt && rm /tmp/requirements.txt

WORKDIR /app

# Copy built artifacts from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/drizzle ./apps/api/drizzle
COPY --from=builder /app/apps/web/dist ./apps/web/dist
COPY --from=builder /app/packages ./packages

# Create data and workspace directories
RUN mkdir -p /data /tmp/workspace

# Environment defaults
ENV PORT=1349 \
    NODE_ENV=production \
    AUTH_ENABLED=true \
    DEFAULT_USERNAME=admin \
    DEFAULT_PASSWORD=admin \
    STORAGE_MODE=local \
    DB_PATH=/data/stirling.db \
    WORKSPACE_PATH=/tmp/workspace \
    PYTHON_VENV_PATH=/opt/venv \
    DEFAULT_THEME=light \
    APP_NAME="Stirling Image"

EXPOSE 1349

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:1349/api/v1/health || exit 1

CMD ["node", "apps/api/dist/index.js"]
```

- [ ] **Step 3: Create docker/docker-compose.yml**

```yaml
services:
  stirling-image:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    container_name: stirling-image
    ports:
      - "1349:1349"
    environment:
      - AUTH_ENABLED=true
      - DEFAULT_USERNAME=admin
      - DEFAULT_PASSWORD=admin
      - STORAGE_MODE=local
      - DEFAULT_THEME=light
      - APP_NAME=Stirling Image
    volumes:
      - ./data:/data
      - ./workspace:/tmp/workspace
    restart: unless-stopped
```

- [ ] **Step 4: Test Docker build**

```bash
cd /Users/sidd/Desktop/Personal/Projects/Stirling-Image
docker build -f docker/Dockerfile -t stirling-image:dev .
```

Expected: Build completes (may take a few minutes for Python deps on first build).

- [ ] **Step 5: Test Docker run**

```bash
docker run --rm -p 1349:1349 stirling-image:dev
```

Open http://localhost:1349 — should see the app.

- [ ] **Step 6: Commit**

```bash
git add docker/
git commit -m "feat: add multi-stage Docker build with Python ML dependencies"
```

---

## Task 13: Static File Serving in Production

**Files:**
- Create: `apps/api/src/plugins/static.ts`
- Modify: `apps/api/src/index.ts`

- [ ] **Step 1: Create static file serving plugin**

apps/api/src/plugins/static.ts:
```typescript
import type { FastifyInstance } from "fastify";
import fastifyStatic from "@fastify/static";
import { resolve } from "node:path";
import { existsSync } from "node:fs";

export async function registerStatic(app: FastifyInstance) {
  const webDistPath = resolve(process.cwd(), "../web/dist");

  if (!existsSync(webDistPath)) {
    app.log.warn(`SPA dist not found at ${webDistPath} — skipping static file serving`);
    return;
  }

  await app.register(fastifyStatic, {
    root: webDistPath,
    prefix: "/",
    wildcard: false,
  });

  // SPA fallback — serve index.html for all non-API routes
  app.setNotFoundHandler((request, reply) => {
    if (request.url.startsWith("/api/")) {
      reply.code(404).send({ error: "Not found", code: "NOT_FOUND" });
    } else {
      reply.sendFile("index.html");
    }
  });
}
```

- [ ] **Step 2: Register in server startup**

Add to `apps/api/src/index.ts` after auth registration:
```typescript
import { registerStatic } from "./plugins/static.js";

// After all API routes registered:
if (process.env.NODE_ENV === "production") {
  await registerStatic(app);
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/plugins/static.ts apps/api/src/index.ts
git commit -m "feat: serve React SPA from Fastify in production mode"
```

---

## Task 14: File Cleanup Cron

**Files:**
- Create: `apps/api/src/lib/cleanup.ts`
- Modify: `apps/api/src/index.ts`

- [ ] **Step 1: Create cleanup service**

apps/api/src/lib/cleanup.ts:
```typescript
import { readdir, stat, rm } from "node:fs/promises";
import { join } from "node:path";
import { env } from "../config.js";

export function startCleanupCron() {
  const intervalMs = env.CLEANUP_INTERVAL_MINUTES * 60 * 1000;
  const maxAgeMs = env.FILE_MAX_AGE_HOURS * 60 * 60 * 1000;

  const cleanup = async () => {
    try {
      const entries = await readdir(env.WORKSPACE_PATH, { withFileTypes: true }).catch(() => []);
      const now = Date.now();
      let cleaned = 0;

      for (const entry of entries) {
        const fullPath = join(env.WORKSPACE_PATH, entry.name);
        try {
          const stats = await stat(fullPath);
          if (now - stats.mtimeMs > maxAgeMs) {
            await rm(fullPath, { recursive: true });
            cleaned++;
          }
        } catch {
          // Skip files that can't be stat'd
        }
      }

      if (cleaned > 0) {
        console.log(`Cleanup: removed ${cleaned} expired workspace entries`);
      }
    } catch (err) {
      console.error("Cleanup error:", err);
    }
  };

  // Run on startup if configured
  cleanup();

  // Schedule recurring cleanup
  const timer = setInterval(cleanup, intervalMs);
  console.log(`Cleanup scheduled: every ${env.CLEANUP_INTERVAL_MINUTES}m, max age ${env.FILE_MAX_AGE_HOURS}h`);

  return () => clearInterval(timer);
}
```

- [ ] **Step 2: Start cleanup in server**

Add to `apps/api/src/index.ts`:
```typescript
import { startCleanupCron } from "./lib/cleanup.js";

// Before app.listen:
startCleanupCron();
```

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/lib/cleanup.ts apps/api/src/index.ts
git commit -m "feat: add automatic workspace file cleanup cron"
```

---

## Task 15: Swagger API Documentation

**Files:**
- Modify: `apps/api/src/index.ts`

- [ ] **Step 1: Register Swagger plugins**

Add to `apps/api/src/index.ts` after CORS:
```typescript
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

await app.register(swagger, {
  openapi: {
    info: {
      title: "Stirling Image API",
      description: "API for Stirling Image — self-hosted image processing suite",
      version: APP_VERSION,
    },
    servers: [{ url: `http://localhost:${env.PORT}` }],
  },
});

await app.register(swaggerUi, {
  routePrefix: "/api/docs",
});
```

- [ ] **Step 2: Test Swagger UI loads**

```bash
cd apps/api && pnpm dev
```

Open http://localhost:1349/api/docs — should see Swagger UI with the health endpoint.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/index.ts
git commit -m "feat: add Swagger/OpenAPI documentation at /api/docs"
```

---

## Verification: Full Stack Integration Test

- [ ] **Step 1: Start both servers**

```bash
pnpm dev
```

This should start both `apps/api` (port 1349) and `apps/web` (port 5173).

- [ ] **Step 2: Verify**

| Check | URL | Expected |
|-------|-----|----------|
| API health | http://localhost:1349/api/v1/health | JSON with status "healthy" |
| Swagger UI | http://localhost:1349/api/docs | Swagger documentation |
| Frontend | http://localhost:5173 | Stirling-Image layout with sidebar, tools, dropzone |
| Login page | http://localhost:5173/login | Split login page |
| Tool page | http://localhost:5173/compress | Tool settings panel + dropzone |
| Theme toggle | Click moon/sun icon | Theme switches between light/dark |
| Search | Type in search bar | Tool list filters |

- [ ] **Step 3: Docker build and test**

```bash
docker build -f docker/Dockerfile -t stirling-image:dev .
docker run --rm -p 1349:1349 stirling-image:dev
```

Open http://localhost:1349 — full app should work from the single container.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: Phase 1 Foundation complete — monorepo, auth, layout, Docker"
```

---

## What Phase 1 Delivers

After completing this plan, you have:

- **Working monorepo** with Turborepo + pnpm, 2 apps + 3 packages
- **Fastify API** with health check, rate limiting, Swagger docs
- **SQLite database** with Drizzle ORM, proper WAL mode, auto-migrations
- **Authentication** via Better-Auth with default admin user
- **React SPA** with Stirling-PDF-style layout (sidebar, tool panel, dropzone)
- **Theme system** (light/dark/system with persistence)
- **Login page** (split layout matching Stirling-PDF)
- **Generic tool page template** (settings panel + dropzone — ready for Phase 2)
- **37 tools defined** in shared constants (routes ready, UI placeholders)
- **Docker container** (multi-stage build, Python ML deps included)
- **File cleanup cron** (24h max age, 30min intervals)
- **API documentation** at /api/docs

**Next:** Phase 2 plan will implement the image-engine package and first 10 core tools (resize, crop, rotate, convert, compress, strip metadata, brightness/contrast, saturation, color channels, color effects).
