import type { FastifyInstance } from "fastify";
import { registerBarcodeRead } from "./barcode-read.js";
import { registerBlurFaces } from "./blur-faces.js";
import { registerBorder } from "./border.js";
// Phase 3: Optimization extras
import { registerBulkRename } from "./bulk-rename.js";
// Phase 3: Layout & Composition
import { registerCollage } from "./collage.js";
import { registerColorAdjustments } from "./color-adjustments.js";
import { registerColorPalette } from "./color-palette.js";
import { registerCompare } from "./compare.js";
import { registerCompose } from "./compose.js";
import { registerCompress } from "./compress.js";
import { registerConvert } from "./convert.js";
import { registerCrop } from "./crop.js";
import { registerEraseObject } from "./erase-object.js";
import { registerFavicon } from "./favicon.js";
import { registerFindDuplicates } from "./find-duplicates.js";
import { registerGifTools } from "./gif-tools.js";
import { registerImageToPdf } from "./image-to-pdf.js";
// Phase 3: Utilities
import { registerInfo } from "./info.js";
import { registerOcr } from "./ocr.js";
import { registerQrGenerate } from "./qr-generate.js";
// Phase 4: AI Tools
import { registerRemoveBackground } from "./remove-background.js";
// Phase 3: Adjustments extra
import { registerReplaceColor } from "./replace-color.js";
import { registerResize } from "./resize.js";
import { registerRotate } from "./rotate.js";
import { registerSmartCrop } from "./smart-crop.js";
import { registerSplit } from "./split.js";
import { registerStripMetadata } from "./strip-metadata.js";
// Phase 3: Format & Conversion
import { registerSvgToRaster } from "./svg-to-raster.js";
import { registerTextOverlay } from "./text-overlay.js";
import { registerUpscale } from "./upscale.js";
import { registerVectorize } from "./vectorize.js";
import { registerWatermarkImage } from "./watermark-image.js";
// Phase 3: Watermark & Overlay
import { registerWatermarkText } from "./watermark-text.js";

/**
 * Registry that imports and registers all tool routes.
 * Each tool uses the createToolRoute factory from tool-factory.ts.
 */
export async function registerToolRoutes(app: FastifyInstance): Promise<void> {
  // Phase 2: Core tools
  registerResize(app);
  registerCrop(app);
  registerRotate(app);
  registerConvert(app);
  registerCompress(app);
  registerStripMetadata(app);
  registerColorAdjustments(app);

  // Phase 3: Watermark & Overlay
  registerWatermarkText(app);
  registerWatermarkImage(app);
  registerTextOverlay(app);
  registerCompose(app);

  // Phase 3: Utilities
  registerInfo(app);
  registerCompare(app);
  registerFindDuplicates(app);
  registerColorPalette(app);
  registerQrGenerate(app);
  registerBarcodeRead(app);

  // Phase 3: Layout & Composition
  registerCollage(app);
  registerSplit(app);
  registerBorder(app);

  // Phase 3: Format & Conversion
  registerSvgToRaster(app);
  registerVectorize(app);
  registerGifTools(app);

  // Phase 3: Optimization extras
  registerBulkRename(app);
  registerFavicon(app);
  registerImageToPdf(app);

  // Phase 3: Adjustments extra
  registerReplaceColor(app);

  // Phase 4: AI Tools
  registerRemoveBackground(app);
  registerUpscale(app);
  registerOcr(app);
  registerBlurFaces(app);
  registerEraseObject(app);
  registerSmartCrop(app);

  app.log.info("Tool routes registered (32 tools, 35 endpoints)");
}
