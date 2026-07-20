// メインアプリ：天気に合わせて次の週の献立を提案

// 初期値は一般的な内容のみ（個人情報はコードに持たせない）。
// 実際の家族構成は各ユーザーが設定画面で入力し、その端末のブラウザ内
// (localStorage) にのみ保存される。サーバーには一切送信しない。
const DEFAULT_SETTINGS = {
  city: "東京",
  adults: 2,
  kids: 2,
  staminaBoost: true,   // 育ち盛り・運動する子向けにスタミナ多め
  allergies: [],        // 例: ["えび", "そば"]
  dislikes: [],         // 例: ["なす"]
};

const WEEK_LABELS = ["月", "火", "水", "木", "金", "土", "日"];
const STORAGE_KEY = "mealplanner.settings.v1";

let settings = loadSettings();
let weekWeather = [];   // 天気配列
let regenSeed = 0;      // 「別の献立にする」で変化
let currentPlan = [];   // 現在の献立（買い物リスト用）

// ── 設定の永続化 ─────────────────────────────
function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return Object.assign({}, DEFAULT_SETTINGS, JSON.parse(raw));
  } catch (e) {}
  return Object.assign({}, DEFAULT_SETTINGS);
}
function saveSettings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

// ── 人数（大人換算）と表示 ─────────────────────
function servingText() {
  const total = settings.adults + settings.kids;
  return `${total}人分`;
}

// ── 疑似乱数（週＋日＋seedで再現性あり）──────────
function seededRandom(seedStr) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return function () {
    h += 0x6D2B79F5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── 献立が家族の制約を満たすか ───────────────────
function passesFamily(menu) {
  for (const a of settings.allergies) {
    if (!a) continue;
    if (menu.allergens.includes(a)) return false;
    if (menu.ingredients.some((ing) => ing.includes(a))) return false;
  }
  for (const d of settings.dislikes) {
    if (!d) continue;
    if (menu.name.includes(d)) return false;
    if (menu.ingredients.some((ing) => ing.includes(d))) return false;
  }
  return true;
}

// ── 1日分の献立を選ぶ ───────────────────────────
function pickMenu(weather, band, usedIds, rng) {
  let candidates = MENUS.filter((m) => m.temp.includes(band) && passesFamily(m));

  // 雨/雪の日は「雨向き」を優先
  if (weather.isRain) {
    const rainy = candidates.filter((m) => m.rainOk);
    if (rainy.length) candidates = rainy;
  }

  // 今週すでに出したものは避ける
  let fresh = candidates.filter((m) => !usedIds.has(m.id));
  if (fresh.length === 0) fresh = candidates; // 尽きたら再利用可
  if (fresh.length === 0) fresh = MENUS.filter(passesFamily); // 最終フォールバック

  // スタミナ重視ならスタミナ度で重み付け
  const weighted = [];
  for (const m of fresh) {
    let w = 1;
    if (settings.staminaBoost) w += (m.stamina - 1) * 1.5;
    if (weather.isRain && m.rainOk) w += 1;
    for (let k = 0; k < Math.max(1, Math.round(w)); k++) weighted.push(m);
  }
  const pick = weighted[Math.floor(rng() * weighted.length)] || fresh[0];
  return pick;
}

// ── 提案理由のテキスト生成 ─────────────────────
function reasonText(weather, band, menu) {
  const parts = [];
  if (weather.isRain) {
    parts.push(`${weather.label}予報なので手間少なめ・温かい献立`);
  } else if (band === "cold") {
    parts.push(`最高${weather.max}℃と冷えるので温かい料理`);
  } else if (band === "hot") {
    parts.push(`最高${weather.max}℃と暑いのでさっぱり系`);
  } else {
    parts.push(`過ごしやすい陽気に定番メニュー`);
  }
  if (settings.staminaBoost && menu.stamina >= 3) {
    parts.push("育ち盛りにスタミナ◎");
  }
  if (menu.spicy) parts.push("※お子さんには甘口で");
  return parts.join(" / ");
}

// ── 週間の献立を生成 ───────────────────────────
function buildPlan() {
  const usedIds = new Set();
  const plan = [];
  weekWeather.forEach((w, i) => {
    const band = tempBand(w.max);
    const rng = seededRandom(`${w.date}-${regenSeed}-${settings.staminaBoost}`);
    const menu = pickMenu(w, band, usedIds, rng);
    usedIds.add(menu.id);
    plan.push({ weather: w, band, menu, reason: reasonText(w, band, menu) });
  });
  currentPlan = plan;
  return plan;
}

// ── 描画 ───────────────────────────────────────
function render() {
  renderSettingsSummary();
  const plan = buildPlan();
  const grid = document.getElementById("plan");
  grid.innerHTML = "";

  plan.forEach((p, i) => {
    const w = p.weather;
    const dateObj = new Date(w.date + "T00:00:00");
    const card = document.createElement("div");
    card.className = "card";
    const spicyClass = p.menu.spicy ? " spicy" : "";
    card.innerHTML = `
      <div class="card-head">
        <span class="dow">${WEEK_LABELS[i] || ""}</span>
        <span class="date">${dateObj.getMonth() + 1}/${dateObj.getDate()}</span>
        <span class="weather" title="${w.label}">${w.icon}</span>
      </div>
      <div class="temps">
        <span class="hi">${w.max}°</span><span class="lo">${w.min}°</span>
        ${w.pop != null ? `<span class="pop">☔${w.pop}%</span>` : ""}
      </div>
      <div class="menu-name${spicyClass}">${p.menu.name}</div>
      <ul class="items">${p.menu.items.map((it) => `<li>${it}</li>`).join("")}</ul>
      <div class="reason">${p.reason}</div>
      <button class="reroll" data-idx="${i}">この日を変える 🔄</button>
    `;
    grid.appendChild(card);
  });

  // 個別リロール
  grid.querySelectorAll(".reroll").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.idx);
      rerollDay(idx);
    });
  });
}

