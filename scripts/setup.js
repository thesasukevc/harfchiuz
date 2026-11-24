const fs = require("node:fs");
const { randomBytes } = require("node:crypto");
const path = require("node:path");
const root = path.join(__dirname, "..");
const config = fs
  .readFileSync(path.join(root, ".env.example"), "utf8")
  .replace("NODE_ENV=production", "NODE_ENV=development")
  .replace("CLIENT_URL=https://harfchi.uz", "CLIENT_URL=http://localhost:3000")
  .replace(/^JWT_SECRET=$/m, "JWT_SECRET=" + randomBytes(48).toString("hex"));
try {
  fs.writeFileSync(path.join(root, ".env"), config, {
    flag: "wx",
    mode: 0o600,
  });
  console.log("Mahalliy sozlamalar yaratildi.");
} catch (e) {
  if (e.code !== "EEXIST") throw e;
  console.log("Mavjud .env sozlamalari ishlatiladi.");
}
