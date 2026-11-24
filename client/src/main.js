import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/jetbrains-mono/latin-400.css";
import "@fontsource/jetbrains-mono/latin-600.css";
import "@fontsource/jetbrains-mono/cyrillic-400.css";
import "./generated.css";
import Chart from "chart.js/auto";
import {
  $,
  esc,
  ico,
  api,
  icons,
  langs,
  modes,
  lengths,
  themes,
  read,
  write,
  toast,
  modal,
  options,
} from "./ui.js";
import { day, streak, regions, level } from "../shared/lexicon.mjs";
import { engine } from "./engine.js";
icons();
const defaults = {
  mode: "time",
  value: 30,
  lang: "latin",
  theme: "dark",
  marks: false,
  numbers: false,
  sound: false,
  pace: "0",
  keymap: false,
  goal: 3,
  custom: "",
};
const p = { ...defaults, ...read("prefs", {}) },
  save = () => write("prefs", p);
const values = {
    time: [15, 30, 60, 120],
    words: [10, 25, 50, 100],
    quote: ["short", "medium", "long"],
    zen: ["free"],
    custom: ["text"],
    weak: ["keys"],
  },
  modeIcons = {
    time: "timer",
    words: "align-left",
    quote: "text-quote",
    zen: "infinity",
    custom: "text-cursor-input",
  };
let user = null,
  bot = null,
  stats = null,
  page = "test",
  graph = null,
  version = 0,
  syncing = false,
  last = null;
const queue = () => read("queue", []),
  guest = () =>
    queue()
      .filter((x) => x.owner === null)
      .map((x) => x.r);
const records = () =>
  user
    ? [
        ...queue()
          .filter((x) => x.owner === user.id)
          .map((x) => x.r),
        ...(stats?.recent || []),
      ]
    : guest();
const best = () =>
  Math.max(
    0,
    ...records()
      .filter(
        (r) =>
          r.mode === p.mode &&
          String(r.mode_value) === String(p.value) &&
          r.language === p.lang,
      )
      .map((r) => r.wpm),
    ...(stats?.practice_bests || [])
      .filter(
        (r) => r.mode_key === p.mode + "-" + p.value && r.language === p.lang,
      )
      .map((r) => r.best_wpm),
  );
