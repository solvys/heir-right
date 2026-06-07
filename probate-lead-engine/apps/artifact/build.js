const { copyFileSync, existsSync, mkdirSync } = require("node:fs");
const { join } = require("node:path");

mkdirSync(join(__dirname, "dist"), { recursive: true });
copyFileSync(join(__dirname, "src", "index.html"), join(__dirname, "dist", "index.html"));
const latestRunPath = join(__dirname, "..", "worker", "output", "latest-run.json");
if (existsSync(latestRunPath)) {
  copyFileSync(latestRunPath, join(__dirname, "dist", "latest-run.json"));
} else if (existsSync(join(__dirname, "demo", "latest-run.json"))) {
  copyFileSync(join(__dirname, "demo", "latest-run.json"), join(__dirname, "dist", "latest-run.json"));
}
const dailyRunPath = join(__dirname, "..", "worker", "output", "daily-run.json");
if (existsSync(dailyRunPath)) {
  copyFileSync(dailyRunPath, join(__dirname, "dist", "daily-run.json"));
} else if (existsSync(join(__dirname, "demo", "daily-run.json"))) {
  copyFileSync(join(__dirname, "demo", "daily-run.json"), join(__dirname, "dist", "daily-run.json"));
}
console.log("artifact built: dist/index.html");
