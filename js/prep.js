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

  // ── 主菜の常備菜（追加） ──────────────────────
  { id: "m19", type: "main", name: "鶏チャーシュー", fridge: 4, freezer: true, bento: true, stamina: 3, spicy: false, allergens: [], ingredients: ["鶏むね肉","しょうゆ","はちみつ","にんにく","しょうが"] },
  { id: "m20", type: "main", name: "鶏むねのオイル蒸し", fridge: 4, freezer: true, bento: true, stamina: 3, spicy: false, allergens: [], ingredients: ["鶏むね肉","塩","オリーブオイル","にんにく"] },
  { id: "m21", type: "main", name: "手羽元のさっぱり煮", fridge: 4, freezer: false, bento: true, stamina: 3, spicy: false, allergens: ["卵"], ingredients: ["鶏手羽元","ゆで卵","酢","しょうゆ","しょうが"] },
  { id: "m22", type: "main", name: "手羽先の甘辛焼き", fridge: 3, freezer: true, bento: true, stamina: 3, spicy: false, allergens: ["小麦"], ingredients: ["鶏手羽先","しょうゆ","みりん","にんにく","片栗粉"] },
  { id: "m23", type: "main", name: "鶏むねのマヨポン", fridge: 3, freezer: false, bento: true, stamina: 3, spicy: false, allergens: ["卵"], ingredients: ["鶏むね肉","マヨネーズ","ポン酢","片栗粉"] },
  { id: "m24", type: "main", name: "ささみの梅しそ巻き", fridge: 3, freezer: true, bento: true, stamina: 2, spicy: false, allergens: [], ingredients: ["鶏ささみ","梅干し","大葉","のり"] },
  { id: "m25", type: "main", name: "鶏ごぼう", fridge: 4, freezer: true, bento: true, stamina: 2, spicy: false, allergens: [], ingredients: ["鶏もも肉","ごぼう","しょうゆ","みりん","ごま"] },
  { id: "m26", type: "main", name: "鶏の甘酢あん", fridge: 3, freezer: true, bento: true, stamina: 3, spicy: false, allergens: ["小麦"], ingredients: ["鶏もも肉","玉ねぎ","ピーマン","酢","ケチャップ","片栗粉"] },
  { id: "m27", type: "main", name: "豚こまの甘辛炒め", fridge: 3, freezer: true, bento: true, stamina: 2, spicy: false, allergens: [], ingredients: ["豚こま肉","玉ねぎ","しょうゆ","みりん","ごま"] },
  { id: "m28", type: "main", name: "豚バラ大根", fridge: 4, freezer: false, bento: true, stamina: 2, spicy: false, allergens: [], ingredients: ["豚バラ肉","大根","しょうゆ","みりん","しょうが"] },
  { id: "m29", type: "main", name: "豚肉のみそ漬け焼き", fridge: 4, freezer: true, bento: true, stamina: 2, spicy: false, allergens: [], ingredients: ["豚ロース","味噌","みりん","砂糖"] },
  { id: "m30", type: "main", name: "煮豚(チャーシュー)", fridge: 5, freezer: true, bento: true, stamina: 3, spicy: false, allergens: ["卵","大豆"], ingredients: ["豚肩ロース","しょうゆ","砂糖","ゆで卵","長ねぎ"] },
  { id: "m31", type: "main", name: "豚こまのケチャップ炒め", fridge: 3, freezer: true, bento: true, stamina: 2, spicy: false, allergens: [], ingredients: ["豚こま肉","玉ねぎ","ピーマン","ケチャップ","ウスターソース"] },
  { id: "m32", type: "main", name: "スペアリブの煮込み", fridge: 4, freezer: true, bento: true, stamina: 3, spicy: false, allergens: [], ingredients: ["スペアリブ","玉ねぎ","にんにく","ケチャップ","はちみつ"] },
  { id: "m33", type: "main", name: "牛肉と大根のオイスター煮", fridge: 4, freezer: false, bento: true, stamina: 2, spicy: false, allergens: ["大豆"], ingredients: ["牛こま肉","大根","オイスターソース","しょうゆ","しょうが"] },
  { id: "m34", type: "main", name: "牛肉とれんこんの甘辛", fridge: 4, freezer: true, bento: true, stamina: 2, spicy: false, allergens: [], ingredients: ["牛こま肉","れんこん","しょうゆ","みりん","ごま"] },
  { id: "m35", type: "main", name: "ドライカレー", fridge: 4, freezer: true, bento: false, stamina: 3, spicy: true, allergens: ["小麦"], ingredients: ["合いびき肉","玉ねぎ","にんじん","ピーマン","カレー粉"] },
  { id: "m36", type: "main", name: "チリコンカン", fridge: 4, freezer: true, bento: true, stamina: 2, spicy: true, allergens: ["大豆"], ingredients: ["合いびき肉","大豆水煮","トマト缶","玉ねぎ","チリパウダー"] },
  { id: "m37", type: "main", name: "鶏つくねの照り焼き", fridge: 3, freezer: true, bento: true, stamina: 2, spicy: false, allergens: ["卵"], ingredients: ["鶏ひき肉","長ねぎ","卵","しょうゆ","みりん"] },
  { id: "m38", type: "main", name: "豆腐つくね", fridge: 3, freezer: true, bento: true, stamina: 2, spicy: false, allergens: ["大豆","卵"], ingredients: ["鶏ひき肉","豆腐","長ねぎ","卵","しょうゆ"] },
  { id: "m39", type: "main", name: "ミートボールのトマト煮", fridge: 4, freezer: true, bento: true, stamina: 3, spicy: false, allergens: ["卵","小麦"], ingredients: ["合いびき肉","玉ねぎ","卵","パン粉","トマト缶"] },
  { id: "m40", type: "main", name: "鮭の照り焼き", fridge: 3, freezer: false, bento: true, stamina: 2, spicy: false, allergens: [], ingredients: ["生鮭","しょうゆ","みりん","砂糖"] },
  { id: "m41", type: "main", name: "さばの竜田揚げ", fridge: 3, freezer: true, bento: true, stamina: 2, spicy: false, allergens: ["小麦"], ingredients: ["さば","しょうゆ","しょうが","片栗粉"] },
  { id: "m42", type: "main", name: "ぶりの照り焼き", fridge: 3, freezer: false, bento: true, stamina: 2, spicy: false, allergens: [], ingredients: ["ぶり","しょうゆ","みりん","砂糖"] },
  { id: "m43", type: "main", name: "いわしの生姜煮", fridge: 4, freezer: false, bento: true, stamina: 1, spicy: false, allergens: [], ingredients: ["いわし","しょうが","しょうゆ","梅干し"] },
  { id: "m44", type: "main", name: "鮭フレーク", fridge: 5, freezer: true, bento: true, stamina: 2, spicy: false, allergens: [], ingredients: ["生鮭","塩","ごま"] },
  { id: "m45", type: "main", name: "さんまの蒲焼き", fridge: 3, freezer: false, bento: true, stamina: 2, spicy: false, allergens: ["小麦"], ingredients: ["さんま","しょうゆ","みりん","片栗粉","山椒"] },
  { id: "m46", type: "main", name: "たらの甘酢あん", fridge: 3, freezer: false, bento: true, stamina: 1, spicy: false, allergens: ["小麦"], ingredients: ["たら","玉ねぎ","にんじん","酢","片栗粉"] },
  { id: "m47", type: "main", name: "えびのチリソース", fridge: 3, freezer: false, bento: true, stamina: 2, spicy: true, allergens: ["えび"], ingredients: ["えび","長ねぎ","豆板醤","ケチャップ","にんにく"] },
  { id: "m48", type: "main", name: "いかと里芋の煮物", fridge: 3, freezer: false, bento: true, stamina: 1, spicy: false, allergens: [], ingredients: ["いか","里芋","しょうゆ","みりん","しょうが"] },
  { id: "m49", type: "main", name: "大豆と鶏の五目煮", fridge: 5, freezer: true, bento: true, stamina: 2, spicy: false, allergens: ["大豆"], ingredients: ["大豆水煮","鶏もも肉","にんじん","こんにゃく","しょうゆ"] },
  { id: "m50", type: "main", name: "厚揚げと豚の煮物", fridge: 4, freezer: false, bento: true, stamina: 2, spicy: false, allergens: ["大豆"], ingredients: ["厚揚げ","豚こま肉","小松菜","しょうゆ","みりん"] },
  { id: "m51", type: "main", name: "作り置きバターチキン", fridge: 4, freezer: true, bento: false, stamina: 3, spicy: true, allergens: ["乳"], ingredients: ["鶏もも肉","トマト缶","生クリーム","バター","カレー粉"] },
  { id: "m52", type: "main", name: "タコライスの肉味噌", fridge: 4, freezer: true, bento: true, stamina: 2, spicy: true, allergens: ["大豆"], ingredients: ["合いびき肉","玉ねぎ","チリパウダー","ケチャップ","味噌"] },
  { id: "m53", type: "main", name: "ガパオ風そぼろ", fridge: 3, freezer: true, bento: true, stamina: 2, spicy: true, allergens: [], ingredients: ["鶏ひき肉","パプリカ","バジル","ナンプラー","にんにく"] },
  { id: "m54", type: "main", name: "鶏レバーの甘辛煮", fridge: 4, freezer: true, bento: true, stamina: 3, spicy: false, allergens: [], ingredients: ["鶏レバー","しょうが","しょうゆ","みりん","砂糖"] },
  { id: "m55", type: "main", name: "鶏の塩麹焼き", fridge: 4, freezer: true, bento: true, stamina: 3, spicy: false, allergens: [], ingredients: ["鶏もも肉","塩麹","にんにく"] },

  // ── 副菜の常備菜（追加） ──────────────────────
  { id: "s15", type: "side", name: "小松菜のおひたし", fridge: 3, freezer: false, bento: true, stamina: 1, spicy: false, allergens: [], ingredients: ["小松菜","かつお節","しょうゆ"] },
  { id: "s16", type: "side", name: "いんげんの胡麻和え", fridge: 3, freezer: false, bento: true, stamina: 1, spicy: false, allergens: [], ingredients: ["いんげん","すりごま","しょうゆ","砂糖"] },
  { id: "s17", type: "side", name: "なすの煮浸し", fridge: 4, freezer: false, bento: true, stamina: 1, spicy: false, allergens: [], ingredients: ["なす","だし","しょうゆ","みりん","しょうが"] },
  { id: "s18", type: "side", name: "なすの南蛮漬け", fridge: 4, freezer: false, bento: true, stamina: 1, spicy: false, allergens: [], ingredients: ["なす","玉ねぎ","酢","しょうゆ","唐辛子"] },
  { id: "s19", type: "side", name: "ピーマンとじゃこの炒め", fridge: 4, freezer: false, bento: true, stamina: 1, spicy: false, allergens: [], ingredients: ["ピーマン","ちりめんじゃこ","しょうゆ","ごま油"] },
  { id: "s20", type: "side", name: "れんこんのきんぴら", fridge: 5, freezer: true, bento: true, stamina: 1, spicy: false, allergens: [], ingredients: ["れんこん","にんじん","しょうゆ","みりん","ごま"] },
  { id: "s21", type: "side", name: "ごぼうサラダ", fridge: 3, freezer: false, bento: true, stamina: 1, spicy: false, allergens: ["卵"], ingredients: ["ごぼう","にんじん","マヨネーズ","ごま"] },
  { id: "s22", type: "side", name: "マカロニサラダ", fridge: 3, freezer: false, bento: true, stamina: 1, spicy: false, allergens: ["卵","小麦"], ingredients: ["マカロニ","きゅうり","ハム","マヨネーズ"] },
  { id: "s23", type: "side", name: "かぼちゃサラダ", fridge: 3, freezer: false, bento: true, stamina: 1, spicy: false, allergens: ["卵"], ingredients: ["かぼちゃ","玉ねぎ","マヨネーズ","レーズン"] },
  { id: "s24", type: "side", name: "コールスロー", fridge: 4, freezer: false, bento: true, stamina: 1, spicy: false, allergens: ["卵"], ingredients: ["キャベツ","にんじん","コーン","マヨネーズ","酢"] },
  { id: "s25", type: "side", name: "大根の煮物", fridge: 4, freezer: false, bento: true, stamina: 1, spicy: false, allergens: [], ingredients: ["大根","だし","しょうゆ","みりん"] },
  { id: "s26", type: "side", name: "大根なます", fridge: 5, freezer: false, bento: true, stamina: 1, spicy: false, allergens: [], ingredients: ["大根","にんじん","酢","砂糖","柚子"] },
  { id: "s27", type: "side", name: "白菜の浅漬け", fridge: 4, freezer: false, bento: true, stamina: 1, spicy: false, allergens: [], ingredients: ["白菜","塩昆布","柚子","塩"] },
  { id: "s28", type: "side", name: "きゅうりの浅漬け", fridge: 4, freezer: false, bento: true, stamina: 1, spicy: false, allergens: [], ingredients: ["きゅうり","塩昆布","しょうが","塩"] },
  { id: "s29", type: "side", name: "もやしのナムル", fridge: 3, freezer: false, bento: true, stamina: 1, spicy: false, allergens: ["大豆"], ingredients: ["もやし","にんじん","ごま油","鶏がらだし"] },
  { id: "s30", type: "side", name: "ブロッコリーとゆで卵のサラダ", fridge: 3, freezer: false, bento: true, stamina: 1, spicy: false, allergens: ["卵"], ingredients: ["ブロッコリー","ゆで卵","マヨネーズ"] },
  { id: "s31", type: "side", name: "アスパラのおかか和え", fridge: 3, freezer: false, bento: true, stamina: 1, spicy: false, allergens: [], ingredients: ["アスパラ","かつお節","しょうゆ"] },
  { id: "s32", type: "side", name: "オクラの胡麻和え", fridge: 3, freezer: false, bento: true, stamina: 1, spicy: false, allergens: [], ingredients: ["オクラ","すりごま","しょうゆ","砂糖"] },
  { id: "s33", type: "side", name: "ミニトマトのマリネ", fridge: 4, freezer: false, bento: true, stamina: 1, spicy: false, allergens: [], ingredients: ["ミニトマト","オリーブオイル","酢","玉ねぎ"] },
  { id: "s34", type: "side", name: "パプリカのマリネ", fridge: 5, freezer: false, bento: true, stamina: 1, spicy: false, allergens: [], ingredients: ["パプリカ","オリーブオイル","酢","にんにく"] },
  { id: "s35", type: "side", name: "きのこのマリネ", fridge: 5, freezer: false, bento: true, stamina: 1, spicy: false, allergens: [], ingredients: ["しめじ","エリンギ","オリーブオイル","酢","にんにく"] },
  { id: "s36", type: "side", name: "自家製なめたけ", fridge: 5, freezer: true, bento: true, stamina: 1, spicy: false, allergens: [], ingredients: ["えのき","しょうゆ","みりん","酢"] },
  { id: "s37", type: "side", name: "切り昆布の煮物", fridge: 5, freezer: true, bento: true, stamina: 1, spicy: false, allergens: ["大豆"], ingredients: ["切り昆布","油揚げ","にんじん","しょうゆ"] },
  { id: "s38", type: "side", name: "うずらの煮卵", fridge: 4, freezer: false, bento: true, stamina: 1, spicy: false, allergens: ["卵"], ingredients: ["うずら卵","しょうゆ","みりん","だし"] },
  { id: "s39", type: "side", name: "ちくわの磯辺揚げ", fridge: 3, freezer: true, bento: true, stamina: 1, spicy: false, allergens: ["小麦","卵"], ingredients: ["ちくわ","青のり","天ぷら粉"] },
  { id: "s40", type: "side", name: "じゃがいものそぼろ煮", fridge: 3, freezer: false, bento: true, stamina: 1, spicy: false, allergens: [], ingredients: ["じゃがいも","鶏ひき肉","だし","しょうゆ","みりん"] },
  { id: "s41", type: "side", name: "さつまいものレモン煮", fridge: 4, freezer: true, bento: true, stamina: 1, spicy: false, allergens: [], ingredients: ["さつまいも","レモン","砂糖","塩"] },
  { id: "s42", type: "side", name: "かぶの浅漬け", fridge: 4, freezer: false, bento: true, stamina: 1, spicy: false, allergens: [], ingredients: ["かぶ","塩昆布","柚子","塩"] },
  { id: "s43", type: "side", name: "春雨サラダ", fridge: 3, freezer: false, bento: true, stamina: 1, spicy: false, allergens: ["卵","小麦"], ingredients: ["春雨","きゅうり","ハム","卵","酢"] },
  { id: "s44", type: "side", name: "枝豆とコーンのサラダ", fridge: 3, freezer: false, bento: true, stamina: 1, spicy: false, allergens: ["卵"], ingredients: ["枝豆","コーン","玉ねぎ","マヨネーズ"] },
  { id: "s45", type: "side", name: "キャベツの塩昆布和え", fridge: 3, freezer: false, bento: true, stamina: 1, spicy: false, allergens: [], ingredients: ["キャベツ","塩昆布","ごま油","ごま"] },
];

// 平日にサッと足す汁物・一品
const QUICK_SOUPS = ["味噌汁", "豚汁", "わかめスープ", "コーンスープ", "けんちん汁", "たまごスープ"];

if (typeof module !== "undefined" && module.exports) { module.exports = { PREP_MENUS, QUICK_SOUPS }; }
