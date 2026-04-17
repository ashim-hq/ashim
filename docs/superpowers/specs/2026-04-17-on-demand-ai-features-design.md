# On-Demand AI Feature Downloads

**Date:** 2026-04-17
**Status:** Approved
**Goal:** Reduce Docker image from ~30 GB to ~5-6 GB (amd64) / ~2-3 GB (arm64) by making AI features downloadable post-install.

## Problem

The Docker image bundles all Python ML packages (~8-10 GB) and model weights (~5-8 GB) regardless of whether users need AI features. Users who only want basic image tools (resize, crop, convert) must pull ~30 GB.

## Design Decisions

- **Single Docker image** — no lite/full variants
- **Individual feature bundles** — users cherry-pick by feature name, not model name
- **Admin-only downloads** — only admins can enable/disable AI features
- **AI tools visible with badge** — uninstalled tools appear in grid with a download indicator
- **Both tool-page and settings UI** — admins can download from the tool page or from a central management panel in settings

## Architecture

### Base Image Contents

The base image includes everything needed for non-AI tools plus the prerequisites for AI feature installation:

| Component | Rationale |
|-----------|-----------|
| Node.js 22 + pnpm + app source + frontend dist | Core application |
| Sharp, imagemagick, tesseract-ocr, potrace, libheif, exiftool | Non-AI image processing |
| caire binary | Content-aware resize |
| Python 3 + pip + build-essential | Required for pip install at runtime |
| numpy==1.26.4, Pillow, opencv-python-headless | Shared by all AI features, small (~300 MB) |
| CUDA runtime (amd64 only, from nvidia/cuda base) | Required for GPU-accelerated AI |

**Estimated size:** ~5-6 GB (amd64), ~2-3 GB (arm64)

### Feature Bundles

Six user-facing bundles, named by what they enable (not by model names). **Each tool belongs to exactly one bundle — no partial functionality.** When a bundle is installed, all its tools work fully. When it's not installed, those tools are locked entirely.

| Feature Name | Python Packages | Models | Tools Fully Enabled | Est. Size |
|---|---|---|---|---|
| **Background Removal** | rembg, onnxruntime(-gpu), mediapipe | birefnet-general-lite, blaze_face, face_landmarker | remove-background, passport-photo | ~700 MB - 1 GB |
| **Face Detection** | mediapipe | blaze_face, face_landmarker | blur-faces, red-eye-removal, smart-crop | ~200-300 MB |
| **Object Eraser & Colorize** | onnxruntime(-gpu) | LaMa ONNX, DDColor ONNX, OpenCV colorize | erase-object, colorize | ~600-800 MB |
| **Upscale & Enhance** | torch, torchvision, realesrgan, codeformer-pip (--no-deps), gfpgan, basicsr, lpips | RealESRGAN x4plus, GFPGANv1.3, CodeFormer (.pth), facexlib, SCUNet, NAFNet | upscale, enhance-faces, noise-removal | ~4-5 GB |
| **Photo Restoration** | onnxruntime(-gpu), mediapipe | LaMa ONNX, DDColor ONNX, CodeFormer ONNX, blaze_face, face_landmarker, OpenCV colorize | restore-photo | ~800 MB - 1 GB |
| **OCR** | paddlepaddle(-gpu), paddleocr | PP-OCRv5 (7 models), PaddleOCR-VL 1.5 | ocr | ~3-4 GB |

Notes:
- `passport-photo` is in the Background Removal bundle because it primarily needs rembg; mediapipe (for face landmarks) is included in the same bundle so the tool works fully
- `noise-removal` is in the Upscale & Enhance bundle because its quality/maximum tiers need PyTorch; all 4 tiers (including OpenCV-based quick/balanced) are locked until the bundle is installed
- `ocr` is fully locked until the OCR bundle is installed, including the Tesseract-based fast tier — this keeps the UX clean even though Tesseract is pre-installed in the base image
- `restore-photo` is its own bundle because it needs models from multiple domains (inpainting, face enhancement, colorization); all stages work when installed
- Some packages appear in multiple bundles (e.g., mediapipe in Background Removal, Face Detection, and Photo Restoration; onnxruntime in Background Removal, Object Eraser, and Photo Restoration). The install script skips already-installed packages — pip handles this naturally
- Some models appear in multiple bundles (e.g., blaze_face in both Background Removal and Face Detection). The install script skips already-downloaded model files

### Bundle Dependencies

```
Background Removal ───── standalone
Face Detection ────────── standalone
Object Eraser & Colorize ── standalone
Upscale & Enhance ─────── standalone
Photo Restoration ─────── standalone
OCR ───────────────────── standalone
```

