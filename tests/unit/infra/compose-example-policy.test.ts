import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

/**
 * The last release's version. semantic-release writes it in the release
 * commit, a little before the publish gate moves the `latest` tag, and between
 * releases it lags main by everything merged since. That lag is the gap this
 * policy guards; the same reading is what release-version-policy relies on.
 */
const publishedVersion: string = JSON.parse(
  readFileSync(path.resolve(root, "package.json"), "utf8"),
).version;

/**
 * Strings a copy-paste example may name only once the image that understands
 * them has shipped. Each value is the first release that does.
 *
 * #1027: the least-privilege role split merged with every Compose example
 * rewritten to use it, but the published 2.2.0 image reads only DATABASE_URL,
 * never creates the runtime role, and looped on `Role "snapotter_app" does not
 * exist`. Public examples pin `snapotter/snapotter:latest`, so they have to
 * boot on whatever `latest` currently is, not on main.
 *
 * Opt-in per setting: anything that reaches the docs before its image ships
 * needs a row here, or the scan cannot see it.
 */
const IMAGE_DEPENDENT_MARKERS: Record<string, string> = {
  DATABASE_MIGRATION_URL: "2.3.0",
  POSTGRES_APP_USER: "2.3.0",
  POSTGRES_APP_PASSWORD: "2.3.0",
  snapotter_app: "2.3.0",
};

/** Tagged, digest-pinned, or bare: all of them resolve to a published image. */
const APP_IMAGE = /(?:ghcr\.io\/snapotter-hq|snapotter)\/snapotter(?![A-Za-z0-9_.-])/;
const FENCE = /^[ \t]*```[^\n]*\n([\s\S]*?)^[ \t]*```/gm;

/** Surfaces the scan must have found an example in, or it proved nothing. */
const SURFACES_WITH_EXAMPLES = ["README.md", "DOCKERHUB.md", "apps/docs/guide/deployment.md"];

function parseVersion(version: string): number[] {
  const parts = version.split(".").map(Number);
  expect(parts, `not a release version: ${version}`).toHaveLength(3);
  for (const part of parts) expect(Number.isInteger(part), version).toBe(true);
  return parts;
}

function isPublished(since: string, published: string): boolean {
  const a = parseVersion(since);
  const b = parseVersion(published);
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] < b[i];
  }
  return true;
}

/** Fenced blocks that reference the app image, with the line the fence opens on. */
function appImageBlocks(markdown: string): Array<{ line: number; text: string }> {
  const blocks: Array<{ line: number; text: string }> = [];
  for (const match of markdown.matchAll(FENCE)) {
    if (!APP_IMAGE.test(match[1])) continue;
    blocks.push({ line: markdown.slice(0, match.index).split("\n").length, text: match[1] });
  }
  return blocks;
}

/**
 * Every app-image block that names a marker the published image does not
 * understand, as `line: marker` strings.
 */
function unpublishedMarkers(markdown: string, published: string): string[] {
  const found: string[] = [];
  for (const { line, text } of appImageBlocks(markdown)) {
    for (const [marker, since] of Object.entries(IMAGE_DEPENDENT_MARKERS)) {
      if (isPublished(since, published)) continue;
      if (text.includes(marker)) found.push(`line ${line}: ${marker} (needs ${since})`);
    }
  }
  return found;
}

function markdownFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      out.push(...markdownFiles(abs));
    } else if (entry.name.endsWith(".md")) {
      out.push(abs);
    }
  }
  return out;
}

/** README, the Docker Hub overview, and the docs site in every locale. */
function publicSurfaces(): string[] {
  return [
    path.resolve(root, "README.md"),
    path.resolve(root, "DOCKERHUB.md"),
    ...markdownFiles(path.resolve(root, "apps/docs")),
  ].sort();
}

function composeExample(image: string): string {
  return [
    "Save this as `compose.yaml`:",
    "",
    "```yaml",
    "services:",
    "  snapotter:",
    `    image: ${image}`,
    "    environment:",
    "      DATABASE_URL: postgres://snapotter_app:snapotter_app@postgres:5432/snapotter",
    "      DATABASE_MIGRATION_URL: postgres://snapotter:snapotter@postgres:5432/snapotter",
    "```",
  ].join("\n");
}

describe("compose example policy", () => {
  it("flags an example that names a setting the published image lacks", () => {
    const example = composeExample("snapotter/snapotter:latest");

    expect(unpublishedMarkers(example, "2.2.0")).toEqual([
      "line 3: DATABASE_MIGRATION_URL (needs 2.3.0)",
      "line 3: snapotter_app (needs 2.3.0)",
    ]);
    expect(unpublishedMarkers(example, "2.3.0")).toEqual([]);
    expect(unpublishedMarkers(example, "2.10.0")).toEqual([]);
  });

  it("treats the GHCR mirror as the same image", () => {
    const example = composeExample("ghcr.io/snapotter-hq/snapotter:latest");

    expect(unpublishedMarkers(example, "2.2.0")).toHaveLength(2);
  });

  it("ignores blocks that do not reference the app image", () => {
    const managed = [
      "```bash",
      "DATABASE_URL=postgres://snapotter_app:secret@db.example.com:5432/snapotter",
      "DATABASE_MIGRATION_URL=postgres://snapotter:owner@db.example.com:5432/snapotter",
      "```",
    ].join("\n");

    expect(unpublishedMarkers(managed, "2.2.0")).toEqual([]);
  });

  it("keeps every public Compose example bootable on the published image", () => {
    const problems: string[] = [];
    const examples = new Map<string, number>();
    for (const file of publicSurfaces()) {
      const markdown = readFileSync(file, "utf8");
      const rel = path.relative(root, file);
      examples.set(rel, appImageBlocks(markdown).length);
      for (const hit of unpublishedMarkers(markdown, publishedVersion)) {
        problems.push(`${rel} ${hit}`);
      }
    }

    for (const surface of SURFACES_WITH_EXAMPLES) {
      expect(
        examples.get(surface),
        `${surface} has no example referencing the app image`,
      ).toBeGreaterThan(0);
    }
    expect(
      problems,
      `these examples reference the app image (published: ${publishedVersion}) but use settings only a newer image understands`,
    ).toEqual([]);
  });
});
