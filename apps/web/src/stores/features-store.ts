import type { FeatureBundleState } from "@ashim/shared";
import { TOOL_BUNDLE_MAP } from "@ashim/shared";
import { create } from "zustand";
import { apiGet } from "@/lib/api";

interface FeaturesState {
  bundles: FeatureBundleState[];
  loaded: boolean;
  fetch: () => Promise<void>;
  refresh: () => Promise<void>;
  isToolInstalled: (toolId: string) => boolean;
  getBundleForTool: (toolId: string) => FeatureBundleState | null;
}

export const useFeaturesStore = create<FeaturesState>((set, get) => ({
  bundles: [],
  loaded: false,

  fetch: async () => {
    if (get().loaded) return;
    try {
      const data = await apiGet<{ bundles: FeatureBundleState[] }>("/v1/features");
      set({ bundles: data.bundles, loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  refresh: async () => {
    try {
      const data = await apiGet<{ bundles: FeatureBundleState[] }>("/v1/features");
      set({ bundles: data.bundles, loaded: true });
    } catch {}
  },

  isToolInstalled: (toolId: string) => {
    const bundleId = TOOL_BUNDLE_MAP[toolId];
    if (!bundleId) return true;
    const bundle = get().bundles.find((b) => b.id === bundleId);
    return bundle?.status === "installed";
  },

  getBundleForTool: (toolId: string) => {
    const bundleId = TOOL_BUNDLE_MAP[toolId];
    if (!bundleId) return null;
    return get().bundles.find((b) => b.id === bundleId) ?? null;
  },
}));