All bundles are independently installable. Shared packages (mediapipe, onnxruntime) and shared models (blaze_face, LaMa, etc.) are silently skipped if already present from another bundle.

### Single Venv Strategy

The current architecture uses a single venv at `/opt/venv` (set via `PYTHON_VENV_PATH`). The bridge (`bridge.ts`) constructs `${venvPath}/bin/python3` — it can only point to one interpreter. Having two venvs (base at `/opt/venv`, features at `/data/ai/venv/`) is fragile: C extensions and entry points reference their venv prefix, and `PYTHONPATH` hacks break in practice.

**Solution:** Use a single venv on the persistent volume at `/data/ai/venv/`.

- The Dockerfile creates `/opt/venv` with base packages (numpy, Pillow, opencv) as before
- The entrypoint script bootstraps `/data/ai/venv/` on first run by copying `/opt/venv` into it (fast file copy, ~300 MB)
- `PYTHON_VENV_PATH` is set to `/data/ai/venv/` so the bridge uses it
- Feature installs add packages to this same venv
- On container update, the entrypoint checks if base package versions changed and updates the venv accordingly (pip install from wheel cache)

This gives us one venv with all packages, living on a persistent volume, bootstrapped from the image's base packages.

### Persistent Storage

All AI data lives under `/data/ai/` on the existing Docker volume (no docker-compose changes):

```
/data/ai/
  venv/           # Single Python virtual environment (bootstrapped from /opt/venv, extended by feature installs)
  models/         # Downloaded model weight files (same structure as /opt/models/)
  pip-cache/      # Wheel cache for fast re-installs after updates
  installed.json  # Tracks installed bundles, versions, timestamps
```

### Feature Manifest

A `feature-manifest.json` file is baked into each Docker image at build time. It is the single source of truth for what each bundle installs:

```json
{
  "manifestVersion": 1,
  "imageVersion": "1.16.0",
  "pythonVersion": "3.12",
  "basePackages": ["numpy==1.26.4", "Pillow==11.1.0", "opencv-python-headless==4.10.0.84"],
  "bundles": {
    "background-removal": {
      "name": "Background Removal",
      "description": "Remove image backgrounds with AI",
      "packages": {
        "common": ["rembg==2.0.62"],
        "amd64": ["onnxruntime-gpu==1.20.1", "mediapipe==0.10.21"],
        "arm64": ["onnxruntime==1.20.1", "rembg[cpu]==2.0.62", "mediapipe==0.10.18"]
      },
      "pipFlags": {},
      "models": [
        {
          "id": "birefnet-general-lite",
          "downloadFn": "rembg_session",
          "args": ["birefnet-general-lite"]
        },
        {
          "id": "blaze-face-short-range",
          "url": "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite",
          "path": "mediapipe/blaze_face_short_range.tflite",
          "minSize": 100000
        },
        {
          "id": "face-landmarker",
          "url": "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
          "path": "mediapipe/face_landmarker.task",
          "minSize": 5000000
        }
      ],
      "enablesTools": ["remove-background", "passport-photo"]
    },
    "upscale-enhance": {
      "name": "Upscale & Enhance",
      "description": "AI upscaling, face enhancement, and noise removal",
      "packages": {
        "common": ["codeformer-pip==0.0.4", "lpips"],
        "amd64": [
          "torch torchvision --extra-index-url https://download.pytorch.org/whl/cu126",
          "realesrgan==0.3.0 --extra-index-url https://download.pytorch.org/whl/cu126"
        ],
        "arm64": ["torch", "torchvision", "realesrgan==0.3.0"]
      },
      "pipFlags": {
        "codeformer-pip==0.0.4": "--no-deps"
      },
      "postInstall": ["pip install numpy==1.26.4"],
      "models": [
        { "id": "realesrgan-x4plus", "url": "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth", "path": "realesrgan/RealESRGAN_x4plus.pth", "minSize": 67000000 },
        { "id": "gfpgan-v1.3", "url": "https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.3.pth", "path": "gfpgan/GFPGANv1.3.pth", "minSize": 332000000 },
        { "id": "codeformer-pth", "url": "https://github.com/sczhou/CodeFormer/releases/download/v0.1.0/codeformer.pth", "path": "codeformer/codeformer.pth", "minSize": 375000000 },
        { "id": "codeformer-onnx", "url": "hf://facefusion/models-3.0.0/codeformer.onnx", "path": "codeformer/codeformer.onnx", "minSize": 377000000 },
        { "id": "facexlib-detection", "url": "https://github.com/xinntao/facexlib/releases/download/v0.1.0/detection_Resnet50_Final.pth", "path": "gfpgan/facelib/detection_Resnet50_Final.pth", "minSize": 104000000 },
        { "id": "facexlib-parsing", "url": "https://github.com/xinntao/facexlib/releases/download/v0.2.2/parsing_parsenet.pth", "path": "gfpgan/facelib/parsing_parsenet.pth", "minSize": 85000000 },
        { "id": "scunet", "url": "https://github.com/cszn/KAIR/releases/download/v1.0/scunet_color_real_psnr.pth", "path": "scunet/scunet_color_real_psnr.pth", "minSize": 4000000 },
        { "id": "nafnet", "url": "hf://mikestealth/nafnet-models/NAFNet-SIDD-width64.pth", "path": "nafnet/NAFNet-SIDD-width64.pth", "minSize": 67000000 }
      ],
      "enablesTools": ["upscale", "enhance-faces", "noise-removal"]
    }
  }
}
```

