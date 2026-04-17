import type { ZodIssue } from "zod";

export function formatZodErrors(issues: ZodIssue[]): string {
  return issues
    .map((i) => (i.path.length > 0 ? `${i.path.join(".")}: ${i.message}` : i.message))
    .join("; ");
}
