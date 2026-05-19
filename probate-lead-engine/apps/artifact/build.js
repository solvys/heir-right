const { copyFileSync, mkdirSync } = require("node:fs");
const { join } = require("node:path");

mkdirSync(join(__dirname, "dist"), { recursive: true });
copyFileSync(join(__dirname, "src", "index.html"), join(__dirname, "dist", "index.html"));
console.log("artifact built: dist/index.html");
