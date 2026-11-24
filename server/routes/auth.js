const express = require("express"),
  crypto = require("node:crypto"),
  jwt = require("jsonwebtoken");
const db = require("../db"),
  { cookie, auth } = require("../middleware/session");
const { regions } = require("../../client/shared/lexicon.mjs");
const router = express.Router();
function userView(u) {
  return u
    ? {
        id: u.id,
        username: u.username,
        display_name: u.display_name,
        region: u.region,
        daily_goal: u.daily_goal,
      }
    : null;
}
router.get("/auth/me", (req, res) =>
  res.json({
    user: userView(req.user),
    bot: process.env.TELEGRAM_BOT_TOKEN
      ? process.env.TELEGRAM_BOT_USERNAME || null
      : null,
  }),
);
router.post("/auth/telegram", (req, res) => {
  const b = req.body,
    token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token)
    return res
      .status(503)
      .json({ error: "Telegram orqali kirish hali sozlanmagan." });
  const now = Math.floor(Date.now() / 1000);
  if (
    !b ||
    !Object.keys(b).every((k) =>
      [
        "id",
        "first_name",
        "last_name",
        "username",
        "photo_url",
        "auth_date",
        "hash",
      ].includes(k),
    ) ||
    !/^\d{1,16}$/.test(String(b.id)) ||
    !Number.isSafeInteger(Number(b.auth_date)) ||
    Math.abs(now - b.auth_date) > 300 ||
    typeof b.first_name !== "string" ||
    !b.first_name.trim() ||
    b.first_name.length > 128 ||
    !Object.values(b).every(
      (v) =>
        ["string", "number"].includes(typeof v) &&
        String(v).length <= 2048 &&
        !/[\r\n]/.test(String(v)),
    ) ||
    (b.photo_url !== undefined &&
      (typeof b.photo_url !== "string" ||
        !URL.canParse(b.photo_url) ||
        new URL(b.photo_url).protocol !== "https:")) ||
    (b.last_name !== undefined &&
      (typeof b.last_name !== "string" || b.last_name.length > 128)) ||
    (b.username && !/^\w{1,32}$/.test(b.username)) ||
    !/^[a-f\d]{64}$/.test(b.hash)
  )
    return res
      .status(400)
      .json({ error: "Kirish ma’lumotlari yaroqsiz yoki eskirgan." });
  const payload = Object.keys(b)
    .filter((k) => k !== "hash")
    .sort()
    .map((k) => k + "=" + b[k])
    .join("\n");
  const sig = crypto
    .createHmac("sha256", crypto.createHash("sha256").update(token).digest())
    .update(payload)
    .digest();
  if (!crypto.timingSafeEqual(sig, Buffer.from(b.hash, "hex")))
    return res.status(403).json({ error: "Telegram tasdig‘i mos kelmadi." });
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare("DELETE FROM auth_receipts WHERE expires<?").run(now);
    if (
      !db
        .prepare("INSERT OR IGNORE INTO auth_receipts VALUES(?,?)")
        .run(b.hash, Number(b.auth_date) + 301).changes
    ) {
      db.exec("ROLLBACK");
      return res.status(409).json({ error: "Kirish tasdig‘i ishlatilgan." });
    }
    if (b.username)
      db.prepare(
        "UPDATE users SET username=NULL WHERE username=? AND telegram_id<>?",
      ).run(b.username, String(b.id));
    const u = db
      .prepare(
        `INSERT INTO users(telegram_id,username,display_name,avatar_url) VALUES(?,?,?,?) ON CONFLICT(telegram_id) DO UPDATE SET username=excluded.username,avatar_url=excluded.avatar_url RETURNING *`,
      )
      .get(
        String(b.id),
        b.username || null,
        [b.first_name, b.last_name].filter(Boolean).join(" ").slice(0, 80),
        b.photo_url || null,
      );
    db.exec("COMMIT");
    res
      .cookie(
        "session",
        jwt.sign({ sub: String(u.id) }, process.env.JWT_SECRET, {
          issuer: "harfchi.uz",
          algorithm: "HS256",
          expiresIn: "7d",
        }),
        { ...cookie, maxAge: 604800000 },
      )
      .json({ user: userView(u) });
  } catch (e) {
    if (db.isTransaction) db.exec("ROLLBACK");
    throw e;
  }
});
router.post("/auth/logout", (req, res) =>
  res.clearCookie("session", cookie).json({ ok: true }),
);
router.patch("/profile", auth, (req, res) => {
  const { display_name, region, daily_goal } = req.body || {};
  if (
    typeof display_name !== "string" ||
    !display_name.trim() ||
    display_name.length > 80 ||
    !(region === null || regions.includes(region)) ||
    ![3, 5, 10].includes(daily_goal)
  )
    return res.status(400).json({ error: "Profil maydonlarini tekshiring." });
  res.json({
    user: userView(
      db
        .prepare(
          "UPDATE users SET display_name=?,region=?,daily_goal=? WHERE id=? RETURNING *",
        )
        .get(display_name.trim(), region, daily_goal, req.user.id),
    ),
  });
});
module.exports = router;
