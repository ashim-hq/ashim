import {
  FEATURE_BUNDLES,
  getBundleForTool,
  getToolsForBundle,
  PYTHON_SIDECAR_TOOLS,
  TOOL_BUNDLE_MAP,
} from "@ashim/shared";
import { describe, expect, it } from "vitest";

describe("Feature bundles", () => {
  it("every PYTHON_SIDECAR_TOOL maps to exactly one bundle", () => {
    for (const toolId of PYTHON_SIDECAR_TOOLS) {
      const bundle = getBundleForTool(toolId);
      expect(bundle, `${toolId} has no bundle`).toBeDefined();
    }
  });

  it("getBundleForTool returns null for non-AI tools", () => {
    expect(getBundleForTool("resize")).toBeNull();
    expect(getBundleForTool("crop")).toBeNull();
  });

  it("getToolsForBundle returns correct tools", () => {
    const tools = getToolsForBundle("background-removal");
    expect(tools).toContain("remove-background");
    expect(tools).toContain("passport-photo");
    expect(tools).not.toContain("upscale");
  });

  it("all 6 bundles are defined", () => {
    expect(Object.keys(FEATURE_BUNDLES)).toHaveLength(6);
    expect(FEATURE_BUNDLES["background-removal"]).toBeDefined();
    expect(FEATURE_BUNDLES["face-detection"]).toBeDefined();
    expect(FEATURE_BUNDLES["object-eraser-colorize"]).toBeDefined();
    expect(FEATURE_BUNDLES["upscale-enhance"]).toBeDefined();
    expect(FEATURE_BUNDLES["photo-restoration"]).toBeDefined();
    expect(FEATURE_BUNDLES["ocr"]).toBeDefined();
  });

  it("TOOL_BUNDLE_MAP covers all sidecar tools", () => {
    const mappedTools = Object.keys(TOOL_BUNDLE_MAP);
    for (const toolId of PYTHON_SIDECAR_TOOLS) {
      expect(mappedTools, `${toolId} missing from TOOL_BUNDLE_MAP`).toContain(toolId);
    }
  });
});
