# Stitch tool design

Join multiple images side by side (horizontal) or top to bottom (vertical) into a single output image. Distinct from the existing collage tool, which arranges images in fixed grid layouts with uniform cell sizes. Stitch preserves aspect ratios and places images linearly.

Motivated by user feedback: people want a simple way to combine images without grid presets or forced cropping. Existing open-source tools either don't support this or bury it behind complex collage UIs.

## Approach

Standalone tool (Approach A). New route and component following the same pattern as the existing collage tool. No image-engine changes since multi-image operations use Sharp directly. No shared abstraction with collage - the ~50 lines of duplicated multipart parsing is a small price for keeping two clearly different tools separate.

## API

### Endpoint

`POST /api/v1/tools/stitch`

New file: `apps/api/src/routes/tools/stitch.ts`

### Input

Multipart form data:
- Multiple `file` fields (2+ images)
- One `settings` JSON field

### Settings schema (Zod)

```
direction:       enum "horizontal" | "vertical"     default "horizontal"
resize:          enum "fit" | "original"             default "fit"
gap:             number 0-100                        default 0
backgroundColor: hex string regex /^#[0-9a-fA-F]{6}$/  default "#FFFFFF"
format:          enum "png" | "jpeg" | "webp"        default "png"
```

### Processing logic

1. Validate all files with `validateImageBuffer()`.
2. Read metadata (width, height) for every image using `sharp().metadata()`.
3. Resize:
   - `fit`: for horizontal, scale all images to match the shortest image's height. For vertical, scale all to match the narrowest image's width. Downscale only - if an image is already smaller than the target, keep it as-is and center it.
   - `original`: keep all images at their original dimensions. Center smaller images on the cross-axis, fill empty space with backgroundColor.
4. Compute canvas dimensions:
   - Horizontal: width = sum of all image widths + gap * (N-1). Height = max height after resize.
   - Vertical: height = sum of all image heights + gap * (N-1). Width = max width after resize.
5. Canvas size check: if canvas width * height exceeds a reasonable pixel limit (e.g. 100 megapixels), reject the request with a 422 error before allocating memory. This prevents Sharp from crashing on massive canvases when many large images are stitched.
6. Create blank canvas with `sharp({ create: { width, height, channels: 4, background } })`.
7. For each image, compute position (running x/y offset + gap) and add to composites array.
8. Composite all images onto canvas, output in requested format.
9. Write to workspace, return standard response shape: `{ jobId, downloadUrl, originalSize, processedSize }`.

### Registration

Import `registerStitch` in `apps/api/src/routes/tools/index.ts` and add to `toolRegistrations` array.

## Frontend

New file: `apps/web/src/components/tools/stitch-settings.tsx`

Uses `useFileStore` directly (Pattern B, like collage) with manual `fetch()` call since it sends multiple files.

### UI layout

Always visible:
- Direction toggle: two buttons, "Horizontal" / "Vertical", default Horizontal
- Stitch button: "Stitch N images" (disabled when < 2 files)

Collapsed "Advanced" section:
- Resize mode: two buttons, "Fit" / "Original", default Fit
- Gap: range slider 0-100px, default 0
- Background color: color input, default #FFFFFF
- Output format: three buttons, PNG / JPEG / WebP, default PNG

Download link shown on success.

### Registration

Add to `apps/web/src/lib/tool-registry.tsx`:
- Lazy import of `StitchSettings`
- `displayMode: "no-comparison"` (output is a new combined image, no before/after)

## Tool registration

Add to `packages/shared/src/constants.ts` TOOLS array:

```
id:          "stitch"
name:        "Stitch"
description: "Join images side by side or top to bottom"
category:    "layout"
icon:        "Columns"
route:       "/stitch"
```

Add i18n strings in `packages/shared/src/i18n/en.ts` following existing patterns.

No changes to `apps/web/src/App.tsx` - the catch-all `/:toolId` route handles it.

## Files changed

New files (2):
- `apps/api/src/routes/tools/stitch.ts`
- `apps/web/src/components/tools/stitch-settings.tsx`

Modified files (4):
- `packages/shared/src/constants.ts` - add TOOLS entry
- `packages/shared/src/i18n/en.ts` - add i18n strings
- `apps/api/src/routes/tools/index.ts` - register route
- `apps/web/src/lib/tool-registry.tsx` - register component

## Not changed

- `packages/image-engine/` - multi-image ops use Sharp directly
- `apps/web/src/App.tsx` - catch-all route handles it
- No new dependencies

## Testing

- Unit test: canvas dimension calculation, resize logic for mismatched image sizes
- Integration test: POST to `/api/v1/tools/stitch` with 2-3 test fixture images, verify output dimensions match expected canvas size
- Edge cases: single image (should reject), images with very different aspect ratios, gap > 0, format conversion, canvas size limit rejection
