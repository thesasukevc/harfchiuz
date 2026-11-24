export const $ = (id) => document.getElementById(id);
export const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export const ico = (name) =>
  '<svg aria-hidden="true" class="ico"><use href="/icons.svg#i-' +
  name +
  '"></use></svg>';
export const icons = () =>
  document
    .querySelectorAll("[data-i]")
    .forEach((el) => (el.outerHTML = ico(el.dataset.i)));
export const langs = {
  latin: "O‘zbekcha lotin",
  easy: "O‘zbekcha oson",
  cyrillic: "O‘zbekcha kirill",
  code: "Dasturlash",
};
export const modes = {
  time: "Vaqt",
  words: "So‘z",
  quote: "Iqtibos",
  zen: "Erkin",
  custom: "Maxsus",
  weak: "Zaif harflar",
};
export const lengths = { short: "Qisqa", medium: "O‘rta", long: "Uzun" };
export const themes = {
  dark: "Harfchi tungi",
  samarqand: "Samarqand",
  toshkent: "Toshkent oqshomi",
  choy: "Yashil choy",
  qogoz: "Oq qog‘oz",
};
export function read(k, v) {
  try {
    return JSON.parse(localStorage.getItem("harfchi:" + k)) ?? v;
  } catch {
    return v;
  }
}
export function write(k, v) {
  try {
    localStorage.setItem("harfchi:" + k, JSON.stringify(v));
    return true;
  } catch {
    toast("Qurilmada saqlash uchun joy yetarli emas.");
    return false;
  }
}
let timer;
export function toast(s) {
  $("notice").textContent = s;
  clearTimeout(timer);
  timer = setTimeout(() => ($("notice").textContent = ""), 4000);
}
export function modal(title, body) {
  $("dialogBody").onclick = null;
  $("dialogTitle").textContent = title;
  $("dialogBody").innerHTML = body;
  if (!$("dialog").open) $("dialog").showModal();
}
export const options = (obj, val) =>
  Object.entries(obj)
    .map(
      ([k, v]) =>
        '<option value="' +
        esc(k) +
        '" ' +
        (String(val) === k ? "selected" : "") +
        ">" +
        esc(v) +
        "</option>",
    )
    .join("");
export async function api(path, method = "GET", body) {
  const res = await fetch("/api" + path, {
    method,
    credentials: "same-origin",
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(12000),
  });
  const data = await res.json();
  if (!res.ok) throw Error(data.error || "So‘rov amalga oshmadi.");
  return data;
}