function rerollDay(idx) {
  const usedIds = new Set(currentPlan.filter((_, i) => i !== idx).map((p) => p.menu.id));
  const w = weekWeather[idx];
  const band = tempBand(w.max);
  const rng = seededRandom(`${w.date}-${Date.now()}-${Math.random()}`);
  const menu = pickMenu(w, band, usedIds, rng);
  currentPlan[idx] = { weather: w, band, menu, reason: reasonText(w, band, menu) };
  renderPlanOnly();
}

function renderPlanOnly() {
  const grid = document.getElementById("plan");
  grid.innerHTML = "";
  currentPlan.forEach((p, i) => {
    const w = p.weather;
    const dateObj = new Date(w.date + "T00:00:00");
    const card = document.createElement("div");
    card.className = "card";
    const spicyClass = p.menu.spicy ? " spicy" : "";
    card.innerHTML = `
      <div class="card-head">
        <span class="dow">${WEEK_LABELS[i] || ""}</span>
        <span class="date">${dateObj.getMonth() + 1}/${dateObj.getDate()}</span>
        <span class="weather" title="${w.label}">${w.icon}</span>
      </div>
      <div class="temps">
        <span class="hi">${w.max}°</span><span class="lo">${w.min}°</span>
        ${w.pop != null ? `<span class="pop">☔${w.pop}%</span>` : ""}
      </div>
      <div class="menu-name${spicyClass}">${p.menu.name}</div>
      <ul class="items">${p.menu.items.map((it) => `<li>${it}</li>`).join("")}</ul>
      <div class="reason">${p.reason}</div>
      <button class="reroll" data-idx="${i}">この日を変える 🔄</button>
    `;
    grid.appendChild(card);
  });
  grid.querySelectorAll(".reroll").forEach((btn) => {
    btn.addEventListener("click", () => rerollDay(Number(btn.dataset.idx)));
  });
}

function renderSettingsSummary() {
  const el = document.getElementById("summary");
  if (!el) return;
  const allergy = settings.allergies.filter(Boolean).join("・") || "なし";
  const dislike = settings.dislikes.filter(Boolean).join("・") || "なし";
  el.innerHTML = `
    <strong>${settings.city}</strong> の週間予報 ／
    ${servingText()}（大人${settings.adults}・子供${settings.kids}）／
    スタミナ多め: ${settings.staminaBoost ? "ON" : "OFF"} ／
    アレルギー: ${allergy} ／ 苦手: ${dislike}
  `;
}

