const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const path = require("node:path");

const input = JSON.parse(fs.readFileSync("/dev/stdin", "utf8"));
const filePath = input.tool_input?.file_path || "";
const formattable = /\.(ts|tsx|js|jsx|json)$/;

if (filePath && formattable.test(filePath) && fs.existsSync(filePath)) {
  const projectRoot = path.resolve(__dirname, "..", "..");
  const biomeBin = path.join(projectRoot, "node_modules", ".bin", "biome");

  try {
    execFileSync(biomeBin, ["check", "--write", filePath], {
      stdio: "pipe",
      cwd: projectRoot,
    });
  } catch {
    // Format failures are non-blocking
  }
}
