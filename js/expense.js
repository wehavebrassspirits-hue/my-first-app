/* カード明細 支出分析 — 完全クライアントサイド（データは端末外に送信しません） */
(() => {
  'use strict';

  // ---- カテゴリ定義 -------------------------------------------------------
  // 加盟店名に含まれるキーワード → カテゴリ。上から順にマッチ。
  const CATEGORIES = [
    '食費', '外食・カフェ', '交通', 'ショッピング', '娯楽・サブスク',
    '通信', '光熱・水道', '医療・薬', '教育', '公共・保険', '投資・積立', 'その他'
  ];

  // キーワードは小文字・NFKC正規化した店名に対して部分一致で判定される。
  // 上から順にマッチするので、より具体的なカテゴリを上に置く。
  const RULES = [
    ['外食・カフェ', [
      'スターバックス', 'starbucks', 'ドトール', 'タリーズ', 'tully', 'コメダ', 'サンマルク', 'エクセルシオール', 'カフェ', 'cafe', 'coffee', 'コーヒー',
      'マクドナルド', 'mcdonald', 'ﾏｸﾄﾞﾅﾙﾄﾞ', 'モスバーガー', 'mos', 'ロッテリア', 'ケンタッキー', 'kfc', 'バーガー', 'burger', 'フレッシュネス', 'サブウェイ', 'subway',
      'すき家', 'すきや', '吉野家', 'よしのや', '松屋', 'まつや', 'なか卯', 'なかう', '天丼', 'かつや', 'てんや', '牛丼',
      'サイゼ', 'ガスト', 'ジョナサン', 'バーミヤン', 'デニーズ', 'ロイヤルホスト', 'ココス', 'coco', 'びっくりドンキー', 'ステーキ', 'しゃぶ', '焼肉', '牛角',
      'ラーメン', '一蘭', '一風堂', '日高屋', '幸楽苑', 'うどん', 'そば', '丸亀', 'はなまる', '寿司', 'すし', 'スシロー', 'くら寿司', 'かっぱ', 'はま寿司', '回転',
      '居酒屋', '鳥貴族', '和民', 'ワタミ', '魚民', '串', '餃子', 'ピザ', 'pizza', 'ドミノ', 'domino', 'サブスク弁当', '食堂', 'レストラン', 'restaurant', 'dining', 'bar ', 'ビアガーデン', 'スタバ',
      'ミスタードーナツ', 'ミスド', 'クリスピー', 'フードコート', 'uber eats', 'ウーバー', 'uber', '出前館', 'wolt', 'menu ',
      'ベルダ', '食店', '飲食', 'キッチン', 'kitchen', 'ビストロ', 'bistro',
    ]],
    ['食費', [
      'スーパー', 'マート', 'mart', 'イオン', 'aeon', 'ライフ', 'life', 'ヤオコー', 'マルエツ', 'サミット', 'コストコ', 'costco', '業務スーパー', '肉のハナマサ',
      'まいばすけっと', 'seiyu', '西友', 'せいゆう', 'gyomu', 'いなげや', 'オーケー', 'ok store', 'ベルク', 'ヤマナカ', 'アピタ', 'ピアゴ', 'カスミ', 'ヨークベニマル', 'マックスバリュ', 'maxvalu',
      'コンビニ', 'セブンイレブン', 'セブン-', '7-eleven', 'seven', 'ローソン', 'lawson', 'ファミリーマート', 'ファミマ', 'familymart', 'ミニストップ', 'ministop', 'デイリーヤマザキ', 'セイコーマート', 'ニューデイズ', 'newdays', 'ポプラ',
      'ベイシア', 'beisia', 'とりせん', 'カスミ', 'ヨークタウン', 'フレッセイ',
      '自販機', '自動販売', 'ジハンキ', 'ジバンキ', '飲料', 'コカ・コーラ', 'コカコーラ', 'コカ', 'ダイドー', 'ドリンコ', 'ヤクルト',
      'コープ', 'coop', '生協', 'カルディ', 'kaldi', '成城石井', 'やまや', '八百屋', '青果', '精肉', '鮮魚', 'ベーカリー', 'パン屋', 'bakery', '酒', 'リカー', 'liquor', 'オーケーストア',
      'ドンキ', 'ドン.キホーテ', 'ドン・キホーテ', 'ローソンストア100', 'ロピア',
    ]],
    ['交通', [
      'jr', 'メトロ', 'metro', '地下鉄', '鉄道', '電鉄', '交通', '東急', '京王', '小田急', '西武', '東武', '京成', '京急', '相鉄', '阪急', '阪神', '近鉄', '南海', '名鉄', '西鉄',
      'suica', 'ｽｲｶ', 'pasmo', 'ｸｲｯｸ', 'icoca', 'モバイルsuica', 'モバイルpasmo', 'チャージ',
      'ana', 'jal', '航空', 'airlines', 'peach', 'ジェットスター', 'skymark', 'スカイマーク', '空港',
      'タクシー', 'taxi', 'go ', 'ｇｏ', 'didi', 'uber', 'newmo',
      'eneos', 'エネオス', 'ｴﾈｵｽ', '出光', 'idemitsu', 'コスモ石油', 'shell', 'シェル', 'ガソリン', 'apollostation',
      'etc', '高速道路', 'nexco', '首都高', 'タイムズ', 'times', '駐車', 'パーキング', 'parking', 'リパーク', '三井のリパーク', 'akippa', 'レンタカー',
      'バス', ' bus', '高速バス', '電車', '運賃',
      'サービスエリア', 'パーキングエリア', 'pa上り', 'pa下り', '上り線', '下り線',
      'オートアールズ', 'オートバックス', 'autobacs', 'イエローハット', 'カー用品', '車検', 'ガソリンスタンド',
      'イデミツ', 'アポロステーション', 'アポロ', 'jass', 'ja-ss', 'ジャスポート', 'ｼﾞﾔｽﾎﾟ', 'エネオス', 'ｴﾈｵｽ ', 'キグナス', 'ss ',
    ]],
    ['通信', [
      'docomo', 'ドコモ', 'ﾄﾞｺﾓ', 'au', 'kddi', 'softbank', 'ソフトバンク', 'ｿﾌﾄﾊﾞﾝｸ', '楽天モバイル', 'rakuten mobile', 'ahamo', 'povo', 'linemo', 'uqモバイル', 'uq ',
      'ymobile', 'ワイモバイル', 'ﾜｲﾓﾊﾞｲﾙ', 'mineo', 'iijmio', 'iij', 'nuro', 'ocn', 'so-net', 'ビッグローブ', 'biglobe', 'plala', 'ぷらら', 'gmo', 'プロバイダ', '光回線', 'フレッツ', 'flets', '通信',
      'wi-fi', 'wifi', 'ワイモバ',
    ]],
    ['光熱・水道', [
      '電力', '電気代', '東京電力', 'tepco', '関西電力', '中部電力', '中国電力', '九州電力', '東北電力', '北海道電力', '四国電力', '北陸電力', '沖縄電力', 'エネオスでんき', 'looopでんき', 'ハルエネ',
      'ガス', 'gas', '東京ガス', '大阪ガス', '東邦ガス', '西部ガス', 'lpガス', 'プロパン', '水道', '上下水道', '水道局',
    ]],
    ['娯楽・サブスク', [
      'netflix', 'ネットフリックス', 'spotify', 'youtube', 'amazon prime', 'prime video', 'prime*', 'disney', 'ディズニー', 'hulu', 'u-next', 'unext', 'dazn', 'abema', 'ニコニコ',
      'apple.com', 'apple ', 'itunes', 'icloud', 'google play', 'google*', 'google ', 'playstation', 'psn', 'nintendo', '任天堂', 'steam', 'ea ', 'エピック', 'epic',
      'adobe', 'chatgpt', 'openai', 'anthropic', 'claude', 'canva', 'dropbox', 'notion', 'microsoft', 'office365', 'microsoft365', 'ms365',
      '映画', 'cinema', 'toho', 'イオンシネマ', '109シネマ', 'ユナイテッド', 'カラオケ', 'ビッグエコー', 'まねきねこ', 'ゲーム', 'game', 'ジム', 'gym', 'フィットネス', 'エニタイム', 'anytime', 'chocozap', 'ちょこざっぷ', 'ライザップ', 'コナミスポーツ', 'ゴルフ', 'dmm', 'fanza',
      'ユーネクスト', 'アソビュー', 'asoview', 'アソビュ', 'ハイランドパーク', 'ランドパーク', '遊園地', 'テーマパーク', '動物園', '水族館', '博物館', '美術館', '温泉', 'スパ', 'プール', 'キャンプ', 'ボウリング', 'ラウンドワン', 'レジャー', '観光', '入園', '入館',
    ]],
    ['ショッピング', [
      'amazon', 'アマゾン', 'ｱﾏｿﾞﾝ', 'amzn', '楽天市場', 'rakuten', '楽天', 'ﾗｸﾃﾝ', 'yahoo', 'ヤフー', 'paypayモール', 'paypayフリマ', 'メルカリ', 'mercari', 'ラクマ', 'qoo10', 'shein', 'temu', 'aliexpress',
      'zozo', 'ゾゾ', 'ユニクロ', 'uniqlo', 'ｸﾞﾛｰﾊﾞﾙ', 'gu ', 'ジーユー', '無印', 'muji', 'しまむら', 'ワークマン', 'ハニーズ', 'ライトオン', 'アダストリア', 'gap', 'zara', 'h&m', 'ヨドバシ', 'yodobashi', 'ビックカメラ', 'ヤマダ', 'yamada', 'ケーズ', 'エディオン', 'ジョーシン', 'ノジマ',
      'ニトリ', 'nitori', 'ikea', 'イケア', '無印良品', 'カインズ', 'コーナン', 'ビバホーム', 'ホームセンター', 'dcm', 'ダイソー', 'daiso', 'セリア', 'seria', 'キャンドゥ', '3コインズ', '100円', 'apple store', '書店', '書店', 'ヴィレッジ', '雑貨', 'ロフト', 'loft', 'ハンズ', '東急ハンズ', 'plaza', 'フランフラン', 'コスメ', 'アットコスメ', '化粧品', 'ハンドメイド', 'minne', 'creema',
      'ヨドバシ.com', 'raku', '花', 'flower', 'ペット', 'petco', 'ペットショップ',
      'コジマ', 'kojima', 'トイザ', 'ベビーザ', 'ザらス', 'toysrus', 'アカチャンホンポ', '赤ちゃん本舗', '西松屋', 'ベビー用品',
    ]],
    ['医療・薬', [
      '病院', 'クリニック', '医院', '歯科', 'デンタル', '内科', '外科', '皮膚科', '眼科', '耳鼻', '整形', '接骨', '整骨', '鍼', 'クリニ',
      '薬局', 'ﾔﾂｷﾖｸ', 'ドラッグ', 'drug', 'マツモトキヨシ', 'マツキヨ', 'ウエルシア', 'welcia', 'サンドラッグ', 'ツルハ', 'tsuruha', 'ココカラ', 'スギ薬局', 'スギヤッキョク', 'クリエイト', 'トモズ', 'かんぽ薬', 'コスモス', 'ウォンツ',
      'クスリ', 'くすり', 'クスリのアオキ', 'カワチ', 'セイムス', 'ダイコク', 'キリン堂', 'クオール', 'アイン薬', '調剤',
    ]],
    ['教育', ['学校', '大学', '塾', 'ゼミ', '予備校', 'スクール', 'school', '英会話', '英語', 'レッスン', '教室', '書籍', 'benesse', 'ベネッセ', '進研', 'udemy', 'kindle', '参考書', 'z会', 'スタディ', 'study', '保育', '幼稚園', '習い事']],
    ['公共・保険', ['保険', '生命', '損保', 'ほけん', '税', '年金', '区役所', '市役所', '町役場', '市民課', '証明書', '発行センター', '県税', '都税', '市税', 'nhk', '受信料', '振込', 'atm', '手数料', '会費', '年会費', 'ふるさと納税', 'ふるさとチョイス', 'さとふる', '楽天ふるさと']],
    ['投資・積立', ['証券', 'sbi証券', '楽天証券', 'マネックス', '松井証券', 'auカブコム', '投信', '投資信託', '積立', 'つみたて', 'nisa', 'ニーサ', 'ideco', 'イデコ', '純金', '金積立', 'ビットコイン', '暗号資産', 'コインチェック', 'bitflyer', 'ｆｘ']],
  ];

  const CAT_COLORS = {
    '食費': '#4caf50', '外食・カフェ': '#ff9800', '交通': '#2196f3',
    'ショッピング': '#e91e63', '娯楽・サブスク': '#9c27b0', '通信': '#00bcd4',
    '光熱・水道': '#ff5722', '医療・薬': '#f44336', '教育': '#795548',
    '公共・保険': '#607d8b', '投資・積立': '#3f51b5', 'その他': '#9e9e9e'
  };

  const OVERRIDES_KEY = 'expense.categoryOverrides.v1';
  const TX_KEY = 'expense.transactions.v1';

  // ---- 状態 ---------------------------------------------------------------
  let rawRows = [];      // CSV全行（配列の配列）
  let transactions = []; // {date, desc, amount, category, key, source}
  let overrides = loadOverrides();
  let lastSource = '';   // 単一ファイル/貼り付け時のカード名（＝ファイル名等）
  let lastMonth = '';    // 単一ファイル時のファイル名から推定した年月（日付が読めない時の補完）
  let catSelected = '';  // カテゴリ別バーで選択中のカテゴリ
  let monthSelected = ''; // 月別バーで選択中の月

  // ---- DOM ----------------------------------------------------------------
  const $ = (id) => document.getElementById(id);
  const drop = $('drop');
  const fileInput = $('file');

  // ---- ユーティリティ -----------------------------------------------------
  function loadOverrides() {
    try { return JSON.parse(localStorage.getItem(OVERRIDES_KEY)) || {}; }
    catch { return {}; }
  }
  function saveOverrides() {
    try { localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides)); } catch {}
  }
  // 読み込んだ明細を端末内に保存／復元／消去（外部送信なし）
  function saveTransactions() {
    try { localStorage.setItem(TX_KEY, JSON.stringify(transactions)); } catch {}
  }
  function loadSavedTransactions() {
    try {
      const a = JSON.parse(localStorage.getItem(TX_KEY));
      return Array.isArray(a) ? a : null;
    } catch { return null; }
  }
  function clearSavedData() {
    try { localStorage.removeItem(TX_KEY); } catch {}
  }
  function status(msg, type = '') {
    const el = $('status');
    el.textContent = msg || '';
    el.className = 'status' + (type ? ' ' + type : '');
  }
  function yen(n) {
    return '¥' + Math.round(n).toLocaleString('ja-JP');
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // 文字コード自動判定：UTF-8 と Shift_JIS で復号し、化け（置換文字）が少ない方を採用
  function decodeBuffer(buf) {
    const bytes = new Uint8Array(buf);
    const tryDecode = (enc) => {
      try {
        const text = new TextDecoder(enc, { fatal: false }).decode(bytes);
        const bad = (text.match(/\uFFFD/g) || []).length;
        return { text, bad };
      } catch { return null; }
    };
    const utf8 = tryDecode('utf-8');
    const sjis = tryDecode('shift_jis');
    if (utf8 && sjis) return (sjis.bad < utf8.bad) ? sjis.text : utf8.text;
    return (utf8 || sjis || { text: '' }).text;
  }

  // CSVパーサ（引用符・改行埋め込み対応）
  function parseCSV(text) {
    const rows = [];
    let row = [], field = '', inQuotes = false;
    text = text.replace(/^﻿/, ''); // BOM除去
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else inQuotes = false;
        } else field += c;
      } else {
        if (c === '"') inQuotes = true;
        else if (c === ',') { row.push(field); field = ''; }
        else if (c === '\r') { /* 無視（\r\n対策） */ }
        else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
        else field += c;
      }
    }
    if (field !== '' || row.length) { row.push(field); rows.push(row); }
    // 空行を除去
    return rows.filter(r => r.some(v => v.trim() !== ''));
  }

  function parseAmount(v) {
    if (v == null) return NaN;
    let s = String(v).trim().replace(/[,¥￥円\s]/g, '');
    // 全角マイナスや括弧書きの負数に対応
    s = s.replace(/[△▲]/, '-').replace(/^\((.+)\)$/, '-$1');
    const n = parseFloat(s);
    return isNaN(n) ? NaN : n;
  }

  function looksLikeDate(v) {
    return /\d{4}[\/\-.年]\s*\d{1,2}[\/\-.月]\s*\d{1,2}/.test(String(v)) ||
           /^\d{1,2}[\/\-]\d{1,2}$/.test(String(v).trim());
  }

  function normalizeDate(v) {
    const s = String(v).trim();
    const m = s.match(/(\d{4})[\/\-.年]\s*(\d{1,2})[\/\-.月]\s*(\d{1,2})/);
    if (m) return `${m[1]}-${String(m[2]).padStart(2, '0')}-${String(m[3]).padStart(2, '0')}`;
    return s;
  }

  function monthOf(dateStr) {
    const m = String(dateStr).match(/(\d{4})-(\d{2})/);
    return m ? `${m[1]}-${m[2]}` : '不明';
  }

  // ファイル名から年月（YYYY-MM）を推定（例: 202606.csv → 2026-06）
  function monthFromName(name) {
    const m = String(name || '').match(/(20\d{2})[-_.／/]?(0[1-9]|1[0-2])/);
    return m ? `${m[1]}-${m[2]}` : '';
  }

  // 明細の月キー。保存済みの t.month があればそれを、無ければ日付から判定。
  function monthKey(t) {
    return t.month || monthOf(t.date);
  }

  // 半角カナ→全角、全角英数→半角などを揃える（明細は半角カナが多いため重要）
  function nfkc(s) {
    try { return String(s).normalize('NFKC'); } catch { return String(s); }
  }

  // ゆるい正規化：NFKC＋小文字化に加え、ひらがな→カタカナ、小さいカナ→大きいカナに統一。
  // （半角カナは「ッ/ャ/ュ/ョ」を表せず大カナになるため、両者を揃えて一致させる）
  const SMALL_KANA = { 'ァ':'ア','ィ':'イ','ゥ':'ウ','ェ':'エ','ォ':'オ','ッ':'ツ','ャ':'ヤ','ュ':'ユ','ョ':'ヨ','ヮ':'ワ','ヵ':'カ','ヶ':'ケ' };
  function loose(s) {
    let t = nfkc(s).toLowerCase();
    t = t.replace(/[ぁ-ゖ]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x60)); // ひらがな→カタカナ
    t = t.replace(/[ァィゥェォッャュョヮヵヶ]/g, c => SMALL_KANA[c]);                      // 小→大カナ
    return t;
  }

  function categorize(desc) {
    const key = normalizeKey(desc);
    if (overrides[key]) return overrides[key];
    const hay = loose(desc);
    for (const [cat, keywords] of RULES) {
      if (keywords.some(k => hay.includes(loose(k)))) return cat;
    }
    return 'その他';
  }

  // 店名から分類ルールのキーを作る（正規化のうえ記号・数字・空白をならす）
  function normalizeKey(desc) {
    return nfkc(desc).toLowerCase().replace(/[0-9０-９\s\-*/#().，、。･・]/g, '').slice(0, 24);
  }

  // ---- ファイル読み込み ---------------------------------------------------
  function isPdf(file, buf) {
    if (/\.pdf$/i.test(file.name) || file.type === 'application/pdf') return true;
    // 先頭が "%PDF"
    const head = new Uint8Array(buf.slice(0, 5));
    return head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46;
  }

  function readArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => reject(r.error || new Error('read error'));
      r.readAsArrayBuffer(file);
    });
  }

  // 複数ファイル対応のエントリ。1件ならこれまで通り（CSVは列マッピング画面）、
  // 複数ならすべて解析して合算する。
  async function handleFiles(fileList) {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    if (files.length === 1) { handleFile(files[0]); return; }

    // 複数まとめて解析
    const all = [];
    const skipped = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      status(`解析中… (${i + 1}/${files.length}) ${f.name}`);
      try {
        const buf = await readArrayBuffer(f);
        const label = f.name.replace(/\.[^.]+$/, ''); // 拡張子を除いたファイル名
        const fmonth = monthFromName(f.name);         // ファイル名の年月（日付補完用）
        let tuples = [];
        if (isPdf(f, buf)) {
          const text = await extractPdfText(buf);
          tuples = parseStatementText(text).map(t => ({ ...t, source: label, fmonth }));
        } else {
          const rows = parseCSV(decodeBuffer(buf));
          tuples = csvRowsToTuples(rows, label).map(t => ({ ...t, fmonth }));
        }
        if (tuples.length) all.push(...tuples);
        else skipped.push(f.name);
      } catch (err) {
        skipped.push(f.name + '（読み取り失敗）');
      }
    }

    if (all.length === 0) {
      status('どのファイルからも明細を読み取れませんでした。形式をご確認ください。', 'error');
      return;
    }
    const ok = finalizeTransactions(all);
    if (ok) {
      const note = `${files.length}ファイル中 ${files.length - skipped.length}件を読み込み、明細 ${all.length}件を合算しました。`
        + (skipped.length ? ` 読み取れなかった: ${skipped.join(', ')}` : '');
      status(note, skipped.length ? 'error' : '');
    }
  }

  function handleFile(file) {
    if (!file) return;
    status('読み込み中…');
    lastSource = file.name.replace(/\.[^.]+$/, '');
    lastMonth = monthFromName(file.name);
    readArrayBuffer(file).then(async (buf) => {
      try {
        if (isPdf(file, buf)) {
          status('PDFを解析中…（初回は少し時間がかかります）');
          const text = await extractPdfText(buf);
          if (!text.trim()) {
            status('このPDFから文字を取り出せませんでした（画像として保存されたPDFの可能性）。明細画面をコピーして「テキスト貼り付け」をお試しください。', 'error');
            return;
          }
          setMode('text');
          $('paste-input').value = text;
          analyzeText(text);
          return;
        }
        const text = decodeBuffer(buf);
        rawRows = parseCSV(text);
        if (rawRows.length === 0) { status('データが見つかりませんでした。', 'error'); return; }
        status('');
        showMapping();
      } catch (err) {
        status('読み込みに失敗しました: ' + (err && err.message ? err.message : err), 'error');
      }
    }).catch(() => status('ファイルを読めませんでした。', 'error'));
  }

  // カード区切り行の判定（例: 「氏名 様, 4980-11**-****-****, カード名」）
  function cardHeaderName(r) {
    for (const cell of r) {
      const s = String(cell || '');
      if (/[\d]{3,4}[-\s]?[\d]{0,4}[\*＊]{2,}/.test(s) || /[\*＊]{2,}-[\*＊]{2,}/.test(s)) {
        // マスクされたカード番号を含む行 → カード名（数字・記号を含まないセル）を探す
        const nameCell = r.find(c => /[A-Za-z぀-ヿ一-鿿]/.test(String(c || '')) &&
          !/様|さん/.test(String(c || '')) && !/[\*＊]/.test(String(c || '')));
        return (nameCell && String(nameCell).trim()) || 'カード' + s.replace(/[^0-9]/g, '').slice(0, 4);
      }
    }
    return null;
  }

  // 見出しからカード会社を推定（分かればカード別内訳のラベルに使う）
  function detectIssuer(rows) {
    const head = rows.slice(0, 4).map(r => (r || []).join(',')).join('\n');
    if (/利用店名・商品名/.test(head)) return '楽天カード';
    if (/三井住友|ｖｐａｓｓ|vpass/i.test(head)) return '三井住友カード';
    if (/ＭＵＦＧ|mufg|ニコス|nicos|dcカード/i.test(head)) return 'MUFG/ニコス';
    if (/ｊｃｂ|jcb/i.test(head)) return 'JCB';
    if (/ｉｏｎ|イオンカード|aeon/i.test(head)) return 'イオンカード';
    return '';
  }

  // CSV行を、見出し・列を自動推定して {date,desc,amount,source} に変換（複数ファイル用・非対話）
  // カード区切り行があればカード名を source に付与。無ければ会社推定→引数 source（ファイル名等）。
  function csvRowsToTuples(rows, source) {
    if (!rows || rows.length === 0) return [];
    const g = guessColumns(rows, true);
    if (g.amountCol < 0) return [];
    const out = [];
    let currentCard = detectIssuer(rows) || source || '';
    for (const r of rows) {
      const card = cardHeaderName(r);
      if (card) { currentCard = card; continue; }        // カード区切り行
      const amount = parseAmount(r[g.amountCol]);
      if (isNaN(amount) || amount === 0) continue;         // 金額なし＝見出し/合計行
      const date = (r[g.dateCol] || '').trim();
      if (!date) continue;                                 // 日付なし＝合計行等はスキップ
      out.push({ date, desc: r[g.descCol] || '', amount, source: currentCard || source || '' });
    }
    return out;
  }

  // ---- PDF明細の文字抽出（端末内で処理・外部送信なし） ---------------------
  // pdf.js（同梱・レガシービルド）で文字を抽出し、行を復元してテキストで返す。
  async function extractPdfText(arrayBuffer) {
    // パスは文書のベースURL基準で解決（GitHub Pagesのサブパス配信にも対応）
    const asset = (p) => new URL(p, document.baseURI).href;
    const pdfjs = await import(asset('vendor/pdfjs/pdf.min.mjs'));
    pdfjs.GlobalWorkerOptions.workerSrc = asset('vendor/pdfjs/pdf.worker.min.mjs');
    const doc = await pdfjs.getDocument({
      data: new Uint8Array(arrayBuffer),
      cMapUrl: asset('vendor/pdfjs/cmaps/'),
      cMapPacked: true,
      isEvalSupported: false
    }).promise;

    const lines = [];
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const content = await page.getTextContent();
      // テキスト片をY座標でグループ化し、行として復元（X順に連結）
      const rows = [];
      for (const it of content.items) {
        const s = (it.str || '');
        if (!s.trim()) continue;
        const y = it.transform[5], x = it.transform[4];
        let row = rows.find(r => Math.abs(r.y - y) <= 3);
        if (!row) { row = { y, items: [] }; rows.push(row); }
        row.items.push({ x, s });
      }
      rows.sort((a, b) => b.y - a.y); // 上から下へ
      for (const r of rows) {
        const line = r.items.sort((a, b) => a.x - b.x).map(o => o.s).join(' ').replace(/\s{2,}/g, ' ').trim();
        if (line) lines.push(line);
      }
    }
    return lines.join('\n');
  }

  // ---- 列マッピング画面 ---------------------------------------------------
  function guessColumns(rows, hasHeader) {
    const body = hasHeader ? rows.slice(1) : rows;
    const cols = Math.max(...rows.map(r => r.length));
    const header = hasHeader ? rows[0] : [];
    let dateCol = -1, amountCol = -1, descCol = -1;

    // 見出し名からの推定
    header.forEach((h, i) => {
      const n = String(h);
      if (dateCol < 0 && /日付|利用日|ご利用日|date/i.test(n)) dateCol = i;
      // 「支払方法」等を金額と誤認しないよう、金額系は「金額/請求/総額」を要求（方法は除外）
      if (amountCol < 0 && !/方法|区分|回数/.test(n) && /利用金額|ご利用金額|請求金額|請求額|支払総額|ご請求|金額|利用額|amount|price/i.test(n)) amountCol = i;
      if (descCol < 0 && /店名|内容|利用先|摘要|ご利用先|加盟店|明細|description|商品/i.test(n)) descCol = i;
    });

    // 値からの推定（見出しで決まらなかった列）
    for (let c = 0; c < cols; c++) {
      const vals = body.slice(0, 30).map(r => r[c]).filter(v => v != null && v !== '');
      if (vals.length === 0) continue;
      const dateHits = vals.filter(looksLikeDate).length / vals.length;
      const numHits = vals.filter(v => !isNaN(parseAmount(v))).length / vals.length;
      if (dateCol < 0 && dateHits > 0.6) dateCol = c;
      if (amountCol < 0 && numHits > 0.6 && dateHits < 0.5) amountCol = c;
    }
    // 説明列：残りで最も文字数の平均が大きい列
    if (descCol < 0) {
      let best = -1, bestLen = 0;
      for (let c = 0; c < cols; c++) {
        if (c === dateCol || c === amountCol) continue;
        const vals = body.slice(0, 30).map(r => (r[c] || ''));
        const len = vals.reduce((a, v) => a + v.length, 0) / (vals.length || 1);
        if (len > bestLen) { bestLen = len; best = c; }
      }
      descCol = best;
    }
    return { dateCol, descCol, amountCol };
  }

  function buildColOptions(select, cols, header, selected) {
    select.innerHTML = '';
    for (let i = 0; i < cols; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      const label = header[i] ? escapeHtml(header[i]) : `列 ${i + 1}`;
      opt.textContent = `${i + 1}: ${label}`;
      if (i === selected) opt.selected = true;
      select.appendChild(opt);
    }
  }

  function showMapping() {
    drop.classList.add('hidden');
    $('results').classList.add('hidden');
    $('mapping').classList.remove('hidden');

    const hasHeader = $('opt-header').checked;
    const cols = Math.max(...rawRows.map(r => r.length));
    const header = hasHeader ? rawRows[0] : [];
    const guess = guessColumns(rawRows, hasHeader);

    buildColOptions($('col-date'), cols, header, guess.dateCol);
    buildColOptions($('col-desc'), cols, header, guess.descCol);
    buildColOptions($('col-amount'), cols, header, guess.amountCol);

    renderPreview(hasHeader);
  }

  function renderPreview(hasHeader) {
    const rows = rawRows.slice(0, hasHeader ? 6 : 5);
    const start = hasHeader ? 1 : 0;
    let html = '';
    if (hasHeader) {
      html += '<thead><tr>' + rawRows[0].map(h => `<th>${escapeHtml(h)}</th>`).join('') + '</tr></thead>';
    }
    html += '<tbody>';
    for (let i = start; i < rows.length; i++) {
      html += '<tr>' + rows[i].map(v => `<td>${escapeHtml(v)}</td>`).join('') + '</tr>';
    }
    html += '</tbody>';
    $('preview').innerHTML = html;
  }

  // ---- テキスト（貼り付け／共有）からの解析 --------------------------------
  // 要約・合計などの行は明細ではないので除外する
  const SUMMARY_RE = /合計|小計|総額|ご請求|請求額|お支払|支払金額|残高|繰越|利用可能|total|balance|subtotal/i;
  // 見出し/請求サマリ等（カード番号マスク・ブランド名・帳票見出し）を除外
  const EXCLUDE_RE = /[\*＊]{3,}|（visa|（master|（jcb|（american|ゴールドカード|ご利用カード|お支払日|返済方法|引落口座|請求確定日|獲得ポイント|会員様|相談窓口|ご利用明細|利用日\s*利用店名|単位：円/i;
  // 利用者・支払方法の語（明細の店名から除去する）
  const PAYER_RE = /(本人|家族|ご本人)[＊*]?/g;
  const METHOD_RE = /(\d+回払い|一括払い|分割払い|リボ払い|ボーナス|据置|1回払い)/g;

  function parseStatementText(text) {
    const out = [];
    for (let raw of String(text).split(/\r?\n/)) {
      const line = raw.replace(/\t/g, ' ').trim();
      if (!line) continue;
      if (EXCLUDE_RE.test(line)) continue;
      const dm = line.match(/\d{4}[\/\-.年]\s?\d{1,2}[\/\-.月]\s?\d{1,2}日?|\b\d{1,2}[\/\-]\d{1,2}\b/);
      const date = dm ? normalizeDate(dm[0]) : '';
      const rest = (dm ? line.slice(dm.index + dm[0].length) : line).trim();

      // 明細表形式（楽天等）: 末尾に数値列が並ぶ → 先頭の数値＝利用金額
      let amount = NaN, desc = '';
      const toks = rest.split(/\s+/);
      let k = toks.length;
      while (k > 0 && /^[\d,]+$/.test(toks[k - 1])) k--;
      const numRun = toks.slice(k);
      if (dm && numRun.length >= 3) {
        amount = parseAmount(numRun[0]);          // 利用金額
        desc = toks.slice(0, k).join(' ');
      } else {
        // 汎用: ¥・円・カンマ付きを優先し、無ければ最後の金額トークン
        const amRe = /[△▲\-]?[¥￥]?\s?\d{1,3}(?:,\d{3})+(?:\.\d+)?\s?円?|[△▲\-]?[¥￥]\s?\d+(?:\.\d+)?\s?円?|[△▲\-]?\d+(?:\.\d+)?\s?円/g;
        let ms = rest.match(amRe), tok = null;
        if (ms && ms.length) { tok = ms[ms.length - 1]; amount = parseAmount(tok); }
        else { const pm = rest.match(/[△▲\-]?\d{3,}/g); if (pm) { tok = pm[pm.length - 1]; amount = parseAmount(tok); } }
        if (tok) desc = rest.replace(tok, ' ');
      }
      if (isNaN(amount) || amount === 0) continue;
      // 店名の整形（利用者・支払方法を除去）
      desc = desc.replace(PAYER_RE, ' ').replace(METHOD_RE, ' ').replace(/\s{2,}/g, ' ').trim();
      // 店名に文字（かな/漢字/英字/半角カナ）が無い行は明細ではない（合計・リボ欄など）
      if (!/[A-Za-z぀-ヿ㐀-鿿ｦ-ﾟＡ-Ｚａ-ｚ]/.test(desc)) continue;
      if (SUMMARY_RE.test(desc)) continue;
      out.push({ date, desc, amount });
    }
    return out;
  }

  // ---- 分析（共通の確定処理） ----------------------------------------------
  function finalizeTransactions(tuples) {
    transactions = [];
    for (const t of tuples) {
      if (isNaN(t.amount) || t.amount === 0) continue;
      const desc = (t.desc || '').trim() || '(名称なし)';
      const date = normalizeDate(t.date || '');
      const source = (t.source || lastSource || '').trim() || '（不明）';
      // 日付が読めない明細は、ファイル名の年月（例 202606）で月を補完
      const mo = monthOf(date);
      const month = mo !== '不明' ? mo : ((t.fmonth || lastMonth) || '不明');
      transactions.push({ date, desc, amount: t.amount, key: normalizeKey(desc), category: categorize(desc), source, month });
    }
    if (transactions.length === 0) {
      status('有効な明細が見つかりませんでした。内容や列の対応づけを確認してください。', 'error');
      return false;
    }
    status('');
    saveTransactions();       // 端末内に保存（外部送信なし）
    showResults();
    return true;
  }

  // 保存済みデータで結果を表示（明細を transactions に入れてから呼ぶ）
  function showResults() {
    drop.classList.add('hidden');
    $('ingest').classList.add('hidden');
    $('mapping').classList.add('hidden');
    $('results').classList.remove('hidden');
    buildMonthFilter();
    render();
  }

  function analyze() {
    const hasHeader = $('opt-header').checked;
    const dateCol = +$('col-date').value;
    const descCol = +$('col-desc').value;
    const amountCol = +$('col-amount').value;
    const body = hasHeader ? rawRows.slice(1) : rawRows;
    const tuples = body.map(r => ({
      date: r[dateCol] || '', desc: r[descCol] || '', amount: parseAmount(r[amountCol])
    }));
    finalizeTransactions(tuples);
  }

  // 貼り付け／共有テキストを解析
  function analyzeText(text) {
    const tuples = parseStatementText(text);
    if (!tuples.length) {
      status('テキストから明細を読み取れませんでした。「日付 店名 金額」の形が含まれているか確認してください。', 'error');
      return;
    }
    finalizeTransactions(tuples);
  }

  function buildMonthFilter() {
    const months = [...new Set(transactions.map(t => monthKey(t)))].sort();
    const sel = $('month-filter');
    sel.innerHTML = '<option value="">全期間</option>' +
      months.map(m => `<option value="${m}">${m}</option>`).join('');
  }

  function currentTx() {
    const m = $('month-filter').value;
    return m ? transactions.filter(t => monthKey(t) === m) : transactions;
  }

  function render() {
    const tx = currentTx();
    // 支出のみ（正の金額）を集計対象に。負（返金）は合計から差し引く。
    const spend = tx.filter(t => t.amount > 0);
    const total = tx.reduce((a, t) => a + t.amount, 0);

    // サマリー
    $('summary').innerHTML =
      `<span class="sum-total">${yen(total)}</span>` +
      `<span class="sum-sub">${tx.length}件 / 平均 ${yen(total / (tx.length || 1))}</span>`;

    renderStats(tx);
    renderCards(tx);
    renderCategoryChart(spend);
    renderMonthChart();
    renderMonthTable();
    renderCategoryTrend();
    renderMerchants(spend);
    renderTable(tx);
  }

  // ---- 統計量 -------------------------------------------------------------
  function median(nums) {
    if (!nums.length) return 0;
    const a = [...nums].sort((x, y) => x - y);
    const mid = Math.floor(a.length / 2);
    return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
  }
  function renderStats(tx) {
    const spend = tx.filter(t => t.amount > 0);
    const amounts = spend.map(t => t.amount);
    const total = tx.reduce((a, t) => a + t.amount, 0);
    const months = new Set(tx.map(t => monthKey(t)).filter(m => m !== '不明')).size || 1;
    const tiles = [
      ['合計', yen(total)],
      ['支出件数', spend.length + '件'],
      ['月平均', yen(total / months)],
      ['1件平均', yen(amounts.reduce((a, b) => a + b, 0) / (amounts.length || 1))],
      ['中央値', yen(median(amounts))],
      ['最高額', yen(amounts.length ? Math.max(...amounts) : 0)],
    ];
    $('stats').innerHTML = tiles.map(([k, v]) =>
      `<div class="stat"><div class="stat-val">${v}</div><div class="stat-key">${k}</div></div>`).join('');
  }

  // ---- カード別内訳 -------------------------------------------------------
  const CARD_COLORS = ['#2472c8', '#e91e63', '#4caf50', '#ff9800', '#9c27b0', '#00bcd4', '#795548', '#607d8b', '#f44336', '#3f51b5'];
  function renderCards(tx) {
    const bySrc = {};
    for (const t of tx) {
      const s = t.source || '（不明）';
      const g = bySrc[s] || (bySrc[s] = { sum: 0, count: 0 });
      g.sum += t.amount; g.count += 1;
    }
    const entries = Object.entries(bySrc).sort((a, b) => b[1].sum - a[1].sum);
    // カードが1種類だけなら内訳カードは隠す
    const wrap = $('cards-card');
    if (entries.length <= 1) { if (wrap) wrap.classList.add('hidden'); return; }
    if (wrap) wrap.classList.remove('hidden');
    const total = entries.reduce((a, e) => a + e[1].sum, 0) || 1;
    let html = '<div class="bars">';
    entries.forEach(([name, g], i) => {
      const pct = g.sum / total * 100;
      const color = CARD_COLORS[i % CARD_COLORS.length];
      html += `
        <div class="bar-row">
          <div class="bar-label" title="${escapeHtml(name)}"><span class="dot" style="background:${color}"></span>${escapeHtml(name)}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct.toFixed(1)}%;background:${color}"></div></div>
          <div class="bar-val">${yen(g.sum)} <span class="bar-pct">${pct.toFixed(0)}% / ${g.count}件</span></div>
        </div>`;
    });
    html += '</div>';
    $('cards').innerHTML = html;
  }

  function renderCategoryChart(tx) {
    const byCat = {};
    for (const t of tx) byCat[t.category] = (byCat[t.category] || 0) + t.amount;
    const entries = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((a, e) => a + e[1], 0) || 1;

    let html = '<div class="bars">';
    for (const [cat, amt] of entries) {
      const pct = (amt / total * 100);
      const color = CAT_COLORS[cat] || '#9e9e9e';
      const sel = catSelected === cat ? ' selected' : '';
      html += `
        <div class="bar-row clickable${sel}" data-cat="${escapeHtml(cat)}">
          <div class="bar-label"><span class="dot" style="background:${color}"></span>${escapeHtml(cat)}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct.toFixed(1)}%;background:${color}"></div></div>
          <div class="bar-val">${yen(amt)} <span class="bar-pct">${pct.toFixed(0)}%</span></div>
        </div>`;
    }
    html += '</div>';
    $('chart-category').innerHTML = html;
    renderCatDetail();
  }

  function renderMonthChart() {
    const byMonth = {};
    for (const t of transactions) {
      const m = monthKey(t);
      byMonth[m] = (byMonth[m] || 0) + t.amount;
    }
    const entries = Object.entries(byMonth).sort();
    const max = Math.max(...entries.map(e => e[1]), 1);

    let html = '<div class="month-bars">';
    for (const [m, amt] of entries) {
      const h = Math.max(2, amt / max * 140);
      const sel = monthSelected === m ? ' selected' : '';
      html += `
        <div class="mbar clickable${sel}" data-month="${m}" title="${m}: ${yen(amt)}">
          <div class="mbar-val">${yen(amt)}</div>
          <div class="mbar-fill" style="height:${h}px"></div>
          <div class="mbar-label">${m.replace(/^\d{4}-/, '')}月</div>
        </div>`;
    }
    html += '</div>';
    $('chart-month').innerHTML = entries.length ? html : '<p class="field-hint">月別データがありません。</p>';
    renderMonthDetail();
  }

  // ---- バー内訳（金額順） -------------------------------------------------
  // 明細の1行表示（金額の多い順に並べたリスト用）
  function detailRows(list) {
    const rows = [...list].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
    let html = '<table class="mini-table detail-table"><thead><tr><th>店名・内容</th><th class="num">金額</th><th>日付</th></tr></thead><tbody>';
    for (const t of rows) {
      html += `<tr><td>${escapeHtml(t.desc)}</td><td class="num ${t.amount < 0 ? 'refund' : ''}">${yen(t.amount)}</td><td class="nowrap">${escapeHtml(t.date || monthKey(t))}</td></tr>`;
    }
    html += '</tbody></table>';
    return html;
  }

  function renderCatDetail() {
    const el = $('cat-detail');
    if (!el) return;
    if (!catSelected) { el.innerHTML = ''; return; }
    const list = currentTx().filter(t => t.category === catSelected);
    const sum = list.reduce((a, t) => a + t.amount, 0);
    el.innerHTML = `<div class="detail-head">「${escapeHtml(catSelected)}」の内訳（金額順） 計 ${yen(sum)} ／ ${list.length}件 <button class="detail-close" data-close="cat">✕</button></div>` + detailRows(list);
  }

  function renderMonthDetail() {
    const el = $('month-detail');
    if (!el) return;
    if (!monthSelected) { el.innerHTML = ''; return; }
    const list = transactions.filter(t => monthKey(t) === monthSelected);
    const sum = list.reduce((a, t) => a + t.amount, 0);
    const label = monthSelected.replace(/^(\d{4})-/, '$1年') + '月';
    el.innerHTML = `<div class="detail-head">${escapeHtml(label)}の内訳（金額順） 計 ${yen(sum)} ／ ${list.length}件 <button class="detail-close" data-close="month">✕</button></div>` + detailRows(list);
  }

  // 月別合計を昇順で返す（全期間・フィルタ非依存）
  function monthlyTotals() {
    const byMonth = {};
    for (const t of transactions) {
      const m = monthKey(t);
      if (m === '不明') continue;
      byMonth[m] = (byMonth[m] || 0) + t.amount;
    }
    return Object.entries(byMonth).sort();
  }

  // ---- 月別テーブル（前月比・件数） ---------------------------------------
  function renderMonthTable() {
    const entries = monthlyTotals();
    if (entries.length === 0) { $('month-table').innerHTML = ''; return; }
    const countByMonth = {};
    for (const t of transactions) {
      const m = monthKey(t);
      if (m !== '不明') countByMonth[m] = (countByMonth[m] || 0) + 1;
    }
    let html = '<table class="mini-table"><thead><tr><th>月</th><th class="num">合計</th><th class="num">前月比</th><th class="num">件数</th></tr></thead><tbody>';
    let prev = null;
    for (const [m, amt] of entries) {
      let mom = '—';
      if (prev !== null && prev !== 0) {
        const diff = amt - prev;
        const pct = diff / Math.abs(prev) * 100;
        const cls = diff > 0 ? 'up' : (diff < 0 ? 'down' : '');
        const sign = diff > 0 ? '▲+' : (diff < 0 ? '▼' : '');
        mom = `<span class="${cls}">${sign}${yen(Math.abs(diff))} (${pct > 0 ? '+' : ''}${pct.toFixed(0)}%)</span>`;
      }
      html += `<tr><td>${m}</td><td class="num">${yen(amt)}</td><td class="num">${mom}</td><td class="num">${countByMonth[m] || 0}</td></tr>`;
      prev = amt;
    }
    html += '</tbody></table>';
    $('month-table').innerHTML = html;
  }

  // ---- カテゴリ別の月推移（積み上げ棒） ------------------------------------
  function renderCategoryTrend() {
    const months = monthlyTotals().map(e => e[0]);
    if (months.length === 0) { $('chart-cat-trend').innerHTML = '<p class="field-hint">月別データがありません。</p>'; return; }
    // 月×カテゴリの支出（正の金額のみ）
    const grid = {}; // month -> {cat: amt}
    const monthTotal = {};
    for (const t of transactions) {
      if (t.amount <= 0) continue;
      const m = monthKey(t);
      if (m === '不明') continue;
      (grid[m] = grid[m] || {})[t.category] = (grid[m]?.[t.category] || 0) + t.amount;
      monthTotal[m] = (monthTotal[m] || 0) + t.amount;
    }
    const max = Math.max(...months.map(m => monthTotal[m] || 0), 1);
    // 凡例（登場カテゴリを合計の多い順）
    const catTotals = {};
    for (const m of months) for (const [c, v] of Object.entries(grid[m] || {})) catTotals[c] = (catTotals[c] || 0) + v;
    const cats = Object.keys(catTotals).sort((a, b) => catTotals[b] - catTotals[a]);

    let bars = '<div class="month-bars">';
    for (const m of months) {
      const total = monthTotal[m] || 0;
      const barH = Math.max(2, total / max * 160);
      let segs = '';
      for (const c of cats) {
        const v = (grid[m] || {})[c] || 0;
        if (v <= 0) continue;
        const h = v / total * barH;
        segs += `<div class="seg" style="height:${h}px;background:${CAT_COLORS[c] || '#9e9e9e'}" title="${m} ${escapeHtml(c)}: ${yen(v)}"></div>`;
      }
      bars += `
        <div class="mbar">
          <div class="mbar-val">${yen(total)}</div>
          <div class="stack" style="height:${barH}px">${segs}</div>
          <div class="mbar-label">${m.replace(/^\d{4}-/, '')}月</div>
        </div>`;
    }
    bars += '</div>';
    const legend = '<div class="legend">' + cats.map(c =>
      `<span class="legend-item"><span class="dot" style="background:${CAT_COLORS[c] || '#9e9e9e'}"></span>${escapeHtml(c)}</span>`).join('') + '</div>';
    $('chart-cat-trend').innerHTML = bars + legend;
  }

  // ---- よく使う店ランキング -----------------------------------------------
  function renderMerchants(spend) {
    const byMerchant = {};
    for (const t of spend) {
      const g = byMerchant[t.key] || (byMerchant[t.key] = { name: t.desc, sum: 0, count: 0, cat: t.category });
      g.sum += t.amount; g.count += 1;
    }
    const list = Object.values(byMerchant).sort((a, b) => b.sum - a.sum).slice(0, 15);
    if (list.length === 0) { $('merchants').innerHTML = '<p class="field-hint">データがありません。</p>'; return; }
    const max = list[0].sum || 1;
    let html = '<div class="bars">';
    for (const g of list) {
      const pct = g.sum / max * 100;
      const color = CAT_COLORS[g.cat] || '#9e9e9e';
      html += `
        <div class="bar-row">
          <div class="bar-label" title="${escapeHtml(g.name)}"><span class="dot" style="background:${color}"></span>${escapeHtml(g.name)}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct.toFixed(1)}%;background:${color}"></div></div>
          <div class="bar-val">${yen(g.sum)} <span class="bar-pct">${g.count}回</span></div>
        </div>`;
    }
    html += '</div>';
    $('merchants').innerHTML = html;
  }

  function renderTable(tx) {
    const sorted = [...tx].sort((a, b) => (a.date < b.date ? 1 : -1));
    let html = '<thead><tr><th>日付</th><th>店名・内容</th><th class="num">金額</th><th>カテゴリ</th></tr></thead><tbody>';
    for (const t of sorted) {
      const idx = transactions.indexOf(t);
      const opts = CATEGORIES.map(c =>
        `<option value="${c}"${c === t.category ? ' selected' : ''}>${c}</option>`).join('');
      html += `
        <tr>
          <td class="nowrap">${escapeHtml(t.date)}</td>
          <td>${escapeHtml(t.desc)}</td>
          <td class="num ${t.amount < 0 ? 'refund' : ''}">${yen(t.amount)}</td>
          <td><select class="cat-select" data-idx="${idx}">${opts}</select></td>
        </tr>`;
    }
    html += '</tbody>';
    const table = $('tx-table');
    table.innerHTML = html;
    table.querySelectorAll('.cat-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const i = +e.target.dataset.idx;
        const t = transactions[i];
        t.category = e.target.value;
        // 同じ店名すべてに適用し、ルールとして記憶
        overrides[t.key] = t.category;
        transactions.forEach(x => { if (x.key === t.key) x.category = t.category; });
        saveOverrides();
        saveTransactions();
        render();
      });
    });
  }

  // ---- リセット -----------------------------------------------------------
  function reset() {
    rawRows = []; transactions = [];
    $('results').classList.add('hidden');
    $('mapping').classList.add('hidden');
    $('ingest').classList.remove('hidden');
    fileInput.value = '';
    status('');
  }

  // ---- 入力モード切替（CSV / テキスト貼り付け） ----------------------------
  function setMode(mode) {
    const isCsv = mode === 'csv';
    $('mode-csv').classList.toggle('active', isCsv);
    $('mode-text').classList.toggle('active', !isCsv);
    drop.classList.toggle('hidden', !isCsv);
    $('paste-area').classList.toggle('hidden', isCsv);
  }

  // ---- 共有・ディープリンクからの取り込み ----------------------------------
  // iOSショートカットは expense.html#paste=<encoded> または ?paste=<encoded> で開く。
  // Android PWA共有ターゲット(GET)は ?text=/&title= で開く。
  const decodeShare = (v) => { try { return decodeURIComponent(String(v).replace(/\+/g, ' ')); } catch { return String(v); } };
  function ingestFromLocation() {
    let shared = '';
    try {
      const params = new URLSearchParams(location.search);
      const q = params.get('paste') || params.get('text') || params.get('title');
      if (q) shared = decodeShare(q);
      const hash = location.hash.match(/[#&]paste=([^&]+)/);
      if (hash) shared = decodeShare(hash[1]);
    } catch {}
    if (shared && shared.trim()) {
      setMode('text');
      $('paste-input').value = shared;
      // URLから機微情報を消す
      try { history.replaceState(null, '', location.pathname); } catch {}
      analyzeText(shared);
      return true;
    }
    return false;
  }

  // 保存済みの明細があれば復元して結果を表示
  function restoreSaved() {
    const saved = loadSavedTransactions();
    if (saved && saved.length) {
      transactions = saved;
      showResults();
      status(`前回の${saved.length}件を復元しました（この端末に保存）。`);
      return true;
    }
    return false;
  }

  // データ消去（確認あり）
  function clearData() {
    if (!confirm('保存した明細データをこの端末から消去します。よろしいですか？（カテゴリのルールは残ります）')) return;
    clearSavedData();
    reset();
  }

  // ---- イベント -----------------------------------------------------------
  fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
  $('mode-csv').addEventListener('click', () => setMode('csv'));
  $('mode-text').addEventListener('click', () => setMode('text'));
  $('btn-parse-text').addEventListener('click', () => { lastSource = '貼り付け'; lastMonth = ''; analyzeText($('paste-input').value); });
  const help = $('help-toggle');
  if (help) help.addEventListener('click', () => $('help-body').classList.toggle('hidden'));
  $('btn-analyze').addEventListener('click', analyze);
  $('btn-reset').addEventListener('click', reset);
  const btnClear = $('btn-clear');
  if (btnClear) btnClear.addEventListener('click', clearData);
  $('month-filter').addEventListener('change', render);
  // 棒グラフのタップで内訳（金額順）をトグル表示
  $('chart-category').addEventListener('click', (e) => {
    const row = e.target.closest('[data-cat]');
    if (!row) return;
    const c = row.getAttribute('data-cat');
    catSelected = (catSelected === c) ? '' : c;
    renderCategoryChart(currentTx().filter(t => t.amount > 0));
  });
  $('chart-month').addEventListener('click', (e) => {
    const bar = e.target.closest('[data-month]');
    if (!bar) return;
    const m = bar.getAttribute('data-month');
    monthSelected = (monthSelected === m) ? '' : m;
    renderMonthChart();
  });
  $('cat-detail').addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) { catSelected = ''; renderCategoryChart(currentTx().filter(t => t.amount > 0)); }
  });
  $('month-detail').addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) { monthSelected = ''; renderMonthChart(); }
  });
  $('opt-header').addEventListener('change', () => showMapping());
  ['col-date', 'col-desc', 'col-amount'].forEach(id =>
    $(id).addEventListener('change', () => renderPreview($('opt-header').checked)));

  ['dragenter', 'dragover'].forEach(ev =>
    drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(ev =>
    drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', (e) => {
    if (e.dataTransfer.files && e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  });

  // ---- 起動処理 -----------------------------------------------------------
  // PWA: Service Worker 登録（オフライン動作 & ホーム画面インストール用）
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
  // 起動時：共有/ショートカットの取り込みを優先、なければ保存済みデータを復元
  if (!ingestFromLocation()) restoreSaved();
})();
