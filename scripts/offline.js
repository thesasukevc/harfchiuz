const fs = require("node:fs"),
  crypto = require("node:crypto"),
  path = require("node:path");
function walk(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((f) =>
      f.isDirectory() ? walk(path.join(dir, f.name)) : path.join(dir, f.name),
    );
}
const files = walk("dist")
    .filter((f) => !f.endsWith("/sw.js"))
    .sort(),
  hash = crypto.createHash("sha256");
for (const f of files) hash.update(fs.readFileSync(f));
const template = fs.readFileSync("client/sw.js", "utf8");
hash.update(template);
fs.writeFileSync(
  "dist/sw.js",
  template
    .replace("__VERSION__", hash.digest("hex").slice(0, 14))
    .replace(
      "__FILES__",
      JSON.stringify(
        files.map(
          (f) => "/" + path.relative("dist", f).split(path.sep).join("/"),
        ),
      ),
    ),
);
