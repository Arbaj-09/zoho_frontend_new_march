/* eslint-disable no-undef */
console.log("✅ firebase-messaging-sw.js loaded");

// ✅ Use CDN worker-safe compat files to avoid local file corruption
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

// ⚠️ Service workers cannot read env vars. Put static values here.
firebase.initializeApp({
  apiKey: "AIzaSyCxWQoSJljxt-vPum4KTtbASZCW5liUjT8",
  authDomain: "zoho-cf081.firebaseapp.com",
  projectId: "zoho-cf081",
  storageBucket: "zoho-cf081.firebasestorage.app",
  messagingSenderId: "60750068601",
  appId: "1:60750068601:web:985809bb4bff5a49cc4da8",
});

let messaging = null;
try {
  messaging = firebase.messaging();
  console.log("✅ firebase.messaging initialized");
} catch (e) {
  console.error("❌ firebase.messaging failed", e);
}

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

// Background notifications
if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    try {
      console.log("✅ Background message received:", payload);
      const notification = (payload && payload.notification) || {};
      const data = (payload && payload.data) || {};
      const title = notification.title || "Notification";
      const url = data.url || "/";

      const options = {
        body: notification.body || "",
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        data: { ...data, url },
      };

      self.registration.showNotification(title, options);
    } catch (e) {
      console.error("❌ onBackgroundMessage failed", e);
    }
  });
}

// Click → focus or open
self.addEventListener("notificationclick", (event) => {
  event.notification?.close();
  const url = (event.notification && event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      return clients.openWindow ? clients.openWindow(url) : null;
    })
  );
});
