const { createServer } = require("node:http");
const { readFileSync, existsSync } = require("node:fs");
const { join } = require("node:path");

const port = Number(process.env.PORT || 4173);
const root = join(__dirname, "dist");
const workerOutput = join(__dirname, "..", "worker", "output", "latest-run.json");

createServer((req, res) => {
  if (req.url === "/latest-run.json") {
    if (!existsSync(workerOutput)) {
      res.writeHead(404, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: "Run the worker dry pipeline first." }));
      return;
    }
    res.writeHead(200, { "content-type": "application/json" });
    res.end(readFileSync(workerOutput));
    return;
  }

  const html = readFileSync(join(root, "index.html"), "utf8");
  res.writeHead(200, { "content-type": "text/html" });
  res.end(html);
}).listen(port, () => {
  console.log(`HeirRight artifact listening on http://localhost:${port}`);
});
