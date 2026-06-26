export function 填入題目卡片(元素, 題目) {
  元素.題目分類.textContent = 題目.driverName || "生活情境";
  元素.題目文字.textContent = 題目.question;
  元素.左側文字.textContent = 題目.leftLabel || "有一點像我";
  元素.右側文字.textContent = 題目.rightLabel || "非常像我";
}
