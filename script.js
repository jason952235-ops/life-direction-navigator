import { 題庫 } from "./data/questionsBetaV2.js";
import { 驅動力說明 } from "./data/drivers.js";
import {
  依答案計算結果 as 使用計分引擎計算結果,
  建立中文結果資料 as 使用計分引擎建立中文結果資料,
} from "./engine/scoreEngine.js";
import { 載入GA4, 追蹤事件 } from "./utils/ga4.js";

const 問卷版本 = "Beta V2";
const 版本 = "RE Beta V1";
const 作答儲存鍵 = "lifeDirectionNavigatorBetaAnswers";
const 回饋儲存鍵 = "lifeDirectionNavigatorBetaFeedback";
const 場次儲存鍵 = "lifeDirectionNavigatorBetaSession";

載入GA4();
追蹤事件("page_view");

const 首頁 = document.querySelector("#home-screen");
const 問卷頁 = document.querySelector("#quiz-screen");
const 結果頁 = document.querySelector("#result-screen");
const 回饋頁 = document.querySelector("#feedback-screen");
const 開始按鈕 = document.querySelector("#start-button");
const 上一題按鈕 = document.querySelector("#prev-button");
const 下一題按鈕 = document.querySelector("#next-button");
const 題號文字 = document.querySelector("#question-counter");
const 儲存狀態 = document.querySelector("#save-status");
const 進度條 = document.querySelector("#progress-bar");
const 題目分類 = document.querySelector("#question-driver");
const 題目文字 = document.querySelector("#question-text");
const 滑桿 = document.querySelector("#answer-slider");
const 左側文字 = document.querySelector("#left-label");
const 右側文字 = document.querySelector("#right-label");
const 分數文字 = document.querySelector("#score-label");
const 主驅動力標題 = document.querySelector("#main-driver-title");
const 結果摘要 = document.querySelector("#result-summary");
const 結果說明 = document.querySelector("#result-description");
const 分數列表 = document.querySelector("#score-list");
const 下一步文字 = document.querySelector("#next-step-text");
const 前往回饋按鈕 = document.querySelector("#go-feedback-button");
const BetaEmail = document.querySelector("#beta-email");
const 相似度滑桿 = document.querySelector("#match-score");
const 相似度文字 = document.querySelector("#match-score-label");
const 補充文字 = document.querySelector("#extra-feedback");
const 儲存回饋按鈕 = document.querySelector("#save-feedback-button");
const 回饋狀態 = document.querySelector("#feedback-status");
const Beta資料按鈕 = document.querySelector("#beta-data-toggle");
const Beta資料面板 = document.querySelector("#beta-data-panel");
const Beta資料輸出 = document.querySelector("#beta-data-output");
const 複製Beta資料按鈕 = document.querySelector("#copy-beta-data-button");
const 複製Beta資料狀態 = document.querySelector("#copy-beta-data-status");

let 目前題號 = 0;
let 作答資料 = {};
let 結果頁已追蹤 = false;

function 取得題庫() {
  return Array.isArray(題庫) ? 題庫 : [];
}

