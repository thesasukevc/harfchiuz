const CACHE = "harfchi-bf3b1248d64065",
  FILES = ["/assets/index-C0zEyA9m.css","/assets/index-DfAeTcnC.js","/assets/inter-latin-400-normal-C38fXH4l.woff2","/assets/inter-latin-400-normal-CyCys3Eg.woff","/assets/inter-latin-600-normal-CiBQ2DWP.woff","/assets/inter-latin-600-normal-LgqL8muc.woff2","/assets/jetbrains-mono-cyrillic-400-normal-BEIGL1Tu.woff2","/assets/jetbrains-mono-cyrillic-400-normal-ugxPyKxw.woff","/assets/jetbrains-mono-latin-400-normal-6-qcROiO.woff","/assets/jetbrains-mono-latin-400-normal-V6pRDFza.woff2","/assets/jetbrains-mono-latin-600-normal-BfsvjouI.woff","/assets/jetbrains-mono-latin-600-normal-C8RAYTDA.woff2","/brand.svg","/favicon.svg","/icon-192.png","/icon-512.png","/icons.svg","/index.html","/manifest.json","/share.png"];
self.addEventListener("install", (e) =>
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(FILES))
      .then(() => self.skipWaiting()),
  ),
);
self.addEventListener("activate", (e) =>
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("harfchi-") && k !== CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  ),
);
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (
    e.request.method !== "GET" ||
    u.origin !== location.origin ||
    u.pathname.startsWith("/api/")
  )
    return;
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).catch(() => caches.match("/index.html")));
    return;
  }
  if (FILES.includes(u.pathname))
    e.respondWith(
      caches.match(u.pathname).then((hit) => hit || fetch(e.request)),
    );
});
