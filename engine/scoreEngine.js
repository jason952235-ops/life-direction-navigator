export function 依答案計算結果(題庫, 答案資料) {
  const 分數 = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };
  const 題數 = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  題庫.forEach((題目) => {
    分數[題目.driver] += 答案資料[題目.id]?.percentageValue ?? 50;
    題數[題目.driver] += 1;
  });

  Object.keys(分數).forEach((代號) => {
    分數[代號] = Math.round(分數[代號] / 題數[代號]);
  });

  const 排序後分數 = Object.entries(分數).sort((前, 後) => 後[1] - 前[1]);
  const 第一名 = 排序後分數[0];
  const 第二名 = 排序後分數[1];

  return {
    主驅動力: 第一名[0],
    第二驅動力: 第二名[0],
    是雙驅動: 第一名[1] - 第二名[1] <= 5,
    排序後分數,
  };
}

export function 建立中文結果資料(結果資料, 驅動力說明) {
  if (!結果資料) {
    return null;
  }

  return {
    ...結果資料,
    主驅動力中文: 驅動力說明[結果資料.主驅動力].名稱,
    第二驅動力中文: 驅動力說明[結果資料.第二驅動力].名稱,
    排序後分數中文: 結果資料.排序後分數.map(([代號, 分數]) => ({
      code: 代號,
      name: 驅動力說明[代號].名稱,
      percentage: 分數,
    })),
  };
}
