// 作り置きモード用データ
// PREP_MENUS: 作り置き向きのおかず
//   type: "main"(主菜常備菜) / "side"(副菜常備菜)
//   fridge: 冷蔵の日持ち目安（日）
//   freezer: 冷凍保存OK
//   bento: お弁当に流用しやすい
//   stamina/spicy/allergens/ingredients は献立DBと同じ意味
//   q/parts: クックパッド検索の調整（任意）
// QUICK_ADDS: 平日にサッと足す一品（汁物など）

const PREP_MENUS = [
  // ── 主菜の常備菜 ──────────────────────────────
  { id: "m1", type: "main", name: "鶏の照り焼き", fridge: 4, freezer: true, bento: true, stamina: 2, spicy: false, allergens: [], ingredients: ["鶏もも肉","しょうゆ","みりん","砂糖","酒"] },
  { id: "m2", type: "main", name: "鶏ハム", fridge: 4, freezer: false, bento: true, stamina: 3, spicy: false, allergens: [], ingredients: ["鶏むね肉","塩","砂糖","こしょう"] },
  { id: "m3", type: "main", name: "鶏そぼろ", fridge: 4, freezer: true, bento: true, stamina: 2, spicy: false, allergens: [], ingredients: ["鶏ひき肉","しょうゆ","みりん","砂糖","しょうが"] },
  { id: "m4", type: "main", name: "豚の生姜焼き", fridge: 3, freezer: true, bento: true, stamina: 2, spicy: false, allergens: [], ingredients: ["豚ロース","玉ねぎ","しょうが","しょうゆ","みりん"] },
  { id: "m5", type: "main", name: "ミートソース", fridge: 4, freezer: true, bento: false, stamina: 3, spicy: false, allergens: [], ingredients: ["合いびき肉","玉ねぎ","にんじん","トマト缶","にんにく"] },
  { id: "m6", type: "main", name: "肉じゃが", fridge: 3, freezer: false, bento: true, stamina: 2, spicy: false, allergens: [], ingredients: ["豚こま肉","じゃがいも","にんじん","玉ねぎ","しょうゆ"] },
  { id: "m7", type: "main", name: "筑前煮", fridge: 4, freezer: false, bento: true, stamina: 1, spicy: false, allergens: [], ingredients: ["鶏もも肉","れんこん","にんじん","ごぼう","こんにゃく"] },
  { id: "m8", type: "main", name: "豚の角煮", fridge: 5, freezer: true, bento: true, stamina: 3, spicy: false, allergens: ["大豆"], ingredients: ["豚バラブロック","しょうが","長ねぎ","しょうゆ","砂糖"] },
  { id: "m9", type: "main", name: "鮭の南蛮漬け", fridge: 4, freezer: false, bento: true, stamina: 2, spicy: false, allergens: [], ingredients: ["生鮭","玉ねぎ","にんじん","ピーマン","酢"] },
  { id: "m10", type: "main", name: "タンドリーチキン", fridge: 3, freezer: true, bento: true, stamina: 3, spicy: true, allergens: ["乳"], ingredients: ["鶏もも肉","ヨーグルト","カレー粉","にんにく","ケチャップ"] },
  { id: "m11", type: "main", name: "プルコギ", fridge: 4, freezer: true, bento: true, stamina: 3, spicy: false, allergens: ["大豆","小麦"], ingredients: ["牛薄切り肉","玉ねぎ","にんじん","にら","焼肉のたれ"] },
  { id: "m12", type: "main", name: "キーマカレー", fridge: 4, freezer: true, bento: false, stamina: 3, spicy: true, allergens: ["小麦"], ingredients: ["合いびき肉","玉ねぎ","にんじん","トマト","カレー粉"] },
  { id: "m13", type: "main", name: "鶏だんご", fridge: 3, freezer: true, bento: true, stamina: 2, spicy: false, allergens: [], ingredients: ["鶏ひき肉","長ねぎ","しょうが","片栗粉","しょうゆ"] },
  { id: "m14", type: "main", name: "さばの味噌煮", fridge: 3, freezer: false, bento: true, stamina: 1, spicy: false, allergens: [], ingredients: ["さば","しょうが","味噌","みりん","砂糖"] },
  { id: "m15", type: "main", name: "牛肉のしぐれ煮", fridge: 5, freezer: true, bento: true, stamina: 2, spicy: false, allergens: ["大豆"], ingredients: ["牛薄切り肉","しょうが","しょうゆ","みりん","砂糖"] },
  { id: "m16", type: "main", name: "豚と大豆のトマト煮", fridge: 4, freezer: true, bento: true, stamina: 2, spicy: false, allergens: ["大豆"], ingredients: ["豚こま肉","大豆水煮","トマト缶","玉ねぎ","にんじん"] },
  { id: "m17", type: "main", name: "鶏むねのはちみつマスタード", fridge: 4, freezer: true, bento: true, stamina: 3, spicy: false, allergens: [], ingredients: ["鶏むね肉","はちみつ","粒マスタード","しょうゆ","にんにく"] },
  { id: "m18", type: "main", name: "作り置きハンバーグ", fridge: 3, freezer: true, bento: true, stamina: 3, spicy: false, allergens: ["卵","小麦","乳"], ingredients: ["合いびき肉","玉ねぎ","卵","パン粉","デミソース"] },

  // ── 副菜の常備菜 ──────────────────────────────
  { id: "s1", type: "side", name: "きんぴらごぼう", fridge: 5, freezer: true, bento: true, stamina: 1, spicy: false, allergens: [], ingredients: ["ごぼう","にんじん","しょうゆ","みりん","ごま"] },
  { id: "s2", type: "side", name: "ひじきの煮物", fridge: 4, freezer: true, bento: true, stamina: 1, spicy: false, allergens: ["大豆"], ingredients: ["乾燥ひじき","にんじん","大豆水煮","油揚げ","しょうゆ"] },
  { id: "s3", type: "side", name: "切り干し大根", fridge: 5, freezer: true, bento: true, stamina: 1, spicy: false, allergens: ["大豆"], ingredients: ["切り干し大根","にんじん","油揚げ","しょうゆ","みりん"] },
  { id: "s4", type: "side", name: "かぼちゃの煮物", fridge: 4, freezer: true, bento: true, stamina: 1, spicy: false, allergens: [], ingredients: ["かぼちゃ","だし","しょうゆ","みりん","砂糖"] },
  { id: "s5", type: "side", name: "ほうれん草の胡麻和え", fridge: 3, freezer: false, bento: true, stamina: 1, spicy: false, allergens: [], ingredients: ["ほうれん草","すりごま","しょうゆ","砂糖"] },
  { id: "s6", type: "side", name: "ポテトサラダ", fridge: 3, freezer: false, bento: true, stamina: 1, spicy: false, allergens: ["卵"], ingredients: ["じゃがいも","きゅうり","にんじん","ハム","マヨネーズ"] },
  { id: "s7", type: "side", name: "キャロットラペ", fridge: 5, freezer: false, bento: true, stamina: 1, spicy: false, allergens: [], ingredients: ["にんじん","レーズン","オリーブオイル","酢","塩"] },
  { id: "s8", type: "side", name: "無限ピーマン", fridge: 4, freezer: false, bento: true, stamina: 1, spicy: false, allergens: [], ingredients: ["ピーマン","ツナ缶","鶏がらだし","ごま油"] },
  { id: "s9", type: "side", name: "やみつききゅうり", fridge: 4, freezer: false, bento: true, stamina: 1, spicy: false, allergens: [], ingredients: ["きゅうり","塩昆布","ごま油","にんにく"] },
  { id: "s10", type: "side", name: "味玉", fridge: 4, freezer: false, bento: true, stamina: 1, spicy: false, allergens: ["卵"], ingredients: ["卵","しょうゆ","みりん","砂糖"] },
  { id: "s11", type: "side", name: "ナムル", fridge: 3, freezer: false, bento: true, stamina: 1, spicy: false, allergens: ["大豆"], ingredients: ["もやし","ほうれん草","にんじん","ごま油","鶏がらだし"] },
  { id: "s12", type: "side", name: "ブロッコリーのおかか和え", fridge: 3, freezer: false, bento: true, stamina: 1, spicy: false, allergens: [], ingredients: ["ブロッコリー","かつお節","しょうゆ"] },
  { id: "s13", type: "side", name: "小松菜と油揚げの煮浸し", fridge: 4, freezer: true, bento: true, stamina: 1, spicy: false, allergens: ["大豆"], ingredients: ["小松菜","油揚げ","だし","しょうゆ","みりん"] },
  { id: "s14", type: "side", name: "大学芋", fridge: 4, freezer: true, bento: true, stamina: 1, spicy: false, allergens: [], ingredients: ["さつまいも","砂糖","しょうゆ","黒ごま"] },
];

// 平日にサッと足す汁物・一品
const QUICK_SOUPS = ["味噌汁", "豚汁", "わかめスープ", "コーンスープ", "けんちん汁", "たまごスープ"];

if (typeof module !== "undefined" && module.exports) { module.exports = { PREP_MENUS, QUICK_SOUPS }; }