### Install Script

A Python script (`packages/ai/python/install_feature.py`) handles feature installation:

1. Reads the feature manifest from the image
2. Detects architecture (amd64/arm64) and GPU availability
3. Creates or reuses the venv at `/data/ai/venv/`
4. Runs pip install with the correct packages, flags, and index URLs per platform
5. Handles the numpy version conflict (--no-deps for codeformer, re-pin numpy)
6. Downloads model weights with retry logic (ported from `download_models.py`)
7. Updates `/data/ai/installed.json` with bundle status
8. Reports progress to stdout as JSON lines (consumed by the Node bridge)

The script must be idempotent — running it twice for the same bundle is a no-op.

### Uninstall and Shared Package Strategy

Bundles share Python packages (e.g., onnxruntime in Background Removal, Object Eraser, and Photo Restoration). Naively pip-uninstalling a bundle's packages could break other installed bundles.

**v1 approach (simple):** Uninstall removes model files and updates `installed.json`. Orphaned pip packages stay in the venv — they use disk but don't cause issues. A "Clean up" button in the AI Features settings panel rebuilds the venv from scratch: creates a fresh venv, installs only packages needed by currently-installed bundles, removes the old venv.

**Future improvement:** Reference counting — track which bundles need which packages, only remove packages exclusively owned by the target bundle.

### Tool Route Registration for Uninstalled Features

Currently `registerToolRoutes()` either registers a route or doesn't (disabled tools get 404). For uninstalled AI features, we need routes that return a structured error instead of 404.

**Solution: Register ALL tool routes always, add a pre-processing guard.**

In `tool-factory.ts`, before calling `config.process()`, check feature installation status:

```typescript
if (isAiTool(config.toolId) && !isFeatureInstalled(config.toolId)) {
  const bundle = getBundleForTool(config.toolId);
  return reply.status(501).send({
    error: "Feature not installed",
    code: "FEATURE_NOT_INSTALLED",
    feature: bundle.id,
    featureName: bundle.name,
    estimatedSize: bundle.estimatedSize,
  });
}
```

This also applies to `restore-photo.ts` (which uses its own route handler, not the factory) and the pipeline pre-validation in `pipeline.ts`.

**For batch processing:** If a batch job targets an uninstalled tool, return 501 before processing starts (same as the route guard). Don't silently skip files.

**For pipelines:** The pipeline pre-validation loop already checks tool availability. Extend it to also check feature installation. Return a 501 with the specific bundle needed.

### API Endpoints

New routes — read endpoint is public (no `/admin/` prefix), mutation endpoints are admin-only:

```
GET  /api/v1/features
  Returns: list of all bundles with install status, sizes, enabled tools
  Auth: any authenticated user (read-only, needed by frontend for badges/tool page state)
  Response: {
    bundles: [{
      id: "background-removal",
      name: "Background Removal",
      description: "Remove image backgrounds with AI",
      status: "not_installed" | "installing" | "installed" | "error",
      installedVersion: "1.15.3" | null,
      estimatedSize: "500-700 MB",
      enablesTools: ["remove-background"],
      partialTools: ["passport-photo"],
      progress: { percent: 45, stage: "Downloading models..." } | null,
      error: "pip install failed: ..." | null,
      dependencies: [] | ["upscale-enhance"]
    }]
  }

POST /api/v1/admin/features/:bundleId/install
  Starts background installation of a feature bundle.
  Auth: admin only
  Response: { jobId: "uuid" }
  SSE progress at: GET /api/v1/jobs/:jobId/progress

POST /api/v1/admin/features/:bundleId/uninstall
  Removes a feature bundle (pip packages + models).
  Auth: admin only
  Response: { ok: true, freedSpace: "500 MB" }

GET  /api/v1/admin/features/disk-usage
  Returns total disk usage of /data/ai/.
  Auth: admin only
  Response: { totalBytes: 5368709120, byBundle: { "background-removal": 734003200, ... } }
```

