export function 建立驅動力分數列(名稱, 分數) {
  const 列 = document.createElement("div");
  列.className = "score-row";
  列.innerHTML = `
    <span class="score-name">${名稱}</span>
    <span class="score-bar" aria-hidden="true"><span style="width: ${分數}%"></span></span>
    <span class="score-value">${分數}%</span>
  `;
  return 列;
}
