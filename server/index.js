const express = require("express"),
  helmet = require("helmet"),
  cors = require("cors"),
  { rateLimit } = require("express-rate-limit"),
  path = require("node:path");
const origin = new URL(process.env.CLIENT_URL || "http://localhost:3000")
  .origin;
if (!process.env.JWT_SECRET || Buffer.byteLength(process.env.JWT_SECRET) < 32)
  throw Error("JWT_SECRET kamida 32 bayt bo‘lishi kerak.");
if (process.env.NODE_ENV === "production" && !origin.startsWith("https://"))
  throw Error("CLIENT_URL uchun HTTPS kerak.");
const app = express();
app.disable("x-powered-by");
app.set("trust proxy", "loopback");
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    contentSecurityPolicy: {
      directives: {
        scriptSrc: ["'self'", "https://telegram.org"],
        frameSrc: ["https://oauth.telegram.org", "https://telegram.org"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        upgradeInsecureRequests:
          process.env.NODE_ENV === "production" ? [] : null,
      },
    },
  }),
);
const allowed = new Set([origin, "https://harfchi.uz"]);
if (process.env.NODE_ENV !== "production") allowed.add("http://localhost:3000");
app.use(
  "/api",
  (req, res, next) => {
    res.set("Cache-Control", "no-store");
    if (req.headers.origin && !allowed.has(req.headers.origin))
      return res.status(403).json({ error: "Manzilga ruxsat berilmagan." });
    next();
  },
  cors({ origin: [...allowed], credentials: true }),
  express.json({ limit: "1mb" }),
  require("cookie-parser")(),
  require("./middleware/session").session,
);
const limiter = (limit, windowMs) =>
  rateLimit({
    limit,
    windowMs,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Biroz kutib, qayta urinib ko‘ring." },
  });
app.use("/api", limiter(240, 60000));
app.use("/api/auth/telegram", limiter(12, 60000));
app.use("/api/results", limiter(90, 60000));
app.use("/api", require("./routes/auth"), require("./routes/results"));
app.use("/api", (q, r) => r.status(404).json({ error: "Manzil topilmadi." }));
const root = path.resolve(__dirname, "../dist");
app.use(
  "/assets",
  express.static(path.join(root, "assets"), { immutable: true, maxAge: "1y" }),
);
app.use(express.static(root));
app.get("/u/:username", (q, r) => r.sendFile(path.join(root, "index.html")));
app.use((e, q, r, n) => {
  console.error(e.name, e.code || e.status || "");
  r.status(e.status || 500).json({ error: "So‘rovni bajarib bo‘lmadi." });
});
if (require.main === module)
  app.listen(
    Number(process.env.PORT) || 3000,
    process.env.HOST || "127.0.0.1",
    () => console.log("Harfchi ishga tushdi."),
  );
module.exports = app;
