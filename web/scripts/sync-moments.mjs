// Copies the moment labels from web/lib/moments.ts into the extension (which has no build step).
// Run after changing moments: node scripts/sync-moments.mjs
import fs from "node:fs";

const src = fs.readFileSync(new URL("../lib/moments.ts", import.meta.url), "utf8");
const body = src.match(/MOMENT_LABELS = \{([\s\S]*?)\} as const/)[1];
const labels = Object.fromEntries([...body.matchAll(/^\s*(\w+):\s*"([^"]+)"/gm)].map((m) => [m[1], m[2]]));
const out = `// Generated from web/lib/moments.ts by web/scripts/sync-moments.mjs. Don't edit by hand.
self.Q_MOMENT_LABELS = ${JSON.stringify(labels, null, 2)};
`;
fs.writeFileSync(new URL("../../extension/moments.js", import.meta.url), out);
console.log(`Synced ${Object.keys(labels).length} moment labels to extension/moments.js`);
