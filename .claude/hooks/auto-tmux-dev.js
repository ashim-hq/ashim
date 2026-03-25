const fs = require("node:fs");
const input = JSON.parse(fs.readFileSync("/dev/stdin", "utf8"));
const cmd = input.tool_input?.command || "";

const devPattern = /\b(pnpm|npm|yarn|bun)\s+(run\s+)?dev\b/;

if (devPattern.test(cmd) && !/tmux/.test(cmd) && !/&\s*$/.test(cmd)) {
  console.log(
    "TIP: Dev servers block the session. Consider running in tmux instead:\n" +
      `  tmux new-session -d -s stirling-dev '${cmd}'\n` +
      "Or append & to background the process.",
  );
}
