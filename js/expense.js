/* カード明細 支出分析 — 完全クライアントサイド（データは端末外に送信しません） */
(() => {
  'use strict';

  // ---- カテゴリ定義 -------------------------------------------------------
  // 加盟店名に含まれるキーワード → カテゴリ。上から順にマッチ。
  const CATEGORIES = [
    '食費', '外食・カフェ', '交通', 'ショッピング', '娯楽・サブスク',
    '通信', '光熱・水道', '医療・薬', '教育', '公共・保険', 'その他'
  ];

  const RULES = [
    ['食費', ['スーパー', 'マート', 'イオン', 'ライフ', 'ヤオコー', 'マルエツ', 'サミット', 'コストコ', '業務スーパー', '肉のハナマサ', 'まいばすけっと', 'seiyu', '西友', 'gyomu']],
    ['外食・カフェ', ['スターバックス', 'starbucks', 'ドトール', 'タリーズ', 'マクドナルド', 'mcdonald', 'すき家', '吉野家', '松屋', 'ケンタッキー', 'kfc', 'サイゼ', 'ガスト', 'モスバーガー', 'ラーメン', '居酒屋', 'コメダ', 'ローソン', 'ファミリーマート', 'セブン', 'seven', 'lawson', 'familymart', 'コンビニ']],
    ['交通', ['jr', 'メトロ', '地下鉄', '鉄道', '交通', 'suica', 'pasmo', 'モバイルsuica', 'ana', 'jal', '航空', 'タクシー', 'taxi', 'eneos', 'エネオス', '出光', 'コスモ石油', 'ガソリン', 'etc', '高速道路', 'nexco', 'タイムズ', 'times', '駐車']],
    ['通信', ['docomo', 'ドコモ', 'au', 'kddi', 'softbank', 'ソフトバンク', '楽天モバイル', 'ahamo', 'povo', 'ymobile', 'ワイモバイル', 'nuro', 'ocn', 'so-net', 'プロバイダ', '通信']],
    ['光熱・水道', ['電力', '電気', '東京電力', '関西電力', '中部電力', 'ガス', '東京ガス', '大阪ガス', '水道']],
    ['娯楽・サブスク', ['netflix', 'ネットフリックス', 'spotify', 'youtube', 'amazon prime', 'prime video', 'disney', 'hulu', 'u-next', 'dazn', 'apple.com', 'itunes', 'google play', 'playstation', 'nintendo', 'steam', 'adobe', 'chatgpt', 'openai', 'claude', '映画', 'カラオケ', 'ゲーム']],
    ['ショッピング', ['amazon', 'アマゾン', '楽天市場', 'rakuten', 'yahoo', 'ヤフー', 'メルカリ', 'zozo', 'ユニクロ', 'uniqlo', 'gu', '無印', 'ニトリ', 'ヨドバシ', 'ビックカメラ', 'ヤマダ', 'apple store', '書店', 'ドン・キホーテ', 'ドンキ', 'ダイソー', '100円', '雑貨']],
    ['医療・薬', ['病院', 'クリニック', '医院', '歯科', '薬局', 'ドラッグ', 'マツモトキヨシ', 'ウエルシア', 'サンドラッグ', 'ツルハ', 'welcia']],
    ['教育', ['学', '塾', 'スクール', '書籍', 'benesse', 'ベネッセ', 'udemy', 'kindle']],
    ['公共・保険', ['保険', '生命', '損保', '税', '年金', '区役所', '市役所', 'nhk']],
  ];

  const CAT_COLORS = {
    '食費': '#4caf50', '外食・カフェ': '#ff9800', '交通': '#2196f3',
    'ショッピング': '#e91e63', '娯楽・サブスク': '#9c27b0', '通信': '#00bcd4',
    '光熱・水道': '#ff5722', '医療・薬': '#f44336', '教育': '#795548',
    '公共・保険': '#607d8b', 'その他': '#9e9e9e'
  };

  const OVERRIDES_KEY = 'expense.categoryOverrides.v1';

  // ---- 状態 ---------------------------------------------------------------
  let rawRows = [];      // CSV全行（配列の配列）
  let transactions = []; // {date, desc, amount, category, key}
  let overrides = loadOverrides();

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

  function categorize(desc) {
    const key = normalizeKey(desc);
    if (overrides[key]) return overrides[key];
    const lower = String(desc).toLowerCase();
    for (const [cat, keywords] of RULES) {
      if (keywords.some(k => lower.includes(k.toLowerCase()))) return cat;
    }
    return 'その他';
  }

  // 店名から分類ルールのキーを作る（記号・数字・空白をならす）
  function normalizeKey(desc) {
    return String(desc).toLowerCase().replace(/[0-9０-９\s\-*/#().，、。]/g, '').slice(0, 24);
  }

  // ---- ファイル読み込み ---------------------------------------------------
  function handleFile(file) {
    if (!file) return;
    status('読み込み中…');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = decodeBuffer(e.target.result);
        rawRows = parseCSV(text);
        if (rawRows.length === 0) { status('データが見つかりませんでした。', 'error'); return; }
        status('');
        showMapping();
      } catch (err) {
        status('読み込みに失敗しました: ' + err.message, 'error');
      }
    };
    reader.onerror = () => status('ファイルを読めませんでした。', 'error');
    reader.readAsArrayBuffer(file);
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
      if (amountCol < 0 && /金額|利用額|支払|amount|price|ご利用金額/i.test(n)) amountCol = i;
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

  function parseStatementText(text) {
    const out = [];
    for (let line of String(text).split(/\r?\n/)) {
      line = line.replace(/\t/g, ' ').trim();
      if (!line) continue;
      let date = '';
      const dm = line.match(/\d{4}[\/\-.年]\s?\d{1,2}[\/\-.月]\s?\d{1,2}日?|\b\d{1,2}[\/\-]\d{1,2}\b/);
      if (dm) date = normalizeDate(dm[0]);
      const rest = dm ? line.replace(dm[0], ' ') : line;
      // 金額トークン（¥・円・カンマ付きを優先し、なければ3桁以上の数字）
      const amRe = /[△▲\-]?[¥￥]?\s?\d{1,3}(?:,\d{3})+(?:\.\d+)?\s?円?|[△▲\-]?[¥￥]\s?\d+(?:\.\d+)?\s?円?|[△▲\-]?\d+(?:\.\d+)?\s?円/g;
      let ms = rest.match(amRe), amount = NaN, tok = null;
      if (ms && ms.length) { tok = ms[ms.length - 1]; amount = parseAmount(tok); }
      else { const pm = rest.match(/[△▲\-]?\d{3,}/g); if (pm) { tok = pm[pm.length - 1]; amount = parseAmount(tok); } }
      if (isNaN(amount) || amount === 0) continue;
      const desc = (rest.replace(tok, ' ').replace(/\s{2,}/g, ' ').trim()) || '(名称なし)';
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
      transactions.push({ date, desc, amount: t.amount, key: normalizeKey(desc), category: categorize(desc) });
    }
    if (transactions.length === 0) {
      status('有効な明細が見つかりませんでした。内容や列の対応づけを確認してください。', 'error');
      return false;
    }
    status('');
    drop.classList.add('hidden');
    $('mapping').classList.add('hidden');
    $('results').classList.remove('hidden');
    buildMonthFilter();
    render();
    return true;
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
    const months = [...new Set(transactions.map(t => monthOf(t.date)))].sort();
    const sel = $('month-filter');
    sel.innerHTML = '<option value="">全期間</option>' +
      months.map(m => `<option value="${m}">${m}</option>`).join('');
  }

  function currentTx() {
    const m = $('month-filter').value;
    return m ? transactions.filter(t => monthOf(t.date) === m) : transactions;
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

    renderCategoryChart(spend);
    renderMonthChart();
    renderTable(tx);
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
      html += `
        <div class="bar-row">
          <div class="bar-label"><span class="dot" style="background:${color}"></span>${escapeHtml(cat)}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct.toFixed(1)}%;background:${color}"></div></div>
          <div class="bar-val">${yen(amt)} <span class="bar-pct">${pct.toFixed(0)}%</span></div>
        </div>`;
    }
    html += '</div>';
    $('chart-category').innerHTML = html;
  }

  function renderMonthChart() {
    const byMonth = {};
    for (const t of transactions) {
      const m = monthOf(t.date);
      byMonth[m] = (byMonth[m] || 0) + t.amount;
    }
    const entries = Object.entries(byMonth).sort();
    const max = Math.max(...entries.map(e => e[1]), 1);

    let html = '<div class="month-bars">';
    for (const [m, amt] of entries) {
      const h = Math.max(2, amt / max * 140);
      html += `
        <div class="mbar" title="${m}: ${yen(amt)}">
          <div class="mbar-val">${yen(amt)}</div>
          <div class="mbar-fill" style="height:${h}px"></div>
          <div class="mbar-label">${m.replace(/^\d{4}-/, '')}月</div>
        </div>`;
    }
    html += '</div>';
    $('chart-month').innerHTML = entries.length ? html : '<p class="field-hint">月別データがありません。</p>';
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
  // iOSショートカットは expense.html#paste=<encoded> で開く。
  // Android PWA共有ターゲット(GET)は ?text=/&title= で開く。
  function ingestFromLocation() {
    let shared = '';
    try {
      const params = new URLSearchParams(location.search);
      shared = params.get('text') || params.get('title') || '';
      const hash = location.hash.match(/[#&]paste=([^&]+)/);
      if (hash) shared = decodeURIComponent(hash[1].replace(/\+/g, ' '));
    } catch {}
    if (shared && shared.trim()) {
      setMode('text');
      $('paste-input').value = shared;
      // URLから機微情報を消す
      try { history.replaceState(null, '', location.pathname); } catch {}
      analyzeText(shared);
    }
  }

  // ---- イベント -----------------------------------------------------------
  fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));
  $('mode-csv').addEventListener('click', () => setMode('csv'));
  $('mode-text').addEventListener('click', () => setMode('text'));
  $('btn-parse-text').addEventListener('click', () => analyzeText($('paste-input').value));
  const help = $('help-toggle');
  if (help) help.addEventListener('click', () => $('help-body').classList.toggle('hidden'));
  $('btn-analyze').addEventListener('click', analyze);
  $('btn-reset').addEventListener('click', reset);
  $('month-filter').addEventListener('change', render);
  $('opt-header').addEventListener('change', () => showMapping());
  ['col-date', 'col-desc', 'col-amount'].forEach(id =>
    $(id).addEventListener('change', () => renderPreview($('opt-header').checked)));

  ['dragenter', 'dragover'].forEach(ev =>
    drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(ev =>
    drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', (e) => {
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  });

  // ---- 起動処理 -----------------------------------------------------------
  // PWA: Service Worker 登録（オフライン動作 & ホーム画面インストール用）
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
  // 共有・ショートカットからの取り込み
  ingestFromLocation();
})();
