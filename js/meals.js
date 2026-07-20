// 献立データベース
// temp: 気温帯 ['cold'(〜15℃) / 'mild'(15〜25℃) / 'hot'(25℃〜)]
// rainOk: 雨の日向き（手間少なめ・室内で完結・温かい）
// effort: 手間 1(楽)〜3(手間)
// stamina: スタミナ度 1〜3（育ち盛り・運動する子向け）
// spicy: 辛い（子供には甘口対応の注記に使用）
// allergens: 主なアレルゲン（除外フィルタ用）
// ingredients: 主な買い物リスト用材料
// q: (任意) クックパッド検索キーワード。「◯◯と◯◯」等の複合名で
//    そのまま検索すると0件になる献立に、主菜1品のキーワードを指定する。

const MENUS = [
  // ── 和食・定食（焼き魚・煮魚・煮物） ─────────────────────
  { id: 1, name: "豚の生姜焼き定食", items: ["豚の生姜焼き", "千切りキャベツ", "ごはん・味噌汁"], temp: ["mild","cold"], rainOk: true, effort: 1, stamina: 2, spicy: false, allergens: [], ingredients: ["豚ロース","玉ねぎ","しょうが","キャベツ","米"] },
  { id: 2, name: "さばの塩焼き定食", items: ["さばの塩焼き", "小松菜のおひたし", "ごはん・味噌汁"], temp: ["mild","cold"], rainOk: true, effort: 2, stamina: 1, spicy: false, allergens: [], ingredients: ["さば","小松菜","大根おろし","米","味噌"] },
  { id: 3, name: "さんまの塩焼き定食", items: ["さんまの塩焼き", "大根おろし", "ごはん・味噌汁"], temp: ["mild","cold"], rainOk: true, effort: 2, stamina: 1, spicy: false, allergens: [], ingredients: ["さんま","大根","すだち","米","味噌"] },
  { id: 4, name: "あじの南蛮漬け", items: ["あじの南蛮漬け", "冷奴", "ごはん・味噌汁"], temp: ["mild","hot"], rainOk: false, effort: 2, stamina: 2, spicy: false, allergens: ["大豆"], ingredients: ["あじ","玉ねぎ","にんじん","ピーマン","酢","豆腐","米"] },
  { id: 5, name: "さばの味噌煮", items: ["さばの味噌煮", "ほうれん草のおひたし", "ごはん・味噌汁"], temp: ["mild","cold"], rainOk: true, effort: 2, stamina: 1, spicy: false, allergens: [], ingredients: ["さば","しょうが","味噌","ほうれん草","米"] },
  { id: 6, name: "ぶりの照り焼き", items: ["ぶりの照り焼き", "きんぴらごぼう", "ごはん・味噌汁"], temp: ["mild","cold"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: [], ingredients: ["ぶり","ごぼう","にんじん","しょうゆ","みりん","米"] },
  { id: 7, name: "かれいの煮付け", items: ["かれいの煮付け", "ほうれん草", "ごはん・味噌汁"], temp: ["mild","cold"], rainOk: true, effort: 2, stamina: 1, spicy: false, allergens: [], ingredients: ["かれい","しょうが","しょうゆ","みりん","ほうれん草","米"] },
  { id: 8, name: "鮭のムニエル", items: ["鮭のムニエル", "粉ふきいも", "コンソメスープ"], temp: ["mild"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: ["乳","小麦"], ingredients: ["生鮭","バター","小麦粉","じゃがいも","レモン","米"] },
  { id: 9, name: "鮭のホイル焼き", items: ["鮭ときのこのホイル焼き", "ごはん", "けんちん汁"], temp: ["mild","cold"], rainOk: true, effort: 2, stamina: 1, spicy: false, allergens: ["乳"], ingredients: ["生鮭","しめじ","玉ねぎ","バター","レモン","米"] },
  { id: 10, name: "鮭のちゃんちゃん焼き", items: ["鮭のちゃんちゃん焼き", "ごはん", "わかめスープ"], temp: ["cold","mild"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: [], ingredients: ["生鮭","キャベツ","玉ねぎ","もやし","味噌","バター","米"] },
  { id: 11, name: "ぶり大根", items: ["ぶり大根", "ほうれん草の胡麻和え", "ごはん・味噌汁"], temp: ["cold"], rainOk: true, effort: 3, stamina: 2, spicy: false, allergens: [], ingredients: ["ぶり","大根","しょうが","しょうゆ","ほうれん草","米"] },
  { id: 12, name: "いわしの梅煮", items: ["いわしの梅煮", "きんぴら", "ごはん・味噌汁"], temp: ["mild","cold"], rainOk: true, effort: 2, stamina: 1, spicy: false, allergens: [], ingredients: ["いわし","梅干し","しょうが","ごぼう","にんじん","米"] },
  { id: 13, name: "たらのホイル焼き", items: ["たらのホイル焼き", "温野菜", "ごはん・スープ"], temp: ["cold","mild"], rainOk: true, effort: 2, stamina: 1, spicy: false, allergens: ["乳"], ingredients: ["たら","しめじ","玉ねぎ","バター","ブロッコリー","米"] },
  { id: 14, name: "ほっけの開き定食", items: ["ほっけの開き", "冷奴", "ごはん・味噌汁"], temp: ["mild","cold"], rainOk: true, effort: 2, stamina: 1, spicy: false, allergens: ["大豆"], ingredients: ["ほっけ","大根","豆腐","米","味噌"] },
  { id: 15, name: "いか大根", items: ["いか大根", "ほうれん草のおひたし", "ごはん・味噌汁"], temp: ["cold"], rainOk: true, effort: 2, stamina: 1, spicy: false, allergens: [], ingredients: ["いか","大根","しょうが","しょうゆ","ほうれん草","米"] },
  { id: 16, name: "あさりの酒蒸しとごはん", q: "あさりの酒蒸し", items: ["あさりの酒蒸し", "だし巻き卵", "ごはん・味噌汁"], temp: ["mild","hot"], rainOk: true, effort: 1, stamina: 1, spicy: false, allergens: ["卵"], ingredients: ["あさり","酒","にんにく","卵","米","味噌"] },
  { id: 17, name: "肉じゃが定食", items: ["肉じゃが", "焼き魚(さば)", "ごはん・味噌汁"], temp: ["cold","mild"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: [], ingredients: ["豚こま肉","じゃがいも","にんじん","玉ねぎ","さば","味噌","米"] },
  { id: 18, name: "筑前煮", items: ["筑前煮", "だし巻き卵", "ごはん・味噌汁"], temp: ["cold","mild"], rainOk: true, effort: 2, stamina: 1, spicy: false, allergens: ["卵"], ingredients: ["鶏もも肉","れんこん","にんじん","ごぼう","こんにゃく","卵","米"] },
  { id: 19, name: "豚の角煮", items: ["豚の角煮", "青梗菜の炒め", "ごはん・味噌汁"], temp: ["cold"], rainOk: true, effort: 3, stamina: 3, spicy: false, allergens: ["大豆"], ingredients: ["豚バラブロック","しょうが","長ねぎ","しょうゆ","青梗菜","米"] },
  { id: 20, name: "鶏の照り焼き", items: ["鶏の照り焼き", "きんぴらごぼう", "ごはん・味噌汁"], temp: ["mild","cold"], rainOk: true, effort: 1, stamina: 2, spicy: false, allergens: [], ingredients: ["鶏もも肉","しょうゆ","みりん","ごぼう","にんじん","米"] },
  { id: 21, name: "豚汁定食", items: ["鮭の塩焼き", "具だくさん豚汁", "ごはん・小鉢"], temp: ["cold"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: [], ingredients: ["生鮭","豚こま肉","大根","にんじん","ごぼう","こんにゃく","味噌","米"] },
  { id: 22, name: "厚揚げと豚の炒め", q: "厚揚げ 豚", items: ["厚揚げと豚肉の甘辛炒め", "もやしナムル", "ごはん・味噌汁"], temp: ["mild","cold"], rainOk: true, effort: 1, stamina: 2, spicy: false, allergens: ["大豆"], ingredients: ["厚揚げ","豚こま肉","ピーマン","もやし","しょうゆ","米"] },

  // ── 揚げ物 ───────────────────────────────────────────
  { id: 23, name: "鶏の唐揚げ定食", items: ["鶏の唐揚げ", "千切りキャベツ・レモン", "ごはん・味噌汁"], temp: ["mild","hot"], rainOk: false, effort: 2, stamina: 3, spicy: false, allergens: ["小麦"], ingredients: ["鶏もも肉","にんにく","しょうが","片栗粉","キャベツ","米"] },
  { id: 24, name: "鶏の竜田揚げ", items: ["鶏の竜田揚げ", "冷奴", "ごはん・味噌汁"], temp: ["mild","hot"], rainOk: false, effort: 2, stamina: 3, spicy: false, allergens: ["大豆"], ingredients: ["鶏もも肉","しょうゆ","しょうが","片栗粉","豆腐","米"] },
  { id: 25, name: "チキン南蛮", items: ["チキン南蛮・タルタル", "コールスロー", "ごはん・スープ"], temp: ["mild","hot"], rainOk: false, effort: 3, stamina: 3, spicy: false, allergens: ["卵","小麦"], ingredients: ["鶏もも肉","卵","小麦粉","酢","マヨネーズ","キャベツ","米"] },
  { id: 26, name: "とんかつ定食", items: ["とんかつ", "千切りキャベツ", "ごはん・豚汁"], temp: ["mild","cold"], rainOk: false, effort: 3, stamina: 3, spicy: false, allergens: ["卵","小麦"], ingredients: ["豚ロース","卵","パン粉","小麦粉","キャベツ","米"] },
  { id: 27, name: "ヒレカツ", items: ["ヒレカツ", "ポテトサラダ", "ごはん・味噌汁"], temp: ["mild"], rainOk: false, effort: 3, stamina: 3, spicy: false, allergens: ["卵","小麦"], ingredients: ["豚ヒレ","卵","パン粉","じゃがいも","きゅうり","米"] },
  { id: 28, name: "メンチカツ", items: ["メンチカツ", "コールスロー", "ごはん・スープ"], temp: ["mild"], rainOk: false, effort: 3, stamina: 3, spicy: false, allergens: ["卵","小麦"], ingredients: ["合いびき肉","玉ねぎ","卵","パン粉","キャベツ","米"] },
  { id: 29, name: "コロッケ定食", items: ["ポテトコロッケ", "千切りキャベツ", "ごはん・味噌汁"], temp: ["mild"], rainOk: false, effort: 3, stamina: 2, spicy: false, allergens: ["卵","小麦"], ingredients: ["じゃがいも","合いびき肉","玉ねぎ","卵","パン粉","キャベツ","米"] },
  { id: 30, name: "あじフライ", items: ["あじフライ・ソース", "ポテトサラダ", "ごはん・味噌汁"], temp: ["mild","hot"], rainOk: false, effort: 3, stamina: 2, spicy: false, allergens: ["卵","小麦"], ingredients: ["あじ","卵","パン粉","じゃがいも","キャベツ","米"] },
  { id: 31, name: "エビフライ", items: ["エビフライ・タルタル", "ポテトサラダ", "ごはん・スープ"], temp: ["mild","hot"], rainOk: false, effort: 3, stamina: 2, spicy: false, allergens: ["えび","卵","小麦"], ingredients: ["えび","パン粉","卵","じゃがいも","きゅうり","米"] },
  { id: 32, name: "かき揚げ丼", items: ["野菜のかき揚げ丼", "小鉢", "味噌汁"], temp: ["mild"], rainOk: false, effort: 3, stamina: 2, spicy: false, allergens: ["小麦","えび"], ingredients: ["玉ねぎ","にんじん","三つ葉","小えび","天ぷら粉","米","めんつゆ"] },
  { id: 33, name: "天ぷら定食", items: ["野菜と海老の天ぷら", "冷奴", "ごはん・味噌汁"], temp: ["mild"], rainOk: false, effort: 3, stamina: 2, spicy: false, allergens: ["小麦","えび","大豆"], ingredients: ["えび","なす","かぼちゃ","ちくわ","天ぷら粉","豆腐","米"] },
  { id: 34, name: "油淋鶏", items: ["油淋鶏(ねぎソース)", "中華スープ", "ごはん"], temp: ["mild","hot"], rainOk: false, effort: 3, stamina: 3, spicy: false, allergens: ["小麦"], ingredients: ["鶏もも肉","長ねぎ","しょうが","酢","片栗粉","米"] },
  { id: 35, name: "夏野菜の揚げ浸し", items: ["夏野菜の揚げ浸し", "冷しゃぶ", "ごはん・味噌汁"], temp: ["hot"], rainOk: false, effort: 2, stamina: 1, spicy: false, allergens: [], ingredients: ["なす","ズッキーニ","パプリカ","豚しゃぶ肉","めんつゆ","米"] },

  // ── ハンバーグ・洋食 ─────────────────────────────────
  { id: 36, name: "ハンバーグ", items: ["デミグラスハンバーグ", "温野菜", "ごはん・コーンスープ"], temp: ["mild","cold"], rainOk: true, effort: 3, stamina: 3, spicy: false, allergens: ["卵","小麦","乳"], ingredients: ["合いびき肉","玉ねぎ","卵","パン粉","デミソース","ブロッコリー","米"] },
  { id: 37, name: "煮込みハンバーグ", items: ["トマト煮込みハンバーグ", "バターライス", "サラダ"], temp: ["cold","mild"], rainOk: true, effort: 3, stamina: 3, spicy: false, allergens: ["卵","小麦"], ingredients: ["合いびき肉","玉ねぎ","卵","パン粉","トマト缶","米"] },
  { id: 38, name: "豆腐ハンバーグ", items: ["豆腐ハンバーグ和風あん", "ひじき煮", "ごはん・味噌汁"], temp: ["mild"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: ["大豆","卵"], ingredients: ["鶏ひき肉","豆腐","玉ねぎ","卵","大根おろし","米"] },
  { id: 39, name: "チキンソテー", items: ["チキンソテーきのこソース", "バターライス", "ミネストローネ"], temp: ["mild"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: ["乳"], ingredients: ["鶏もも肉","しめじ","玉ねぎ","トマト缶","バター","米"] },
  { id: 40, name: "ポークソテー", items: ["ポークソテー玉ねぎソース", "温野菜", "ごはん・スープ"], temp: ["mild"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: [], ingredients: ["豚ロース","玉ねぎ","にんにく","しょうゆ","ブロッコリー","米"] },
  { id: 41, name: "チキンのトマト煮", items: ["鶏肉のトマト煮込み", "バゲット", "サラダ"], temp: ["mild","cold"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: ["小麦"], ingredients: ["鶏もも肉","玉ねぎ","トマト缶","にんにく","バゲット","米"] },
  { id: 42, name: "ミートローフ", items: ["ミートローフ", "マッシュポテト", "コンソメスープ"], temp: ["mild","cold"], rainOk: true, effort: 3, stamina: 3, spicy: false, allergens: ["卵","小麦"], ingredients: ["合いびき肉","玉ねぎ","卵","パン粉","じゃがいも","ケチャップ"] },
  { id: 43, name: "ロールキャベツ", items: ["トマトロールキャベツ", "ごはん or パン", "コンソメスープ"], temp: ["cold"], rainOk: true, effort: 3, stamina: 2, spicy: false, allergens: [], ingredients: ["合いびき肉","キャベツ","玉ねぎ","トマト缶","コンソメ"] },
  { id: 44, name: "マカロニグラタン", items: ["海老とマカロニのグラタン", "コーンスープ", "サラダ"], temp: ["cold"], rainOk: true, effort: 3, stamina: 2, spicy: false, allergens: ["小麦","乳","えび"], ingredients: ["えび","マカロニ","玉ねぎ","牛乳","バター","チーズ","コーンスープ"] },
  { id: 45, name: "ドリア", items: ["チキンドリア", "コンソメスープ", "サラダ"], temp: ["cold","mild"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: ["乳","小麦"], ingredients: ["鶏もも肉","玉ねぎ","牛乳","バター","チーズ","米"] },
  { id: 46, name: "ラザニア", items: ["ミートラザニア", "ミネストローネ", "サラダ"], temp: ["cold"], rainOk: true, effort: 3, stamina: 3, spicy: false, allergens: ["小麦","乳"], ingredients: ["合いびき肉","ラザニア","トマト缶","チーズ","牛乳","玉ねぎ"] },
  { id: 47, name: "オムライス", items: ["ふわとろオムライス", "コンソメスープ", "サラダ"], temp: ["mild"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: ["卵"], ingredients: ["鶏もも肉","卵","玉ねぎ","ケチャップ","米","ピーマン"] },
  { id: 48, name: "ハヤシライス", items: ["ハヤシライス", "コールスロー", "福神漬け"], temp: ["cold","mild"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: ["小麦"], ingredients: ["牛薄切り肉","玉ねぎ","マッシュルーム","ハヤシルウ","米"] },
  { id: 49, name: "ビーフストロガノフ", items: ["ビーフストロガノフ", "バターライス", "サラダ"], temp: ["cold"], rainOk: true, effort: 3, stamina: 3, spicy: false, allergens: ["乳","小麦"], ingredients: ["牛薄切り肉","玉ねぎ","マッシュルーム","サワークリーム","デミ","米"] },
  { id: 50, name: "ポトフ", items: ["具だくさんポトフ", "バゲット", "チーズ"], temp: ["cold"], rainOk: true, effort: 2, stamina: 1, spicy: false, allergens: ["乳","小麦"], ingredients: ["ソーセージ","キャベツ","じゃがいも","にんじん","玉ねぎ","コンソメ"] },
  { id: 51, name: "ミネストローネと厚切りトースト", q: "ミネストローネ", items: ["ミネストローネ", "厚切りトースト", "オムレツ"], temp: ["cold","mild"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: ["小麦","卵"], ingredients: ["ベーコン","トマト缶","キャベツ","じゃがいも","食パン","卵"] },
  { id: 52, name: "タンドリーチキン", items: ["タンドリーチキン", "ナン or ごはん", "サラダ"], temp: ["mild","hot"], rainOk: true, effort: 2, stamina: 3, spicy: true, allergens: ["乳"], ingredients: ["鶏もも肉","ヨーグルト","カレー粉","にんにく","ナン","米"] },

  // ── カレー ───────────────────────────────────────────
  { id: 53, name: "カレーライス", items: ["ポークカレー", "福神漬け", "コールスロー"], temp: ["cold","mild"], rainOk: true, effort: 2, stamina: 3, spicy: false, allergens: ["小麦"], ingredients: ["豚こま肉","じゃがいも","にんじん","玉ねぎ","カレールウ","米"] },
  { id: 54, name: "夏野菜カレー", items: ["夏野菜カレー", "らっきょう", "ヨーグルトサラダ"], temp: ["hot","mild"], rainOk: true, effort: 2, stamina: 3, spicy: false, allergens: ["小麦","乳"], ingredients: ["鶏もも肉","なす","ズッキーニ","パプリカ","トマト","カレールウ","米"] },
  { id: 55, name: "キーマカレー", items: ["キーマカレー", "温玉のせ", "サラダ"], temp: ["mild","hot"], rainOk: true, effort: 2, stamina: 3, spicy: true, allergens: ["小麦","卵"], ingredients: ["合いびき肉","玉ねぎ","にんじん","トマト","カレー粉","卵","米"] },
  { id: 56, name: "バターチキンカレー", items: ["バターチキンカレー", "ナン", "サラダ"], temp: ["cold","mild"], rainOk: true, effort: 2, stamina: 3, spicy: true, allergens: ["乳","小麦"], ingredients: ["鶏もも肉","トマト缶","生クリーム","バター","カレー粉","ナン"] },
  { id: 57, name: "スープカレー", items: ["チキンスープカレー", "ごはん", "ゆで卵"], temp: ["cold","mild"], rainOk: true, effort: 2, stamina: 2, spicy: true, allergens: ["小麦","卵"], ingredients: ["鶏もも肉","にんじん","じゃがいも","ピーマン","カレー粉","卵","米"] },

  // ── 中華 ─────────────────────────────────────────────
  { id: 58, name: "麻婆豆腐(甘口)", items: ["麻婆豆腐", "中華スープ", "ごはん"], temp: ["cold","mild"], rainOk: true, effort: 1, stamina: 2, spicy: true, allergens: ["大豆"], ingredients: ["豚ひき肉","豆腐","長ねぎ","麻婆豆腐の素(甘口)","米"] },
  { id: 59, name: "麻婆茄子", items: ["麻婆茄子", "わかめスープ", "ごはん"], temp: ["mild","hot"], rainOk: true, effort: 1, stamina: 2, spicy: true, allergens: ["大豆"], ingredients: ["豚ひき肉","なす","ピーマン","長ねぎ","豆板醤","米"] },
  { id: 60, name: "回鍋肉", items: ["回鍋肉", "わかめスープ", "ごはん"], temp: ["mild","hot"], rainOk: true, effort: 1, stamina: 2, spicy: true, allergens: ["大豆"], ingredients: ["豚バラ肉","キャベツ","ピーマン","テンメンジャン","米"] },
  { id: 61, name: "青椒肉絲", items: ["青椒肉絲", "中華スープ", "ごはん"], temp: ["mild","hot"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: ["大豆"], ingredients: ["牛肉(細切り)","ピーマン","たけのこ","オイスターソース","米"] },
  { id: 62, name: "酢豚", items: ["酢豚", "中華スープ", "ごはん"], temp: ["mild"], rainOk: true, effort: 3, stamina: 3, spicy: false, allergens: ["小麦"], ingredients: ["豚もも肉","玉ねぎ","ピーマン","にんじん","パイナップル","米"] },
  { id: 63, name: "エビチリ", items: ["エビチリ", "中華スープ", "ごはん"], temp: ["mild","hot"], rainOk: true, effort: 2, stamina: 2, spicy: true, allergens: ["えび"], ingredients: ["えび","長ねぎ","にんにく","豆板醤","ケチャップ","米"] },
  { id: 64, name: "えびマヨ", items: ["えびマヨ", "中華スープ", "ごはん"], temp: ["mild"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: ["えび","卵"], ingredients: ["えび","マヨネーズ","練乳","片栗粉","レタス","米"] },
  { id: 65, name: "八宝菜", items: ["八宝菜", "わかめスープ", "ごはん"], temp: ["mild","cold"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: ["えび"], ingredients: ["豚肉","白菜","えび","うずら卵","にんじん","米"] },
  { id: 66, name: "中華丼", items: ["中華丼", "わかめスープ", "ザーサイ"], temp: ["mild","cold"], rainOk: true, effort: 1, stamina: 2, spicy: false, allergens: ["えび"], ingredients: ["豚肉","白菜","えび","うずら卵","にんじん","米"] },
  { id: 67, name: "天津飯", items: ["天津飯", "中華スープ", "冷奴"], temp: ["mild"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: ["卵","大豆"], ingredients: ["卵","かに風味かまぼこ","長ねぎ","豆腐","米"] },
  { id: 68, name: "よだれ鶏", items: ["よだれ鶏", "中華スープ", "ごはん"], temp: ["hot","mild"], rainOk: true, effort: 2, stamina: 2, spicy: true, allergens: [], ingredients: ["鶏むね肉","長ねぎ","にんにく","ラー油","米"] },
  { id: 69, name: "バンバンジー", items: ["バンバンジー", "春雨スープ", "ごはん"], temp: ["hot"], rainOk: true, effort: 2, stamina: 1, spicy: false, allergens: [], ingredients: ["鶏むね肉","きゅうり","トマト","ごまだれ","米"] },
  { id: 70, name: "焼き餃子", items: ["焼き餃子(たっぷり)", "中華スープ", "ごはん"], temp: ["mild","hot"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: ["小麦"], ingredients: ["豚ひき肉","キャベツ","にら","餃子の皮","にんにく","米"] },
  { id: 71, name: "水餃子", items: ["水餃子", "青菜炒め", "ごはん"], temp: ["cold","mild"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: ["小麦"], ingredients: ["豚ひき肉","白菜","にら","餃子の皮","チンゲン菜","米"] },
  { id: 72, name: "春巻き", items: ["春巻き", "中華スープ", "ごはん"], temp: ["mild"], rainOk: false, effort: 3, stamina: 2, spicy: false, allergens: ["小麦","えび"], ingredients: ["豚肉","たけのこ","春雨","春巻きの皮","えび","米"] },
  { id: 73, name: "焼売", items: ["肉焼売", "中華スープ", "ごはん"], temp: ["mild","cold"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: ["小麦"], ingredients: ["豚ひき肉","玉ねぎ","焼売の皮","グリンピース","米"] },
  { id: 74, name: "チャーハン", items: ["五目チャーハン", "わかめスープ", "焼き餃子"], temp: ["mild","hot"], rainOk: true, effort: 1, stamina: 2, spicy: false, allergens: ["卵","小麦"], ingredients: ["卵","焼豚","長ねぎ","にんじん","餃子","米"] },
  { id: 75, name: "あんかけ焼きそば", items: ["五目あんかけ焼きそば", "中華スープ", "ザーサイ"], temp: ["mild","cold"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: ["小麦","えび"], ingredients: ["中華麺","豚肉","白菜","えび","うずら卵","にんじん"] },

  // ── 韓国・エスニック ─────────────────────────────────
  { id: 76, name: "ビビンバ", items: ["ビビンバ", "わかめスープ", "キムチ"], temp: ["mild","hot"], rainOk: true, effort: 2, stamina: 3, spicy: true, allergens: ["卵"], ingredients: ["牛ひき肉","ほうれん草","もやし","にんじん","卵","コチュジャン","米"] },
  { id: 77, name: "プルコギ", items: ["プルコギ", "チヂミ", "わかめスープ"], temp: ["mild","hot"], rainOk: true, effort: 2, stamina: 3, spicy: false, allergens: ["小麦","大豆"], ingredients: ["牛薄切り肉","玉ねぎ","にんじん","にら","焼肉のたれ","米"] },
  { id: 78, name: "チーズタッカルビ", items: ["チーズタッカルビ", "サンチュ", "ごはん"], temp: ["mild"], rainOk: true, effort: 2, stamina: 3, spicy: true, allergens: ["乳"], ingredients: ["鶏もも肉","キャベツ","さつまいも","チーズ","コチュジャン","米"] },
  { id: 79, name: "サムギョプサル", items: ["サムギョプサル", "サンチュ・キムチ", "わかめスープ"], temp: ["mild","hot"], rainOk: true, effort: 2, stamina: 3, spicy: false, allergens: [], ingredients: ["豚バラ肉","サンチュ","にんにく","キムチ","ごま油","米"] },
  { id: 80, name: "チヂミ", items: ["海鮮チヂミ", "わかめスープ", "ナムル"], temp: ["mild","cold"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: ["小麦","卵","えび"], ingredients: ["にら","えび","いか","小麦粉","卵","もやし"] },
  { id: 81, name: "スンドゥブチゲ", items: ["スンドゥブチゲ", "ナムル", "ごはん"], temp: ["cold"], rainOk: true, effort: 2, stamina: 2, spicy: true, allergens: ["大豆","卵"], ingredients: ["おぼろ豆腐","あさり","豚肉","卵","キムチ","米"] },
  { id: 82, name: "キムチ鍋", items: ["豚キムチ鍋", "〆ラーメン", "ナムル"], temp: ["cold"], rainOk: true, effort: 2, stamina: 3, spicy: true, allergens: ["大豆","小麦"], ingredients: ["豚バラ肉","白菜キムチ","豆腐","にら","中華麺","米"] },
  { id: 83, name: "スタミナ豚キムチ", items: ["豚キムチ炒め", "わかめスープ", "ごはん"], temp: ["hot","mild"], rainOk: true, effort: 1, stamina: 3, spicy: true, allergens: ["大豆"], ingredients: ["豚バラ肉","白菜キムチ","にら","もやし","ごま油","米"] },
  { id: 84, name: "ガパオライス", items: ["ガパオライス(目玉焼きのせ)", "春雨スープ", "きゅうりサラダ"], temp: ["hot"], rainOk: true, effort: 2, stamina: 2, spicy: true, allergens: ["卵"], ingredients: ["鶏ひき肉","パプリカ","玉ねぎ","バジル","卵","米","ナンプラー"] },
  { id: 85, name: "タコライス", items: ["タコライス", "コーンスープ", "サラダ"], temp: ["hot"], rainOk: true, effort: 1, stamina: 2, spicy: false, allergens: ["乳"], ingredients: ["合いびき肉","レタス","トマト","チーズ","タコスミックス","米"] },
  { id: 86, name: "ロコモコ", items: ["ロコモコ", "コンソメスープ", "サラダ"], temp: ["hot","mild"], rainOk: true, effort: 2, stamina: 3, spicy: false, allergens: ["卵","小麦"], ingredients: ["合いびき肉","玉ねぎ","卵","グレイビー","レタス","米"] },
  { id: 87, name: "ゴーヤチャンプルー", items: ["ゴーヤチャンプルー", "もずく酢", "ごはん・味噌汁"], temp: ["hot"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: ["卵","大豆"], ingredients: ["ゴーヤ","豚肉","木綿豆腐","卵","かつお節","米"] },

  // ── 鍋・煮込み（寒い日） ─────────────────────────────
  { id: 88, name: "鶏の寄せ鍋", items: ["鶏もも肉の寄せ鍋", "白菜・きのこ・豆腐", "〆のうどん or 雑炊"], temp: ["cold"], rainOk: true, effort: 1, stamina: 2, spicy: false, allergens: ["小麦","大豆"], ingredients: ["鶏もも肉","白菜","しめじ","豆腐","長ねぎ","うどん","だし"] },
  { id: 89, name: "水炊き", items: ["博多水炊き", "ポン酢・薬味", "〆の雑炊"], temp: ["cold"], rainOk: true, effort: 1, stamina: 2, spicy: false, allergens: [], ingredients: ["鶏もも肉","白菜","春菊","えのき","ポン酢","米"] },
  { id: 90, name: "もつ鍋", items: ["もつ鍋(味噌 or 醤油)", "にら・キャベツ", "〆の中華麺"], temp: ["cold"], rainOk: true, effort: 2, stamina: 3, spicy: false, allergens: ["大豆","小麦"], ingredients: ["牛もつ","キャベツ","にら","にんにく","中華麺","味噌"] },
  { id: 91, name: "豆乳鍋", items: ["豆乳鍋", "白菜・きのこ・鶏だんご", "〆のうどん"], temp: ["cold"], rainOk: true, effort: 1, stamina: 2, spicy: false, allergens: ["大豆","小麦"], ingredients: ["豆乳","鶏だんご","白菜","しめじ","豆腐","うどん"] },
  { id: 92, name: "常夜鍋", items: ["豚と青菜の常夜鍋", "ポン酢", "〆のうどん"], temp: ["cold"], rainOk: true, effort: 1, stamina: 2, spicy: false, allergens: ["小麦"], ingredients: ["豚薄切り肉","ほうれん草","春菊","昆布だし","ポン酢","うどん"] },
  { id: 93, name: "鶏団子鍋", items: ["鶏団子鍋", "白菜・きのこ", "〆の雑炊"], temp: ["cold"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: [], ingredients: ["鶏ひき肉","長ねぎ","白菜","えのき","春菊","米"] },
  { id: 94, name: "石狩鍋", items: ["鮭の石狩鍋", "野菜たっぷり", "〆のうどん"], temp: ["cold"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: ["小麦"], ingredients: ["生鮭","白菜","じゃがいも","にんじん","味噌","うどん"] },
  { id: 95, name: "しゃぶしゃぶ", items: ["豚しゃぶしゃぶ", "ごまだれ・ポン酢", "〆のうどん"], temp: ["cold"], rainOk: true, effort: 2, stamina: 3, spicy: false, allergens: ["小麦"], ingredients: ["豚しゃぶ肉","白菜","春菊","えのき","ごまだれ","うどん"] },
  { id: 96, name: "すき焼き", items: ["牛すき焼き", "溶き卵", "ごはん"], temp: ["cold"], rainOk: true, effort: 2, stamina: 3, spicy: false, allergens: ["卵","小麦"], ingredients: ["牛薄切り肉","白菜","長ねぎ","焼き豆腐","しらたき","春菊","卵","割り下"] },
  { id: 97, name: "ぶりしゃぶ", items: ["ぶりしゃぶ", "水菜・ねぎ", "〆の雑炊"], temp: ["cold"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: [], ingredients: ["ぶり","水菜","長ねぎ","昆布だし","ポン酢","米"] },
  { id: 98, name: "おでん", items: ["おでん盛り合わせ", "からし", "ごはん"], temp: ["cold"], rainOk: true, effort: 2, stamina: 1, spicy: false, allergens: ["小麦","卵"], ingredients: ["大根","卵","ちくわ","こんにゃく","はんぺん","がんもどき","おでんの素"] },
  { id: 99, name: "湯豆腐", items: ["湯豆腐", "薬味・ポン酢", "だし巻き卵・ごはん"], temp: ["cold"], rainOk: true, effort: 1, stamina: 1, spicy: false, allergens: ["大豆","卵"], ingredients: ["豆腐","昆布","長ねぎ","卵","ポン酢","米"] },
  { id: 100, name: "カレー鍋", items: ["カレー鍋", "肉・野菜たっぷり", "〆のごはん or 中華麺"], temp: ["cold"], rainOk: true, effort: 2, stamina: 3, spicy: false, allergens: ["小麦"], ingredients: ["豚肉","白菜","にんじん","きのこ","カレー鍋の素","米"] },
  { id: 101, name: "トマト鍋", items: ["トマト鍋", "ソーセージ・野菜", "〆のリゾット"], temp: ["cold"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: ["乳"], ingredients: ["ソーセージ","キャベツ","トマト缶","じゃがいも","チーズ","米"] },
  { id: 102, name: "けんちんうどん", items: ["けんちんうどん", "ちくわ天", "おにぎり"], temp: ["cold"], rainOk: true, effort: 1, stamina: 1, spicy: false, allergens: ["小麦"], ingredients: ["うどん","大根","にんじん","ごぼう","里芋","豆腐","長ねぎ"] },
  { id: 103, name: "クリームシチュー", items: ["チキンクリームシチュー", "ごはん or バゲット", "ブロッコリー"], temp: ["cold"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: ["小麦","乳"], ingredients: ["鶏もも肉","じゃがいも","にんじん","玉ねぎ","ブロッコリー","牛乳","シチュールウ"] },
  { id: 104, name: "ビーフシチュー", items: ["ビーフシチュー", "バターロール", "グリーンサラダ"], temp: ["cold"], rainOk: true, effort: 3, stamina: 3, spicy: false, allergens: ["小麦","乳"], ingredients: ["牛肉(角切り)","じゃがいも","にんじん","玉ねぎ","デミグラスルウ","バターロール"] },
  { id: 105, name: "ポークビーンズ", items: ["ポークビーンズ", "厚切りトースト", "サラダ"], temp: ["cold","mild"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: ["大豆","小麦"], ingredients: ["豚こま肉","大豆水煮","トマト缶","玉ねぎ","にんじん","食パン"] },

  // ── パスタ・麺（洋・中） ─────────────────────────────
  { id: 106, name: "ミートソースパスタ", items: ["ミートソースパスタ", "ガーリックトースト", "サラダ"], temp: ["mild"], rainOk: true, effort: 2, stamina: 3, spicy: false, allergens: ["小麦"], ingredients: ["合いびき肉","玉ねぎ","にんじん","トマト缶","スパゲッティ","バゲット"] },
  { id: 107, name: "カルボナーラ", items: ["カルボナーラ", "コンソメスープ", "サラダ"], temp: ["mild"], rainOk: true, effort: 2, stamina: 3, spicy: false, allergens: ["小麦","卵","乳"], ingredients: ["ベーコン","卵","粉チーズ","生クリーム","スパゲッティ","黒こしょう"] },
  { id: 108, name: "ペペロンチーノ", items: ["ペペロンチーノ", "コンソメスープ", "サラダ"], temp: ["mild","hot"], rainOk: true, effort: 1, stamina: 1, spicy: true, allergens: ["小麦"], ingredients: ["スパゲッティ","にんにく","唐辛子","オリーブオイル","パセリ"] },
  { id: 109, name: "ナポリタン", items: ["ナポリタン", "コンソメスープ", "サラダ"], temp: ["mild"], rainOk: true, effort: 1, stamina: 2, spicy: false, allergens: ["小麦"], ingredients: ["ウインナー","玉ねぎ","ピーマン","ケチャップ","スパゲッティ"] },
  { id: 110, name: "ボンゴレビアンコ", items: ["ボンゴレビアンコ", "バゲット", "サラダ"], temp: ["mild"], rainOk: true, effort: 2, stamina: 1, spicy: false, allergens: ["小麦"], ingredients: ["あさり","にんにく","白ワイン","スパゲッティ","パセリ"] },
  { id: 111, name: "たらこパスタ", items: ["たらこパスタ", "コンソメスープ", "サラダ"], temp: ["mild"], rainOk: true, effort: 1, stamina: 1, spicy: false, allergens: ["小麦","乳"], ingredients: ["たらこ","バター","スパゲッティ","刻みのり","大葉"] },
  { id: 112, name: "きのこの和風パスタ", items: ["きのこの和風パスタ", "コンソメスープ", "サラダ"], temp: ["mild","cold"], rainOk: true, effort: 1, stamina: 1, spicy: false, allergens: ["小麦"], ingredients: ["しめじ","えのき","ベーコン","しょうゆ","スパゲッティ","刻みのり"] },
  { id: 113, name: "トマトクリームパスタ", items: ["海老のトマトクリームパスタ", "コンソメスープ", "サラダ"], temp: ["mild","cold"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: ["小麦","乳","えび"], ingredients: ["えび","トマト缶","生クリーム","玉ねぎ","スパゲッティ"] },
  { id: 114, name: "ジェノベーゼ", items: ["ジェノベーゼパスタ", "コンソメスープ", "サラダ"], temp: ["hot","mild"], rainOk: true, effort: 1, stamina: 1, spicy: false, allergens: ["小麦","乳"], ingredients: ["バジルソース","じゃがいも","スパゲッティ","粉チーズ","にんにく"] },
  { id: 115, name: "冷製トマトパスタ", items: ["冷製トマトパスタ", "コーンスープ", "サラダ"], temp: ["hot"], rainOk: true, effort: 1, stamina: 1, spicy: false, allergens: ["小麦"], ingredients: ["トマト","にんにく","オリーブオイル","バジル","スパゲッティ"] },
  { id: 116, name: "味噌ラーメンと餃子", q: "味噌ラーメン", items: ["味噌ラーメン", "焼き餃子", "メンマ"], temp: ["cold"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: ["小麦"], ingredients: ["中華麺","もやし","コーン","豚ひき肉","餃子","味噌だれ"] },
  { id: 117, name: "醤油ラーメン", items: ["醤油ラーメン", "チャーシュー", "煮卵"], temp: ["cold"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: ["小麦","卵"], ingredients: ["中華麺","チャーシュー","メンマ","煮卵","長ねぎ","醤油だれ"] },
  { id: 118, name: "タンメン", items: ["タンメン", "焼売", "ザーサイ"], temp: ["cold","mild"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: ["小麦"], ingredients: ["中華麺","キャベツ","もやし","豚肉","にんじん","焼売"] },
  { id: 119, name: "ちゃんぽん", items: ["長崎ちゃんぽん", "餃子", "ザーサイ"], temp: ["cold"], rainOk: true, effort: 2, stamina: 3, spicy: false, allergens: ["小麦","えび"], ingredients: ["ちゃんぽん麺","豚肉","えび","キャベツ","もやし","かまぼこ"] },
  { id: 120, name: "担々麺", items: ["担々麺", "ザーサイ", "ミニチャーハン"], temp: ["cold","mild"], rainOk: true, effort: 2, stamina: 2, spicy: true, allergens: ["小麦","大豆"], ingredients: ["中華麺","豚ひき肉","チンゲン菜","練りごま","豆板醤","米"] },
  { id: 121, name: "焼きそば", items: ["ソース焼きそば", "わかめスープ", "冷奴"], temp: ["mild","hot"], rainOk: true, effort: 1, stamina: 2, spicy: false, allergens: ["小麦","大豆"], ingredients: ["焼きそば麺","豚こま肉","キャベツ","もやし","にんじん","青のり"] },

  // ── 丼もの ───────────────────────────────────────────
  { id: 122, name: "牛丼", items: ["牛丼", "味噌汁", "冷奴"], temp: ["mild","hot"], rainOk: true, effort: 1, stamina: 2, spicy: false, allergens: ["大豆"], ingredients: ["牛薄切り肉","玉ねぎ","紅生姜","豆腐","米","めんつゆ"] },
  { id: 123, name: "豚丼", items: ["帯広風豚丼", "味噌汁", "浅漬け"], temp: ["mild","hot"], rainOk: true, effort: 1, stamina: 3, spicy: false, allergens: [], ingredients: ["豚ロース","玉ねぎ","しょうゆ","みりん","米","刻みねぎ"] },
  { id: 124, name: "親子丼", items: ["親子丼", "味噌汁", "浅漬け"], temp: ["mild","cold"], rainOk: true, effort: 1, stamina: 2, spicy: false, allergens: ["卵"], ingredients: ["鶏もも肉","卵","玉ねぎ","三つ葉","米","めんつゆ"] },
  { id: 125, name: "カツ丼", items: ["カツ丼", "味噌汁", "漬物"], temp: ["mild","cold"], rainOk: true, effort: 3, stamina: 3, spicy: false, allergens: ["卵","小麦"], ingredients: ["豚ロース","卵","玉ねぎ","パン粉","三つ葉","米"] },
  { id: 126, name: "天丼", items: ["天丼", "味噌汁", "小鉢"], temp: ["mild"], rainOk: false, effort: 3, stamina: 2, spicy: false, allergens: ["小麦","えび"], ingredients: ["えび","なす","かぼちゃ","ちくわ","天ぷら粉","米","天つゆ"] },
  { id: 127, name: "うな丼", items: ["うな丼", "肝吸い", "きゅうりの酢の物"], temp: ["hot","mild"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: [], ingredients: ["うなぎ蒲焼","山椒","きゅうり","三つ葉","米"] },
  { id: 128, name: "海鮮丼", items: ["海鮮丼", "お吸い物", "だし巻き卵"], temp: ["hot","mild"], rainOk: true, effort: 1, stamina: 1, spicy: false, allergens: ["卵"], ingredients: ["刺身盛り合わせ","大葉","卵","わさび","米","寿司酢"] },
  { id: 129, name: "ねぎとろ丼", items: ["ねぎとろ丼", "味噌汁", "冷奴"], temp: ["hot","mild"], rainOk: true, effort: 1, stamina: 1, spicy: false, allergens: ["大豆"], ingredients: ["まぐろたたき","刻みねぎ","刻みのり","豆腐","米"] },
  { id: 130, name: "まぐろの漬け丼", items: ["まぐろの漬け丼", "お吸い物", "小鉢"], temp: ["hot","mild"], rainOk: true, effort: 1, stamina: 1, spicy: false, allergens: ["大豆"], ingredients: ["まぐろ","しょうゆ","みりん","大葉","刻みのり","米"] },
  { id: 131, name: "サーモンアボカド丼", items: ["サーモンアボカド丼", "コーンスープ", "サラダ"], temp: ["hot","mild"], rainOk: true, effort: 1, stamina: 1, spicy: false, allergens: [], ingredients: ["サーモン","アボカド","刻みのり","わさび醤油","米"] },
  { id: 132, name: "ローストビーフ丼", items: ["ローストビーフ丼", "コンソメスープ", "サラダ"], temp: ["hot","mild"], rainOk: true, effort: 2, stamina: 3, spicy: false, allergens: ["卵"], ingredients: ["ローストビーフ","温玉","玉ねぎ","ソース","米"] },
  { id: 133, name: "スタミナ丼", items: ["ねぎ塩豚カルビ丼", "わかめスープ", "冷奴"], temp: ["hot","mild"], rainOk: true, effort: 1, stamina: 3, spicy: false, allergens: ["大豆"], ingredients: ["豚バラ肉","長ねぎ","レモン","豆腐","米","ごま油"] },
  { id: 134, name: "焼き鳥丼", items: ["焼き鳥丼", "味噌汁", "浅漬け"], temp: ["mild","hot"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: [], ingredients: ["鶏もも肉","長ねぎ","たれ","刻みのり","米"] },
  { id: 135, name: "三色そぼろ丼", items: ["三色そぼろ丼", "味噌汁", "浅漬け"], temp: ["mild","hot"], rainOk: true, effort: 1, stamina: 2, spicy: false, allergens: ["卵"], ingredients: ["鶏ひき肉","卵","いんげん","しょうゆ","米"] },

  // ── 夏の冷たい麺・さっぱり ───────────────────────────
  { id: 136, name: "冷やし中華", items: ["冷やし中華(具だくさん)", "餃子", "わかめスープ"], temp: ["hot"], rainOk: false, effort: 2, stamina: 2, spicy: false, allergens: ["小麦","卵"], ingredients: ["中華麺","きゅうり","ハム","卵","トマト","冷やし中華のたれ"] },
  { id: 137, name: "そうめんと天ぷら", q: "そうめん", items: ["薬味そうめん", "野菜と海老の天ぷら", "枝豆"], temp: ["hot"], rainOk: false, effort: 2, stamina: 1, spicy: false, allergens: ["小麦","えび"], ingredients: ["そうめん","えび","なす","かぼちゃ","みょうが","めんつゆ","枝豆"] },
  { id: 138, name: "ざるそば", items: ["ざるそば", "天ぷら", "だし巻き卵"], temp: ["hot"], rainOk: false, effort: 2, stamina: 1, spicy: false, allergens: ["そば","小麦","えび","卵"], ingredients: ["そば","えび","なす","卵","めんつゆ","薬味ねぎ"] },
  { id: 139, name: "ぶっかけうどん", items: ["冷やしぶっかけうどん", "天かす・薬味", "だし巻き卵"], temp: ["hot"], rainOk: false, effort: 1, stamina: 1, spicy: false, allergens: ["小麦","卵"], ingredients: ["うどん","めんつゆ","天かす","大根おろし","卵","刻みねぎ"] },
  { id: 140, name: "サラダうどん", items: ["冷やしサラダうどん", "ツナと野菜", "冷奴"], temp: ["hot"], rainOk: false, effort: 1, stamina: 1, spicy: false, allergens: ["小麦","大豆"], ingredients: ["うどん","ツナ","レタス","トマト","豆腐","めんつゆ"] },
  { id: 141, name: "冷やし担々麺", items: ["冷やし担々麺", "ザーサイ", "ミニチャーハン"], temp: ["hot"], rainOk: false, effort: 2, stamina: 2, spicy: true, allergens: ["小麦","大豆"], ingredients: ["中華麺","豚ひき肉","きゅうり","練りごま","ラー油","米"] },
  { id: 142, name: "ざるうどんと唐揚げ", q: "ざるうどん", items: ["ざるうどん", "鶏の唐揚げ", "冷やしトマト"], temp: ["hot"], rainOk: false, effort: 2, stamina: 3, spicy: false, allergens: ["小麦"], ingredients: ["うどん","鶏もも肉","片栗粉","トマト","めんつゆ","薬味ねぎ"] },
  { id: 143, name: "冷しゃぶサラダ", items: ["豚冷しゃぶサラダ", "冷奴", "ごはん・味噌汁"], temp: ["hot"], rainOk: false, effort: 1, stamina: 2, spicy: false, allergens: ["大豆"], ingredients: ["豚しゃぶ肉","レタス","きゅうり","トマト","豆腐","ごまだれ","米"] },
  { id: 144, name: "蒸し鶏の香味だれ", items: ["蒸し鶏の香味だれ", "春雨サラダ", "ごはん・スープ"], temp: ["hot","mild"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: [], ingredients: ["鶏むね肉","長ねぎ","しょうが","きゅうり","春雨","米"] },
  { id: 145, name: "なす味噌炒め", items: ["なすと豚の味噌炒め", "冷奴", "ごはん・味噌汁"], temp: ["mild","hot"], rainOk: true, effort: 1, stamina: 2, spicy: false, allergens: ["大豆"], ingredients: ["なす","豚こま肉","ピーマン","味噌","豆腐","米"] },
  { id: 146, name: "冷やしトマトと餃子", q: "餃子", items: ["焼き餃子", "冷やしトマト", "わかめスープ"], temp: ["hot"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: ["小麦"], ingredients: ["豚ひき肉","キャベツ","にら","餃子の皮","トマト","米"] },

  // ── 寿司・イベント・粉物 ─────────────────────────────
  { id: 147, name: "手巻き寿司", items: ["手巻き寿司", "茶碗蒸し", "お吸い物"], temp: ["hot","mild"], rainOk: true, effort: 2, stamina: 1, spicy: false, allergens: ["卵"], ingredients: ["刺身盛り合わせ","きゅうり","納豆","卵","焼きのり","米","寿司酢"] },
  { id: 148, name: "ちらし寿司", items: ["ちらし寿司", "お吸い物", "だし巻き卵"], temp: ["hot","mild"], rainOk: true, effort: 2, stamina: 1, spicy: false, allergens: ["卵","えび"], ingredients: ["刺身","えび","れんこん","絹さや","卵","米","寿司酢"] },
  { id: 149, name: "いなり寿司と天ぷら", q: "いなり寿司", items: ["いなり寿司", "野菜天ぷら", "お吸い物"], temp: ["mild","hot"], rainOk: false, effort: 2, stamina: 1, spicy: false, allergens: ["大豆","小麦"], ingredients: ["油揚げ","米","かぼちゃ","なす","ちくわ","天ぷら粉"] },
  { id: 150, name: "おうちたこ焼き", items: ["たこ焼き", "焼きそば", "枝豆"], temp: ["hot","mild"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: ["小麦","卵"], ingredients: ["たこ","たこ焼き粉","卵","キャベツ","青ねぎ","焼きそば麺","枝豆"] },
  { id: 151, name: "お好み焼き", items: ["豚玉お好み焼き", "焼きそば", "わかめスープ"], temp: ["mild","cold"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: ["小麦","卵","えび"], ingredients: ["豚バラ肉","キャベツ","お好み焼き粉","卵","天かす","青のり"] },
  { id: 152, name: "もんじゃ焼き", items: ["もんじゃ焼き", "焼きそば", "枝豆"], temp: ["mild"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: ["小麦","えび"], ingredients: ["キャベツ","豚肉","切りいか","もんじゃ粉","天かす","ソース"] },
  { id: 153, name: "おうち焼肉", items: ["焼肉盛り合わせ", "サンチュ・キムチ", "わかめスープ・ごはん"], temp: ["mild","hot"], rainOk: true, effort: 2, stamina: 3, spicy: false, allergens: ["大豆"], ingredients: ["牛カルビ","豚ロース","サンチュ","キムチ","焼肉のたれ","米"] },
  { id: 154, name: "おうちピザ", items: ["マルゲリータ", "ミネストローネ", "サラダ"], temp: ["mild","cold"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: ["小麦","乳"], ingredients: ["ピザ生地","トマトソース","モッツァレラ","バジル","ベーコン"] },
  { id: 155, name: "チーズフォンデュ", items: ["チーズフォンデュ", "バゲット・温野菜", "コンソメスープ"], temp: ["cold"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: ["乳","小麦"], ingredients: ["チーズ","バゲット","ブロッコリー","じゃがいも","ソーセージ","白ワイン"] },
  { id: 156, name: "BBQ風グリルプレート", items: ["グリルチキン・ソーセージ", "グリル野菜", "ガーリックライス"], temp: ["hot","mild"], rainOk: false, effort: 2, stamina: 3, spicy: false, allergens: [], ingredients: ["鶏もも肉","ソーセージ","パプリカ","ズッキーニ","にんにく","米"] },

  // ── その他ごはんもの ─────────────────────────────────
  { id: 157, name: "とうもろこしごはんと焼き魚", q: "とうもろこしごはん", items: ["とうもろこしごはん", "鮭の塩焼き", "味噌汁"], temp: ["hot","mild"], rainOk: true, effort: 2, stamina: 1, spicy: false, allergens: [], ingredients: ["とうもろこし","米","生鮭","小松菜","味噌"] },
  { id: 158, name: "炊き込みごはんと唐揚げ", q: "炊き込みごはん", items: ["きのこ炊き込みごはん", "鶏の唐揚げ", "味噌汁"], temp: ["mild","cold"], rainOk: false, effort: 2, stamina: 3, spicy: false, allergens: ["小麦"], ingredients: ["米","しめじ","にんじん","鶏もも肉","片栗粉","油揚げ"] },
  { id: 159, name: "ビビンバ丼(そぼろ)", items: ["ビビンバ丼", "わかめスープ", "キムチ"], temp: ["hot","mild"], rainOk: true, effort: 1, stamina: 3, spicy: true, allergens: ["卵","大豆"], ingredients: ["牛ひき肉","もやし","ほうれん草","にんじん","卵","コチュジャン","米"] },
  { id: 160, name: "オムハヤシ", items: ["オムハヤシ", "コンソメスープ", "サラダ"], temp: ["cold","mild"], rainOk: true, effort: 2, stamina: 2, spicy: false, allergens: ["卵","小麦"], ingredients: ["卵","牛薄切り肉","玉ねぎ","ハヤシルウ","米"] },
];

// UMD 風エクスポート（モジュール未使用でも window から参照可能）
if (typeof module !== "undefined" && module.exports) { module.exports = { MENUS }; }
