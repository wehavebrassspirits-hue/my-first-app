// 楽天レシピの人気ランキングを取得して trending.json を生成する。
// GitHub Actions から1日1回実行する想定。
// 必要な環境変数: RAKUTEN_APP_ID（楽天のアプリID。GitHubのSecretsに登録）
//
// 楽天ウェブサービス（無料）: https://webservice.rakuten.co.jp/
//   - Recipe/CategoryList : カテゴリ一覧
//   - Recipe/CategoryRanking : カテゴリ別人気ランキング（各カテゴリ上位4件）

const fs = require("fs");
const path = require("path");

const APP_ID = process.env.RAKUTEN_APP_ID;
const OUT = path.join(__dirname, "..", "trending.json");
const API = "https://app.rakuten.co.jp/services/api/Recipe";

// 夕食向けに拾いたい大カテゴリ名のキーワード
const WANT = ["肉", "魚", "ごはん", "麺", "パスタ", "鍋", "カレー", "人気"];
const MAX_ITEMS = 12;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJSON(url) {
  const res = await fetch(url, { headers: { "User-Agent": "kondate-maker/1.0" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function main() {
  if (!APP_ID) {
    console.log("RAKUTEN_APP_ID が未設定です。トレンド取得はスキップします。");
    console.log("→ GitHubのSettingsでSecret『RAKUTEN_APP_ID』を登録すると有効になります。");
    return; // 失敗にはせず終了（キー未登録でもCIを赤くしない）
  }

  // 1) 大カテゴリ一覧を取得
  const listUrl = `${API}/CategoryList/20170426?applicationId=${APP_ID}`;
  const list = await getJSON(listUrl);
  const large = (list.result && list.result.large) || [];

  // 欲しいキーワードに合う大カテゴリを最大6つ選ぶ
  const picked = large
    .filter((c) => WANT.some((w) => c.categoryName.includes(w)))
    .slice(0, 6);
  const targets = picked.length ? picked : large.slice(0, 6);

  const items = [];
  const seen = new Set();

  for (const cat of targets) {
    await sleep(900); // 1req/sec 制限に配慮
    try {
      const rankUrl = `${API}/CategoryRanking/20170426?applicationId=${APP_ID}&categoryId=${cat.categoryId}`;
      const data = await getJSON(rankUrl);
      const recipes = (data.result || []).slice(0, 2); // 各カテゴリ上位2件
      for (const r of recipes) {
        if (seen.has(r.recipeUrl)) continue;
        seen.add(r.recipeUrl);
        items.push({
          title: r.recipeTitle,
          url: r.recipeUrl,
          image: r.foodImageUrl || r.mediumImageUrl || "",
          materials: (r.recipeMaterial || []).slice(0, 6),
          category: cat.categoryName,
        });
      }
    } catch (e) {
      console.warn(`カテゴリ ${cat.categoryName} の取得に失敗: ${e.message}`);
    }
    if (items.length >= MAX_ITEMS) break;
  }

  const out = {
    updated: new Date().toISOString().slice(0, 10),
    source: "楽天レシピ",
    items: items.slice(0, MAX_ITEMS),
  };

  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`trending.json を更新しました（${out.items.length}件）。`);
}

main().catch((e) => {
  console.error("トレンド取得でエラー:", e.message);
  process.exit(1);
});
