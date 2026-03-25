import { create } from "zustand";
import { apiDeleteUserFiles, apiListFiles, apiUploadUserFiles, type UserFile } from "@/lib/api";

interface FilesPageState {
  files: UserFile[];
  total: number;
  selectedFileId: string | null;
  checkedIds: Set<string>;
  activeTab: "recent" | "upload";
  searchQuery: string;
  loading: boolean;
  error: string | null;

  fetchFiles: () => Promise<void>;
  uploadFiles: (files: File[]) => Promise<void>;
  deleteChecked: () => Promise<void>;
  selectFile: (id: string | null) => void;
  toggleChecked: (id: string) => void;
  toggleCheckAll: () => void;
  setSearchQuery: (q: string) => void;
  setActiveTab: (tab: "recent" | "upload") => void;
}

export const useFilesPageStore = create<FilesPageState>((set, get) => ({
  files: [],
  total: 0,
  selectedFileId: null,
  checkedIds: new Set(),
  activeTab: "recent",
  searchQuery: "",
  loading: false,
  error: null,

  fetchFiles: async () => {
    set({ loading: true, error: null });
    try {
      const { searchQuery } = get();
      const result = await apiListFiles({ search: searchQuery || undefined, limit: 100 });
      set({ files: result.files, total: result.total, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load files", loading: false });
    }
  },

  uploadFiles: async (files) => {
    set({ loading: true, error: null });
    try {
      await apiUploadUserFiles(files);
      await get().fetchFiles();
      set({ activeTab: "recent" });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Upload failed", loading: false });
    }
  },

  deleteChecked: async () => {
    const { checkedIds } = get();
    if (checkedIds.size === 0) return;
    set({ loading: true, error: null });
    try {
      await apiDeleteUserFiles(Array.from(checkedIds));
      set({ checkedIds: new Set(), selectedFileId: null });
      await get().fetchFiles();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Delete failed", loading: false });
    }
  },

  selectFile: (id) => set({ selectedFileId: id }),
  toggleChecked: (id) => {
    const { checkedIds } = get();
    const next = new Set(checkedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    set({ checkedIds: next });
  },
  toggleCheckAll: () => {
    const { files, checkedIds } = get();
    set({
      checkedIds: checkedIds.size === files.length ? new Set() : new Set(files.map((f) => f.id)),
    });
  },
  setSearchQuery: (q) => set({ searchQuery: q }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
