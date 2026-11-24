const router = require("express").Router(),
  db = require("../db"),
  { auth } = require("../middleware/session");
const { randomUUID } = require("node:crypto"),
  {
    day,
    level,
    streak,
    regions,
    generate,
  } = require("../../client/shared/lexicon.mjs");
const { valid, assess } = require("../utils/anticheat");
const boardModes = [15, 30, 60];
router.post("/challenges", auth, (req, res) => {
  const { value, language } = req.body || {};
  if (
    ![...boardModes, 120].includes(value) ||
    !["latin", "cyrillic"].includes(language)
  )
    return res.status(400).json({ error: "Mashq turi yaroqsiz." });
  const id = randomUUID(),
    target = generate(language, Math.ceil(value * 5)),
    now = Date.now();
  db.prepare("DELETE FROM challenges WHERE abs(issued)<?").run(now - 86400000);
  db.prepare("INSERT INTO challenges VALUES(?,?,?,?,?,?)").run(
    id,
    req.user.id,
    value,
    language,
    target,
    now,
  );
  res.json({ id, target });
});
router.post("/challenges/:id/start", auth, (req, res) => {
  const r = db
    .prepare(
      "UPDATE challenges SET issued=? WHERE id=? AND user_id=? AND issued>0",
    )
    .run(-Date.now(), req.params.id, req.user.id);
  if (!r.changes) return res.status(409).json({ error: "Sinov eskirgan." });
  res.json({ ok: true });
});
router.post("/results", auth, (req, res) => {
  const b = req.body;
  if (!valid(b))
    return res.status(400).json({ error: "Natija ma’lumotlari yaroqsiz." });
  const uid = req.user.id;
  db.exec("BEGIN IMMEDIATE");
  try {
    const exists = db
      .prepare(
        "SELECT id,ranked FROM test_results WHERE user_id=? AND client_id=?",
      )
      .get(uid, b.client_id);
    if (exists) {
      db.exec("COMMIT");
      return res.json(exists);
    }
    let c =
      typeof b.challenge === "string"
        ? db
            .prepare(
              "DELETE FROM challenges WHERE id=? AND user_id=? RETURNING *",
            )
            .get(b.challenge, uid)
        : null;
    if (c && c.issued < 0) c.issued = -c.issued;
    else c = null;
    const s = assess(b, c),
      date = new Date(
        s.ranked ? Date.now() : Math.min(Date.now(), Date.parse(b.created_at)),
      ).toISOString(),
      d = day(date);
    const data = [
      uid,
      b.client_id,
      b.mode,
      String(b.mode_value),
      b.language,
      s.wpm,
      s.raw_wpm,
      s.accuracy,
      s.consistency,
      b.correct_chars,
      b.incorrect_chars,
      b.extra_chars,
      b.missed_chars,
      b.duration_sec,
      JSON.stringify(b.weak_keys),
      date,
      d,
      s.ranked,
    ];
    const { lastInsertRowid: id } = db
      .prepare(
        "INSERT INTO test_results(user_id,client_id,mode,mode_value,language,wpm,raw_wpm,accuracy,consistency,correct_chars,incorrect_chars,extra_chars,missed_chars,duration_sec,weak_keys_json,created_at,day,ranked) VALUES(" +
          data.map(() => "?").join(",") +
          ")",
      )
      .run(...data);
    if (s.ranked)
      db.prepare(
        `INSERT INTO personal_bests VALUES(?,?,?,?,?,?,?) ON CONFLICT(user_id,mode_key,language) DO UPDATE SET best_wpm=excluded.best_wpm,best_accuracy=excluded.best_accuracy,result_id=excluded.result_id,updated_at=excluded.updated_at WHERE excluded.best_wpm>best_wpm OR (excluded.best_wpm=best_wpm AND excluded.best_accuracy>best_accuracy)`,
      ).run(
        uid,
        b.mode + "-" + b.mode_value,
        b.language,
        s.wpm,
        s.accuracy,
        id,
        date,
      );
    const st = streak(
      db
        .prepare("SELECT DISTINCT day FROM test_results WHERE user_id=?")
        .all(uid)
        .map((r) => r.day),
    );
    db.prepare(
      "UPDATE users SET current_streak=?,best_streak=?,last_test_date=? WHERE id=?",
    ).run(st.current, st.best, st.last, uid);
    db.exec("COMMIT");
    res.status(201).json({ id: Number(id), ranked: s.ranked });
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
});
function profile(u) {
  const total = db
    .prepare("SELECT count(*) n FROM test_results WHERE user_id=?")
    .get(u.id).n;
  return {
    display_name: u.display_name,
    username: u.username,
    region: u.region,
    level: level(total),
    total,
    current_streak:
      u.last_test_date &&
      Date.parse(day(Date.now())) - Date.parse(u.last_test_date) <= 86400000
        ? u.current_streak
        : 0,
    best_streak: u.best_streak,
    personal_bests: db
      .prepare(
        "SELECT mode_key,language,best_wpm,best_accuracy FROM personal_bests WHERE user_id=? ORDER BY best_wpm DESC",
      )
      .all(u.id),
  };
}
router.get("/results/me", auth, (req, res) =>
  res.json({
    ...profile(req.user),
    practice_bests: db
      .prepare(
        "SELECT mode || '-' || mode_value AS mode_key, language,MAX(wpm) AS best_wpm FROM test_results WHERE user_id=? GROUP BY mode,mode_value,language",
      )
      .all(req.user.id),
    today: db
      .prepare("SELECT count(*) n FROM test_results WHERE user_id=? AND day=?")
      .get(req.user.id, day(Date.now())).n,
    recent: db
      .prepare(
        "SELECT mode,mode_value,wpm,raw_wpm,accuracy,created_at,language,weak_keys_json,ranked FROM test_results WHERE user_id=? ORDER BY created_at DESC LIMIT 50",
      )
      .all(req.user.id),
  }),
);
router.get("/u/:username", (req, res) => {
  const u = db
    .prepare("SELECT * FROM users WHERE username=?")
    .get(req.params.username);
  if (!u) return res.status(404).json({ error: "Profil topilmadi." });
  res.json(profile(u));
});
router.get("/leaderboard", (req, res) => {
  const {
    mode = "30",
    lang = "latin",
    period = "all",
    region = "",
  } = req.query;
  if (
    !boardModes.includes(Number(mode)) ||
    !["latin", "cyrillic"].includes(lang) ||
    !["daily", "weekly", "all"].includes(period) ||
    (region && !regions.includes(region))
  )
    return res.status(400).json({ error: "Reyting filtrlarini tekshiring." });
  const since =
    period === "daily"
      ? day(Date.now())
      : period === "weekly"
        ? day(Date.now() - 6 * 86400000)
        : "0000";
  const filter = region ? " AND u.region=?" : "";
  const args = region ? [region] : [];
  const sql =
    period === "all"
      ? `SELECT u.username,u.display_name,u.region,p.best_wpm wpm,p.best_accuracy accuracy FROM personal_bests p JOIN users u ON u.id=p.user_id WHERE p.mode_key=? AND p.language=? ${filter} ORDER BY wpm DESC,accuracy DESC,p.updated_at,u.id LIMIT 100`
      : `SELECT * FROM (SELECT u.username,u.display_name,u.region,r.wpm,r.accuracy,r.created_at,ROW_NUMBER() OVER(PARTITION BY u.id ORDER BY wpm DESC,accuracy DESC,r.created_at,r.id) place FROM test_results r JOIN users u ON r.user_id=u.id WHERE ranked=1 AND mode='time' AND mode_value=? AND language=? AND day>=? ${filter}) WHERE place=1 ORDER BY wpm DESC,accuracy DESC,created_at LIMIT 100`;
  res.json(
    db
      .prepare(sql)
      .all(
        ...(period === "all"
          ? ["time-" + mode, lang, ...args]
          : [mode, lang, since, ...args]),
      ),
  );
});
module.exports = router;
