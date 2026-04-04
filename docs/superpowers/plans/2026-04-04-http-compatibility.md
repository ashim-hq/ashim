# HTTP/Non-Secure Context Compatibility - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all frontend features work over plain HTTP on non-localhost addresses (LAN/NAS deployments).

**Architecture:** Add `generateId()` and `copyToClipboard()` utilities to `apps/web/src/lib/utils.ts`, then replace all 10 call sites across 7 files. Test the utilities with Vitest.

**Tech Stack:** TypeScript, Vitest (jsdom), `crypto.getRandomValues()`, `document.execCommand("copy")`

**Spec:** `docs/superpowers/specs/2026-04-04-http-compatibility-design.md`

---

### Task 1: Add `generateId()` utility and test

**Files:**
- Modify: `apps/web/src/lib/utils.ts`
- Create: `tests/unit/web/utils.test.ts`

- [ ] **Step 1: Write the test file**

Create `tests/unit/web/utils.test.ts`:

```ts
// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { generateId } from "../../../apps/web/src/lib/utils";

describe("generateId", () => {
  it("returns a valid UUID v4 string", () => {
    const id = generateId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it("returns unique values on successive calls", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:unit -- tests/unit/web/utils.test.ts`
Expected: FAIL - `generateId` is not exported from utils.

- [ ] **Step 3: Implement `generateId` in utils.ts**

Add to `apps/web/src/lib/utils.ts` after the existing `cn` function:

```ts
export function generateId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test:unit -- tests/unit/web/utils.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/utils.ts tests/unit/web/utils.test.ts
git commit -m "feat: add generateId() utility for non-secure context compatibility"
```

---

### Task 2: Add `copyToClipboard()` utility and test

**Files:**
- Modify: `apps/web/src/lib/utils.ts`
- Modify: `tests/unit/web/utils.test.ts`

- [ ] **Step 1: Write the tests**

Append to `tests/unit/web/utils.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { copyToClipboard } from "../../../apps/web/src/lib/utils";

describe("copyToClipboard", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns true when clipboard API succeeds", async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    expect(await copyToClipboard("hello")).toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("hello");
  });

  it("falls back to execCommand when clipboard API fails", async () => {
    Object.assign(navigator, { clipboard: undefined });
    const execCommand = vi.spyOn(document, "execCommand").mockReturnValue(true);
    expect(await copyToClipboard("hello")).toBe(true);
    expect(execCommand).toHaveBeenCalledWith("copy");
  });

  it("returns false when both approaches fail", async () => {
    Object.assign(navigator, { clipboard: undefined });
    vi.spyOn(document, "execCommand").mockImplementation(() => {
      throw new Error("not supported");
    });
    expect(await copyToClipboard("hello")).toBe(false);
  });
});
```

Note: update the `import` line at the top of the file to also import `afterEach` and `vi` alongside the existing `describe, expect, it`, and import `copyToClipboard` from the same utils path.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:unit -- tests/unit/web/utils.test.ts`
Expected: FAIL - `copyToClipboard` is not exported from utils.

- [ ] **Step 3: Implement `copyToClipboard` in utils.ts**

Add to `apps/web/src/lib/utils.ts` after `generateId`:

```ts
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test:unit -- tests/unit/web/utils.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/utils.ts tests/unit/web/utils.test.ts
git commit -m "feat: add copyToClipboard() utility with execCommand fallback"
```

---

### Task 3: Replace `crypto.randomUUID()` in `use-tool-processor.ts`

**Files:**
- Modify: `apps/web/src/hooks/use-tool-processor.ts`

- [ ] **Step 1: Add import**

Add `generateId` to imports at the top of `apps/web/src/hooks/use-tool-processor.ts`:

```ts
import { generateId } from "@/lib/utils";
```

- [ ] **Step 2: Replace line 91**

Change:
```ts
      const clientJobId = crypto.randomUUID();
```
To:
```ts
      const clientJobId = generateId();
```

- [ ] **Step 3: Replace line 260**

Change:
```ts
      const clientJobId = crypto.randomUUID();
```
To:
```ts
      const clientJobId = generateId();
```

- [ ] **Step 4: Verify no remaining `crypto.randomUUID` references**

Run: `grep -n "crypto.randomUUID" apps/web/src/hooks/use-tool-processor.ts`
Expected: No output.

- [ ] **Step 5: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/hooks/use-tool-processor.ts
git commit -m "fix: replace crypto.randomUUID with generateId in use-tool-processor"
```

---

### Task 4: Replace `crypto.randomUUID()` in AI tool settings

**Files:**
- Modify: `apps/web/src/components/tools/ocr-settings.tsx`
- Modify: `apps/web/src/components/tools/erase-object-settings.tsx`

- [ ] **Step 1: Update `ocr-settings.tsx`**

