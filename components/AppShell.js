export function 顯示頁面(頁面列表, 目標頁面) {
  頁面列表.forEach((頁面) => 頁面.classList.add("hidden"));
  目標頁面.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
