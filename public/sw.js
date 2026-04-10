/* global self */
self.addEventListener("push", (event) => {
  let payload = { title: "Foodie", body: "", orderId: "", type: "order" };
  try {
    if (event.data) {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    }
  } catch {
    try {
      const t = event.data?.text();
      if (t) payload.body = t;
    } catch {
      /* ignore */
    }
  }

  const title = payload.title || "Foodie";
  const body = payload.body || "You have a new update.";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      data: {
        url: payload.orderId ? `/notifications` : "/notifications",
        orderId: payload.orderId || "",
        type: payload.type || "order",
      },
      tag: payload.orderId ? `order-${payload.orderId}` : "foodie-general",
      renotify: true,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const path = "/notifications";
  const absolute = new URL(path, self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && "focus" in client) {
          void client.focus();
          if ("navigate" in client && typeof client.navigate === "function") {
            void client.navigate(path);
          }
          return;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(absolute);
      }
    }),
  );
});
