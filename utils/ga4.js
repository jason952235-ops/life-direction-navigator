export const GA4測量ID = "G-JBVZVZ3SZJ";

export function 載入GA4() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", GA4測量ID, {
    send_page_view: false,
  });
}

export function 追蹤事件(事件名稱, 事件資料 = {}) {
  if (typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", 事件名稱, 事件資料);
}
