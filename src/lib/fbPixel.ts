// src/lib/fbPixel.ts
export function initFbPixel(pixelId: string) {
  if (typeof window === "undefined") return;
  if ((window as any).fbq) return;

  (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      (n.callMethod)
        ? n.callMethod.apply(n, arguments)
        : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = "https://connect.facebook.net/en_US/fbevents.js";
    s = b.getElementsByTagName(e)[0];
    s.parentNode!.insertBefore(t, s);
  })(window, document, "script", 0);

  (window as any).fbq("init", pixelId);
  (window as any).fbq("track", "PageView");
}

export function genEventId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// chỉ track Pixel phía browser
export function trackEventBrowser(eventName: string, customData?: Record<string, any>, eventId?: string) {
  (window as any).fbq?.("track", eventName, customData || {}, eventId ? { eventID: eventId } : {});
}
