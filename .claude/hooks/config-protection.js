const fs = require("node:fs");
const input = JSON.parse(fs.readFileSync("/dev/stdin", "utf8"));
const filePath = input.tool_input?.file_path || "";

const protectedPatterns = [
  /biome\.json$/,
  /\.eslintrc/,
  /eslint\.config/,
  /\.prettierrc/,
  /prettier\.config/,
  /tsconfig.*\.json$/,
  /\.editorconfig$/,
];

if (protectedPatterns.some((p) => p.test(filePath))) {
  console.log(
    `BLOCKED: Cannot modify config file "${filePath}". Fix the code to match the config, not the other way around.`,
  );
  process.exit(2);
}
