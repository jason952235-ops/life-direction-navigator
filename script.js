const 驅動力名稱 = {
  甲: "成長驅動力",
  乙: "影響驅動力",
  丙: "連結驅動力",
  丁: "卓越驅動力",
  戊: "洞察驅動力",
};

const 驅動力摘要 = {
  甲: "你目前最在意的是持續學習、突破限制與擴大自己的可能性。",
  乙: "你目前最在意的是讓自己的行動產生影響，並推動他人或環境前進。",
  丙: "你目前最在意的是關係、歸屬感與和重要的人一起走得更穩。",
  丁: "你目前最在意的是品質、成果與把事情做到更成熟、更可靠。",
  戊: "你目前最在意的是理解本質、看清方向，並用更深的洞察做選擇。",
};

const 驅動力補充資料 = {
  甲: {
    優勢: ["學習力強", "適應力高", "勇於突破"],
    盲點: ["容易追求新鮮感", "容易忽略收斂與完成"],
  },
  乙: {
    優勢: ["表達力強", "帶動力高", "善於激勵他人"],
    盲點: ["容易太在意外界回饋", "容易急著推動他人"],
  },
  丙: {
    優勢: ["同理心強", "重視信任", "善於支持他人"],
    盲點: ["容易過度顧慮他人", "容易忽略自己的需求"],
  },
  丁: {
    優勢: ["規劃能力強", "執行力高", "重視細節"],
    盲點: ["容易要求過高", "容易陷入完美主義"],
  },
  戊: {
    優勢: ["觀察力強", "分析力強", "善於理解本質"],
    盲點: ["容易想太多", "行動速度較慢"],
  },
};

const 選項代號 = {
  甲: "A",
  乙: "B",
  丙: "C",
  丁: "D",
  戊: "E",
};

const GA4追蹤代碼 = "G-JBVZVZ3SZJ";

const 問卷清單 = questionBank.map((題目資料) => ({
  題目: 題目資料.question,
  選項: 題目資料.options.map((選項) => ({
    類型: 選項.type,
    文字: 選項.text,
  })),
}));
const 題目清單 = 問卷清單.map((題目資料) => 題目資料.題目);

let 目前題號 = 0;
let 分數 = { 甲: 0, 乙: 0, 丙: 0, 丁: 0, 戊: 0 };
let 報告已瀏覽 = false;
let 已選類型 = "";
let 目前滑軌值 = 80;

const 首頁 = document.querySelector("#首頁");
const 問卷頁 = document.querySelector("#問卷頁");
const 結果頁 = document.querySelector("#結果頁");
const 開始按鈕 = document.querySelector("#開始按鈕");
const 題數文字 = document.querySelector("#題數文字");
const 進度填滿 = document.querySelector("#進度填滿");
const 題目文字 = document.querySelector("#題目文字");
const 選項列表 = document.querySelector("#選項列表");
const 提示文字 = document.querySelector("#提示文字");
const 下一題按鈕 = document.querySelector("#下一題按鈕");
const 主驅動力 = document.querySelector("#主驅動力");
const 主分數 = document.querySelector("#主分數");
const 副驅動力 = document.querySelector("#副驅動力");
const 副分數 = document.querySelector("#副分數");
const 結果摘要 = document.querySelector("#結果摘要");
const 優勢列表 = document.querySelector("#優勢列表");
const 盲點列表 = document.querySelector("#盲點列表");
const 分數列表 = document.querySelector("#分數列表");
const 評分按鈕區 = document.querySelector("#評分按鈕區");
const 評分訊息 = document.querySelector("#評分訊息");
const 解鎖按鈕 = document.querySelector("#解鎖按鈕");
const 重新按鈕 = document.querySelector("#重新按鈕");

function 載入GA4() {
  if (GA4追蹤代碼 === "G-XXXXXXXXXX") {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", GA4追蹤代碼, {
    send_page_view: false,
  });
}

function 送出追蹤事件(事件名稱, 事件資料 = {}) {
  if (window.gtag) {
    window.gtag("event", 事件名稱, 事件資料);
  }
}

載入GA4();
// page_view：網站開啟時送出，用來統計首頁載入次數。
送出追蹤事件("page_view");

