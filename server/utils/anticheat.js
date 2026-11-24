const { metrics, tally } = require("../../client/shared/score.mjs");
const { dictionaries } = require("../../client/shared/lexicon.mjs");
const values = {
  time: ["15", "30", "60", "120"],
  words: ["10", "25", "50", "100"],
  quote: ["short", "medium", "long"],
  zen: ["free"],
  custom: ["text"],
  weak: ["keys"],
};
const integer = (x, max) => Number.isInteger(x) && x >= 0 && x <= max;
const isUUID = (v) =>
  typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v,
  );
function valid(b) {
  if (
    !b ||
    typeof b.mode !== "string" ||
    typeof b.language !== "string" ||
    !["string", "number"].includes(typeof b.mode_value) ||
    !Object.hasOwn(values, b.mode) ||
    !values[b.mode]?.includes(String(b.mode_value)) ||
    !Object.hasOwn(dictionaries, b.language) ||
    !isUUID(b.client_id) ||
    (b.challenge != null && !isUUID(b.challenge)) ||
    !Number.isFinite(b.duration_sec) ||
    b.duration_sec <= 0 ||
    b.duration_sec > 86400
  )
    return false;
  if (
    ![
      "correct_chars",
      "incorrect_chars",
      "extra_chars",
      "missed_chars",
      "presses",
      "errors",
    ].every((k) => integer(b[k], 100000)) ||
    b.errors > b.presses ||
    !b.presses
  )
    return false;
  if (b.correct_chars + b.incorrect_chars + b.extra_chars > b.presses)
    return false;
  if (
    ![b.keystrokeTimings, b.wpmSeries].every(
      (a) =>
        Array.isArray(a) &&
        a.length <= 100000 &&
        a.every((n) => Number.isFinite(n) && n >= 0 && n <= 86400000),
    )
  )
    return false;
  if (
    !b.weak_keys ||
    typeof b.weak_keys !== "object" ||
    Array.isArray(b.weak_keys) ||
    Object.entries(b.weak_keys).some(
      ([k, v]) => [...k].length !== 1 || !integer(v, 100000),
    )
  )
    return false;
  return (
    typeof b.input === "string" &&
    b.input.length <= 100000 &&
    typeof b.created_at === "string" &&
    Number.isFinite(Date.parse(b.created_at)) &&
    Date.parse(b.created_at) <= Date.now() + 60000
  );
}
function assess(b, challenge) {
  const stats = metrics(b, b.duration_sec, b.presses, b.errors, b.wpmSeries);
  let ranked =
    !!challenge &&
    b.mode === "time" &&
    Number(b.mode_value) === challenge.value &&
    b.language === challenge.language;
  if (ranked) {
    const elapsed = (Date.now() - challenge.issued) / 1000,
      counts = tally(challenge.target, b.input),
      times = b.keystrokeTimings;
    const sum = times.reduce((a, x) => a + x, 0),
      mean = sum / Math.max(times.length, 1);
    const variance =
      times.reduce((a, x) => a + (x - mean) ** 2, 0) /
      Math.max(times.length, 1);
    const expectedBins = Array(challenge.value).fill(0);
    let cursor = 0;
    expectedBins[0] = 12;
    for (const dt of times) {
      cursor += dt;
      const second = Math.floor(cursor / 1000);
      if (second < expectedBins.length) expectedBins[second] += 12;
    }
    const measured = b.wpmSeries.reduce((a, x) => a + x / 12, 0);
    ranked =
      elapsed >= challenge.value - 0.8 &&
      elapsed <= challenge.value + 180 &&
      Math.abs(b.duration_sec - challenge.value) < 0.35 &&
      stats.raw_wpm <= 260 &&
      stats.wpm <= 260 &&
      stats.wpm > 0 &&
      Object.keys(counts).every((k) => counts[k] === b[k]) &&
      b.presses >= b.input.length &&
      times.length === b.presses - 1 &&
      sum <= b.duration_sec * 1000 + 150 &&
      times.length >= 3 &&
      variance > 0.02 &&
      b.wpmSeries.length === challenge.value &&
      Math.abs(measured - b.presses) < 1 &&
      b.wpmSeries.every(
        (n, i) => n <= 600 && Math.abs(n - expectedBins[i]) <= 12,
      ) &&
      Object.values(b.weak_keys).reduce((a, x) => a + x, 0) === b.errors;
  }
  return { ...stats, ranked: Number(ranked) };
}
module.exports = { valid, assess };
