const CACHE_NAME = "spirito-vita-v4";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/logo-ar.png",
  "/logo-en.png",
  "/audio/ambiance.ogg",
  "/images/categories/burgers.jpg",
  "/images/categories/soup.jpg",
  "/images/categories/sides.jpg",
  "/images/categories/pasta.jpg",
  "/images/categories/salads.jpg",
  "/images/categories/main.jpg",
  "/images/categories/sandwiches.jpg",
  "/images/categories/pizza.jpg",
  "/images/categories/healthy.jpg",
  "/images/categories/desserts.jpg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
