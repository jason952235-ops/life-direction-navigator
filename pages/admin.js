import { 題庫 } from "../data/questionsBetaV2.js";
import { 驅動力說明 } from "../data/drivers.js";
import { 依答案計算結果, 建立中文結果資料 } from "../engine/scoreEngine.js";

const 問卷版本 = "Beta V2";
const 作答儲存鍵 = "lifeDirectionNavigatorBetaAnswers";
const 回饋儲存鍵 = "lifeDirectionNavigatorBetaFeedback";
const 場次儲存鍵 = "lifeDirectionNavigatorBetaSession";

const 版本文字 = document.querySelector("#admin-version");
const 開始時間文字 = document.querySelector("#admin-started-at");
const 完成時間文字 = document.querySelector("#admin-completed-at");
const 主驅動力文字 = document.querySelector("#admin-primary-driver");
const 分數列表 = document.querySelector("#admin-score-list");
const 作答列表 = document.querySelector("#admin-answer-list");
const 回饋列表 = document.querySelector("#admin-feedback-list");
const 完整資料輸出 = document.querySelector("#admin-raw-output");
const 複製按鈕 = document.querySelector("#admin-copy-button");
const 清除按鈕 = document.querySelector("#admin-clear-button");
const 狀態文字 = document.querySelector("#admin-status");

let 目前完整資料 = {};

function 讀取本機資料(儲存鍵) {
  const 原始資料 = localStorage.getItem(儲存鍵);

  if (!原始資料) {
    return {};
  }

  try {
    return JSON.parse(原始資料);
  } catch {
    return {};
  }
}

function 格式化時間(時間) {
  if (!時間) {
    return "尚無資料";
  }

  return new Date(時間).toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
    hour12: false,
  });
}

function 取得最後作答時間(作答資料) {
  return Object.values(作答資料)
    .map((答案) => 答案.answeredAt)
    .filter(Boolean)
    .at(-1);
}

function 建立後台資料() {
  const 作答資料 = 讀取本機資料(作答儲存鍵);
  const 回饋資料 = 讀取本機資料(回饋儲存鍵);
  const 場次資料 = 讀取本機資料(場次儲存鍵);
  const 已回答題數 = Object.keys(作答資料).length;
  const 是否完成 = 已回答題數 === 題庫.length;
  const 結果 = 是否完成 ? 依答案計算結果(題庫, 作答資料) : null;

  return {
    questionnaireVersion: 作答資料.Q01?.questionnaireVersion || 回饋資料.questionnaireVersion || 問卷版本,
    answeredCount: 已回答題數,
    isCompleted: 是否完成,
    startedAt: 場次資料.startedAt || "",
    completedAt: 是否完成 ? 取得最後作答時間(作答資料) || "" : "",
    resultData: 建立中文結果資料(結果, 驅動力說明),
    rawAnswers: 作答資料,
    feedbackData: 回饋資料,
  };
}

function 建立文字列(標題, 內容) {
  const 外框 = document.createElement("div");
  const 名稱 = document.createElement("dt");
  const 數值 = document.createElement("dd");
  名稱.textContent = 標題;
  數值.textContent = 內容 || "尚無資料";
  外框.append(名稱, 數值);
  return 外框;
}

function 顯示分數(結果資料) {
  分數列表.replaceChildren();

  if (!結果資料) {
    分數列表.textContent = "問卷完成後才會顯示正式分數。";
    return;
  }

  結果資料.排序後分數中文.forEach((項目) => {
    const 列 = document.createElement("div");
    列.className = "score-row";

    const 名稱 = document.createElement("span");
    名稱.className = "score-name";
    名稱.textContent = 項目.name;

    const 分數條 = document.createElement("span");
    分數條.className = "score-bar";
    分數條.setAttribute("aria-hidden", "true");
    const 分數進度 = document.createElement("span");
    分數進度.style.width = `${項目.percentage}%`;
    分數條.appendChild(分數進度);

    const 分數 = document.createElement("span");
    分數.className = "score-value";
    分數.textContent = `${項目.percentage}%`;

    列.append(名稱, 分數條, 分數);
    分數列表.appendChild(列);
  });
}

function 顯示作答資料(作答資料) {
  作答列表.replaceChildren();

  題庫.forEach((題目) => {
    const 答案 = 作答資料[題目.id];
    const 列 = document.createElement("tr");
    [題目.id, 題目.question, 答案?.sliderValue ?? "尚未作答", 格式化時間(答案?.answeredAt)].forEach((內容) => {
      const 儲存格 = document.createElement("td");
      儲存格.textContent = 內容;
      列.appendChild(儲存格);
    });
    作答列表.appendChild(列);
  });
}

function 顯示回饋資料(回饋資料) {
  const 欄位 = [
    ["結果相似度", 回饋資料.matchScore],
    ["整體感受", 回饋資料.overallFeeling],
    ["完整版興趣", 回饋資料.fullReportInterest],
    ["付費意願", 回饋資料.willingnessToPay],
    ["補充回饋", 回饋資料.extraFeedback],
    ["送出時間", 格式化時間(回饋資料.submittedAt)],
  ];

  回饋列表.replaceChildren(...欄位.map(([標題, 內容]) => 建立文字列(標題, String(內容 ?? ""))));
}

function 更新後台() {
  目前完整資料 = 建立後台資料();
  版本文字.textContent = 目前完整資料.questionnaireVersion;
  開始時間文字.textContent = 格式化時間(目前完整資料.startedAt);
  完成時間文字.textContent = 格式化時間(目前完整資料.completedAt);
  主驅動力文字.textContent = 目前完整資料.resultData?.主驅動力中文 || "問卷尚未完成";
  顯示分數(目前完整資料.resultData);
  顯示作答資料(目前完整資料.rawAnswers);
  顯示回饋資料(目前完整資料.feedbackData);
  完整資料輸出.textContent = JSON.stringify(目前完整資料, null, 2);
}

async function 複製資料() {
  更新後台();

  try {
    await navigator.clipboard.writeText(完整資料輸出.textContent);
  } catch {
    const 暫存欄位 = document.createElement("textarea");
    暫存欄位.value = 完整資料輸出.textContent;
    document.body.appendChild(暫存欄位);
    暫存欄位.select();
    document.execCommand("copy");
    暫存欄位.remove();
  }

  狀態文字.textContent = "資料已複製。";
}

function 清除本機測試資料() {
  const 是否確認 = window.confirm("確定要清除這台裝置上的 Beta 測試資料嗎？此動作無法復原。");

  if (!是否確認) {
    return;
  }

  [作答儲存鍵, 回饋儲存鍵, 場次儲存鍵].forEach((儲存鍵) => localStorage.removeItem(儲存鍵));
  更新後台();
  狀態文字.textContent = "本機測試資料已清除。";
}

複製按鈕.addEventListener("click", 複製資料);
清除按鈕.addEventListener("click", 清除本機測試資料);
更新後台();
