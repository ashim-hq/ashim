const fs = require("node:fs");
const input = JSON.parse(fs.readFileSync("/dev/stdin", "utf8"));
const cmd = input.tool_input?.command || "";

if (/--no-verify/.test(cmd)) {
  console.log(
    "BLOCKED: --no-verify bypasses git hooks. Fix the underlying issue instead of skipping checks.",
  );
  process.exit(2);
}
