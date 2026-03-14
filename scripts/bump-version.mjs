/**
 * bump-version.mjs
 * Auto-increments the minor version in src/version.ts before every build.
 * Run by Vercel automatically via `prebuild` script in package.json.
 */
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const versionFilePath = join(__dirname, "../src/version.ts");

let content = readFileSync(versionFilePath, "utf-8");

// Match the minor field
const minorMatch = content.match(/minor:\s*(\d+)/);
if (!minorMatch) {
  console.error("❌ Could not find minor version field in version.ts");
  process.exit(1);
}

const oldMinor = parseInt(minorMatch[1], 10);
const newMinor = oldMinor + 1;
content = content.replace(/minor:\s*\d+/, `minor: ${newMinor}`);

// Also update buildDate to today
const today = new Date().toISOString().split("T")[0];
content = content.replace(/buildDate:\s*"[^"]*"/, `buildDate: "${today}"`);

writeFileSync(versionFilePath, content, "utf-8");
console.log(`✅ Version bumped: minor ${oldMinor} → ${newMinor} (build date: ${today})`);