function weak() {
  const w = {};
  for (const r of records())
    for (const [k, v] of Object.entries(
      r.weak_keys || JSON.parse(r.weak_keys_json || "{}"),
    ))
      w[k] = (w[k] || 0) + v;
  return Object.fromEntries(
    Object.entries(w)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8),
  );
}
const eng = engine({ p, user: () => user, best, weak, finish: result });
function numbers() {
  const rs = records(),
    pending = user ? queue().filter((x) => x.owner === user.id) : [];
  return {
    total: user ? (stats?.total || 0) + pending.length : rs.length,
    today: user
      ? (stats?.today || 0) +
        pending.filter((x) => day(x.r.created_at) === day(Date.now())).length
      : rs.filter((x) => day(x.created_at) === day(Date.now())).length,
    st: user
      ? stats?.current_streak || 0
      : streak(rs.map((r) => day(r.created_at))).current,
    goal: user?.daily_goal || p.goal,
  };
}
function cards() {
  const { today, st, goal } = numbers();
  $("goalCard").innerHTML =
    '<div class="big">' +
    today +
    " <small>/ " +
    goal +
    ' ta</small></div><div class="progress">' +
    Array.from(
      { length: goal },
      (_, i) => '<i class="' + (i < today ? "fill" : "") + '"></i>',
    ).join("") +
    "</div>";
  $("streakCard").innerHTML =
    '<div class="big">' +
    st +
    ' <small>kun</small></div><p class="sub">Ketma-ket mashq kunlari</p>';
  $("bestCard").innerHTML =
    '<div class="big">' +
    (best() || "—") +
    ' <small>WPM</small></div><p class="sub">Tanlangan mashq bo‘yicha</p>';
}
function bar() {
  document.documentElement.dataset.theme = p.theme;
  $("modes").innerHTML = Object.keys(modeIcons)
    .map(
      (m) =>
        '<button data-mode="' +
        m +
        '" class="' +
        (m === p.mode ? "on" : "") +
        '">' +
        ico(modeIcons[m]) +
        modes[m] +
        "</button>",
    )
    .join("");
  $("values").innerHTML =
    values[p.mode].length > 1
      ? values[p.mode]
          .map(
            (v) =>
              '<button data-value="' +
              v +
              '" class="' +
              (String(v) === String(p.value) ? "on" : "") +
              '">' +
              (lengths[v] || v) +
              "</button>",
          )
          .join("")
      : '<span class="sub">' +
        (p.mode === "custom"
          ? "O‘z matningiz"
          : p.mode === "weak"
            ? "Xatolarni mashq qilish"
            : "Cheklovsiz") +
        "</span>";
  for (const k of ["marks", "numbers"]) {
    $(k).disabled = !["time", "words"].includes(p.mode);
    $(k).classList.toggle("on", p[k] && !$(k).disabled);
    $(k).setAttribute("aria-pressed", String(p[k] && !$(k).disabled));
  }
  $("sound").innerHTML = ico(p.sound ? "volume-2" : "volume-x");
  $("sound").setAttribute("aria-pressed", String(p.sound));
  $("langButton").querySelector("span").textContent = langs[p.lang];
  cards();
}
function reset(repeat = false, focus = false) {
  if (graph) {
    graph.destroy();
    graph = null;
  }
  bar();
  eng.reset(repeat);
  if (focus) eng.focus();
  save();
}
function mode(m) {
  if (m === "custom") {
    custom();
    return;
  }
  p.mode = m;
  p.value = m === "time" ? 30 : m === "words" ? 25 : values[m][0];
  if (m === "quote") p.lang = "latin";
  reset(false, true);
}
function custom() {
  modal(
    "Maxsus matn",
    '<label class="field">Mashq uchun matn<textarea id="customText" maxlength="5000">' +
      esc(p.custom) +
      '</textarea></label><button class="primary" id="applyText">Mashqni boshlash</button>',
  );
  $("applyText").onclick = () => {
    const s = $("customText").value.trim();
    if (!s) return $("customText").focus();
    p.custom = s;
    p.mode = "custom";
    p.value = "text";
    $("dialog").close();
    reset(false, true);
  };
}
$("modes").onclick = (e) => {
  const b = e.target.closest("[data-mode]");
  if (b) mode(b.dataset.mode);
};
$("values").onclick = (e) => {
  const b = e.target.closest("[data-value]");
  if (b) {
    p.value = b.dataset.value;
    reset(false, true);
  }
};
for (const k of ["marks", "numbers"])
  $(k).onclick = () => {
    p[k] = !p[k];
    reset(false, true);
  };
