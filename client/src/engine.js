import { $, esc, ico, api, toast } from "./ui.js";
import {
  dictionaries,
  generate,
  normalize,
  quotes,
} from "../shared/lexicon.mjs";
import { tally, metrics } from "../shared/score.mjs";
const rowsLatin = ["1234567890-=", "qwertyuiop[]", "asdfghjkl;'", "zxcvbnm,./"],
  rowsCyr = ["ё1234567890ғҳ", "йцукенгшўзхъ", "фқвапролджэ", "ячсмитьбю."];
let audio;
function clickSound() {
  try {
    audio ??= new AudioContext();
    if (audio.state === "suspended") audio.resume();
    const o = audio.createOscillator(),
      g = audio.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(640, audio.currentTime);
    o.frequency.exponentialRampToValueAtTime(140, audio.currentTime + 0.03);
    g.gain.setValueAtTime(0.045, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.038);
    o.connect(g);
    g.connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + 0.04);
  } catch {}
}
export function engine(ctx) {
  let seq = 0,
    target = "",
    words = [],
    challenge = null,
    start = 0,
    last = 0,
    interval,
    active = false,
    done = false,
    prev = "",
    presses = 0,
    errors = 0,
    timings = [],
    weak = {},
    bins = [],
    lastKey = "",
    lastFrame = "",
    renderFrame = 0,
    owner = null;
  const input = $("input"),
    p = ctx.p;
  function gen() {
    if (p.mode === "custom")
      return (p.custom || "").trim().replace(/\s+/g, " ");
    if (p.mode === "zen") return "";
    if (p.mode === "quote") {
      const q = quotes[p.value];
      return q[Math.floor(Math.random() * q.length)];
    }
    if (p.mode === "weak") {
      const keys = Object.keys(ctx.weak());
      const list = dictionaries[p.lang].filter((w) =>
        keys.some((k) => normalize(w).includes(normalize(k))),
      );
      if (!list.length) return generate(p.lang, 25, p.marks, p.numbers);
      return Array.from(
        { length: 25 },
        () => list[Math.floor(Math.random() * list.length)],
      ).join(" ");
    }
    return generate(
      p.lang,
      p.mode === "words" ? Number(p.value) : Math.ceil(Number(p.value) * 5),
      p.marks,
      p.numbers,
    );
  }
  function stop() {
    clearInterval(interval);
    active = false;
    document.body.classList.remove("focused");
  }
  function reset(repeat = false) {
    stop();
    const id = ++seq;
    challenge = null;
    done = false;
    start = last = presses = errors = 0;
    timings = [];
    weak = {};
    bins = [];
    prev = "";
    input.value = "";
    input.disabled = false;
    lastFrame = "";
    owner = ctx.user()?.id ?? null;
    if (!repeat) target = gen();
    words = target.split(" ");
    $("results").hidden = true;
    $("practice").hidden = false;
    $("state").textContent = "Boshlashga tayyor";
    $("hint").innerHTML =
      ico("keyboard") +
      (p.mode === "zen"
        ? "Erkin yozing · Shift + Enter bilan yakunlang"
        : "Yozishni boshlang");
    $("zenDone").hidden = p.mode !== "zen";
    tick();
    draw();
    if (
      ctx.user() &&
      !repeat &&
      p.mode === "time" &&
      !p.marks &&
      !p.numbers &&
      ["latin", "cyrillic"].includes(p.lang)
    ) {
      api("/challenges", "POST", { value: Number(p.value), language: p.lang })
        .then((c) => {
          if (seq === id && !active && !done) {
            challenge = c.id;
            $("state").textContent = "Reyting sinovi tayyor";
            target = c.target;
            words = target.split(" ");
            lastFrame = "";
            draw();
          }
        })
        .catch(() => {});
    }
  }
  function keymap(ch) {
    const rows = p.lang === "cyrillic" ? rowsCyr : rowsLatin;
    const next = normalize(ch).toLowerCase();
    const shifted =
      p.lang === "cyrillic"
        ? { "!": "1", "?": "7", ",": ".", ":": "6", ";": "4" }
        : { "!": "1", "?": "/", ":": ";", "@": "2", "#": "3" };
    const key = shifted[next] || next;
    const signature = [p.lang, key, p.keymap].join("|");
    if (lastKey === signature) return;
    lastKey = signature;
    let finger = key === " " ? "bosh barmoq" : "";
    const layout = rows
      .map((row, r) => {
        return (
          '<div class="keyrow">' +
          [...row]
            .map((k, i) => {
              if (k === key) {
                const offset = r === 0 ? (p.lang === "cyrillic" ? 2 : 1) : 0;
                const j = i - offset;
                finger =
                  (j < 5 ? "chap " : "o‘ng ") +
                  (j < 1 || j > 8
                    ? "jimjiloq"
                    : j === 1 || j === 8
                      ? "nomsiz barmoq"
                      : j === 2 || j === 7
                        ? "o‘rta barmoq"
                        : "ko‘rsatkich barmoq");
              }
              return (
                '<b class="' +
                (k === key ? "on" : "") +
                '">' +
                esc(k.toUpperCase()) +
                "</b>"
              );
            })
            .join("") +
          "</div>"
        );
      })
      .join("");
    $("keyHint").textContent = key
      ? (key === " " ? "Bo‘sh joy" : ch) + " · " + (finger || "belgilar qatori")
      : "";
    $("keymap").hidden = !p.keymap;
    if (p.keymap)
      $("keymap").innerHTML =
        layout +
        '<div class="keyrow"><b class="' +
        (key === " " ? "on" : "") +
        '">Bo‘sh joy</b></div>';
  }
  function draw() {
    if (done || $("test").hidden) return;
    const typed = prev.split(" "),
      wi = typed.length - 1,
      pos = typed[wi].length,
      isZen = p.mode === "zen";
    const list = isZen ? typed : words;
    const from = Math.max(0, Math.floor(wi / 24) * 24 - 12),
      end = Math.min(list.length, wi + 70);
    const signature =
      seq + "|" + prev + "|" + target.slice(0, 80) + "|" + p.mode;
    if (signature !== lastFrame) {
      lastFrame = signature;
      let html = "";
      for (let i = from; i < end; i++) {
        const actual = typed[i] ?? "",
          expected = list[i] || "";
        html += '<span class="word" data-word="' + i + '">';
        for (let j = 0; j < Math.max(actual.length, expected.length); j++) {
          const a = actual[j],
            e = expected[j];
          let cls =
            a === undefined
              ? i < wi
                ? "wrong"
                : ""
              : e === undefined
                ? "added"
                : normalize(a) === normalize(e)
                  ? "ok"
                  : "wrong";
          html += '<span class="' + cls + '">' + esc(e ?? a) + "</span>";
        }
        html += '<span class="end"></span></span> ';
      }
      $("lines").innerHTML =
        html || '<span class="word" data-word="0"><span></span></span>';
    }
    const w = $("lines").querySelector('[data-word="' + wi + '"]');
    if (!w) return;
    const ch = w.children[Math.min(pos, w.children.length - 1)],
      lh = parseFloat(getComputedStyle($("viewport")).lineHeight);
    const relative = (el) => {
      const line = $("lines").getBoundingClientRect(),
        r = el.getBoundingClientRect();
      return { x: r.left - line.left, y: r.top - line.top };
    };
    const loc = relative(ch),
      shift = Math.max(0, Math.floor((loc.y + 2) / lh) - 1) * lh;
    $("lines").style.transform = "translateY(-" + shift + "px)";
    $("caret").style.transform =
      "translate(" + loc.x + "px," + (loc.y - shift) + "px)";
    const pace = Number(p.pace === "pb" ? ctx.best() : p.pace);
    $("pace").hidden = !pace || !active || isZen;
    if (!$("pace").hidden) {
      let n = Math.floor((((performance.now() - start) / 1000) * pace) / 12),
        k = 0;
      while (k < words.length - 1 && n > words[k].length) {
        n -= words[k].length + 1;
        k++;
      }
      const ghost = $("lines").querySelector('[data-word="' + k + '"]')
        ?.children[n];
      if (ghost) {
        const xy = relative(ghost);
        $("pace").style.transform =
          "translate(" + xy.x + "px," + (xy.y - shift) + "px)";
      } else $("pace").hidden = true;
    }
    keymap(isZen ? "" : (list[wi]?.[pos] ?? " "));
  }
  function tick() {
    const elapsed = start ? (performance.now() - start) / 1000 : 0;
    $("remaining").textContent =
      p.mode === "time"
        ? Math.max(0, Number(p.value) - Math.floor(elapsed))
        : p.mode === "zen"
          ? Math.floor(elapsed)
          : (prev ? prev.split(" ").length - 1 : 0) + " / " + words.length;
    $("unit").textContent = ["time", "zen"].includes(p.mode)
      ? "soniya"
      : "so‘z";
    if (p.mode === "time" && active && elapsed >= Number(p.value)) finish();
    else if (active && p.pace !== "0") draw();
  }
  function finish() {
    if (done || !active) return;
    const duration =
      p.mode === "time"
        ? Number(p.value)
        : Math.max(0.1, (performance.now() - start) / 1000);
    done = true;
    stop();
    input.blur();
    input.disabled = true;
    const counts = tally(
      p.mode === "zen" ? prev : target,
      prev,
      !["time", "zen"].includes(p.mode),
    );
    const series = Array.from(
      { length: Math.ceil(duration) },
      (_, i) => (bins[i] || 0) * 12,
    );
    const r = {
      client_id: crypto.randomUUID(),
      mode: p.mode,
      mode_value: String(p.value),
      language: p.lang,
      created_at: new Date().toISOString(),
      duration_sec: duration,
      ...counts,
      ...metrics(counts, duration, presses, errors, series),
      weak_keys: weak,
      presses,
      errors,
      wpmSeries: series,
      keystrokeTimings: timings,
      input: prev,
      challenge,
    };
    ctx.finish(r, owner);
  }
  input.addEventListener("paste", (e) => e.preventDefault());
  input.addEventListener("drop", (e) => e.preventDefault());
  input.addEventListener("beforeinput", (e) => {
    if (
      !e.inputType.startsWith("delete") &&
      e.data &&
      e.data.length > 1 &&
      !e.isComposing
    )
      e.preventDefault();
  });
  input.addEventListener("input", () => {
    if (done) return;
    if (
      active &&
      p.mode === "time" &&
      (performance.now() - start) / 1000 >= Number(p.value)
    ) {
      input.value = prev;
      finish();
      return;
    }
    let value = input.value.replace(/[\r\n]/g, " ");
    const zen = p.mode === "zen";
    if (!zen) value = value.replace(/^ +/, "").replace(/ {2,}/g, " ");
    if (!value.startsWith(prev) && !prev.startsWith(value)) {
      input.value = prev;
      return;
    }
    if (value.length < prev.length && !zen) {
      const old = prev.split(" ");
      const newIndex = value.split(" ").length - 1;
      if (
        newIndex < old.length - 1 &&
        normalize(old[newIndex]) === normalize(words[newIndex] || "")
      ) {
        value = old.slice(0, old.length - 1).join(" ") + " ";
      }
    }
    input.value = value;
    if (value === prev) return;
    if (!zen && !target) {
      input.value = prev;
      return;
    }
    const now = performance.now();
    if (!active) {
      active = true;
      start = now;
      document.body.classList.add("focused");
      $("state").textContent = "Mashq davom etmoqda";
      $("hint").innerHTML = ico("activity") + "Diqqat rejimi";
      if (challenge)
        api("/challenges/" + challenge + "/start", "POST", {}).catch(() => {});
      interval = setInterval(tick, 125);
    }
    if (value.length > prev.length) {
      const added = value.slice(prev.length);
      let working = prev;
      for (const a of added) {
        const parts = working.split(" "),
          idx = parts.length - 1;
        const expected =
          a === " "
            ? parts[idx].length === (words[idx] || "").length
              ? " "
              : words[idx]?.[parts[idx].length] || " "
            : words[idx]?.[parts[idx].length] || " ";
        if (!zen && normalize(a) !== normalize(expected)) {
          errors++;
          weak[expected] = (weak[expected] || 0) + 1;
        }
        if (presses) timings.push(Math.round((now - last) * 100) / 100);
        last = now;
        presses++;
        const bucket = Math.floor((now - start) / 1000);
        bins[bucket] = (bins[bucket] || 0) + 1;
        working += a;
      }
      if (p.sound) clickSound();
    }
    prev = value;
    const parts = prev.split(" ");
    if (
      !zen &&
      p.mode !== "time" &&
      (parts.length > words.length ||
        (parts.length === words.length &&
          parts.at(-1).length >= words.at(-1).length))
    ) {
      if (prev.endsWith(" ")) prev = prev.trimEnd();
      finish();
      return;
    }
    if (p.mode === "time" && parts.length >= words.length - 5 && !challenge) {
      target += " " + generate(p.lang, 60, p.marks, p.numbers);
      words = target.split(" ");
    }
    tick();
    draw();
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && (e.ctrlKey || e.altKey)) {
      e.preventDefault();
      input.value = prev.replace(/\S+\s*$|\s+$/, "");
      input.dispatchEvent(new Event("input"));
      return;
    }
    if (e.key === "Enter" && p.mode === "zen" && e.shiftKey) {
      e.preventDefault();
      finish();
    } else if (e.key === "Enter") e.preventDefault();
    if (
      [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ].includes(e.key)
    )
      e.preventDefault();
  });
  input.addEventListener("click", () =>
    input.setSelectionRange(input.value.length, input.value.length),
  );
  window.addEventListener("resize", () => {
    cancelAnimationFrame(renderFrame);
    renderFrame = requestAnimationFrame(draw);
  });
  return {
    reset,
    draw,
    finish,
    stop,
    abandon() {
      stop();
      seq++;
      done = true;
    },
    focus: () => input.focus({ preventScroll: true }),
    active: () => active,
  };
}
