export function 取得單選答案(名稱) {
  return document.querySelector(`input[name="${名稱}"]:checked`)?.value || "";
}