### Background Job Mechanism

Feature installation runs as a background child process (not inline with the HTTP request):

1. `POST /admin/features/:bundleId/install` spawns the install script as a child process
2. Progress is streamed via stderr JSON lines → captured by the Node process → pushed to SSE listeners
3. The existing SSE infrastructure (`/api/v1/jobs/:jobId/progress`) is reused
4. Job status is persisted to the `jobs` table for recovery on restart
5. Only one install can run at a time (mutex). Concurrent install requests return 409 Conflict.

### Python Sidecar Changes

**dispatcher.py:**
- On startup, read `/data/ai/installed.json` to know which features are available
- Populate `available_modules` based on what's actually installed
- When a script is requested for an uninstalled feature, return a structured error: `{"error": "feature_not_installed", "feature": "background-removal", "message": "Background Removal is not installed"}`
- After a feature is installed, the dispatcher must be restarted (or sent a reload signal) to pick up new packages. The bridge handles this by killing and re-spawning the dispatcher.

**Python scripts:**
- Convert hard module-level imports in `colorize.py` and `restore.py` to lazy imports inside functions
- All scripts should check for their feature's models and return a clear "not installed" error if missing
- The `sys.path` must include `/data/ai/venv/lib/python3.X/site-packages/` (set by the dispatcher on startup based on installed.json)

**Bridge (bridge.ts):**
- Update `PYTHON_VENV_PATH` logic to prefer `/data/ai/venv/` when it exists
- Add a `restartDispatcher()` function called after feature install completes
- Handle the new `feature_not_installed` error type from the dispatcher

### Model Path Resolution

Currently models are at `/opt/models/`. With on-demand downloads, they'll be at `/data/ai/models/`. The resolution order:

1. `/opt/models/<model>` (Docker-baked, for backwards compatibility if someone builds a full image)
2. `/data/ai/models/<model>` (on-demand download location)
3. `~/.cache/ashim/<model>` (local dev fallback)

Environment variables (`U2NET_HOME`, etc.) are updated by the install script to point to `/data/ai/models/`.

### Dockerfile Changes

1. Remove all `pip install` commands for ML packages (lines 175-206)
2. Remove `download_models.py` COPY and RUN (lines 219-231)
3. Keep: Python 3 + pip + build-essential (do NOT purge build-essential)
4. Keep: numpy, Pillow, opencv-python-headless install (lightweight shared deps)
5. Add: COPY `feature-manifest.json` into the image
6. Add: COPY `install_feature.py` into the image
7. Update entrypoint to set up `/data/ai/` directory structure on first run
8. Update env vars: `MODELS_PATH=/data/ai/models` as default, fallback to `/opt/models`

### Frontend: Tool Page (Uninstalled State)

When a user navigates to an AI tool that isn't installed:

**For admins:**
- Show a card replacing the normal upload area:
  - Feature icon + name (e.g., "Background Removal")
  - "This feature requires an additional download (~500-700 MB)"
  - [Enable Feature] button
  - After clicking: progress bar with stage text, estimated time
  - On completion: page automatically transitions to the normal tool UI

**For non-admins:**
- Show: "This feature is not enabled. Ask your administrator to enable it in Settings."

### Frontend: Tool Grid (Badge)

AI tools in the grid show a small download icon overlay when not installed. When installed, the icon disappears and the tool looks like any other tool.

Tools with partial dependencies (e.g., passport-photo needs 2 bundles) show the badge until ALL required bundles are installed.

### Frontend: Settings Panel

New "AI Features" section in the settings dialog (admin only):

- List of all 6 feature bundles as cards
- Each card shows: name, description, status (installed/not installed/installing), disk usage
- Install/Uninstall buttons per bundle
- "Install All" button at the top
- Total AI disk usage summary at the bottom
- Progress bar during installation
- Dependency warnings (e.g., "Advanced Noise Removal requires Upscale & Face Enhance")

### Container Update Flow

When a user does `docker pull` + restart:

1. **Pull:** Only app code layers changed → ~50-100 MB download
2. **Startup:** Backend reads feature manifest from new image + installed.json from volume
3. **Comparison:**
   - If bundle package versions unchanged → no action, instant startup
   - If a package version bumped → `pip install --upgrade` from wheel cache (seconds)
   - If a model URL/version changed → re-download that model only
   - If Python major version changed → rebuild venv from cached wheels (rare, ~2-5 min)