Add import at the top:
```ts
import { generateId } from "@/lib/utils";
```

Replace line 52:
```ts
    const clientJobId = crypto.randomUUID();
```
With:
```ts
    const clientJobId = generateId();
```

- [ ] **Step 2: Update `erase-object-settings.tsx`**

Add import at the top:
```ts
import { generateId } from "@/lib/utils";
```

Replace line 52:
```ts
    const clientJobId = crypto.randomUUID();
```
With:
```ts
    const clientJobId = generateId();
```

- [ ] **Step 3: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/tools/ocr-settings.tsx apps/web/src/components/tools/erase-object-settings.tsx
git commit -m "fix: replace crypto.randomUUID with generateId in AI tool settings"
```

---

### Task 5: Replace `crypto.randomUUID()` in pipeline/automation

**Files:**
- Modify: `apps/web/src/components/tools/pipeline-builder.tsx`
- Modify: `apps/web/src/pages/automate-page.tsx`

- [ ] **Step 1: Update `pipeline-builder.tsx`**

Add import at the top:
```ts
import { generateId } from "@/lib/utils";
```

Replace line 104:
```ts
        id: crypto.randomUUID(),
```
With:
```ts
        id: generateId(),
```

- [ ] **Step 2: Update `automate-page.tsx`**

Add import at the top:
```ts
import { generateId } from "@/lib/utils";
```

Replace line 147:
```ts
      id: crypto.randomUUID(),
```
With:
```ts
      id: generateId(),
```

- [ ] **Step 3: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/tools/pipeline-builder.tsx apps/web/src/pages/automate-page.tsx
git commit -m "fix: replace crypto.randomUUID with generateId in pipeline/automation"
```

---

### Task 6: Replace `navigator.clipboard` in all 4 call sites

**Files:**
- Modify: `apps/web/src/components/settings/settings-dialog.tsx`
- Modify: `apps/web/src/components/tools/color-palette-settings.tsx`
- Modify: `apps/web/src/components/tools/ocr-settings.tsx`
- Modify: `apps/web/src/components/tools/barcode-read-settings.tsx`

- [ ] **Step 1: Update `settings-dialog.tsx`**

Add `copyToClipboard` to imports (the file already imports from `@/lib/utils` if `cn` is used, otherwise add a new import):
```ts
import { copyToClipboard } from "@/lib/utils";
```

Replace lines 1147-1152:
```ts
  const copyKey = useCallback((key: string) => {
    navigator.clipboard.writeText(key).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);
```
With:
```ts
  const copyKey = useCallback(async (key: string) => {
    const ok = await copyToClipboard(key);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);
```

- [ ] **Step 2: Update `color-palette-settings.tsx`**

Add import:
```ts
import { copyToClipboard } from "@/lib/utils";
```

Replace lines 45-53:
```ts
  const copyColor = async (color: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    } catch {
      // Fallback: silent fail
    }
  };
```
With:
```ts
  const copyColor = async (color: string, idx: number) => {
    const ok = await copyToClipboard(color);
    if (ok) {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    }
  };
```

- [ ] **Step 3: Update `ocr-settings.tsx`**

This file already has a `generateId` import from Task 4. Add `copyToClipboard` to the same import:
```ts
import { copyToClipboard, generateId } from "@/lib/utils";
```

Replace lines 118-124:
```ts
  const handleCopy = async () => {
    if (text) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
```
With:
```ts
  const handleCopy = async () => {
    if (text) {
      const ok = await copyToClipboard(text);
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };
```

- [ ] **Step 4: Update `barcode-read-settings.tsx`**

Add import:
```ts
import { copyToClipboard } from "@/lib/utils";
```

Replace lines 45-54:
```ts
  const copyText = async () => {
    if (!result?.text) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback: silent fail
    }
  };
```
With:
```ts
  const copyText = async () => {
    if (!result?.text) return;
    const ok = await copyToClipboard(result.text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };
```

- [ ] **Step 5: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/settings/settings-dialog.tsx apps/web/src/components/tools/color-palette-settings.tsx apps/web/src/components/tools/ocr-settings.tsx apps/web/src/components/tools/barcode-read-settings.tsx
git commit -m "fix: replace navigator.clipboard with copyToClipboard utility"
```

---

### Task 7: Final verification

- [ ] **Step 1: Verify no remaining direct usages**

Run: `grep -rn "crypto\.randomUUID\|navigator\.clipboard" apps/web/src/`
Expected: No output.

- [ ] **Step 2: Run full lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 3: Run full test suite**

Run: `pnpm test`
Expected: All existing tests pass, plus the 5 new tests in `utils.test.ts`.

- [ ] **Step 4: Commit any lint fixes if needed**

```bash
git add -A
git commit -m "fix: lint fixes for http compatibility changes"
```

(Skip if lint passed cleanly.)
