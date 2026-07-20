// 天気予報（Open-Meteo / APIキー不要・無料）

// プリセット都市（緯度経度）
const CITIES = {
  "宇都宮": { lat: 36.5658, lon: 139.8836 },
  "東京":   { lat: 35.6895, lon: 139.6917 },
  "大阪":   { lat: 34.6937, lon: 135.5023 },
  "名古屋": { lat: 35.1815, lon: 136.9066 },
  "福岡":   { lat: 33.5904, lon: 130.4017 },
  "札幌":   { lat: 43.0621, lon: 141.3544 },
  "仙台":   { lat: 38.2682, lon: 140.8694 },
  "広島":   { lat: 34.3853, lon: 132.4553 },
};

// WMO 天気コード → 絵文字・ラベル・雨判定
function decodeWeather(code) {
  const map = {
    0:  ["☀️", "快晴", false],
    1:  ["🌤️", "晴れ", false],
    2:  ["⛅", "薄曇り", false],
    3:  ["☁️", "曇り", false],
    45: ["🌫️", "霧", false],
    48: ["🌫️", "霧", false],
    51: ["🌦️", "小雨", true],
    53: ["🌦️", "雨", true],
    55: ["🌧️", "雨", true],
    56: ["🌧️", "みぞれ", true],
    57: ["🌧️", "みぞれ", true],
    61: ["🌦️", "小雨", true],
    63: ["🌧️", "雨", true],
    65: ["🌧️", "強い雨", true],
    66: ["🌧️", "冷雨", true],
    67: ["🌧️", "冷雨", true],
    71: ["🌨️", "小雪", true],
    73: ["🌨️", "雪", true],
    75: ["❄️", "大雪", true],
    77: ["🌨️", "雪", true],
    80: ["🌦️", "にわか雨", true],
    81: ["🌧️", "にわか雨", true],
    82: ["⛈️", "激しい雨", true],
    85: ["🌨️", "にわか雪", true],
    86: ["❄️", "にわか雪", true],
    95: ["⛈️", "雷雨", true],
    96: ["⛈️", "雷雨", true],
    99: ["⛈️", "雷雨", true],
  };
  return map[code] || ["🌡️", "—", false];
}

// 次の週（今日から見た翌週の月曜〜日曜）の予報を取得
async function fetchNextWeek(lat, lon) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", lat);
  url.searchParams.set("longitude", lon);
  url.searchParams.set("daily", "weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max");
  url.searchParams.set("timezone", "Asia/Tokyo");
  url.searchParams.set("forecast_days", "16");

  const res = await fetch(url);
  if (!res.ok) throw new Error("天気APIの取得に失敗しました (" + res.status + ")");
  const data = await res.json();
  const d = data.daily;

  // 全日をオブジェクト化
  const all = d.time.map((date, i) => {
    const [icon, label, isRain] = decodeWeather(d.weathercode[i]);
    return {
      date,
      max: Math.round(d.temperature_2m_max[i]),
      min: Math.round(d.temperature_2m_min[i]),
      precip: d.precipitation_sum[i],
      pop: d.precipitation_probability_max ? d.precipitation_probability_max[i] : null,
      code: d.weathercode[i],
      icon, label, isRain,
    };
  });

  // 翌週の月曜を求める
  const today = new Date();
  const dow = today.getDay(); // 0=日
  const daysUntilNextMonday = ((8 - dow) % 7) || 7; // 次の月曜まで
  const start = new Date(today);
  start.setDate(today.getDate() + daysUntilNextMonday);
  const startStr = toDateStr(start);

  // startStr 以降の7日を抽出（無ければ取れる範囲で）
  const idx = all.findIndex((x) => x.date >= startStr);
  const week = idx >= 0 ? all.slice(idx, idx + 7) : all.slice(-7);
  return week;
}

function toDateStr(dt) {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// 気温帯の判定
function tempBand(maxTemp) {
  if (maxTemp < 15) return "cold";
  if (maxTemp <= 25) return "mild";
  return "hot";
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { CITIES, decodeWeather, fetchNextWeek, tempBand, toDateStr };
}
