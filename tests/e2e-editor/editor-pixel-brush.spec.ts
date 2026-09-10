import type { Page } from "@playwright/test";
import { expect, loadTestImage, selectTool, test } from "./helpers";

// Regression coverage for issue #829: the blur brush (and sharpen and smudge,
// which share the same pixel-brush hook) snapshotted the whole document and
// added that snapshot as a new full-size image object. A single click stacked
// an opaque copy of the entire image on top of the original, and dragging it
// with the move tool revealed the "duplicate" underneath. A stroke object must
// carry only the pixels the brush touched and stay transparent everywhere else.

type Rgba = { r: number; g: number; b: number; a: number };

type StageView = {
  Konva?: {
    stages: Array<{
      x(): number;
      y(): number;
      scaleX(): number;
      find(selector: string): Array<{
        id(): string;
        image(): CanvasImageSource | undefined;
        width(): number;
        height(): number;
      }>;
    }>;
  };
};

// Image *objects* carry their store id; the source image node has none.
function countImageObjects(page: Page): Promise<number> {
  return page.evaluate(() => {
    const konva = (window as unknown as StageView).Konva;
    if (!konva?.stages?.length) return 0;
    return konva.stages[0].find("Image").filter((node) => node.id()).length;
  });
}

// Read one document pixel from the newest image object's own bitmap.
function readStrokeObjectPixel(page: Page, x: number, y: number): Promise<Rgba | null> {
  return page.evaluate(
    ({ x, y }) => {
      const konva = (window as unknown as StageView).Konva;
      if (!konva?.stages?.length) return null;
      const objects = konva.stages[0].find("Image").filter((node) => node.id());
      const node = objects[objects.length - 1];
      const source = node?.image();
      if (!node || !source) return null;
      const scratch = document.createElement("canvas");
      scratch.width = node.width();
      scratch.height = node.height();
      const ctx = scratch.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(source, 0, 0);
      const d = ctx.getImageData(x, y, 1, 1).data;
      return { r: d[0], g: d[1], b: d[2], a: d[3] };
    },
    { x, y },
  );
}

// Screen position of a document pixel: the stage carries the editor's pan as
// its position and the zoom as its scale.
async function screenPointForDocumentPixel(page: Page, docX: number, docY: number) {
  const canvas = page.locator('[data-testid="editor-canvas"] canvas').first();
  const box = await canvas.boundingBox();
  if (!box) throw new Error("editor canvas has no bounding box");
  const view = await page.evaluate(() => {
    const stage = (window as unknown as StageView).Konva?.stages[0];
    if (!stage) return null;
    return { x: stage.x(), y: stage.y(), zoom: stage.scaleX() };
  });
  if (!view) throw new Error("Konva stage not found");
  return {
    x: box.x + view.x + (docX + 0.5) * view.zoom,
    y: box.y + view.y + (docY + 0.5) * view.zoom,
  };
}

test.describe("Editor pixel brushes (issue #829)", () => {
  test("a blur brush click adds only the brushed pixels, not a copy of the whole image", async ({
    editorPage: page,
  }) => {
    // The fixture is a flat, fully opaque rgb(255,100,50) 200x150 image, so the
    // blur leaves colours untouched and alpha is what tells a brushed pixel
    // from an untouched one.
    await loadTestImage(page);
    await page.waitForTimeout(500);

    await selectTool(page, "blur-brush");
    const center = await screenPointForDocumentPixel(page, 100, 75);
    await page.mouse.click(center.x, center.y);

    // One click adds exactly one stroke object.
    await expect.poll(() => countImageObjects(page), { timeout: 10_000 }).toBe(1);

    // Under the click the stroke carries the (blurred) image pixel, opaque.
    await expect
      .poll(() => readStrokeObjectPixel(page, 100, 75), { timeout: 10_000 })
      .toEqual({ r: 255, g: 100, b: 50, a: 255 });

    // Far from the click the stroke object must be transparent. Before the fix
    // it was an opaque copy of the entire document.
    const corner = await readStrokeObjectPixel(page, 2, 2);
    expect(corner).not.toBeNull();
    expect(corner?.a).toBe(0);
  });
});