4. **Dispatcher restart** if any packages changed

This check runs at startup, not blocking the HTTP server. AI features show "Updating..." status until the check completes.

### Error Handling

| Scenario | Behavior |
|---|---|
| No internet during install | Error with clear message: "Could not download packages. Check your internet connection." |
| Partial install (interrupted) | On next install attempt, detect incomplete state and resume/retry |
| Disk full | Error with disk usage info: "Not enough disk space. Need ~500 MB, only 200 MB available." |
| pip install failure | Error with the pip output. Bundle marked as "error" status, admin can retry. |
| Model download failure | Retry 3 times with exponential backoff. On final failure, mark bundle as partially installed (packages OK, models missing). |
| Container update breaks venv | Version manifest comparison detects mismatch, triggers venv rebuild from wheel cache |

### Testing Strategy

- **Unit tests:** Feature manifest parsing, version comparison logic, bundle dependency resolution
- **Integration tests:** Install/uninstall API endpoints, status reporting, SSE progress
- **E2E tests:** Admin enables a feature from settings, tool page transitions from "not installed" to working
- **Docker build test:** Verify base image builds without ML packages, verify feature-manifest.json is present
- **Install script test:** Run install script in a clean container, verify packages and models are correctly installed

### Migration Path

Since the new image is fundamentally different (no ML packages baked in), existing users upgrading from the full image will need to re-download their AI features. The Python ML packages are no longer in the system venv, so even if old model weights exist at `/opt/models/`, the features won't work without packages.

The first-run experience for upgrading users:

1. Detect this is an upgrade: no `/data/ai/installed.json` exists, but user data exists in `/data`
2. Show a one-time banner in the UI: "We've reduced the image size from 30 GB to 5 GB! AI features are now downloaded on-demand. Visit Settings → AI Features to enable the ones you need."
3. No automatic downloads — let the admin choose what to install
4. Old model weights at `/opt/models/` are ignored (they won't exist in the new image anyway since that layer is removed)

### Frontend: Feature Status Propagation

The frontend needs to know which tools are installed for three purposes: tool grid badges, tool page state, and settings panel.

**Features store** (`apps/web/src/stores/features-store.ts`):
- Zustand store fetched on app load (like `settings-store.ts`)
- Calls `GET /api/v1/features` to get bundle statuses
- Provides a derived mapping: `toolInstallStatus: Record<string, "installed" | "not_installed" | "installing" | "partial">` where "partial" means some but not all required bundles are installed (e.g., passport-photo with only Background Removal but not Face Detection)
- Provides `isToolInstalled(toolId): boolean` and `getBundlesForTool(toolId): BundleInfo[]` helpers
- Refreshes on install/uninstall completion

**Tool grid integration:**
- `ToolCard` checks `isToolInstalled(tool.id)` from the features store
- If not installed: show a download icon badge (similar to existing "Experimental" badge)
- The tool remains clickable (not disabled) — clicking navigates to the tool page where the install prompt appears
- `PYTHON_SIDECAR_TOOLS` constant is used to determine which tools are AI tools (only AI tools can be "not installed")

**Tool page integration:**
- `ToolPage` component checks feature status after the tool lookup
- If the user is admin and feature not installed: render `FeatureInstallPrompt` component instead of the normal tool UI
- If the user is non-admin and feature not installed: render "This feature is not enabled. Contact your administrator."
- The install prompt shows feature name, description, estimated size, and an "Enable" button
- After clicking "Enable": show progress bar with SSE-streamed progress, auto-transition to normal tool UI on completion

### Development and Testing

All development and testing is done via Docker containers — the same environment users run. Build the image locally and run it with:

```bash
docker run -d --name ashim -p 1349:1349 -v ashim-data:/data ghcr.io/ashim-hq/ashim:latest
```

Auth can be disabled for development by passing `-e AUTH_ENABLED=false`.

### Scope Boundaries

**In scope:**
- Dockerfile restructuring to remove ML packages and models
- Feature manifest system
- Install/uninstall API + background job
- Python sidecar changes for dynamic feature detection
- Frontend: tool page download prompt, grid badge, settings panel
- Container update handling with version manifest

**Out of scope (future work):**
- Additional rembg model variants as sub-downloads within Background Removal
- Automatic feature recommendations based on usage
- Download from private/custom model registries
- Bandwidth throttling for downloads
- Multiple venv support (e.g., different Python versions)
