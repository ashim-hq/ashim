# Translation guide

Stirling Image ships with English by default. The i18n system is designed so adding a new language is straightforward. This page walks you through the process.

## How translations work

All UI strings live in `packages/shared/src/i18n/`. The reference file is `en.ts`, which exports a typed object with every string the app uses. Other languages are separate files (e.g., `de.ts`, `fr.ts`) that export the same shape.

The `TranslationKeys` type is derived from the English file, so TypeScript will catch any missing keys in your translation.

## Adding a new language

### 1. Fork and branch

Fork the repository and create a new branch from `main`:

```bash
git checkout -b feat/add-german-translations
```

### 2. Copy the reference file

```bash
cp packages/shared/src/i18n/en.ts packages/shared/src/i18n/de.ts
```

### 3. Translate the strings

Open `de.ts` and translate every string value. Keep the object structure and keys exactly the same. Only change the values.

```ts
// packages/shared/src/i18n/de.ts
export const de = {
  common: {
    upload: "Vom Computer hochladen",
    process: "Verarbeiten",
    download: "Herunterladen",
    cancel: "Abbrechen",
    // ... translate all entries
  },
  tools: {
    resize: {
      name: "Größe ändern",
      description: "Größe nach Pixeln, Prozent oder Social-Media-Vorgaben ändern",
    },
    // ... translate all tool entries
  },
  // ... translate all sections: settings, auth, pipeline, nav
} as const;
```

Things to keep in mind:

- Preserve any interpolation placeholders if they exist in the future (e.g., `{count}`, `{filename}`).
- Do not translate object keys, only values.
- Keep the `as const` assertion at the end.

### 4. Export the new language

Edit `packages/shared/src/i18n/index.ts` to include your language:

```ts
export type { TranslationKeys } from "./en.js";
export { en } from "./en.js";
export { de } from "./de.js";
```

### 5. Register in the frontend

The frontend needs to know about the new locale. Add it to the locale selector so users can switch languages. The exact location depends on how the locale switcher is implemented at the time of your contribution. Search for where `en` is referenced in the frontend and add your language alongside it.

### 6. Test it

```bash
pnpm typecheck    # will catch missing or mistyped keys
pnpm dev          # manually verify strings appear correctly
```

TypeScript is your safety net here. If your translation file is missing a key or has the wrong structure, `pnpm typecheck` will fail with a clear error.

### 7. Submit a PR

Push your branch and open a pull request. In the PR description, list which sections you translated and any strings you intentionally left in English (technical terms, proper nouns, etc.).

## Strings that don't need translation

Some strings are the same across languages: tool names that are English loanwords, technical terms, abbreviations. If a string is identical in your language, just leave it as the English value. No special configuration is needed.

## Adding new translation keys

If you are adding a new feature that needs new UI strings:

1. Add the new keys to `packages/shared/src/i18n/en.ts` first. This is the reference file.
2. Add translations to any other language files you can. If you can't translate them, leave the English value as a placeholder and note it in your PR.
3. Run `pnpm typecheck` to make sure all language files still satisfy the `TranslationKeys` type.

## File reference

| File | Purpose |
|------|---------|
| `packages/shared/src/i18n/en.ts` | English strings (reference locale) |
| `packages/shared/src/i18n/index.ts` | Exports all locales and the `TranslationKeys` type |
| `packages/shared/src/constants.ts` | Tool registry (names/descriptions also live here) |