$("restart").onclick = () => reset(false, true);
$("zenDone").onclick = eng.finish;
$("sound").onclick = () => {
  p.sound = !p.sound;
  bar();
  save();
  eng.focus();
};
$("keyToggle").onclick = () => {
  p.keymap = !p.keymap;
  save();
  eng.draw();
};
$("langButton").onclick = () => {
  modal(
    "Lug‘atni tanlang",
    Object.entries(langs)
      .map(
        ([k, v]) =>
          '<button class="choice ' +
          (k === p.lang ? "active" : "") +
          '" data-lang="' +
          k +
          '">' +
          v +
          "</button>",
      )
      .join(""),
  );
  $("dialogBody").onclick = (e) => {
    const l = e.target.dataset.lang;
    if (!l) return;
    p.lang = l;
    if (p.mode === "quote" && l !== "latin") {
      p.mode = "words";
      p.value = 25;
    }
    $("dialog").close();
    reset(false, true);
  };
};
function settings() {
  modal(
    "Sozlamalar",
    field("Mavzu", "theme", themes, p.theme) +
      field(
        "Raqib kursor",
        "pace",
        {
          0: "O‘chirilgan",
          pb: "Shaxsiy rekord",
          40: "40 WPM",
          60: "60 WPM",
          80: "80 WPM",
          100: "100 WPM",
        },
        p.pace,
      ) +
      field(
        "Klaviatura ovozi",
        "audioOpt",
        { off: "O‘chirilgan", on: "Yoqilgan" },
        p.sound ? "on" : "off",
      ) +
      (!user
        ? field(
            "Kunlik maqsad",
            "goal",
            { 3: "3 ta sinov", 5: "5 ta sinov", 10: "10 ta sinov" },
            p.goal,
          )
        : ""),
  );
  $("theme").onchange = (e) => {
    p.theme = e.target.value;
    bar();
    save();
  };
  $("paceOpt").onchange = (e) => {
    p.pace = e.target.value;
    save();
    eng.draw();
  };
  $("audioOpt").onchange = (e) => {
    p.sound = e.target.value === "on";
    bar();
    save();
  };
  if ($("goal"))
    $("goal").onchange = (e) => {
      p.goal = Number(e.target.value);
      cards();
      save();
    };
}
function field(label, id, obj, val) {
  return (
    '<label class="field">' +
    label +
    '<select id="' +
    (id === "pace" ? "paceOpt" : id) +
    '">' +
    options(obj, val) +
    "</select></label>"
  );
}
$("settings").onclick = settings;
$("close").onclick = () => $("dialog").close();
function commands() {
  const cmds = [
    [
      "Yangi mashq",
      () => {
        navigate("test");
        reset(false, true);
      },
    ],
    ["Sozlamalar", settings],
    ["Reyting", () => navigate("board")],
    ["Statistika", () => navigate("stats")],
    ["Lug‘atni tanlash", () => $("langButton").click()],
    ["Xatolarni mashq qilish", practiceWeak],
  ];
  modal(
    "Tezkor buyruqlar",
    '<input id="query" placeholder="Buyruqni izlang…" aria-label="Buyruqni izlang"><div id="matches"></div>',
  );
  const draw = () => {
    $("matches").replaceChildren();
    for (const [name, fn] of cmds.filter(([n]) =>
      n.toLowerCase().includes($("query").value.toLowerCase()),
    )) {
      const b = document.createElement("button");
      b.className = "choice";
      b.textContent = name;
      b.onclick = () => {
        $("dialog").close();
        fn();
      };
      $("matches").append(b);
    }
  };
  draw();
  $("query").oninput = draw;
  $("query").onkeydown = (e) => {
    if (e.key === "Enter") $("matches").firstChild?.click();
  };
  $("query").focus();
}
$("commands").onclick = commands;
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.shiftKey && e.code === "KeyP") {
    e.preventDefault();
    commands();
    return;
  }
  if ($("dialog").open) return;
  if (e.key === "Escape") {
    e.preventDefault();
    settings();
  }
  if (
    e.key === "Tab" &&
    page === "test" &&
    !e.shiftKey &&
    (document.activeElement === $("input") ||
      document.activeElement === document.body)
  ) {
    e.preventDefault();
    reset(false, true);
  }
  if (
    page === "test" &&
    !$("practice").hidden &&
    document.activeElement === document.body &&
    e.key.length === 1 &&
    !e.metaKey &&
    !e.ctrlKey &&
    !e.altKey
  )
    eng.focus();
});
function practiceWeak() {
  if (!Object.keys(weak()).length) {
    toast("Zaif harflar keyingi xatolaringiz asosida aniqlanadi.");
    return;
  }
  navigate("test");
  p.mode = "weak";
  p.value = "keys";
  reset(false, true);
}
async function refresh() {
  if (!user) {
    stats = null;
    cards();
    return;
  }
  const uid = user.id;
  const data = await api("/results/me");
  if (user?.id === uid) {
    stats = data;
    cards();
  }
}
async function sync(importGuest = false) {
  if (!user || syncing) return;
  syncing = true;
  const uid = user.id;
  try {
    if (importGuest) {
      const list = queue();
      for (const x of list) if (x.owner === null) x.owner = uid;
      write("queue", list);
    }
    while (user?.id === uid) {
      const x = queue().find((item) => item.owner === uid);
      if (!x) break;
      const status = await api("/results", "POST", x.r);
      if (
        !write(
          "queue",
          queue().filter((y) => y.r.client_id !== x.r.client_id),
        )
      )
        break;
      if (last?.client_id === x.r.client_id && $("saveStatus"))
        $("saveStatus").textContent = status.ranked
          ? "Tasdiqlangan rekordlar uchun qabul qilindi."
          : "Profil tarixiga saqlandi.";
    }
    await refresh();
    if (page === "stats") showStats();
  } catch {
    toast("Natijalar qurilmada saqlandi. Aloqa tiklanganda yuboriladi.");
  } finally {
    syncing = false;
  }
}
window.addEventListener("online", () => sync());
async function initialize() {
  try {
    const data = await api("/auth/me");
    user = data.user;
    bot = data.bot;
    if (user) {
      $("account").querySelector("span").textContent = user.display_name;
      await sync(true);
      if (!eng.active() && page === "test" && !last) reset();
    }
  } catch {}
}
function result(r, owner) {
  last = r;
  const stored = { ...r };
  if (!stored.challenge) {
    stored.input = "";
    stored.keystrokeTimings = [];
  }
  const saved = write("queue", [{ owner, r: stored }, ...queue()]);
  cards();
  if (user) sync();
  $("practice").hidden = true;
  $("results").hidden = false;
  const widgets = [
    ["Yalpi tezlik", r.raw_wpm + " WPM"],
    ["Aniqlik", r.accuracy + "%"],
    ["Sof tezlik", r.wpm + " WPM"],
    ["Barqarorlik", r.consistency + "%"],
  ];
  $("results").innerHTML =
    '<p class="eyebrow">MASHQ NATIJASI</p><h2 class="my-4">' +
    modes[r.mode] +
    " · " +
    langs[r.language] +
    '</h2><div class="summary">' +
    widgets
      .map(
        ([k, v]) =>
          '<div><div class="metric">' +
          v +
          '</div><span class="sub">' +
          k +
          "</span></div>",
      )
      .join("") +
    '</div><div class="graph"><canvas id="chart" aria-label="Soniyalar bo‘yicha yozish tezligi"></canvas></div><p class="sub">To‘g‘ri: ' +
    r.correct_chars +
    " · Xato: " +
    r.incorrect_chars +
    " · Ortiqcha: " +
    r.extra_chars +
    " · Tushib qolgan: " +
    r.missed_chars +
    '</p><p id="saveStatus" class="sub my-4">' +
    (saved
      ? user
        ? "Profilga yuborilmoqda…"
        : "Natija shu qurilmaga saqlandi."
      : "Qurilmada natijani saqlash uchun joy yetmadi.") +
    '</p><div class="action-row"><button id="again">' +
    ico("rotate-ccw") +
    'Yangi mashq</button><button id="repeat">' +
    ico("repeat") +
    'Matnni takrorlash</button><button id="copy">' +
    ico("copy") +
    'Nusxalash</button><button id="png">' +
    ico("download") +
    'PNG karta</button><button id="weakTrain">Xatolarni mashq qilish</button></div>';
  const color = getComputedStyle(document.documentElement)
    .getPropertyValue("--gold")
    .trim();
  graph = new Chart($("chart"), {
    type: "line",
    data: {
      labels: r.wpmSeries.map((_, i) => i + 1),
      datasets: [
        {
          label: "Yalpi tezlik (WPM)",
          data: r.wpmSeries,
          borderColor: color,
          backgroundColor: color + "22",
          fill: true,
          pointRadius: 0,
          tension: 0.22,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      scales: {
        x: {
          title: { display: true, text: "Soniya" },
          ticks: { maxTicksLimit: 10 },
        },
        y: { beginAtZero: true },
      },
    },
  });
  $("again").onclick = () => reset(false, true);
  $("repeat").onclick = () => reset(true, true);
  $("weakTrain").onclick = practiceWeak;
  $("copy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(
        "Harfchi.uz · " + r.wpm + " WPM · Aniqlik " + r.accuracy + "%",
      );
      toast("Natija nusxalandi.");
    } catch {
      toast("Nusxalash uchun brauzer ruxsati kerak.");
    }
  };
  $("png").onclick = () => {
    const c = document.createElement("canvas");
    c.width = 1200;
    c.height = 630;
    const g = c.getContext("2d");
    g.fillStyle = "#323437";
    g.fillRect(0, 0, 1200, 630);
    g.fillStyle = "#e2b714";
    g.font = "bold 46px monospace";
    g.fillText("harfchi.uz", 76, 105);
    g.font = "bold 104px monospace";
    g.fillText(r.wpm + " WPM", 76, 284);
    g.fillStyle = "#d1d0c5";
    g.font = "34px sans-serif";
    g.fillText(
      "Aniqlik " + r.accuracy + "%   ·   Barqarorlik " + r.consistency + "%",
      80,
      385,
    );
    g.fillText(
      langs[r.language] +
        "   /   " +
        modes[r.mode] +
        "   /   " +
        Math.round(r.duration_sec) +
        " soniya",
      80,
      505,
    );
    c.toBlob((b) => {
      if (!b) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = "harfchi-natija.png";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }, "image/png");
  };
}
function title(label, heading) {
  return (
    '<div class="title-row"><div><p class="eyebrow"><span class="line"></span>' +
    label +
    "</p><h1>" +
    heading +
    "<span>.</span></h1></div></div>"
  );
}
function table(headers, rows, empty) {
  return rows.length
    ? '<div class="table-wrap"><table><thead><tr>' +
        headers.map((h) => "<th>" + h + "</th>").join("") +
        "</tr></thead><tbody>" +
        rows
          .map(
            (r) =>
              "<tr>" + r.map((c) => "<td>" + c + "</td>").join("") + "</tr>",
          )
          .join("") +
        "</tbody></table></div>"
    : '<p class="empty">' + empty + "</p>";
}
function showStats() {
  const n = numbers(),
    w = weak();
  $("other").innerHTML =
    title("SHAXSIY NATIJALAR", "Statistika") +
    '<div class="panel"><div class="summary">' +
    [
      ["Daraja", level(n.total)],
      ["Sinovlar", n.total],
      ["Kunlik seriya", n.st + " kun"],
      ["Bugun", n.today + " / " + n.goal],
    ]
      .map(
        ([a, b]) => '<div><p class="sub">' + a + "</p><h2>" + b + "</h2></div>",
      )
      .join("") +
    '</div></div><div class="panel"><h2>Zaif harflar</h2><div class="my-4">' +
    (Object.entries(w)
      .map(
        ([k, v]) =>
          '<span class="pill">' +
          esc(k === " " ? "Bo‘sh joy" : k) +
          " · " +
          v +
          "</span>",
      )
      .join("") ||
      '<span class="sub">Xatolar qayd etilganda harflar shu yerda ko‘rinadi.</span>') +
    '</div><button id="train" class="outline">Xatolarni mashq qilish</button></div><div class="panel"><h2>So‘nggi mashqlar</h2>' +
    table(
      ["Sana", "Mashq", "Sof tezlik", "Aniqlik"],
      records()
        .slice(0, 50)
        .map((r) => [
          day(r.created_at),
          modes[r.mode],
          r.wpm + " WPM",
          r.accuracy + "%",
        ]),
      "Birinchi mashqingizdan so‘ng natija shu yerda ko‘rinadi.",
    ) +
    "</div>";
  $("train").onclick = practiceWeak;
}
function board() {
  const reg = {
    "": "Butun O‘zbekiston",
    ...Object.fromEntries(regions.map((r) => [r, r])),
  };
  $("other").innerHTML =
    title("TEZ YOZUVCHILAR", "Reyting") +
    '<div class="panel"><div class="filters">' +
    field(
      "Vaqt",
      "bm",
      { 15: "15 soniya", 30: "30 soniya", 60: "60 soniya" },
      30,
    ) +
    field(
      "Lug‘at",
      "bl",
      { latin: langs.latin, cyrillic: langs.cyrillic },
      "latin",
    ) +
    field(
      "Davr",
      "bp",
      { daily: "Bugun", weekly: "Oxirgi 7 kun", all: "Barcha vaqt" },
      "all",
    ) +
    field("Hudud", "br", reg, "") +
    '</div><div id="ranks"></div></div>';
  const update = async () => {
    const v = ++version;
    $("ranks").textContent = "Yuklanmoqda…";
    try {
      const data = await api(
        "/leaderboard?" +
          new URLSearchParams({
            mode: $("bm").value,
            lang: $("bl").value,
            period: $("bp").value,
            region: $("br").value,
          }),
      );
      if (v !== version || !$("ranks")) return;
      $("ranks").innerHTML = table(
        ["O‘rin", "Ism", "Hudud", "Sof tezlik", "Aniqlik"],
        data.map((r, i) => [
          i + 1,
          r.username
            ? '<a href="/u/' +
              encodeURIComponent(r.username) +
              '">' +
              esc(r.display_name) +
              "</a>"
            : esc(r.display_name),
          esc(r.region || "—"),
          r.wpm + " WPM",
          r.accuracy + "%",
        ]),
        "Bu filtrlar bo‘yicha hali tasdiqlangan natija yo‘q.",
      );
    } catch {
      if (v === version && $("ranks"))
        $("ranks").textContent =
          "Reytingni yuklab bo‘lmadi. Internet aloqasini tekshiring.";
    }
  };
  ["bm", "bl", "bp", "br"].forEach((id) => ($(id).onchange = update));
  update();
}
function navigate(dest) {
  page = dest;
  version++;
  $("test").hidden = dest !== "test";
  $("other").hidden = dest === "test";
  document
    .querySelectorAll("[data-page]")
    .forEach((b) => b.classList.toggle("selected", b.dataset.page === dest));
  if (dest === "test") {
    reset();
    return;
  }
  eng.abandon();
  if (dest === "board") board();
  if (dest === "stats") {
    showStats();
    if (user)
      refresh()
        .then(() => {
          if (page === "stats") showStats();
        })
        .catch(() => {});
  }
}
document.querySelector("nav").onclick = (e) => {
  const b = e.target.closest("[data-page]");
  if (b) {
    if (location.pathname !== "/") history.replaceState(null, "", "/");
    navigate(b.dataset.page);
  }
};
async function publicProfile(name) {
  navigate("public");
  $("other").textContent = "Yuklanmoqda…";
  try {
    const u = await api("/u/" + encodeURIComponent(name));
    if (page !== "public") return;
    $("other").innerHTML =
      title("OMMAVIY PROFIL", esc(u.display_name)) +
      '<div class="panel"><h2>' +
      u.level +
      '</h2><p class="my-4">' +
      esc(u.region || "Hudud ko‘rsatilmagan") +
      " · " +
      u.current_streak +
      " kunlik seriya · Eng uzun seriya: " +
      u.best_streak +
      " kun</p>" +
      table(
        ["Mashq", "Lug‘at", "Rekord", "Aniqlik"],
        u.personal_bests.map((r) => [
          esc(r.mode_key.replace("time-", "Vaqt · ")) + " s",
          langs[r.language],
          r.best_wpm + " WPM",
          r.best_accuracy + "%",
        ]),
        "Tasdiqlangan rekordlar hali yo‘q.",
      ) +
      "</div>";
  } catch (e) {
    if (page === "public") $("other").textContent = e.message;
  }
}
$("account").onclick = () => {
  if (!user) {
    modal(
      "Hisobga kirish",
      '<p class="sub">Telegram orqali kiring. Ushbu qurilmadagi mehmon natijalari profilingizga qo‘shiladi.</p><div class="my-4" id="widget"></div>',
    );
    if (!bot) {
      $("widget").textContent =
        "Telegram orqali kirish hozir mavjud emas. Mehmon sifatida mashq qilishingiz mumkin.";
      return;
    }
    const s = document.createElement("script");
    s.src = "https://telegram.org/js/telegram-widget.js?22";
    s.async = true;
    s.dataset.telegramLogin = bot;
    s.dataset.size = "large";
    s.dataset.lang = "uz";
    s.dataset.userpic = "false";
    s.dataset.authUrl = location.origin + "/";
    $("widget").append(s);
    return;
  }
  modal(
    "Profil sozlamalari",
    '<label class="field">Ism<input id="name" maxlength="80" value="' +
      esc(user.display_name) +
      '"></label>' +
      field(
        "Hudud",
        "region",
        {
          "": "Tanlanmagan",
          ...Object.fromEntries(regions.map((r) => [r, r])),
        },
        user.region || "",
      ) +
      field(
        "Kunlik maqsad",
        "userGoal",
        { 3: "3 ta sinov", 5: "5 ta sinov", 10: "10 ta sinov" },
        user.daily_goal,
      ) +
      '<div class="action-row"><button id="saveUser" class="primary">Saqlash</button><button id="logout">Hisobdan chiqish</button></div>',
  );
  $("saveUser").onclick = async () => {
    try {
      user = (
        await api("/profile", "PATCH", {
          display_name: $("name").value,
          region: $("region").value || null,
          daily_goal: Number($("userGoal").value),
        })
      ).user;
      $("account").querySelector("span").textContent = user.display_name;
      $("dialog").close();
      cards();
      if (page === "stats") showStats();
    } catch (e) {
      toast(e.message);
    }
  };
  $("logout").onclick = async () => {
    try {
      await api("/auth/logout", "POST", {});
      location.replace("/");
    } catch (e) {
      toast(e.message);
    }
  };
};
async function boot() {
  const params = new URLSearchParams(location.search);
  if (params.has("hash") && params.has("auth_date")) {
    const b = Object.fromEntries(params);
    history.replaceState(null, "", location.pathname);
    try {
      await api("/auth/telegram", "POST", b);
    } catch (e) {
      toast(e.message);
    }
  }
  reset();
  await initialize();
  if (location.pathname.startsWith("/u/"))
    publicProfile(decodeURIComponent(location.pathname.slice(3)));
  if ("serviceWorker" in navigator)
    navigator.serviceWorker.register("/sw.js").catch(() => {});
}
boot();
