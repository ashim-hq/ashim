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

Six user-facing bundles, named by what they enable (not by model names):

| Feature Name | Python Packages | Models | Tools Enabled | Est. Size |
|---|---|---|---|---|
| **Background Removal** | rembg, onnxruntime(-gpu) | birefnet-general-lite (default) | remove-background, passport-photo (partial) | ~500-700 MB |
| **Face Detection** | mediapipe | blaze_face, face_landmarker | blur-faces, red-eye-removal, smart-crop, passport-photo (partial) | ~200-300 MB |
| **Object Eraser & Colorize** | onnxruntime(-gpu) if not already installed | LaMa ONNX, DDColor ONNX, OpenCV colorize | erase-object, colorize, restore-photo (partial) | ~600-800 MB |
| **Upscale & Face Enhance** | torch, torchvision, realesrgan, codeformer-pip (--no-deps), gfpgan, basicsr, lpips | RealESRGAN x4plus, GFPGANv1.3, CodeFormer (.pth + .onnx), facexlib models | upscale, enhance-faces, restore-photo (partial) | ~4-5 GB |
| **OCR** | paddlepaddle(-gpu), paddleocr | PP-OCRv5 (7 models), PaddleOCR-VL 1.5 | ocr (balanced + best tiers) | ~3-4 GB |
| **Advanced Noise Removal** | _(requires Upscale bundle for torch)_ | SCUNet, NAFNet | noise-removal (quality + maximum tiers) | ~100 MB |

Notes:
- `passport-photo` needs both Background Removal + Face Detection
- `restore-photo` needs Object Eraser & Colorize + optionally Upscale & Face Enhance (for face restoration step)
- `noise-removal` quick/balanced tiers work without any bundle (uses OpenCV)
- `ocr` fast tier works without any bundle (uses Tesseract, pre-installed in base)
- Advanced Noise Removal depends on the Upscale & Face Enhance bundle (shared PyTorch dependency)

### Bundle Dependencies

```
Background Removal ─── standalone
Face Detection ─────── standalone
Object Eraser & Colorize ── standalone (uses onnxruntime from Background Removal if installed, otherwise installs it)
Upscale & Face Enhance ─── standalone
OCR ────────────────── standalone
Advanced Noise Removal ─── depends on "Upscale & Face Enhance" (for PyTorch)
```

onnxruntime is needed by both Background Removal and Object Eraser & Colorize. The install script installs it with the first bundle that needs it, and skips it for subsequent bundles.

### Persistent Storage

All AI data lives under `/data/ai/` on the existing Docker volume (no docker-compose changes):

```
/data/ai/
  venv/           # Python virtual environment with installed packages
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
        "amd64": ["onnxruntime-gpu==1.20.1"],
        "arm64": ["onnxruntime==1.20.1", "rembg[cpu]==2.0.62"]
      },
      "pipFlags": {},
      "models": [
        {
          "id": "birefnet-general-lite",
          "name": "Default model",
          "required": true,
          "downloadFn": "rembg_session",
          "args": ["birefnet-general-lite"]
        }
      ],
      "optionalModels": [
        {
          "id": "u2net",
          "name": "U2-Net (lightweight)",
          "downloadFn": "rembg_session",
          "args": ["u2net"]
        },
        {
          "id": "birefnet-general",
          "name": "BiRefNet General (high quality)",
          "downloadFn": "rembg_session",
          "args": ["birefnet-general"]
        }
      ],
      "enablesTools": ["remove-background"],
      "partialTools": ["passport-photo"]
    },
    "upscale-enhance": {
      "name": "Upscale & Face Enhance",
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
        { "id": "facexlib-parsing", "url": "https://github.com/xinntao/facexlib/releases/download/v0.2.2/parsing_parsenet.pth", "path": "gfpgan/facelib/parsing_parsenet.pth", "minSize": 85000000 }
      ],
      "enablesTools": ["upscale", "enhance-faces"],
      "partialTools": ["restore-photo"]
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

### API Endpoints

New routes under `/api/v1/admin/features/`:

```
GET  /api/v1/admin/features
  Returns: list of all bundles with install status, sizes, enabled tools
  Auth: any authenticated user (read-only)
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