// ── 買い物リスト ───────────────────────────────
function showShoppingList() {
  const counts = {};
  currentPlan.forEach((p) => {
    p.menu.ingredients.forEach((ing) => {
      counts[ing] = (counts[ing] || 0) + 1;
    });
  });
  const items = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const box = document.getElementById("shopping");
  box.innerHTML = `
    <h3>🛒 今週の買い物リスト（${servingText()}目安）</h3>
    <ul>${items.map(([ing, n]) => `<li>${ing}${n > 1 ? ` <em>×${n}日</em>` : ""}</li>`).join("")}</ul>
    <p class="hint">※分量は${servingText()}を目安に調整してください（スタミナ多めONのときは気持ち多めに）。</p>
  `;
  box.classList.remove("hidden");
  box.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ── 天気を取得して再描画 ──────────────────────
async function loadAndRender() {
  const grid = document.getElementById("plan");
  const status = document.getElementById("status");
  status.textContent = "天気予報を取得中…";
  grid.innerHTML = "";
  document.getElementById("shopping").classList.add("hidden");

  try {
    const c = CITIES[settings.city] || CITIES["東京"];
    weekWeather = await fetchNextWeek(c.lat, c.lon);
    if (!weekWeather.length) throw new Error("予報データが空でした");
    status.textContent = "";
    render();
  } catch (e) {
    status.innerHTML = `⚠️ ${e.message}<br>ネットワークをご確認ください。ローカルで開いている場合は簡易サーバー経由でお試しください（README参照）。`;
  }
}

// ── 設定モーダル ───────────────────────────────
function openSettings() {
  document.getElementById("s-city").value = settings.city;
  document.getElementById("s-adults").value = settings.adults;
  document.getElementById("s-kids").value = settings.kids;
  document.getElementById("s-stamina").checked = settings.staminaBoost;
  document.getElementById("s-allergies").value = settings.allergies.join(", ");
  document.getElementById("s-dislikes").value = settings.dislikes.join(", ");
  document.getElementById("modal").classList.remove("hidden");
}
function closeSettings() {
  document.getElementById("modal").classList.add("hidden");
}
function applySettings() {
  settings.city = document.getElementById("s-city").value;
  settings.adults = Math.max(0, parseInt(document.getElementById("s-adults").value, 10) || 0);
  settings.kids = Math.max(0, parseInt(document.getElementById("s-kids").value, 10) || 0);
  settings.staminaBoost = document.getElementById("s-stamina").checked;
  settings.allergies = splitList(document.getElementById("s-allergies").value);
  settings.dislikes = splitList(document.getElementById("s-dislikes").value);
  saveSettings();
  closeSettings();
  loadAndRender();
}
function splitList(str) {
  return (str || "").split(/[,、\s]+/).map((s) => s.trim()).filter(Boolean);
}

// ── 初期化 ─────────────────────────────────────
function init() {
  // 都市セレクトを生成
  const citySel = document.getElementById("s-city");
  Object.keys(CITIES).forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name; opt.textContent = name;
    citySel.appendChild(opt);
  });

  document.getElementById("btn-settings").addEventListener("click", openSettings);
  document.getElementById("btn-close").addEventListener("click", closeSettings);
  document.getElementById("btn-apply").addEventListener("click", applySettings);
  document.getElementById("btn-regen").addEventListener("click", () => { regenSeed++; render(); });
  document.getElementById("btn-shopping").addEventListener("click", showShoppingList);
  document.getElementById("modal").addEventListener("click", (e) => {
    if (e.target.id === "modal") closeSettings();
  });

  loadAndRender();

  // 初回起動時は設定画面を開いて家族構成の入力をうながす
  const isFirstRun = localStorage.getItem(STORAGE_KEY) === null;
  if (isFirstRun) {
    const welcome = document.getElementById("welcome");
    if (welcome) welcome.classList.remove("hidden");
    openSettings();
  }
}

document.addEventListener("DOMContentLoaded", init);