function 顯示頁面(頁面) {
  首頁.classList.add("隱藏");
  問卷頁.classList.add("隱藏");
  結果頁.classList.add("隱藏");
  頁面.classList.remove("隱藏");
}

function 開始測驗() {
  目前題號 = 0;
  分數 = { 甲: 0, 乙: 0, 丙: 0, 丁: 0, 戊: 0 };
  報告已瀏覽 = false;
  評分訊息.textContent = "";
  // quiz_start：使用者按下「開始測驗」時送出。
  送出追蹤事件("quiz_start");
  顯示題目();
  顯示頁面(問卷頁);
}

function 顯示題目() {
  const 顯示題號 = 目前題號 + 1;
  已選類型 = "";
  目前滑軌值 = 80;
  題數文字.textContent = `第 ${顯示題號} 題 / 共 ${題目清單.length} 題`;
  題目文字.textContent = 題目清單[目前題號];
  進度填滿.style.width = `${(顯示題號 / 題目清單.length) * 100}%`;
  提示文字.textContent = "";
  下一題按鈕.textContent = 顯示題號 === 題目清單.length ? "查看結果" : "下一題";
  選項列表.innerHTML = "";

  const 選項卡片區 = document.createElement("div");
  選項卡片區.className = "選項卡片區";

  問卷清單[目前題號].選項.forEach((選項) => {
    選項卡片區.appendChild(建立選項卡片(選項));
  });

  選項列表.appendChild(選項卡片區);
}

function 建立選項卡片(選項) {
  const 卡片 = document.createElement("button");
  卡片.className = "選項卡片";
  卡片.type = "button";
  卡片.textContent = `${選項代號[選項.類型]} ${選項.文字}`;
  卡片.dataset.類型 = 選項.類型;
  卡片.addEventListener("click", () => 選擇選項卡片(卡片));
  return 卡片;
}

function 選擇選項卡片(卡片) {
  已選類型 = 卡片.dataset.類型;
  目前滑軌值 = 80;
  提示文字.textContent = "";

  document.querySelectorAll(".選項卡片").forEach((選項卡片) => {
    選項卡片.classList.remove("已選擇");
    選項卡片.querySelector(".滑軌盒")?.remove();
  });

  卡片.classList.add("已選擇");
  卡片.appendChild(建立程度滑軌());
}

function 建立程度滑軌() {
  const 滑軌盒 = document.createElement("div");
  滑軌盒.className = "滑軌盒";

  const 滑軌標籤列 = document.createElement("div");
  滑軌標籤列.className = "滑軌標籤列";
  滑軌標籤列.innerHTML = "<span>有一點像我</span><span>一半一半</span><span>非常像我</span>";

  const 滑軌 = document.createElement("input");
  滑軌.className = "程度滑軌";
  滑軌.type = "range";
  滑軌.min = "0";
  滑軌.max = "100";
  滑軌.value = 目前滑軌值;

  const 滑軌狀態列 = document.createElement("div");
  滑軌狀態列.className = "滑軌狀態列";

  const 滑軌數字 = document.createElement("span");
  const 滑軌狀態文字 = document.createElement("strong");

  滑軌狀態列.appendChild(滑軌數字);
  滑軌狀態列.appendChild(滑軌狀態文字);
  滑軌盒.appendChild(滑軌標籤列);
  滑軌盒.appendChild(滑軌);
  滑軌盒.appendChild(滑軌狀態列);

  function 更新滑軌顯示() {
    const 數值 = Number(滑軌.value);
    目前滑軌值 = 數值;
    滑軌.style.setProperty("--滑軌值", `${數值}%`);
    滑軌.style.setProperty("--目前顏色", 取得滑軌顏色(數值));
    滑軌數字.textContent = `${數值}`;
    滑軌狀態文字.textContent = 取得滑軌狀態文字(數值);
  }

  滑軌.addEventListener("input", 更新滑軌顯示);
  更新滑軌顯示();
  return 滑軌盒;
}

