export function 更新進度條(進度條, 目前題號, 題目總數) {
  進度條.style.width = `${((目前題號 + 1) / 題目總數) * 100}%`;
}
