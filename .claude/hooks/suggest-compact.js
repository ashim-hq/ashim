const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const _input = JSON.parse(fs.readFileSync("/dev/stdin", "utf8"));
const counterFile = path.join(os.tmpdir(), "stirling-claude-tool-count.json");

let count = 0;
try {
  const data = JSON.parse(fs.readFileSync(counterFile, "utf8"));
  count = data.count || 0;
} catch {
  // First call or file missing
}

count++;
fs.writeFileSync(counterFile, JSON.stringify({ count }));

if (count === 50 || (count > 50 && (count - 50) % 25 === 0)) {
  console.log(
    `${count} tool calls this session. Consider /compact at a logical boundary to free up context.`,
  );
}
