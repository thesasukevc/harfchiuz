const jwt = require("jsonwebtoken"),
  db = require("../db");
const cookie = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};
function session(req, res, next) {
  try {
    const t = jwt.verify(req.cookies.session, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "harfchi.uz",
    });
    req.user = db.prepare("SELECT * FROM users WHERE id=?").get(t.sub);
  } catch {}
  next();
}
function auth(req, res, next) {
  if (!req.user)
    return res.status(401).json({ error: "Avval hisobingizga kiring." });
  next();
}
module.exports = { cookie, session, auth };
