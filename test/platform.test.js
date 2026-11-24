const { test, before, after } = require("node:test");
const assert = require("node:assert/strict"),
  crypto = require("node:crypto");
process.env.DATABASE_URL = ":memory:";
process.env.JWT_SECRET = crypto.randomBytes(40).toString("hex");
process.env.TELEGRAM_BOT_TOKEN = crypto.randomBytes(35).toString("hex");
process.env.CLIENT_URL = "http://localhost:3000";
const app = require("../server"),
  db = require("../server/db");
const { assess, valid } = require("../server/utils/anticheat");
const {
  normalize,
  dictionaries,
  streak,
  day,
} = require("../client/shared/lexicon.mjs");
const { tally } = require("../client/shared/score.mjs");
let server, base, cookie;
before(async () => {
  server = await new Promise((resolve) => {
    const s = app.listen(0, "127.0.0.1", () => resolve(s));
  });
  base = "http://127.0.0.1:" + server.address().port;
});
after(async () => {
  await new Promise((resolve) => server.close(resolve));
  db.close();
});
async function call(route, body, method = body ? "POST" : "GET", headers = {}) {
  return fetch(base + "/api" + route, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}
test("Lug‘atlar, apostrof shakllari va Toshkent kun chegarasi", () => {
  assert.ok(new Set(dictionaries.latin).size > 1000);
  assert.ok(new Set(dictionaries.cyrillic).size > 500);
  assert.ok(dictionaries.cyrillic.every((w) => /^[а-яёғқҳўъ]+$/u.test(w)));
  assert.ok(dictionaries.easy.every((w) => !/[‘’']/.test(w)));
  for (const a of ["'", "`", "’", "‘", "ʻ", "ʼ"])
    assert.equal(normalize("o" + a + "rik"), "o'rik");
  assert.equal(day("2026-01-01T19:00:00Z"), "2026-01-02");
  assert.deepEqual(
    streak(["2026-01-01", "2026-01-02", "2026-01-02"], "2026-01-04"),
    { current: 0, best: 2, last: "2026-01-02" },
  );
  assert.deepEqual(tally("oq olma", "o olm"), {
    correct_chars: 5,
    incorrect_chars: 0,
    extra_chars: 0,
    missed_chars: 1,
  });
});
test("Telegram sessiyasi, shaxsiy natijalar, qayta yuborish va filtrlangan reyting", async () => {
  assert.equal((await call("/results/me")).status, 401);
  const signed = {
    id: "12345",
    first_name: "Sinov",
    username: "sinovchi",
    auth_date: String(Math.floor(Date.now() / 1000)),
  };
  const key = crypto
    .createHash("sha256")
    .update(process.env.TELEGRAM_BOT_TOKEN)
    .digest();
  signed.hash = crypto
    .createHmac("sha256", key)
    .update(
      Object.keys(signed)
        .sort()
        .map((k) => k + "=" + signed[k])
        .join("\n"),
    )
    .digest("hex");
  const login = await call("/auth/telegram", signed);
  assert.equal(login.status, 200);
  cookie = login.headers.get("set-cookie").split(";")[0];
  assert.match(login.headers.get("set-cookie"), /HttpOnly/);
  assert.equal((await call("/auth/telegram", signed)).status, 409);
  assert.equal(
    (
      await call(
        "/profile",
        { display_name: "Kitobxon", region: "Andijon", daily_goal: 5 },
        "PATCH",
      )
    ).status,
    200,
  );
  const issued = await (
    await call("/challenges", { value: 15, language: "latin" })
  ).json();
  assert.ok(issued.target);
  await call("/challenges/" + issued.id + "/start", {});
  db.prepare("UPDATE challenges SET issued=? WHERE id=?").run(
    -(Date.now() - 15000),
    issued.id,
  );
  const input = issued.target.slice(0, 45);
  const timings = Array.from({ length: 44 }, (_, i) => (i % 2 ? 310 : 350));
  const bins = Array(15).fill(0);
  let t = 0;
  bins[0] = 12;
  for (const v of timings) {
    t += v;
    bins[Math.floor(t / 1000)] += 12;
  }
  const r = {
    client_id: crypto.randomUUID(),
    challenge: issued.id,
    created_at: new Date().toISOString(),
    mode: "time",
    mode_value: "15",
    language: "latin",
    duration_sec: 15,
    input,
    ...tally(issued.target, input),
    weak_keys: {},
    errors: 0,
    presses: 45,
    keystrokeTimings: timings,
    wpmSeries: bins,
  };
  const saved = await call("/results", r);
  assert.equal(saved.status, 201);
  assert.equal((await saved.json()).ranked, 1);
  assert.equal((await call("/results", r)).status, 200);
  const profile = await (await call("/results/me")).json();
  assert.equal(profile.total, 1);
  assert.equal(profile.current_streak, 1);
  assert.equal(profile.personal_bests[0].best_wpm, 36);
  for (const period of ["daily", "weekly", "all"])
    assert.equal(
      (
        await (
          await call(
            "/leaderboard?mode=15&lang=latin&region=Andijon&period=" + period,
          )
        ).json()
      ).length,
      1,
    );
  assert.equal(
    (await (await call("/leaderboard?mode=15&region=Buxoro")).json()).length,
    0,
  );
  assert.equal((await (await call("/u/sinovchi")).json()).level, "Boshlovchi");
  const c = {
    issued: Date.now() - 15000,
    value: 15,
    language: "latin",
    target: issued.target,
  };
  assert.equal(
    assess({ ...r, keystrokeTimings: timings.map(() => 330) }, c).ranked,
    0,
  );
  assert.equal(assess({ ...r, correct_chars: 600 }, c).ranked, 0);
  assert.equal(assess(r, null).ranked, 0);
  assert.equal(valid({ ...r, mode: "constructor" }), false);
  const local = { ...r, client_id: crypto.randomUUID(), challenge: null };
  assert.equal((await (await call("/results", local)).json()).ranked, 0);
  assert.equal((await (await call("/results/me")).json()).total, 2);
  assert.equal((await call("/profile", {}, "PATCH")).status, 400);
  assert.equal(
    (
      await call("/auth/logout", {}, "POST", {
        Origin: "https://other.example",
      })
    ).status,
    403,
  );
  assert.equal((await call("/auth/logout", {})).status, 200);
});
