export function 讀取本機資料(儲存鍵) {
  const 原始資料 = localStorage.getItem(儲存鍵);

  if (!原始資料) {
    return null;
  }

  try {
    return JSON.parse(原始資料);
  } catch {
    return 原始資料;
  }
}

export function 寫入本機資料(儲存鍵, 資料) {
  localStorage.setItem(儲存鍵, JSON.stringify(資料));
}

export function 移除本機資料(儲存鍵) {
  localStorage.removeItem(儲存鍵);
}
