import { normalize } from "./lexicon.mjs";
export function tally(target, input, finished = false) {
  const words = normalize(target).split(" "),
    typed = normalize(input).split(" ");
  let correct = 0,
    incorrect = 0,
    extra = 0,
    missed = 0;
  typed.forEach((w, i) => {
    const expected = words[i] || "";
    for (let j = 0; j < w.length; j++) {
      if (j >= expected.length) extra++;
      else if (w[j] === expected[j]) correct++;
      else incorrect++;
    }
    if (i < typed.length - 1 || finished)
      missed += Math.max(0, expected.length - w.length);
    if (i < typed.length - 1) {
      if (i < words.length - 1) correct++;
      else extra++;
    }
  });
  return {
    correct_chars: correct,
    incorrect_chars: incorrect,
    extra_chars: extra,
    missed_chars: missed,
  };
}
export function metrics(counts, duration, presses, errors, series) {
  const avg = series.reduce((a, b) => a + b, 0) / Math.max(1, series.length);
  const sd = Math.sqrt(
    series.reduce((a, b) => a + (b - avg) ** 2, 0) / Math.max(1, series.length),
  );
  return {
    wpm: Math.round((counts.correct_chars * 12) / duration),
    raw_wpm: Math.round((presses * 12) / duration),
    accuracy: Math.round((100 * (presses - errors)) / Math.max(1, presses)),
    consistency: avg ? Math.max(0, Math.round(100 * (1 - sd / avg))) : 0,
  };
}