function 取得滑軌狀態文字(數值) {
  if (數值 <= 20) {
    return "有一點像我";
  }

  if (數值 <= 40) {
    return "稍微像我";
  }

  if (數值 <= 60) {
    return "一半一半";
  }

  if (數值 <= 80) {
    return "大部分像我";
  }

  return "非常像我";
}

function 取得滑軌顏色(數值) {
  if (數值 <= 20) {
    return "#b85f56";
  }

  if (數值 <= 40) {
    return "#9a667c";
  }

  if (數值 <= 60) {
    return "#8a6f9f";
  }

  if (數值 <= 80) {
    return "#6379a8";
  }

  return "#4f7fa8";
}

function 前往下一題() {
  if (!已選類型) {
    提示文字.textContent = "請先選擇最接近你的答案";
    return;
  }

  分數[已選類型] += 目前滑軌值;
  目前題號 += 1;

  if (目前題號 >= 題目清單.length) {
    // quiz_complete：完成第25題並準備進入結果頁時送出。
    送出追蹤事件("quiz_complete");
    顯示結果();
    return;
  }

  顯示題目();
}

function 顯示結果() {
  const 排序分數 = Object.entries(分數).sort((第一筆, 第二筆) => {
    return 第二筆[1] - 第一筆[1];
  });

  const 主要結果 = 排序分數[0];
  const 次要結果 = 排序分數[1];

  主驅動力.textContent = 驅動力名稱[主要結果[0]];
  主分數.textContent = `${主要結果[1]} 分`;
  副驅動力.textContent = 驅動力名稱[次要結果[0]];
  副分數.textContent = `${次要結果[1]} 分`;
  結果摘要.textContent = `${驅動力摘要[主要結果[0]]} 同時，${驅動力摘要[次要結果[0]]}`;
  顯示清單(優勢列表, 驅動力補充資料[主要結果[0]].優勢);
  顯示清單(盲點列表, 驅動力補充資料[主要結果[0]].盲點);

  分數列表.innerHTML = "";
  排序分數.forEach(([類型, 得分]) => {
    const 項目 = document.createElement("div");
    項目.className = "分數項目";
    項目.innerHTML = `<span>${驅動力名稱[類型]}</span><span>${得分} 分</span>`;
    分數列表.appendChild(項目);
  });

  建立評分按鈕();
  if (!報告已瀏覽) {
    // result_view：結果頁第一次顯示時送出。
    送出追蹤事件("result_view");
    // primary_driver：結果產生時送出主驅動力名稱。
    送出追蹤事件("primary_driver", {
      driver_name: 驅動力名稱[主要結果[0]],
    });
    報告已瀏覽 = true;
  }

  顯示頁面(結果頁);
}

function 顯示清單(清單, 項目文字清單) {
  清單.innerHTML = "";

  項目文字清單.forEach((項目文字) => {
    const 項目 = document.createElement("li");
    項目.textContent = 項目文字;
    清單.appendChild(項目);
  });
}

function 建立評分按鈕() {
  評分按鈕區.innerHTML = "";

  for (let 分數值 = 1; 分數值 <= 5; 分數值 += 1) {
    const 按鈕 = document.createElement("button");
    按鈕.className = "評分按鈕";
    按鈕.type = "button";
    按鈕.textContent = 分數值;
    按鈕.addEventListener("click", () => 送出評分(分數值, 按鈕));
    評分按鈕區.appendChild(按鈕);
  }
}

function 送出評分(分數值, 選到的按鈕) {
  document.querySelectorAll(".評分按鈕").forEach((按鈕) => {
    按鈕.classList.remove("已選擇");
  });

  選到的按鈕.classList.add("已選擇");
  評分訊息.textContent = "已收到你的評分，謝謝你。";
  // rating_submit：使用者按滿意度評分時送出評分值。
  送出追蹤事件("rating_submit", {
    rating_value: 分數值,
  });
}

開始按鈕.addEventListener("click", 開始測驗);
下一題按鈕.addEventListener("click", 前往下一題);
重新按鈕.addEventListener("click", 開始測驗);
解鎖按鈕.addEventListener("click", () => {
  送出追蹤事件("ldn_unlock_clicked");
  alert("完整報告即將開放。\n感謝你參與 Beta 測試。");
});