function 顯示頁面(目標頁面) {
  [首頁, 問卷頁, 結果頁, 回饋頁].forEach((頁面) => 頁面.classList.add("hidden"));
  目標頁面.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function 取得目前答案(題目) {
  return 作答資料[題目.id]?.sliderValue ?? 50;
}

function 取得百分比(滑桿元素) {
  return Math.round(Number(滑桿元素.value));
}

function 取得單選答案(名稱) {
  return document.querySelector(`input[name="${名稱}"]:checked`)?.value || "";
}

function 補零(數字) {
  return String(數字).padStart(2, "0");
}

function 取得台灣時間(日期 = new Date()) {
  const 台灣日期 = new Date(日期.toLocaleString("en-US", { timeZone: "Asia/Taipei" }));
  const 年 = 台灣日期.getFullYear();
  const 月 = 補零(台灣日期.getMonth() + 1);
  const 日 = 補零(台灣日期.getDate());
  const 時 = 補零(台灣日期.getHours());
  const 分 = 補零(台灣日期.getMinutes());
  const 秒 = 補零(台灣日期.getSeconds());

  return `${年}-${月}-${日} ${時}:${分}:${秒}`;
}

function 建立SessionId() {
  const 現在 = new Date();
  const 時間碼 = 取得台灣時間(現在).replaceAll("-", "").replace(" ", "-").replaceAll(":", "");
  const 隨機碼 = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `LDN-BETA-${時間碼}-${隨機碼}`;
}

function 建立新場次() {
  const 場次資料 = {
    sessionId: 建立SessionId(),
    startedAt: new Date().toISOString(),
    startedAtTaiwan: 取得台灣時間(),
  };

  localStorage.setItem(場次儲存鍵, JSON.stringify(場次資料));
  return 場次資料;
}

function 讀取本機資料(儲存鍵) {
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

function 取得場次資料() {
  return 讀取本機資料(場次儲存鍵) || null;
}

function 儲存單題答案() {
  const 題目 = 取得題庫()[目前題號];

  if (!題目) {
    return;
  }

  作答資料[題目.id] = {
    questionId: 題目.id,
    sliderValue: 取得百分比(滑桿),
    percentageValue: 取得百分比(滑桿),
    questionnaireVersion: 問卷版本,
    reVersion: 版本,
    answeredAt: new Date().toISOString(),
  };

  localStorage.setItem(作答儲存鍵, JSON.stringify(作答資料));
  儲存狀態.textContent = "已儲存";
}

function 顯示題目() {
  const 題庫 = 取得題庫();
  const 題目 = 題庫[目前題號];

  if (!題目) {
    return;
  }

  題號文字.textContent = `第 ${目前題號 + 1} 題 / ${題庫.length} 題`;
  題目分類.textContent = 題目.driverName || "生活情境";
  題目文字.textContent = 題目.question;
  左側文字.textContent = 題目.leftLabel || "有一點像我";
  右側文字.textContent = 題目.rightLabel || "非常像我";
  滑桿.value = 取得目前答案(題目);
  分數文字.textContent = `${取得百分比(滑桿)}%`;
  進度條.style.width = `${((目前題號 + 1) / 題庫.length) * 100}%`;
  上一題按鈕.disabled = 目前題號 === 0;
  下一題按鈕.textContent = 目前題號 === 題庫.length - 1 ? "查看結果" : "下一題";
  儲存狀態.textContent = 作答資料[題目.id] ? "已儲存" : "尚未作答";
}

function 計算結果() {
  return 依答案計算結果(作答資料);
}

function 依答案計算結果(答案資料) {
  return 使用計分引擎計算結果(取得題庫(), 答案資料);
}

function 建立中文結果資料(結果資料) {
  return 使用計分引擎建立中文結果資料(結果資料, 驅動力說明);
}

function 取得最後作答時間(問卷原始作答資料) {
  const 作答時間列表 = Object.values(問卷原始作答資料)
    .map((答案) => 答案.answeredAt)
    .filter(Boolean);

  return 作答時間列表.at(-1) || "";
}

function 建立Beta資料() {
  const 問卷原始作答資料 = 讀取本機資料(作答儲存鍵) || {};
  const 回饋資料 = 讀取本機資料(回饋儲存鍵) || {};
  const 場次資料 = 取得場次資料();
  const 已回答題數 = Object.keys(問卷原始作答資料).length;
  const 是否完成 = 已回答題數 === 取得題庫().length;
  const 完成時間 = 是否完成 ? 取得最後作答時間(問卷原始作答資料) : "";
  const 結果資料 = Object.keys(問卷原始作答資料).length
    ? 依答案計算結果(問卷原始作答資料)
    : null;
  const 匯出時間 = new Date();

  return {
    sessionId: 場次資料?.sessionId || "",
    questionnaireVersion: 問卷版本,
    reVersion: 版本,
    answeredCount: 已回答題數,
    isCompleted: 是否完成,
    startedAt: 場次資料?.startedAt || "",
    startedAtTaiwan: 場次資料?.startedAtTaiwan || "",
    completedAt: 完成時間,
    completedAtTaiwan: 完成時間 ? 取得台灣時間(new Date(完成時間)) : "",
    feedbackSubmittedAt: 回饋資料.submittedAt || "",
    feedbackSubmittedAtTaiwan: 回饋資料.submittedAt ? 取得台灣時間(new Date(回饋資料.submittedAt)) : "",
    rawAnswers: 問卷原始作答資料,
    resultData: 建立中文結果資料(結果資料),
    feedbackData: 回饋資料,
    betaEmail: 回饋資料.betaEmail || "",
    exportedAt: 匯出時間.toISOString(),
    exportedAtTaiwan: 取得台灣時間(匯出時間),
  };
}

function 更新Beta資料面板() {
  const Beta資料 = 建立Beta資料();
  Beta資料輸出.textContent = JSON.stringify(Beta資料, null, 2);
}

function 顯示結果() {
  const 結果 = 計算結果();
  const 主驅動力 = 驅動力說明[結果.主驅動力];
  const 第二驅動力 = 驅動力說明[結果.第二驅動力];

  if (結果.是雙驅動) {
    主驅動力標題.textContent = `你的雙驅動傾向：${主驅動力.名稱} × ${第二驅動力.名稱}`;
    結果摘要.textContent = "你目前同時受到兩種力量牽引。";
    結果說明.textContent = "這不代表矛盾，而是代表你在不同情境中，會用兩種方式尋找方向。";
    下一步文字.textContent = "先觀察最近一週：哪些時刻需要前進，哪些時刻需要停下來理解。從這個差異裡，你會更容易找到下一步。";
  } else {
    主驅動力標題.textContent = `你的主要驅動力：${主驅動力.名稱}`;
    結果摘要.textContent = `你現在最明顯的方向感，來自${主驅動力.名稱}。`;
    結果說明.textContent = 主驅動力.說明;
    下一步文字.textContent = 主驅動力.建議;
  }

  分數列表.innerHTML = "";

  結果.排序後分數.forEach(([代號, 分數]) => {
    const 列 = document.createElement("div");
    列.className = "score-row";
    列.innerHTML = `
      <span class="score-name">${驅動力說明[代號].名稱}</span>
      <span class="score-bar" aria-hidden="true"><span style="width: ${分數}%"></span></span>
      <span class="score-value">${分數}%</span>
    `;
    分數列表.appendChild(列);
  });

  if (!結果頁已追蹤) {
    追蹤事件("result_view");
    追蹤事件("primary_driver", {
      driver_name: 主驅動力.名稱,
    });
    結果頁已追蹤 = true;
  }

  顯示頁面(結果頁);
}

function 儲存回饋() {
  const 回饋資料 = {
    betaEmail: BetaEmail.value.trim(),
    matchPercentage: 取得百分比(相似度滑桿),
    helpfulPart: 取得單選答案("helpful-part"),
    improvePart: 取得單選答案("improve-part"),
    betaHelp: 取得單選答案("beta-help"),
    extraFeedback: 補充文字.value.trim(),
    questionnaireVersion: 問卷版本,
    reVersion: 版本,
    submittedAt: new Date().toISOString(),
  };

  localStorage.setItem(回饋儲存鍵, JSON.stringify(回饋資料));
  追蹤事件("rating_submit", {
    rating_value: 回饋資料.matchPercentage,
  });
  追蹤事件("feedback_submit", {
    match_percentage: 回饋資料.matchPercentage,
    helpful_part: 回饋資料.helpfulPart,
    improve_part: 回饋資料.improvePart,
    beta_help: 回饋資料.betaHelp,
  });
  回饋狀態.textContent = "謝謝你，回饋已儲存。";
  更新Beta資料面板();
}

開始按鈕.addEventListener("click", () => {
  建立新場次();
  作答資料 = {};
  目前題號 = 0;
  結果頁已追蹤 = false;
  localStorage.removeItem(作答儲存鍵);
  localStorage.removeItem(回饋儲存鍵);
  追蹤事件("quiz_start");
  顯示頁面(問卷頁);
  顯示題目();
});

滑桿.addEventListener("input", () => {
  分數文字.textContent = `${取得百分比(滑桿)}%`;
  儲存單題答案();
});

上一題按鈕.addEventListener("click", () => {
  儲存單題答案();
  目前題號 -= 1;
  顯示題目();
});

下一題按鈕.addEventListener("click", () => {
  儲存單題答案();

  if (目前題號 === 取得題庫().length - 1) {
    追蹤事件("quiz_complete");
    顯示結果();
    return;
  }

  目前題號 += 1;
  顯示題目();
});

相似度滑桿.addEventListener("input", () => {
  相似度文字.textContent = `${取得百分比(相似度滑桿)}%`;
});

前往回饋按鈕.addEventListener("click", () => {
  顯示頁面(回饋頁);
});

Beta資料按鈕.addEventListener("click", () => {
  Beta資料面板.classList.toggle("hidden");
  更新Beta資料面板();
});

複製Beta資料按鈕.addEventListener("click", async () => {
  更新Beta資料面板();

  try {
    await navigator.clipboard.writeText(Beta資料輸出.textContent);
  } catch {
    const 暫存欄位 = document.createElement("textarea");
    暫存欄位.value = Beta資料輸出.textContent;
    document.body.appendChild(暫存欄位);
    暫存欄位.select();
    document.execCommand("copy");
    暫存欄位.remove();
  }

  複製Beta資料狀態.textContent = "已複製，可以貼給產品分析";
});

儲存回饋按鈕.addEventListener("click", 儲存回饋);
