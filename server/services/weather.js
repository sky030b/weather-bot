const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const locationName = '臺北市';
const taiwanOffset = 8 * 60 * 60 * 1000;
const oneDayOffset = 24 * 60 * 60 * 1000;

let weatherData;
async function fetchWeatherData(locationName = '臺北市') {
  try {
    const response = await axios.get(process.env.API_URL, {
      params: {
        Authorization: process.env.API_TOKEN,
        locationName,
        elementName: process.env.ELEMENT_NAME
      }
    });
    weatherData = response.data.records.locations[0].location[0].weatherElement[0].time;
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}

function getNowTime() {
  return new Date(Date.now() + taiwanOffset).toISOString().slice(0, 19).replace("T", " ");
}

function getPeriodTime(description) {
  if (description.includes("現在") || description.includes("即時")) return getNowTime();

  let targetDate;
  if (description.includes("明天")) {
    targetDate = new Date(Date.now() + taiwanOffset + oneDayOffset).toISOString().slice(0, 10);
  } else if (description.includes("後天")) {
    targetDate = new Date(Date.now() + taiwanOffset + oneDayOffset * 2).toISOString().slice(0, 10);
  } else {
    targetDate = getNowTime().slice(0, 10);
  }

  const timePeriods = [
    { label: '晚上', start: 21, end: 24 },
    { label: '夜晚', start: 21, end: 24 },
    { label: '黃昏', start: 18, end: 21 },
    { label: '傍晚', start: 15, end: 18 },
    { label: '下午', start: 15, end: 18 },
    { label: '中午', start: 12, end: 15 },
    { label: '早上', start: 9, end: 12 },
    { label: '上午', start: 9, end: 12 },
    { label: '早晨', start: 6, end: 9 },
    { label: '清晨', start: 3, end: 6 },
    { label: '凌晨', start: 3, end: 6 },
    { label: '深夜', start: 0, end: 3 },
    { label: '半夜', start: 0, end: 3 },
    { label: '午夜', start: 0, end: 3 }
  ];

  let period = timePeriods.find(period => description.includes(period.label));
  if (!period) {
    // alert("無效的時間描述，將提供現在的天氣資訊。");
    if (targetDate < getNowTime()) return getNowTime();

    period = { label: '早上', start: 9, end: 12 };
  }

  const hour = String(period.start).padStart(2, '0');
  const fullPeriodTime = `${targetDate} ${hour}:00:00`;

  return fullPeriodTime;
}

function getReplyAttr(description) {
  let attributes = [];
  const allAttributes = ["weather", "rainProbability", "temperature", "feeling", "wind", "humidity"];
  if (description.includes("天氣") || description.includes("氣象")) attributes.push("weather");
  if (description.includes("降雨") || description.includes("機率")) attributes.push("rainProbability");
  if (description.includes("溫度") || description.includes("氣溫")) attributes.push("temperature");
  if (description.includes("體感") || description.includes("覺得")) attributes.push("feeling");
  if (description.includes("風")) attributes.push("wind");
  if (description.includes("濕度")) attributes.push("humidity");
  if (description.includes("完整")) attributes = allAttributes;
  return attributes.length ? attributes : allAttributes;
}

function parseWeatherDescription(description) {
  const lines = description.replaceAll('。', '。\n').split('\n');
  const weatherInfo = {
    weather: lines[0],
    rainProbability: lines[1],
    temperature: lines[2],
    feeling: lines[3],
    wind: lines[4],
    humidity: lines[5]
  };

  return weatherInfo;
}

function hasKeywords(description) {
  const keywords = [
    "天氣", "氣象", "降雨", "機率", "溫度", "氣溫", "覺得", "體感", "風", "濕度", "完整",
    "晚上", "夜晚", "黃昏", "傍晚", "下午", "中午", "早上", "上午", "早晨", "清晨", "深夜",
    "凌晨", "半夜", "午夜", "現在", "即時", "明天", "後天"
  ];
  return keywords.some(keyword => description.includes(keyword));
}


async function getReply(description) {
  if (!hasKeywords(description)) {
    return "no match";
  }

  await fetchWeatherData();

  let periodTime = getPeriodTime(description);
  const attributes = getReplyAttr(description);

  let reply = "";
  if (periodTime < getNowTime()) {
    reply += "無法查詢過去記錄，故提供即時記錄。\n\n";
    periodTime = getNowTime();
  };

  const result = weatherData.find(item => item.endTime > periodTime);
  if (!result) return "無法找到符合條件的天氣資料，故提供完整的即時記錄。\n\n";

  const weatherInfo = parseWeatherDescription(result.elementValue[0].value);
  reply += `${periodTime.slice(0, 19)}:\n`;

  attributes.forEach(attr => {
    if (weatherInfo[attr]) reply += `${weatherInfo[attr]}\n`;
  });

  return reply.trim();
}

// async function init() {
//   await fetchWeatherData(locationName);
// }

// init();

async function analyzeMessageReturnWeather(description) {
  // function analyzeMessageReturnWeather(description) {
  // await fetchWeatherData();
  return await getReply(description);
}

module.exports = { fetchWeatherData, analyzeMessageReturnWeather };
