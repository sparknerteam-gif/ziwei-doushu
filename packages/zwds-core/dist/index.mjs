// src/types.ts
var BRANCH_INDEX = {
  zi: 0,
  chou: 1,
  yin: 2,
  mao: 3,
  chen: 4,
  si: 5,
  wu: 6,
  wei: 7,
  shen: 8,
  you: 9,
  xu: 10,
  hai: 11
};
var INDEX_TO_BRANCH = {
  0: "zi",
  1: "chou",
  2: "yin",
  3: "mao",
  4: "chen",
  5: "si",
  6: "wu",
  7: "wei",
  8: "shen",
  9: "you",
  10: "xu",
  11: "hai"
};
var STEM_INDEX = {
  jia: 0,
  yi: 1,
  bing: 2,
  ding: 3,
  wu: 4,
  ji: 5,
  geng: 6,
  xin: 7,
  ren: 8,
  gui: 9
};
var INDEX_TO_STEM = {
  0: "jia",
  1: "yi",
  2: "bing",
  3: "ding",
  4: "wu",
  5: "ji",
  6: "geng",
  7: "xin",
  8: "ren",
  9: "gui"
};

// src/chart/chart-builder.ts
import { astro } from "iztro";

// src/calendar/heavenly-stems.ts
function getYearStem(year) {
  const idx = ((year - 4) % 10 + 10) % 10;
  return INDEX_TO_STEM[idx];
}
function getYearBranch(year) {
  const idx = ((year - 4) % 12 + 12) % 12;
  return INDEX_TO_BRANCH[idx];
}
var MONTH_STEM_START = {
  jia: 2,
  // 丙(2) — 甲己之年丙作首
  yi: 4,
  // 戊(4) — 乙庚之年戊為頭
  bing: 6,
  // 庚(6) — 丙辛必定尋庚起
  ding: 8,
  // 壬(8) — 丁壬壬位順行流
  wu: 0,
  // 甲(0) — 戊癸何方發？甲寅之上好追求
  ji: 2,
  // 丙(2)
  geng: 4,
  // 戊(4)
  xin: 6,
  // 庚(6)
  ren: 8,
  // 壬(8)
  gui: 0
  // 甲(0)
};
function getMonthStem(yearStem, monthIndex) {
  const start = MONTH_STEM_START[yearStem];
  const idx = (start + monthIndex - 1) % 10;
  return INDEX_TO_STEM[idx];
}
function getMonthBranch(monthIndex) {
  const idx = (monthIndex + 1) % 12;
  return INDEX_TO_BRANCH[idx];
}
var HOUR_STEM_START = {
  jia: 0,
  // 甲(0) — 甲己還加甲
  yi: 2,
  // 丙(2) — 乙庚丙作初
  bing: 4,
  // 戊(4) — 丙辛從戊起
  ding: 6,
  // 庚(6) — 丁壬庚子居
  wu: 8,
  // 壬(8) — 戊癸何方發？壬子是真途
  ji: 0,
  // 甲(0)
  geng: 2,
  // 丙(2)
  xin: 4,
  // 戊(4)
  ren: 6,
  // 庚(6)
  gui: 8
  // 壬(8)
};
function getHourStem(dayStem, hourBranchIndex) {
  const start = HOUR_STEM_START[dayStem];
  const idx = (start + hourBranchIndex) % 10;
  return INDEX_TO_STEM[idx];
}
function getHourBranch(hour) {
  const branchIndex = Math.floor((hour + 1) % 24 / 2);
  return INDEX_TO_BRANCH[branchIndex];
}
function getSexagenaryPosition(year) {
  return ((year - 4) % 60 + 60) % 60;
}
function isBeforeLichun(year, month, day) {
  if (month < 2) return true;
  if (month === 2 && day < 4) return true;
  return false;
}
function getLunarYearForPillars(year, month, day) {
  return isBeforeLichun(year, month, day) ? year - 1 : year;
}
var STEM_NAMES = {
  jia: { zh: "\u7532", en: "Jia", yinYang: "yang" },
  yi: { zh: "\u4E59", en: "Yi", yinYang: "yin" },
  bing: { zh: "\u4E19", en: "Bing", yinYang: "yang" },
  ding: { zh: "\u4E01", en: "Ding", yinYang: "yin" },
  wu: { zh: "\u620A", en: "Wu", yinYang: "yang" },
  ji: { zh: "\u5DF1", en: "Ji", yinYang: "yin" },
  geng: { zh: "\u5E9A", en: "Geng", yinYang: "yang" },
  xin: { zh: "\u8F9B", en: "Xin", yinYang: "yin" },
  ren: { zh: "\u58EC", en: "Ren", yinYang: "yang" },
  gui: { zh: "\u7678", en: "Gui", yinYang: "yin" }
};
var BRANCH_NAMES = {
  zi: { zh: "\u5B50", en: "Zi", animal: "Rat" },
  chou: { zh: "\u4E11", en: "Chou", animal: "Ox" },
  yin: { zh: "\u5BC5", en: "Yin", animal: "Tiger" },
  mao: { zh: "\u536F", en: "Mao", animal: "Rabbit" },
  chen: { zh: "\u8FB0", en: "Chen", animal: "Dragon" },
  si: { zh: "\u5DF3", en: "Si", animal: "Snake" },
  wu: { zh: "\u5348", en: "Wu", animal: "Horse" },
  wei: { zh: "\u672A", en: "Wei", animal: "Goat" },
  shen: { zh: "\u7533", en: "Shen", animal: "Monkey" },
  you: { zh: "\u9149", en: "You", animal: "Rooster" },
  xu: { zh: "\u620C", en: "Xu", animal: "Dog" },
  hai: { zh: "\u4EA5", en: "Hai", animal: "Pig" }
};

// src/chart/four-pillars.ts
function calculateFourPillars(input) {
  const { year, month, day, hour } = input;
  const lunarYear = getLunarYearForPillars(year, month, day);
  const yearStem = getYearStem(lunarYear);
  const yearBranch = getYearBranch(lunarYear);
  const solarMonthIdx = getSolarMonthForPillar(year, month, day);
  const monthStem = getMonthStem(yearStem, solarMonthIdx);
  const monthBranch = getMonthBranch(solarMonthIdx);
  const { stem: dayStem, branch: dayBranch } = calculateDayPillar(year, month, day);
  const hourBranch = getHourBranch(hour);
  const hourBranchIdx = { zi: 0, chou: 1, yin: 2, mao: 3, chen: 4, si: 5, wu: 6, wei: 7, shen: 8, you: 9, xu: 10, hai: 11 }[hourBranch];
  const hourStem = getHourStem(dayStem, hourBranchIdx);
  return {
    year: { stem: yearStem, branch: yearBranch },
    month: { stem: monthStem, branch: monthBranch },
    day: { stem: dayStem, branch: dayBranch },
    hour: { stem: hourStem, branch: hourBranch }
  };
}
function getSolarMonthForPillar(_year, month, day) {
  const termStarts = {
    1: { day: 6, solarMonth: 12 },
    // 小寒 ~Jan 6 → 丑月
    2: { day: 4, solarMonth: 1 },
    // 立春 ~Feb 4 → 寅月
    3: { day: 6, solarMonth: 2 },
    // 驚蟄 ~Mar 6 → 卯月
    4: { day: 5, solarMonth: 3 },
    // 清明 ~Apr 5 → 辰月
    5: { day: 6, solarMonth: 4 },
    // 立夏 ~May 6 → 巳月
    6: { day: 6, solarMonth: 5 },
    // 芒種 ~Jun 6 → 午月
    7: { day: 7, solarMonth: 6 },
    // 小暑 ~Jul 7 → 未月
    8: { day: 8, solarMonth: 7 },
    // 立秋 ~Aug 8 → 申月
    9: { day: 8, solarMonth: 8 },
    // 白露 ~Sep 8 → 酉月
    10: { day: 8, solarMonth: 9 },
    // 寒露 ~Oct 8 → 戌月
    11: { day: 7, solarMonth: 10 },
    // 立冬 ~Nov 7 → 亥月
    12: { day: 7, solarMonth: 11 }
    // 大雪 ~Dec 7 → 子月
  };
  const entry = termStarts[month];
  if (!entry) return month;
  if (day >= entry.day) {
    return entry.solarMonth;
  }
  const prev = termStarts[month === 1 ? 12 : month - 1];
  return prev ? prev.solarMonth : month - 1 || 12;
}
function calculateDayPillar(year, month, day) {
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;
  let jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  const epochJdn = 2415021;
  const daysDiff = jdn - epochJdn;
  const stemIdx = ((0 + daysDiff) % 10 + 10) % 10;
  const branchIdx = ((10 + daysDiff) % 12 + 12) % 12;
  const STEM_MAP = {
    0: "jia",
    1: "yi",
    2: "bing",
    3: "ding",
    4: "wu",
    5: "ji",
    6: "geng",
    7: "xin",
    8: "ren",
    9: "gui"
  };
  const BRANCH_MAP = {
    0: "zi",
    1: "chou",
    2: "yin",
    3: "mao",
    4: "chen",
    5: "si",
    6: "wu",
    7: "wei",
    8: "shen",
    9: "you",
    10: "xu",
    11: "hai"
  };
  return {
    stem: STEM_MAP[stemIdx],
    branch: BRANCH_MAP[branchIdx]
  };
}
function formatFourPillars(pillars) {
  const fmt = (s, b) => `${STEM_NAMES[s].zh}${BRANCH_NAMES[b].zh}(${STEM_NAMES[s].en} ${BRANCH_NAMES[b].animal})`;
  return [
    `Year:  ${fmt(pillars.year.stem, pillars.year.branch)}`,
    `Month: ${fmt(pillars.month.stem, pillars.month.branch)}`,
    `Day:   ${fmt(pillars.day.stem, pillars.day.branch)}`,
    `Hour:  ${fmt(pillars.hour.stem, pillars.hour.branch)}`
  ].join("\n");
}

// src/chart/ming-palace.ts
function calculateMingPalace(lunarMonth, hourBranch) {
  const hourIndex = { zi: 0, chou: 1, yin: 2, mao: 3, chen: 4, si: 5, wu: 6, wei: 7, shen: 8, you: 9, xu: 10, hai: 11 }[hourBranch];
  const mingIdx = (2 + lunarMonth - hourIndex + 12) % 12;
  return mingIdx;
}
function calculateShenPalace(lunarMonth, hourBranch) {
  const hourIndex = { zi: 0, chou: 1, yin: 2, mao: 3, chen: 4, si: 5, wu: 6, wei: 7, shen: 8, you: 9, xu: 10, hai: 11 }[hourBranch];
  const shenIdx = (2 + lunarMonth + hourIndex) % 12;
  return shenIdx;
}
function isYangYear(yearStemIndex) {
  return yearStemIndex % 2 === 0;
}
function getDecadeDirection(yearStemIndex, gender) {
  const yang = isYangYear(yearStemIndex);
  if (yang && gender === "male") return "clockwise";
  if (yang && gender === "female") return "counterclockwise";
  if (!yang && gender === "male") return "counterclockwise";
  return "clockwise";
}

// src/chart/twelve-palaces.ts
var PALACE_ORDER = [
  "ming",
  "xiongdi",
  "fuqi",
  "zinv",
  "caibo",
  "jie",
  "qianyi",
  "jiaoyou",
  "shiye",
  "tianzhai",
  "fude",
  "fumu"
];
function assignPalacesToBranches(mingBranchIndex) {
  const result = {};
  for (let i = 0; i < 12; i++) {
    const branchIdx = (mingBranchIndex - i + 12) % 12;
    result[branchIdx] = PALACE_ORDER[i];
  }
  return result;
}
function getPalaceAtBranch(mingBranchIndex, branchIndex) {
  const offset = (mingBranchIndex - branchIndex + 12) % 12;
  return PALACE_ORDER[offset];
}
function assignPalaceStems(yearStem) {
  const yinStem = getMonthStem(yearStem, 1);
  const result = {};
  for (let i = 0; i < 12; i++) {
    const branchIdx = (2 + i) % 12;
    const stemIdx = (getStemIndex(yinStem) + i) % 10;
    result[branchIdx] = INDEX_TO_STEM[stemIdx];
  }
  return result;
}
function getStemIndex(stem) {
  return { jia: 0, yi: 1, bing: 2, ding: 3, wu: 4, ji: 5, geng: 6, xin: 7, ren: 8, gui: 9 }[stem];
}
function getBranchForPalace(mingBranchIndex, palaceName) {
  const palaceIdx = PALACE_ORDER.indexOf(palaceName);
  return (mingBranchIndex - palaceIdx + 12) % 12;
}

// src/data/transformation-map.ts
var TRANSFORMATION_MAP = {
  jia: { lianzhen: "lu", pojun: "quan", wuqu: "ke", taiyang: "ji" },
  yi: { tianji: "lu", tianliang: "quan", ziwei: "ke", taiyin: "ji" },
  bing: { tiantong: "lu", tianji: "quan", wenchang: "ke", lianzhen: "ji" },
  ding: { taiyin: "lu", tiantong: "quan", tianji: "ke", jumen: "ji" },
  wu: { tanlang: "lu", taiyin: "quan", youbi: "ke", tianji: "ji" },
  ji: { wuqu: "lu", tanlang: "quan", tianliang: "ke", wenqu: "ji" },
  geng: { taiyang: "lu", wuqu: "quan", taiyin: "ke", tiantong: "ji" },
  xin: { jumen: "lu", taiyang: "quan", wenqu: "ke", wenchang: "ji" },
  ren: { tianliang: "lu", ziwei: "quan", zuofu: "ke", wuqu: "ji" },
  gui: { pojun: "lu", jumen: "quan", taiyin: "ke", tanlang: "ji" }
};
function getTransformations(yearStem) {
  const map = TRANSFORMATION_MAP[yearStem];
  return Object.entries(map).map(([starId, type]) => ({ starId, type }));
}
var TRANSFORMATION_NAMES = {
  lu: { zh: "\u5316\u797F", en: "Prosperity Transformation" },
  quan: { zh: "\u5316\u6B0A", en: "Authority Transformation" },
  ke: { zh: "\u5316\u79D1", en: "Fame Transformation" },
  ji: { zh: "\u5316\u5FCC", en: "Obstruction Transformation" }
};

// src/data/five-element-map.ts
var NA_YIN_TABLE = {
  // 甲 (jia) — index 0
  0: {
    0: { element: "metal", number: 4 },
    // 甲子
    1: { element: "metal", number: 4 },
    // 甲丑
    2: { element: "water", number: 2 },
    // 甲寅
    3: { element: "water", number: 2 },
    // 甲卯
    4: { element: "fire", number: 6 },
    // 甲辰
    5: { element: "fire", number: 6 },
    // 甲巳
    6: { element: "metal", number: 4 },
    // 甲午
    7: { element: "metal", number: 4 },
    // 甲未
    8: { element: "water", number: 2 },
    // 甲申
    9: { element: "water", number: 2 },
    // 甲酉
    10: { element: "fire", number: 6 },
    // 甲戌
    11: { element: "fire", number: 6 }
    // 甲亥
  },
  // 乙 (yi) — index 1
  1: {
    0: { element: "metal", number: 4 },
    // 乙子
    1: { element: "metal", number: 4 },
    // 乙丑
    2: { element: "water", number: 2 },
    // 乙寅
    3: { element: "water", number: 2 },
    // 乙卯
    4: { element: "fire", number: 6 },
    // 乙辰
    5: { element: "fire", number: 6 },
    // 乙巳
    6: { element: "metal", number: 4 },
    // 乙午
    7: { element: "metal", number: 4 },
    // 乙未
    8: { element: "water", number: 2 },
    // 乙申
    9: { element: "water", number: 2 },
    // 乙酉
    10: { element: "fire", number: 6 },
    // 乙戌
    11: { element: "fire", number: 6 }
    // 乙亥
  },
  // 丙 (bing) — index 2
  2: {
    0: { element: "water", number: 2 },
    // 丙子
    1: { element: "water", number: 2 },
    // 丙丑
    2: { element: "fire", number: 6 },
    // 丙寅
    3: { element: "fire", number: 6 },
    // 丙卯
    4: { element: "earth", number: 5 },
    // 丙辰
    5: { element: "earth", number: 5 },
    // 丙巳
    6: { element: "water", number: 2 },
    // 丙午
    7: { element: "water", number: 2 },
    // 丙未
    8: { element: "fire", number: 6 },
    // 丙申
    9: { element: "fire", number: 6 },
    // 丙酉
    10: { element: "earth", number: 5 },
    // 丙戌
    11: { element: "earth", number: 5 }
    // 丙亥
  },
  // 丁 (ding) — index 3
  3: {
    0: { element: "water", number: 2 },
    // 丁子
    1: { element: "water", number: 2 },
    // 丁丑
    2: { element: "fire", number: 6 },
    // 丁寅
    3: { element: "fire", number: 6 },
    // 丁卯
    4: { element: "earth", number: 5 },
    // 丁辰
    5: { element: "earth", number: 5 },
    // 丁巳
    6: { element: "water", number: 2 },
    // 丁午
    7: { element: "water", number: 2 },
    // 丁未
    8: { element: "fire", number: 6 },
    // 丁申
    9: { element: "fire", number: 6 },
    // 丁酉
    10: { element: "earth", number: 5 },
    // 丁戌
    11: { element: "earth", number: 5 }
    // 丁亥
  },
  // 戊 (wu) — index 4
  4: {
    0: { element: "fire", number: 6 },
    // 戊子
    1: { element: "fire", number: 6 },
    // 戊丑
    2: { element: "earth", number: 5 },
    // 戊寅
    3: { element: "earth", number: 5 },
    // 戊卯
    4: { element: "wood", number: 3 },
    // 戊辰
    5: { element: "wood", number: 3 },
    // 戊巳
    6: { element: "fire", number: 6 },
    // 戊午
    7: { element: "fire", number: 6 },
    // 戊未
    8: { element: "earth", number: 5 },
    // 戊申
    9: { element: "earth", number: 5 },
    // 戊酉
    10: { element: "wood", number: 3 },
    // 戊戌
    11: { element: "wood", number: 3 }
    // 戊亥
  },
  // 己 (ji) — index 5
  5: {
    0: { element: "fire", number: 6 },
    // 己子
    1: { element: "fire", number: 6 },
    // 己丑
    2: { element: "earth", number: 5 },
    // 己寅
    3: { element: "earth", number: 5 },
    // 己卯
    4: { element: "wood", number: 3 },
    // 己辰
    5: { element: "wood", number: 3 },
    // 己巳
    6: { element: "fire", number: 6 },
    // 己午
    7: { element: "fire", number: 6 },
    // 己未
    8: { element: "earth", number: 5 },
    // 己申
    9: { element: "earth", number: 5 },
    // 己酉
    10: { element: "wood", number: 3 },
    // 己戌
    11: { element: "wood", number: 3 }
    // 己亥
  },
  // 庚 (geng) — index 6
  6: {
    0: { element: "earth", number: 5 },
    // 庚子
    1: { element: "earth", number: 5 },
    // 庚丑
    2: { element: "wood", number: 3 },
    // 庚寅
    3: { element: "wood", number: 3 },
    // 庚卯
    4: { element: "metal", number: 4 },
    // 庚辰
    5: { element: "metal", number: 4 },
    // 庚巳
    6: { element: "earth", number: 5 },
    // 庚午
    7: { element: "earth", number: 5 },
    // 庚未
    8: { element: "wood", number: 3 },
    // 庚申
    9: { element: "wood", number: 3 },
    // 庚酉
    10: { element: "metal", number: 4 },
    // 庚戌
    11: { element: "metal", number: 4 }
    // 庚亥
  },
  // 辛 (xin) — index 7
  7: {
    0: { element: "earth", number: 5 },
    // 辛子
    1: { element: "earth", number: 5 },
    // 辛丑
    2: { element: "wood", number: 3 },
    // 辛寅
    3: { element: "wood", number: 3 },
    // 辛卯
    4: { element: "metal", number: 4 },
    // 辛辰
    5: { element: "metal", number: 4 },
    // 辛巳
    6: { element: "earth", number: 5 },
    // 辛午
    7: { element: "earth", number: 5 },
    // 辛未
    8: { element: "wood", number: 3 },
    // 辛申
    9: { element: "wood", number: 3 },
    // 辛酉
    10: { element: "metal", number: 4 },
    // 辛戌
    11: { element: "metal", number: 4 }
    // 辛亥
  },
  // 壬 (ren) — index 8
  8: {
    0: { element: "wood", number: 3 },
    // 壬子
    1: { element: "wood", number: 3 },
    // 壬丑
    2: { element: "metal", number: 4 },
    // 壬寅
    3: { element: "metal", number: 4 },
    // 壬卯
    4: { element: "water", number: 2 },
    // 壬辰
    5: { element: "water", number: 2 },
    // 壬巳
    6: { element: "wood", number: 3 },
    // 壬午
    7: { element: "wood", number: 3 },
    // 壬未
    8: { element: "metal", number: 4 },
    // 壬申
    9: { element: "metal", number: 4 },
    // 壬酉
    10: { element: "water", number: 2 },
    // 壬戌
    11: { element: "water", number: 2 }
    // 壬亥
  },
  // 癸 (gui) — index 9
  9: {
    0: { element: "wood", number: 3 },
    // 癸子
    1: { element: "wood", number: 3 },
    // 癸丑
    2: { element: "metal", number: 4 },
    // 癸寅
    3: { element: "metal", number: 4 },
    // 癸卯
    4: { element: "water", number: 2 },
    // 癸辰
    5: { element: "water", number: 2 },
    // 癸巳
    6: { element: "wood", number: 3 },
    // 癸午
    7: { element: "wood", number: 3 },
    // 癸未
    8: { element: "metal", number: 4 },
    // 癸申
    9: { element: "metal", number: 4 },
    // 癸酉
    10: { element: "water", number: 2 },
    // 癸戌
    11: { element: "water", number: 2 }
    // 癸亥
  }
};
function getFiveElementBureau(stem, branch) {
  const stemIdx = { jia: 0, yi: 1, bing: 2, ding: 3, wu: 4, ji: 5, geng: 6, xin: 7, ren: 8, gui: 9 }[stem];
  const branchIdx = { zi: 0, chou: 1, yin: 2, mao: 3, chen: 4, si: 5, wu: 6, wei: 7, shen: 8, you: 9, xu: 10, hai: 11 }[branch];
  return NA_YIN_TABLE[stemIdx][branchIdx];
}

// src/data/star-brightness.ts
var BRIGHTNESS_TABLE = {
  ziwei: {
    zi: "ping",
    chou: "miao",
    yin: "miao",
    mao: "wang",
    chen: "miao",
    si: "wang",
    wu: "miao",
    wei: "miao",
    shen: "wang",
    you: "wang",
    xu: "de",
    hai: "wang"
  },
  tianji: {
    zi: "wang",
    chou: "xian",
    yin: "de",
    mao: "wang",
    chen: "li",
    si: "wang",
    wu: "wang",
    wei: "miao",
    shen: "xian",
    you: "wang",
    xu: "xian",
    hai: "de"
  },
  taiyang: {
    zi: "xian",
    chou: "xian",
    yin: "wang",
    mao: "miao",
    chen: "wang",
    si: "wang",
    wu: "miao",
    wei: "de",
    shen: "de",
    you: "ping",
    xu: "xian",
    hai: "xian"
  },
  wuqu: {
    zi: "wang",
    chou: "miao",
    yin: "de",
    mao: "li",
    chen: "miao",
    si: "wang",
    wu: "wang",
    wei: "miao",
    shen: "de",
    you: "wang",
    xu: "wang",
    hai: "xian"
  },
  tiantong: {
    zi: "wang",
    chou: "xian",
    yin: "li",
    mao: "wang",
    chen: "ping",
    si: "miao",
    wu: "xian",
    wei: "xian",
    shen: "de",
    you: "ping",
    xu: "wang",
    hai: "miao"
  },
  lianzhen: {
    zi: "ping",
    chou: "xian",
    yin: "miao",
    mao: "ping",
    chen: "miao",
    si: "xian",
    wu: "ping",
    wei: "miao",
    shen: "de",
    you: "ping",
    xu: "wang",
    hai: "xian"
  },
  tianfu: {
    zi: "wang",
    chou: "miao",
    yin: "de",
    mao: "li",
    chen: "miao",
    si: "wang",
    wu: "wang",
    wei: "de",
    shen: "de",
    you: "wang",
    xu: "miao",
    hai: "de"
  },
  taiyin: {
    zi: "wang",
    chou: "miao",
    yin: "xian",
    mao: "xian",
    chen: "xian",
    si: "xian",
    wu: "ping",
    wei: "de",
    shen: "wang",
    you: "miao",
    xu: "wang",
    hai: "miao"
  },
  tanlang: {
    zi: "wang",
    chou: "wang",
    yin: "ping",
    mao: "ping",
    chen: "ping",
    si: "xian",
    wu: "ping",
    wei: "wang",
    shen: "ping",
    you: "ping",
    xu: "miao",
    hai: "xian"
  },
  jumen: {
    zi: "wang",
    chou: "xian",
    yin: "ping",
    mao: "miao",
    chen: "xian",
    si: "wang",
    wu: "ping",
    wei: "xian",
    shen: "ping",
    you: "miao",
    xu: "xian",
    hai: "wang"
  },
  tianxiang: {
    zi: "wang",
    chou: "miao",
    yin: "miao",
    mao: "xian",
    chen: "de",
    si: "xian",
    wu: "de",
    wei: "de",
    shen: "miao",
    you: "xian",
    xu: "de",
    hai: "de"
  },
  tianliang: {
    zi: "wang",
    chou: "miao",
    yin: "de",
    mao: "wang",
    chen: "miao",
    si: "xian",
    wu: "miao",
    wei: "de",
    shen: "xian",
    you: "wang",
    xu: "miao",
    hai: "xian"
  },
  qisha: {
    zi: "wang",
    chou: "miao",
    yin: "miao",
    mao: "miao",
    chen: "xian",
    si: "xian",
    wu: "miao",
    wei: "de",
    shen: "de",
    you: "wang",
    xu: "xian",
    hai: "ping"
  },
  pojun: {
    zi: "wang",
    chou: "xian",
    yin: "de",
    mao: "xian",
    chen: "wang",
    si: "ping",
    wu: "miao",
    wei: "wang",
    shen: "xian",
    you: "ping",
    xu: "xian",
    hai: "ping"
  }
};
function getStarBrightness(starId, branch) {
  const row = BRIGHTNESS_TABLE[starId];
  if (!row) return "ping";
  return row[branch] ?? "ping";
}
var BRIGHTNESS_COLORS = {
  miao: "#dc2626",
  // red — maximum
  wang: "#ea580c",
  // orange — prosperous
  de: "#ca8a04",
  // yellow — attained
  li: "#16a34a",
  // green — beneficial
  ping: "#6b7280",
  // gray — neutral
  bu: "#4b5563",
  // dark gray — not favorable
  xian: "#1f2937"
  // nearly black — trapped
};
var BRIGHTNESS_LABELS = {
  miao: { zh: "\u5EDF", en: "Max Brightness" },
  wang: { zh: "\u65FA", en: "Prosperous" },
  de: { zh: "\u5F97", en: "Attained" },
  li: { zh: "\u5229", en: "Beneficial" },
  ping: { zh: "\u5E73", en: "Neutral" },
  bu: { zh: "\u4E0D", en: "Unfavorable" },
  xian: { zh: "\u9677", en: "Trapped" }
};

// src/data/star-definitions.ts
var MAJOR_STARS = [
  // === Ziwei Group (紫微系) ===
  {
    id: "ziwei",
    nameZh: "\u7D2B\u5FAE",
    nameEn: "The Emperor (Zi-Wei)",
    type: "major",
    category: "ziwei_group",
    element: "earth",
    descriptionEn: "The sovereign of all stars. Supreme authority, leadership, and nobility \u2014 the archetype of the dignified ruler.",
    descriptionZh: "\u5317\u6597\u5E1D\u738B\u661F\uFF0C\u4E3B\u6B0A\u8CB4\u3001\u9818\u5C0E\u3001\u5C0A\u8CB4\uFF0C\u5316\u6C23\u70BA\u5C0A\u3002"
  },
  {
    id: "tianji",
    nameZh: "\u5929\u6A5F",
    nameEn: "The Strategist (Tian-Ji)",
    type: "major",
    category: "ziwei_group",
    element: "wood",
    descriptionEn: "Master of strategy, calculation, and mental agility. The archetype of the brilliant advisor and behind-the-scenes planner.",
    descriptionZh: "\u5357\u6597\u5584\u661F\uFF0C\u4E3B\u667A\u6167\u3001\u8B00\u7565\u3001\u8B8A\u52D5\uFF0C\u5316\u6C23\u70BA\u5584\u3002"
  },
  {
    id: "taiyang",
    nameZh: "\u592A\u967D",
    nameEn: "The Sun (Tai-Yang)",
    type: "major",
    category: "ziwei_group",
    element: "fire",
    descriptionEn: "Radiance, generosity, and public visibility. Embodies masculine energy, fame, and an outgoing charismatic presence.",
    descriptionZh: "\u4E2D\u5929\u5409\u661F\uFF0C\u4E3B\u5149\u660E\u3001\u535A\u611B\u3001\u540D\u671B\uFF0C\u5316\u6C23\u70BA\u8CB4\u3002"
  },
  {
    id: "wuqu",
    nameZh: "\u6B66\u66F2",
    nameEn: "The Finance Marshal (Wu-Qu)",
    type: "major",
    category: "ziwei_group",
    element: "metal",
    descriptionEn: "Financial mastery, discipline, and decisive action. The archetype of wealth management paired with a military spirit.",
    descriptionZh: "\u5317\u6597\u6B63\u661F\uFF0C\u4E3B\u8CA1\u5BCC\u3001\u6C7A\u65B7\u3001\u525B\u6BC5\uFF0C\u5316\u6C23\u70BA\u8CA1\u3002"
  },
  {
    id: "tiantong",
    nameZh: "\u5929\u540C",
    nameEn: "The Child of Heaven (Tian-Tong)",
    type: "major",
    category: "ziwei_group",
    element: "water",
    descriptionEn: "Natural harmony, leisure, and artistic grace. Embraces contentment, easy-going charm, and the enjoyment of life's pleasures.",
    descriptionZh: "\u5357\u6597\u5584\u661F\uFF0C\u4E3B\u6EAB\u548C\u3001\u4EAB\u798F\u3001\u85DD\u8853\uFF0C\u5316\u6C23\u70BA\u798F\u3002"
  },
  {
    id: "lianzhen",
    nameZh: "\u5EC9\u8C9E",
    nameEn: "The Chancellor (Lian-Zhen)",
    type: "major",
    category: "ziwei_group",
    element: "fire",
    descriptionEn: "A complex archetype of integrity, passion, and control. Can manifest as strict moral character or intense emotional depth \u2014 the diplomat who holds the prison keys.",
    descriptionZh: "\u5317\u6597\u6B63\u661F\uFF0C\u4E3B\u6E05\u5EC9\u3001\u8C9E\u7BC0\u3001\u56DA\u7981\uFF0C\u5316\u6C23\u70BA\u56DA\u3002"
  },
  // === Tianfu Group (天府系) ===
  {
    id: "tianfu",
    nameZh: "\u5929\u5E9C",
    nameEn: "The Sovereign Empress (Tian-Fu)",
    type: "major",
    category: "tianfu_group",
    element: "earth",
    descriptionEn: "The Southern Dipper's ruling star of territorial dominion. Stability, wealth accumulation, and protective grace \u2014 the archetype of the mother-ruler who commands and nurtures.",
    descriptionZh: "\u5357\u6597\u4E3B\u661F\uFF0C\u4E3B\u8CA1\u5EAB\u3001\u7A69\u5B9A\u3001\u5305\u5BB9\uFF0C\u5316\u6C23\u70BA\u5EAB\u3002"
  },
  {
    id: "taiyin",
    nameZh: "\u592A\u9670",
    nameEn: "The Moon (Tai-Yin)",
    type: "major",
    category: "tianfu_group",
    element: "water",
    descriptionEn: "Feminine grace, beauty, intuition, and real estate fortune. Embodies emotional depth, passive wealth, and magnetic allure.",
    descriptionZh: "\u4E2D\u5929\u5409\u661F\uFF0C\u4E3B\u6EAB\u67D4\u3001\u7F8E\u9E97\u3001\u623F\u7522\uFF0C\u5316\u6C23\u70BA\u5BCC\u3002"
  },
  {
    id: "tanlang",
    nameZh: "\u8CAA\u72FC",
    nameEn: "The Ambitious Wolf (Tan-Lang)",
    type: "major",
    category: "tianfu_group",
    element: "wood",
    descriptionEn: "The archetype of limitless desire and magnetic charisma. A master of social dynamics, entertainment, attraction, and the relentless pursuit of pleasure and power.",
    descriptionZh: "\u5317\u6597\u6B63\u661F\uFF0C\u4E3B\u617E\u671B\u3001\u4EA4\u969B\u3001\u6843\u82B1\uFF0C\u5316\u6C23\u70BA\u6843\u82B1\u3002"
  },
  {
    id: "jumen",
    nameZh: "\u5DE8\u9580",
    nameEn: "The Gate of Shadows (Ju-Men)",
    type: "major",
    category: "tianfu_group",
    element: "water",
    descriptionEn: "The archetype of hidden truths and verbal power. Mastery of communication, investigation, and argument \u2014 but also the keeper of secrets and the source of litigation.",
    descriptionZh: "\u5317\u6597\u6B63\u661F\uFF0C\u4E3B\u53E3\u624D\u3001\u662F\u975E\u3001\u6697\u6627\uFF0C\u5316\u6C23\u70BA\u6697\u3002"
  },
  {
    id: "tianxiang",
    nameZh: "\u5929\u76F8",
    nameEn: "The Minister of State (Tian-Xiang)",
    type: "major",
    category: "tianfu_group",
    element: "water",
    descriptionEn: "Diplomatic service, unwavering loyalty, and refined public image. The archetype of the trusted official who serves with grace and protects the seal of authority.",
    descriptionZh: "\u5357\u6597\u5584\u661F\uFF0C\u4E3B\u670D\u52D9\u3001\u5FE0\u8AA0\u3001\u5916\u8868\uFF0C\u5316\u6C23\u70BA\u5370\u3002"
  },
  {
    id: "tianliang",
    nameZh: "\u5929\u6881",
    nameEn: "The Guardian Elder (Tian-Liang)",
    type: "major",
    category: "tianfu_group",
    element: "earth",
    descriptionEn: "Longevity, wisdom, and benevolent protection. The archetype of the wise mentor and guardian who shelters others through life's storms.",
    descriptionZh: "\u5357\u6597\u5584\u661F\uFF0C\u4E3B\u9577\u58FD\u3001\u667A\u6167\u3001\u6148\u60B2\uFF0C\u5316\u6C23\u70BA\u852D\u3002"
  },
  {
    id: "qisha",
    nameZh: "\u4E03\u6BBA",
    nameEn: "The Seven Killings (Qi-Sha)",
    type: "major",
    category: "tianfu_group",
    element: "metal",
    descriptionEn: "Raw power, entrepreneurial daring, and fierce independence. The archetype of the warrior-leader who takes bold risks and commands through sheer force of will.",
    descriptionZh: "\u5357\u6597\u6B63\u661F\uFF0C\u4E3B\u6B0A\u529B\u3001\u679C\u65B7\u3001\u98A8\u96AA\uFF0C\u5316\u6C23\u70BA\u6BBA\u3002"
  },
  {
    id: "pojun",
    nameZh: "\u7834\u8ECD",
    nameEn: "The Army Breaker (Po-Jun)",
    type: "major",
    category: "tianfu_group",
    element: "water",
    descriptionEn: "Creative destruction for renewal. The archetype of the innovator and rebel who shatters old structures to forge new orders from the wreckage.",
    descriptionZh: "\u5317\u6597\u6B63\u661F\uFF0C\u4E3B\u7834\u820A\u7ACB\u65B0\u3001\u6539\u9769\u3001\u7834\u58DE\uFF0C\u5316\u6C23\u70BA\u8017\u3002"
  }
];
var AUXILIARY_STARS = [
  // Month-based (月系星)
  {
    id: "zuofu",
    nameZh: "\u5DE6\u8F14",
    nameEn: "The Left Aide (Zuo-Fu)",
    type: "auxiliary",
    category: "month_star",
    element: "earth",
    descriptionEn: "Noble benefactor support \u2014 helpful colleagues and visible allies who lift your path.",
    descriptionZh: "\u6708\u7CFB\u5409\u661F\uFF0C\u4E3B\u8CB4\u4EBA\u76F8\u52A9\u3001\u8F14\u4F50\u3002"
  },
  {
    id: "youbi",
    nameZh: "\u53F3\u5F3C",
    nameEn: "The Right Aide (You-Bi)",
    type: "auxiliary",
    category: "month_star",
    element: "earth",
    descriptionEn: "Hidden benefactors and behind-the-scenes assistance \u2014 complementary to the Left Aide.",
    descriptionZh: "\u6708\u7CFB\u5409\u661F\uFF0C\u4E3B\u6697\u4E2D\u76F8\u52A9\u3001\u8F14\u5F3C\u3002"
  },
  {
    id: "wenchang",
    nameZh: "\u6587\u660C",
    nameEn: "The Scholar (Wen-Chang)",
    type: "auxiliary",
    category: "hour_star",
    element: "metal",
    descriptionEn: "Academic excellence, literary brilliance, and examination success.",
    descriptionZh: "\u6642\u7CFB\u5409\u661F\uFF0C\u4E3B\u6587\u91C7\u3001\u79D1\u8209\u3001\u5B78\u8853\u3002"
  },
  {
    id: "wenqu",
    nameZh: "\u6587\u66F2",
    nameEn: "The Artist (Wen-Qu)",
    type: "auxiliary",
    category: "hour_star",
    element: "water",
    descriptionEn: "Artistic genius, eloquence, music, and creative expression.",
    descriptionZh: "\u6642\u7CFB\u5409\u661F\uFF0C\u4E3B\u85DD\u8853\u3001\u53E3\u624D\u3001\u97F3\u6A02\u3002"
  },
  // Hour-based (時系星)
  {
    id: "dijie",
    nameZh: "\u5730\u52AB",
    nameEn: "Earth Calamity (Di-Jie)",
    type: "auxiliary",
    category: "hour_star",
    element: "fire",
    descriptionEn: "Sudden setbacks, obstacles, and unexpected losses. A challenging force of disruption.",
    descriptionZh: "\u6642\u7CFB\u715E\u661F\uFF0C\u4E3B\u6CE2\u6298\u3001\u52AB\u96E3\u3001\u640D\u5931\u3002"
  },
  {
    id: "dikong",
    nameZh: "\u5730\u7A7A",
    nameEn: "Earth Void (Di-Kong)",
    type: "auxiliary",
    category: "hour_star",
    element: "fire",
    descriptionEn: "Emptiness, idealism, detachment from reality \u2014 the spiritual seeker or the impractical dreamer.",
    descriptionZh: "\u6642\u7CFB\u715E\u661F\uFF0C\u4E3B\u7A7A\u865B\u3001\u5E7B\u60F3\u3001\u4E0D\u5207\u5BE6\u969B\u3002"
  },
  // Stem-based (干系星)
  {
    id: "lucun",
    nameZh: "\u797F\u5B58",
    nameEn: "The Hoard (Lu-Cun)",
    type: "auxiliary",
    category: "stem_star",
    element: "earth",
    descriptionEn: "Accumulated wealth, stable preservation, and steady material growth.",
    descriptionZh: "\u5E72\u7CFB\u5409\u661F\uFF0C\u4E3B\u7A4D\u84C4\u3001\u7A69\u5B9A\u8CA1\u5BCC\u3002"
  },
  {
    id: "qingyang",
    nameZh: "\u64CE\u7F8A",
    nameEn: "The Blade (Qing-Yang)",
    type: "auxiliary",
    category: "stem_star",
    element: "metal",
    descriptionEn: "Sharp conflicts, acute competition, and cutting-edge aggression \u2014 a Mars-like force.",
    descriptionZh: "\u5E72\u7CFB\u715E\u661F\uFF0C\u4E3B\u722D\u9B25\u3001\u50B7\u5BB3\u3001\u7AF6\u722D\u3002"
  },
  {
    id: "tuoluo",
    nameZh: "\u9640\u7F85",
    nameEn: "The Spiral (Tuo-Luo)",
    type: "auxiliary",
    category: "stem_star",
    element: "metal",
    descriptionEn: "Chronic delays, entanglements, and situations that drag on \u2014 the karmic drag.",
    descriptionZh: "\u5E72\u7CFB\u715E\u661F\uFF0C\u4E3B\u62D6\u5EF6\u3001\u7CFE\u7E8F\u3001\u6162\u6027\u554F\u984C\u3002"
  },
  // Branch-based (支系星)
  {
    id: "tianma",
    nameZh: "\u5929\u99AC",
    nameEn: "The Heavenly Horse (Tian-Ma)",
    type: "auxiliary",
    category: "branch_star",
    element: "fire",
    descriptionEn: "Constant movement, travel, speed \u2014 a restless, mobile life of perpetual motion.",
    descriptionZh: "\u652F\u7CFB\u5409\u661F\uFF0C\u4E3B\u5954\u8D70\u3001\u65C5\u884C\u3001\u8B8A\u52D5\u3002"
  },
  {
    id: "tiankui",
    nameZh: "\u5929\u9B41",
    nameEn: "The Heavenly Leader (Tian-Kui)",
    type: "auxiliary",
    category: "stem_star",
    element: "fire",
    descriptionEn: "Noble patronage from above \u2014 mentoring, upward mobility, and recognition from superiors.",
    descriptionZh: "\u5E72\u7CFB\u5409\u661F\uFF0C\u4E3B\u8CB4\u4EBA\u63D0\u62D4\u3001\u4E0A\u7D1A\u8CDE\u8B58\u3002"
  },
  {
    id: "tianyue",
    nameZh: "\u5929\u925E",
    nameEn: "The Heavenly Battle-Axe (Tian-Yue)",
    type: "auxiliary",
    category: "stem_star",
    element: "fire",
    descriptionEn: "Grassroots support from peers and subordinates \u2014 the power of horizontal loyalty.",
    descriptionZh: "\u5E72\u7CFB\u5409\u661F\uFF0C\u4E3B\u5E73\u8F29\u76F8\u52A9\u3001\u4E0B\u7D1A\u652F\u6301\u3002"
  },
  {
    id: "huoxing",
    nameZh: "\u706B\u661F",
    nameEn: "Mars Fire (Huo-Xing)",
    type: "auxiliary",
    category: "hour_star",
    element: "fire",
    descriptionEn: "Sudden explosive energy \u2014 impulsiveness and rapid but unstable transformation.",
    descriptionZh: "\u6642\u7CFB\u715E\u661F\uFF0C\u4E3B\u706B\u707D\u3001\u7A81\u767C\u3001\u6025\u8E81\u3002"
  },
  {
    id: "lingxing",
    nameZh: "\u9234\u661F",
    nameEn: "Saturn Bell (Ling-Xing)",
    type: "auxiliary",
    category: "hour_star",
    element: "fire",
    descriptionEn: "Slow-burning anxiety, hidden worries, and accumulated stress \u2014 the smoldering warning.",
    descriptionZh: "\u6642\u7CFB\u715E\u661F\uFF0C\u4E3B\u6697\u6182\u3001\u7A4D\u7D2F\u58D3\u529B\u3001\u6162\u6027\u56F0\u64FE\u3002"
  },
  // Additional auxiliary stars
  {
    id: "tianxing",
    nameZh: "\u5929\u5211",
    nameEn: "Heavenly Punishment (Tian-Xing)",
    type: "auxiliary",
    category: "branch_star",
    element: "fire",
    descriptionEn: "Legal entanglements, discipline, and surgical intervention \u2014 encounters with law or the knife.",
    descriptionZh: "\u652F\u7CFB\u661F\uFF0C\u4E3B\u5211\u7F70\u3001\u6CD5\u5F8B\u3001\u624B\u8853\u3002"
  },
  {
    id: "tianyao",
    nameZh: "\u5929\u59DA",
    nameEn: "Heavenly Allure (Tian-Yao)",
    type: "auxiliary",
    category: "branch_star",
    element: "water",
    descriptionEn: "Romantic magnetism, seductive charm, and fated relationship encounters.",
    descriptionZh: "\u652F\u7CFB\u661F\uFF0C\u4E3B\u6843\u82B1\u3001\u5AF5\u5A9A\u3001\u611F\u60C5\u6A5F\u9047\u3002"
  },
  {
    id: "tianku",
    nameZh: "\u5929\u54ED",
    nameEn: "Heavenly Weeping (Tian-Ku)",
    type: "auxiliary",
    category: "branch_star",
    element: "water",
    descriptionEn: "Deep emotional sensitivity \u2014 periods of sorrow, grief, and cathartic release.",
    descriptionZh: "\u652F\u7CFB\u661F\uFF0C\u4E3B\u60B2\u50B7\u3001\u54ED\u6CE3\u3001\u60C5\u7DD2\u654F\u611F\u3002"
  }
];
var ALL_STAR_DEFINITIONS = [...MAJOR_STARS, ...AUXILIARY_STARS];
var STAR_BY_ID = {};
for (const star of ALL_STAR_DEFINITIONS) {
  STAR_BY_ID[star.id] = star;
}
var MAJOR_STAR_IDS = new Set(MAJOR_STARS.map((s) => s.id));
var AUXILIARY_STAR_IDS = new Set(AUXILIARY_STARS.map((s) => s.id));

// src/calendar/solar-lunar.ts
import { calendar } from "iztro";
function solarToLunar(year, month, day, hour = 0) {
  const dateStr = `${year}-${month}-${day}`;
  const timeIndex = Math.floor((hour + 1) % 24 / 2);
  const lunarData = calendar.solar2lunar(dateStr);
  const sbData = calendar.getHeavenlyStemAndEarthlyBranchBySolarDate(
    dateStr,
    timeIndex
  );
  const yearStem = parseStem(sbData.yearly[0]) ?? "jia";
  const yearBranch = parseBranch(sbData.yearly[1]) ?? "zi";
  const monthStem = parseStem(sbData.monthly[0]) ?? "jia";
  const monthBranch = parseBranch(sbData.monthly[1]) ?? "zi";
  const dayStem = parseStem(sbData.daily[0]) ?? "jia";
  const dayBranch = parseBranch(sbData.daily[1]) ?? "zi";
  const hourBranch = parseBranch(sbData.hourly[1]) ?? getHourBranch(hour);
  return {
    year: lunarData.lunarYear,
    month: lunarData.lunarMonth,
    day: lunarData.lunarDay,
    isLeapMonth: lunarData.isLeap,
    yearStem,
    yearBranch,
    monthStem,
    monthBranch,
    dayStem,
    dayBranch,
    hourBranch
  };
}
var STEM_CHARS = {
  "\u7532": "jia",
  "\u4E59": "yi",
  "\u4E19": "bing",
  "\u4E01": "ding",
  "\u620A": "wu",
  "\u5DF1": "ji",
  "\u5E9A": "geng",
  "\u8F9B": "xin",
  "\u58EC": "ren",
  "\u7678": "gui"
};
var BRANCH_CHARS = {
  "\u5B50": "zi",
  "\u4E11": "chou",
  "\u5BC5": "yin",
  "\u536F": "mao",
  "\u8FB0": "chen",
  "\u5DF3": "si",
  "\u5348": "wu",
  "\u672A": "wei",
  "\u7533": "shen",
  "\u9149": "you",
  "\u620C": "xu",
  "\u4EA5": "hai"
};
function parseStem(char) {
  return STEM_CHARS[char] ?? null;
}
function parseBranch(char) {
  return BRANCH_CHARS[char] ?? null;
}

// src/calendar/true-solar-time.ts
import { DateTime } from "luxon";
function calculateTrueSolarTime(input) {
  const { year, month, day, hour, minute, ianaTimeZone, longitude } = input;
  const localDt = DateTime.fromObject(
    { year, month, day, hour, minute },
    { zone: ianaTimeZone }
  );
  if (!localDt.isValid) {
    throw new Error(`Invalid date or timezone: ${localDt.invalidReason}`);
  }
  const utcOffsetMinutes = localDt.offset;
  const isDST = localDt.isInDST;
  const timezoneMeridian = utcOffsetMinutes / 60 * 15;
  const longitudeOffsetMinutes = Math.round((longitude - timezoneMeridian) * 4);
  const totalOffsetMinutes = longitudeOffsetMinutes;
  const trueSolarDt = localDt.plus({ minutes: totalOffsetMinutes });
  let dayShift = 0;
  const orig = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const next = trueSolarDt.toFormat("yyyy-MM-dd");
  if (next > orig) dayShift = 1;
  else if (next < orig) dayShift = -1;
  return {
    effectiveYear: trueSolarDt.year,
    effectiveMonth: trueSolarDt.month,
    effectiveDay: trueSolarDt.day,
    correctedHour: trueSolarDt.hour,
    correctedMinute: trueSolarDt.minute,
    dayShift,
    utcOffsetMinutes,
    longitudeOffsetMinutes,
    totalOffsetMinutes,
    isDST
  };
}
function getShichen(correctedHour) {
  const idx = Math.floor((correctedHour + 1) % 24 / 2);
  const names = {
    0: { zh: "\u5B50\u6642", en: "Zi (Rat) \u2014 23:00\u201300:59" },
    1: { zh: "\u4E11\u6642", en: "Chou (Ox) \u2014 01:00\u201302:59" },
    2: { zh: "\u5BC5\u6642", en: "Yin (Tiger) \u2014 03:00\u201304:59" },
    3: { zh: "\u536F\u6642", en: "Mao (Rabbit) \u2014 05:00\u201306:59" },
    4: { zh: "\u8FB0\u6642", en: "Chen (Dragon) \u2014 07:00\u201308:59" },
    5: { zh: "\u5DF3\u6642", en: "Si (Snake) \u2014 09:00\u201310:59" },
    6: { zh: "\u5348\u6642", en: "Wu (Horse) \u2014 11:00\u201312:59" },
    7: { zh: "\u672A\u6642", en: "Wei (Goat) \u2014 13:00\u201314:59" },
    8: { zh: "\u7533\u6642", en: "Shen (Monkey) \u2014 15:00\u201316:59" },
    9: { zh: "\u9149\u6642", en: "You (Rooster) \u2014 17:00\u201318:59" },
    10: { zh: "\u620C\u6642", en: "Xu (Dog) \u2014 19:00\u201320:59" },
    11: { zh: "\u4EA5\u6642", en: "Hai (Pig) \u2014 21:00\u201322:59" }
  };
  const entry = names[idx] ?? { zh: "?", en: "?" };
  return { index: idx, nameZh: entry.zh, nameEn: entry.en };
}
var WORLD_CITY_PRESETS = [
  // Asia
  { city: "Beijing", country: "China", ianaTimeZone: "Asia/Shanghai", longitude: 116.407 },
  { city: "Hong Kong", country: "Hong Kong", ianaTimeZone: "Asia/Hong_Kong", longitude: 114.169 },
  { city: "Taipei", country: "Taiwan", ianaTimeZone: "Asia/Taipei", longitude: 121.565 },
  { city: "Singapore", country: "Singapore", ianaTimeZone: "Asia/Singapore", longitude: 103.82 },
  { city: "Tokyo", country: "Japan", ianaTimeZone: "Asia/Tokyo", longitude: 139.692 },
  { city: "Seoul", country: "South Korea", ianaTimeZone: "Asia/Seoul", longitude: 126.978 },
  { city: "Shanghai", country: "China", ianaTimeZone: "Asia/Shanghai", longitude: 121.474 },
  { city: "Bangkok", country: "Thailand", ianaTimeZone: "Asia/Bangkok", longitude: 100.502 },
  { city: "Dubai", country: "UAE", ianaTimeZone: "Asia/Dubai", longitude: 55.271 },
  { city: "Mumbai", country: "India", ianaTimeZone: "Asia/Kolkata", longitude: 72.878 },
  { city: "Kuala Lumpur", country: "Malaysia", ianaTimeZone: "Asia/Kuala_Lumpur", longitude: 101.687 },
  // Europe
  { city: "London", country: "UK", ianaTimeZone: "Europe/London", longitude: -0.128 },
  { city: "Paris", country: "France", ianaTimeZone: "Europe/Paris", longitude: 2.352 },
  { city: "Berlin", country: "Germany", ianaTimeZone: "Europe/Berlin", longitude: 13.405 },
  { city: "Moscow", country: "Russia", ianaTimeZone: "Europe/Moscow", longitude: 37.618 },
  { city: "Rome", country: "Italy", ianaTimeZone: "Europe/Rome", longitude: 12.496 },
  { city: "Madrid", country: "Spain", ianaTimeZone: "Europe/Madrid", longitude: -3.704 },
  { city: "Amsterdam", country: "Netherlands", ianaTimeZone: "Europe/Amsterdam", longitude: 4.904 },
  { city: "Stockholm", country: "Sweden", ianaTimeZone: "Europe/Stockholm", longitude: 18.069 },
  { city: "Zurich", country: "Switzerland", ianaTimeZone: "Europe/Zurich", longitude: 8.542 },
  // North America
  { city: "New York", country: "USA", ianaTimeZone: "America/New_York", longitude: -74.006 },
  { city: "Los Angeles", country: "USA", ianaTimeZone: "America/Los_Angeles", longitude: -118.244 },
  { city: "Chicago", country: "USA", ianaTimeZone: "America/Chicago", longitude: -87.63 },
  { city: "Houston", country: "USA", ianaTimeZone: "America/Chicago", longitude: -95.37 },
  { city: "San Francisco", country: "USA", ianaTimeZone: "America/Los_Angeles", longitude: -122.419 },
  { city: "Toronto", country: "Canada", ianaTimeZone: "America/Toronto", longitude: -79.383 },
  { city: "Vancouver", country: "Canada", ianaTimeZone: "America/Vancouver", longitude: -123.121 },
  { city: "Mexico City", country: "Mexico", ianaTimeZone: "America/Mexico_City", longitude: -99.133 },
  // South America
  { city: "S\xE3o Paulo", country: "Brazil", ianaTimeZone: "America/Sao_Paulo", longitude: -46.633 },
  { city: "Buenos Aires", country: "Argentina", ianaTimeZone: "America/Argentina/Buenos_Aires", longitude: -58.382 },
  { city: "Santiago", country: "Chile", ianaTimeZone: "America/Santiago", longitude: -70.649 },
  // Oceania
  { city: "Sydney", country: "Australia", ianaTimeZone: "Australia/Sydney", longitude: 151.209 },
  { city: "Melbourne", country: "Australia", ianaTimeZone: "Australia/Melbourne", longitude: 144.963 },
  { city: "Brisbane", country: "Australia", ianaTimeZone: "Australia/Brisbane", longitude: 153.026 },
  { city: "Perth", country: "Australia", ianaTimeZone: "Australia/Perth", longitude: 115.861 },
  { city: "Auckland", country: "New Zealand", ianaTimeZone: "Pacific/Auckland", longitude: 174.764 },
  // Africa
  { city: "Cape Town", country: "South Africa", ianaTimeZone: "Africa/Johannesburg", longitude: 18.424 },
  { city: "Lagos", country: "Nigeria", ianaTimeZone: "Africa/Lagos", longitude: 3.379 },
  { city: "Nairobi", country: "Kenya", ianaTimeZone: "Africa/Nairobi", longitude: 36.822 }
];

// src/chart/chart-builder.ts
function calculateChartSync(birthData) {
  const { year, month, day, hour, minute, gender, ianaTimeZone, longitude } = birthData;
  const trueSolar = calculateTrueSolarTime({
    year,
    month,
    day,
    hour,
    minute,
    ianaTimeZone: ianaTimeZone ?? "Asia/Hong_Kong",
    longitude: longitude ?? 114.169
  });
  const effectiveYear = trueSolar.effectiveYear;
  const effectiveMonth = trueSolar.effectiveMonth;
  const effectiveDay = trueSolar.effectiveDay;
  const effectiveHour = trueSolar.correctedHour;
  const effectiveMinute = trueSolar.correctedMinute;
  const lunarDate = solarToLunar(effectiveYear, effectiveMonth, effectiveDay, effectiveHour);
  const fourPillars = calculateFourPillars({
    year: effectiveYear,
    month: effectiveMonth,
    day: effectiveDay,
    hour: effectiveHour
  });
  const timeIndex = hourToTimeIndex(effectiveHour);
  const iztroGender = gender === "male" ? "\u7537" : "\u5973";
  const iztroResult = astro.astrolabeBySolarDate(
    `${effectiveYear}-${effectiveMonth}-${effectiveDay}`,
    timeIndex,
    iztroGender
  );
  const iztroPalaces = iztroResult.palaces ?? [];
  let mingBranchIndex = 2;
  const iztroMingPalace = iztroPalaces.find((p) => {
    const n = p.name;
    return n === "\u547D\u5BAE" || n === "Destiny";
  });
  if (iztroMingPalace) {
    mingBranchIndex = branchNameToIndex(iztroMingPalace.earthlyBranch);
  }
  if (iztroResult.earthlyBranchOfSoulPalace) {
    mingBranchIndex = branchNameToIndex(iztroResult.earthlyBranchOfSoulPalace);
  }
  const shenBranchIndex = iztroResult.earthlyBranchOfBodyPalace ? branchNameToIndex(iztroResult.earthlyBranchOfBodyPalace) : calculateShenPalace(lunarDate.month, lunarDate.hourBranch);
  const palaceBranchMap = assignPalacesToBranches(mingBranchIndex);
  const branchStemMap = assignPalaceStems(fourPillars.year.stem);
  const mingStem = branchStemMap[mingBranchIndex];
  const mingBranch = INDEX_TO_BRANCH[mingBranchIndex];
  const fiveElementBureau = getFiveElementBureau(mingStem, mingBranch);
  const palaces = buildPalacesFromIztro(
    iztroPalaces,
    iztroResult,
    palaceBranchMap,
    branchStemMap,
    mingBranchIndex,
    shenBranchIndex,
    fourPillars.year.stem
  );
  const transformations = buildTransformations(palaces, fourPillars.year.stem);
  const decadeDirection = getDecadeDirection(
    STEM_INDEX[fourPillars.year.stem],
    gender
  );
  const decadeCycles = buildDecadeCycles(
    mingBranchIndex,
    fiveElementBureau.number,
    decadeDirection
  );
  for (const cycle of decadeCycles) {
    for (const palace of palaces) {
      const brIdx = palace.index;
      if (brIdx === cycle.palaceIndex) {
        palace.decadeCycle = cycle;
      }
    }
  }
  return {
    birthData,
    lunarDate,
    fourPillars,
    mingPalaceIndex: mingBranchIndex,
    shenPalaceIndex: shenBranchIndex,
    fiveElementBureau,
    palaces,
    transformations,
    decadeCycles,
    calculatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function calculateChart(birthData) {
  return calculateChartSync(birthData);
}
function hourToTimeIndex(hour) {
  return Math.floor((hour + 1) % 24 / 2);
}
function branchNameToIndex(name) {
  if (!name) return 2;
  const map = {
    "\u5B50": 0,
    "\u4E11": 1,
    "\u5BC5": 2,
    "\u536F": 3,
    "\u8FB0": 4,
    "\u5DF3": 5,
    "\u5348": 6,
    "\u672A": 7,
    "\u7533": 8,
    "\u9149": 9,
    "\u620C": 10,
    "\u4EA5": 11,
    "Zi": 0,
    "Chou": 1,
    "Yin": 2,
    "Mao": 3,
    "Chen": 4,
    "Si": 5,
    "Wu": 6,
    "Wei": 7,
    "Shen": 8,
    "You": 9,
    "Xu": 10,
    "Hai": 11
  };
  return map[name] ?? 2;
}
function starNameToId(name) {
  const map = {
    "\u7D2B\u5FAE": "ziwei",
    "\u5929\u6A5F": "tianji",
    "\u592A\u967D": "taiyang",
    "\u6B66\u66F2": "wuqu",
    "\u5929\u540C": "tiantong",
    "\u5EC9\u8C9E": "lianzhen",
    "\u5929\u5E9C": "tianfu",
    "\u592A\u9670": "taiyin",
    "\u8CAA\u72FC": "tanlang",
    "\u5DE8\u9580": "jumen",
    "\u5929\u76F8": "tianxiang",
    "\u5929\u6881": "tianliang",
    "\u4E03\u6BBA": "qisha",
    "\u7834\u8ECD": "pojun",
    "\u5DE6\u8F14": "zuofu",
    "\u53F3\u5F3C": "youbi",
    "\u6587\u660C": "wenchang",
    "\u6587\u66F2": "wenqu",
    "\u5730\u52AB": "dijie",
    "\u5730\u7A7A": "dikong",
    "\u797F\u5B58": "lucun",
    "\u64CE\u7F8A": "qingyang",
    "\u9640\u7F85": "tuoluo",
    "\u5929\u99AC": "tianma",
    "\u5929\u9B41": "tiankui",
    "\u5929\u925E": "tianyue",
    "\u706B\u661F": "huoxing",
    "\u9234\u661F": "lingxing",
    "\u5929\u5211": "tianxing",
    "\u5929\u59DA": "tianyao",
    "\u5929\u54ED": "tianku",
    // English names from iztro
    "Purple": "ziwei",
    "Sky": "tianji",
    "Sun": "taiyang",
    "Military": "wuqu",
    "Heavenly Unity": "tiantong",
    "Upright": "lianzhen",
    "Treasury": "tianfu",
    "Moon": "taiyin",
    "Greedy Wolf": "tanlang",
    "Great Gate": "jumen",
    "Minister": "tianxiang",
    "Heavenly Beam": "tianliang",
    "Seven Killings": "qisha",
    "Army Breaker": "pojun",
    "Left Assistant": "zuofu",
    "Right Aide": "youbi",
    "Literary": "wenchang",
    "Literary Music": "wenqu",
    "Earth Calamity": "dijie",
    "Earth Void": "dikong",
    "Preserved Blessing": "lucun",
    "Rising Goat": "qingyang",
    "Spinning Top": "tuoluo",
    "Heavenly Horse": "tianma",
    "Heavenly Leader": "tiankui",
    "Heavenly Battle-Axe": "tianyue",
    "Fire": "huoxing",
    "Bell": "lingxing",
    "Heavenly Punishment": "tianxing",
    "Heavenly Allure": "tianyao",
    "Heavenly Weeping": "tianku"
  };
  return map[name] ?? name.toLowerCase().replace(/\s+/g, "_");
}
function buildPalacesFromIztro(iztroPalaces, iztroResult, palaceBranchMap, branchStemMap, mingBranchIndex, shenBranchIndex, yearStem) {
  const palaces = [];
  const iztroByBranch = {};
  for (const p of iztroPalaces) {
    const idx = branchNameToIndex(p.earthlyBranch);
    iztroByBranch[idx] = p;
  }
  for (let branchIdx = 0; branchIdx < 12; branchIdx++) {
    const palaceName = palaceBranchMap[branchIdx];
    const stem = branchStemMap[branchIdx];
    const branch = INDEX_TO_BRANCH[branchIdx];
    const iztroPalace = iztroByBranch[branchIdx];
    const stars = extractStars(iztroPalace, branch);
    const majorStars = stars.filter((s) => MAJOR_STAR_IDS.has(s.id));
    const minorStars = stars.filter((s) => !MAJOR_STAR_IDS.has(s.id));
    palaces.push({
      index: branchIdx,
      name: palaceName,
      earthlyBranch: branch,
      heavenlyStem: stem,
      isMingPalace: branchIdx === mingBranchIndex,
      isShenPalace: branchIdx === shenBranchIndex,
      majorStars,
      minorStars,
      stars
    });
  }
  return palaces;
}
function extractStars(iztroPalace, branch) {
  const stars = [];
  if (!iztroPalace) return stars;
  const allStars = [
    ...iztroPalace.majorStars ?? [],
    ...iztroPalace.minorStars ?? [],
    ...iztroPalace.adjectiveStars ?? []
  ];
  for (const s of allStars) {
    const rawName = s?.name ?? "";
    const starId = starNameToId(rawName);
    const starDef = STAR_BY_ID[starId];
    let brightness = getStarBrightness(starId, branch);
    if (s?.brightness) {
      const brightMap = {
        "\u5EDF": "miao",
        "\u65FA": "wang",
        "\u5F97": "de",
        "\u5229": "li",
        "\u5E73": "ping",
        "\u4E0D": "bu",
        "\u9677": "xian",
        "bright": "miao",
        "prosperous": "wang"
      };
      brightness = brightMap[s.brightness] ?? brightness;
    }
    let isTransformed = false;
    let transformation;
    if (s?.mutagen) {
      const m = s.mutagen;
      const tMap = {
        "\u797F": "lu",
        "\u6B0A": "quan",
        "\u79D1": "ke",
        "\u5FCC": "ji"
      };
      transformation = tMap[m] ?? void 0;
      if (transformation) isTransformed = true;
    }
    if (starDef) {
      stars.push({
        id: starDef.id,
        nameZh: starDef.nameZh,
        nameEn: starDef.nameEn,
        type: starDef.type,
        brightness,
        isTransformed,
        transformation,
        category: starDef.category
      });
    } else if (rawName) {
      stars.push({
        id: starId,
        nameZh: rawName,
        nameEn: rawName,
        type: "auxiliary",
        brightness,
        isTransformed,
        transformation
      });
    }
  }
  stars.sort((a, b) => {
    if (a.type === "major" && b.type !== "major") return -1;
    if (a.type !== "major" && b.type === "major") return 1;
    return a.id.localeCompare(b.id);
  });
  return stars;
}
function buildTransformations(palaces, yearStem) {
  const transformations = [];
  const transformationData = getTransformations(yearStem);
  const seen = /* @__PURE__ */ new Set();
  for (const t of transformationData) {
    for (let i = 0; i < palaces.length; i++) {
      const star = palaces[i].stars.find((s) => s.id === t.starId);
      if (star && !seen.has(t.starId)) {
        star.isTransformed = true;
        star.transformation = t.type;
        seen.add(t.starId);
        transformations.push({
          type: t.type,
          starId: t.starId,
          starNameZh: star.nameZh,
          starNameEn: star.nameEn,
          palaceIndex: i
        });
        for (const ms of palaces[i].majorStars) {
          if (ms.id === t.starId) {
            ms.isTransformed = true;
            ms.transformation = t.type;
          }
        }
        for (const ms of palaces[i].minorStars) {
          if (ms.id === t.starId) {
            ms.isTransformed = true;
            ms.transformation = t.type;
          }
        }
        break;
      }
    }
  }
  return transformations;
}
function buildDecadeCycles(mingBranchIndex, bureauNumber, direction) {
  const cycles = [];
  let cur = mingBranchIndex;
  let age = bureauNumber;
  for (let i = 0; i < 12; i++) {
    cycles.push({
      startAge: age,
      endAge: age + 9,
      palaceIndex: cur,
      direction
    });
    cur = direction === "clockwise" ? (cur + 1) % 12 : (cur - 1 + 12) % 12;
    age += 10;
  }
  return cycles;
}

// src/data/palace-definitions.ts
var PALACE_DEFINITIONS = [
  {
    id: "ming",
    nameZh: "\u547D\u5BAE",
    nameEn: "Destiny Palace",
    shortNameEn: "Destiny",
    descriptionEn: "Self, personality, life direction, physical appearance, and overall fortune. The most important palace.",
    descriptionZh: "\u4E3B\u81EA\u6211\u3001\u6027\u683C\u3001\u4EBA\u751F\u65B9\u5411\u3001\u76F8\u8C8C\u3001\u6574\u9AD4\u904B\u52E2\u3002",
    index: 0,
    gridRow: 3,
    gridCol: 4,
    defaultBranchIndex: 2
    // 寅
  },
  {
    id: "xiongdi",
    nameZh: "\u5144\u5F1F\u5BAE",
    nameEn: "Siblings Palace",
    shortNameEn: "Siblings",
    descriptionEn: "Siblings, close peers, colleagues, and relationships with people of the same generation.",
    descriptionZh: "\u4E3B\u5144\u5F1F\u59D0\u59B9\u3001\u540C\u8F29\u3001\u540C\u4E8B\u3001\u5E73\u8F29\u95DC\u4FC2\u3002",
    index: 1,
    gridRow: 4,
    gridCol: 4,
    defaultBranchIndex: 1
    // 丑
  },
  {
    id: "fuqi",
    nameZh: "\u592B\u59BB\u5BAE",
    nameEn: "Spouse Palace",
    shortNameEn: "Spouse",
    descriptionEn: "Marriage, spouse, romantic partnerships, and relationship dynamics.",
    descriptionZh: "\u4E3B\u5A5A\u59FB\u3001\u914D\u5076\u3001\u611F\u60C5\u4F34\u4FB6\u3001\u6200\u611B\u95DC\u4FC2\u3002",
    index: 2,
    gridRow: 4,
    gridCol: 3,
    defaultBranchIndex: 0
    // 子
  },
  {
    id: "zinv",
    nameZh: "\u5B50\u5973\u5BAE",
    nameEn: "Children Palace",
    shortNameEn: "Children",
    descriptionEn: "Children, offspring, creativity, pleasures, and sexual life.",
    descriptionZh: "\u4E3B\u5B50\u5973\u3001\u5F8C\u4EE3\u3001\u5275\u610F\u3001\u4EAB\u6A02\u3001\u6027\u751F\u6D3B\u3002",
    index: 3,
    gridRow: 4,
    gridCol: 2,
    defaultBranchIndex: 11
    // 亥
  },
  {
    id: "caibo",
    nameZh: "\u8CA1\u5E1B\u5BAE",
    nameEn: "Wealth Palace",
    shortNameEn: "Wealth",
    descriptionEn: "Income, earning ability, financial management, and material resources.",
    descriptionZh: "\u4E3B\u8CA1\u904B\u3001\u8CFA\u9322\u80FD\u529B\u3001\u7406\u8CA1\u65B9\u5F0F\u3001\u7269\u8CEA\u8CC7\u6E90\u3002",
    index: 4,
    gridRow: 4,
    gridCol: 1,
    defaultBranchIndex: 10
    // 戌
  },
  {
    id: "jie",
    nameZh: "\u75BE\u5384\u5BAE",
    nameEn: "Health Palace",
    shortNameEn: "Health",
    descriptionEn: "Physical health, illness tendencies, accidents, and overall wellbeing.",
    descriptionZh: "\u4E3B\u8EAB\u9AD4\u5065\u5EB7\u3001\u75BE\u75C5\u50BE\u5411\u3001\u610F\u5916\u3001\u8EAB\u5FC3\u72C0\u614B\u3002",
    index: 5,
    gridRow: 3,
    gridCol: 1,
    defaultBranchIndex: 9
    // 酉
  },
  {
    id: "qianyi",
    nameZh: "\u9077\u79FB\u5BAE",
    nameEn: "Travel Palace",
    shortNameEn: "Travel",
    descriptionEn: "Travel, relocation, external environment, and how one is perceived by outsiders.",
    descriptionZh: "\u4E3B\u5916\u51FA\u3001\u642C\u9077\u3001\u5916\u5728\u74B0\u5883\u3001\u5916\u4EBA\u773C\u4E2D\u5F62\u8C61\u3002",
    index: 6,
    gridRow: 2,
    gridCol: 1,
    defaultBranchIndex: 8
    // 申
  },
  {
    id: "jiaoyou",
    nameZh: "\u4EA4\u53CB\u5BAE",
    nameEn: "Friends Palace",
    shortNameEn: "Friends",
    descriptionEn: "Friends, social circle, subordinates, servants, and networking.",
    descriptionZh: "\u4E3B\u670B\u53CB\u3001\u793E\u4EA4\u5708\u3001\u4E0B\u5C6C\u3001\u50D5\u4EBA\u3001\u4EBA\u8108\u3002",
    index: 7,
    gridRow: 1,
    gridCol: 1,
    defaultBranchIndex: 7
    // 未
  },
  {
    id: "shiye",
    nameZh: "\u4E8B\u696D\u5BAE",
    nameEn: "Career Palace",
    shortNameEn: "Career",
    descriptionEn: "Career, profession, social status, achievements, and public reputation.",
    descriptionZh: "\u4E3B\u4E8B\u696D\u3001\u8077\u696D\u3001\u793E\u6703\u5730\u4F4D\u3001\u6210\u5C31\u3001\u540D\u8072\u3002",
    index: 8,
    gridRow: 1,
    gridCol: 2,
    defaultBranchIndex: 6
    // 午
  },
  {
    id: "tianzhai",
    nameZh: "\u7530\u5B85\u5BAE",
    nameEn: "Property Palace",
    shortNameEn: "Property",
    descriptionEn: "Home, real estate, family environment, and living conditions.",
    descriptionZh: "\u4E3B\u623F\u7522\u3001\u5BB6\u5EAD\u74B0\u5883\u3001\u5C45\u4F4F\u689D\u4EF6\u3001\u4E0D\u52D5\u7522\u3002",
    index: 9,
    gridRow: 1,
    gridCol: 3,
    defaultBranchIndex: 5
    // 巳
  },
  {
    id: "fude",
    nameZh: "\u798F\u5FB7\u5BAE",
    nameEn: "Fortune Palace",
    shortNameEn: "Fortune",
    descriptionEn: "Inner happiness, spiritual wellbeing, enjoyment, and karmic blessings.",
    descriptionZh: "\u4E3B\u5167\u5FC3\u5FEB\u6A02\u3001\u7CBE\u795E\u4EAB\u53D7\u3001\u798F\u6C23\u3001\u7956\u852D\u3002",
    index: 10,
    gridRow: 1,
    gridCol: 4,
    defaultBranchIndex: 4
    // 辰
  },
  {
    id: "fumu",
    nameZh: "\u7236\u6BCD\u5BAE",
    nameEn: "Parents Palace",
    shortNameEn: "Parents",
    descriptionEn: "Parents, elders, superiors, teachers, and authority figures.",
    descriptionZh: "\u4E3B\u7236\u6BCD\u3001\u9577\u8F29\u3001\u4E0A\u53F8\u3001\u8001\u5E2B\u3001\u6B0A\u5A01\u4EBA\u7269\u3002",
    index: 11,
    gridRow: 2,
    gridCol: 4,
    defaultBranchIndex: 3
    // 卯
  }
];
var PALACE_BY_ID = {};
for (const p of PALACE_DEFINITIONS) {
  PALACE_BY_ID[p.id] = p;
}
function getPalaceOrder(mingBranchIndex) {
  const order = [
    "ming",
    "xiongdi",
    "fuqi",
    "zinv",
    "caibo",
    "jie",
    "qianyi",
    "jiaoyou",
    "shiye",
    "tianzhai",
    "fude",
    "fumu"
  ];
  const result = [];
  for (let i = 0; i < 12; i++) {
    const branchIdx = (mingBranchIndex - i + 12) % 12;
    result[branchIdx] = order[i];
  }
  return result;
}

// src/i18n/en.ts
function getPalaceNameEn(name) {
  return PALACE_BY_ID_LOOKUP[name]?.nameEn ?? name;
}
function getPalaceNameZh(name) {
  return PALACE_BY_ID_LOOKUP[name]?.nameZh ?? name;
}
var PALACE_BY_ID_LOOKUP = {};
for (const p of PALACE_DEFINITIONS) {
  PALACE_BY_ID_LOOKUP[p.id] = p;
}
function getStarNameEn(starId) {
  const star = STAR_BY_ID_LOOKUP[starId];
  return star?.nameEn ?? starId;
}
function getStarNameZh(starId) {
  const star = STAR_BY_ID_LOOKUP[starId];
  return star?.nameZh ?? starId;
}
var STAR_BY_ID_LOOKUP = {};
for (const s of ALL_STAR_DEFINITIONS) {
  STAR_BY_ID_LOOKUP[s.id] = s;
}
var FIVE_ELEMENT_NAMES = {
  wood: { zh: "\u6728", en: "Wood" },
  fire: { zh: "\u706B", en: "Fire" },
  earth: { zh: "\u571F", en: "Earth" },
  metal: { zh: "\u91D1", en: "Metal" },
  water: { zh: "\u6C34", en: "Water" }
};
var YIN_YANG_NAMES = {
  yang: { zh: "\u967D", en: "Yang" },
  yin: { zh: "\u9670", en: "Yin" }
};
var GENDER_NAMES = {
  male: { zh: "\u7537", en: "Male" },
  female: { zh: "\u5973", en: "Female" }
};
var DECADE_CYCLE_TERMS = {
  decadeCycle: { zh: "\u5927\u9650", en: "Decade Cycle" },
  yearlyCycle: { zh: "\u6D41\u5E74", en: "Yearly Cycle" },
  clockwise: { zh: "\u9806\u884C", en: "Clockwise" },
  counterclockwise: { zh: "\u9006\u884C", en: "Counterclockwise" }
};
var COMMON_TERMS = {
  birthChart: { zh: "\u547D\u76E4", en: "Birth Chart" },
  destinyPalace: { zh: "\u547D\u5BAE", en: "Destiny Palace" },
  bodyPalace: { zh: "\u8EAB\u5BAE", en: "Body Palace" },
  fourPillars: { zh: "\u56DB\u67F1\u516B\u5B57", en: "Four Pillars" },
  heavenlyStem: { zh: "\u5929\u5E72", en: "Heavenly Stem" },
  earthlyBranch: { zh: "\u5730\u652F", en: "Earthly Branch" },
  fiveElementBureau: { zh: "\u4E94\u884C\u5C40", en: "Five Element Bureau" },
  majorStars: { zh: "\u4E3B\u661F", en: "Major Stars" },
  minorStars: { zh: "\u8F14\u661F", en: "Minor Stars" },
  transformation: { zh: "\u56DB\u5316", en: "Four Transformations" },
  brightness: { zh: "\u4EAE\u5EA6", en: "Brightness" },
  lunarCalendar: { zh: "\u8FB2\u66C6", en: "Lunar Calendar" },
  solarCalendar: { zh: "\u967D\u66C6", en: "Solar Calendar" },
  birthDate: { zh: "\u51FA\u751F\u65E5\u671F", en: "Birth Date" },
  birthTime: { zh: "\u51FA\u751F\u6642\u9593", en: "Birth Time" },
  gender: { zh: "\u6027\u5225", en: "Gender" },
  timezone: { zh: "\u6642\u5340", en: "Timezone" },
  calculate: { zh: "\u6392\u76E4", en: "Calculate Chart" },
  interpretation: { zh: "\u89E3\u8B80", en: "Interpretation" },
  save: { zh: "\u5132\u5B58", en: "Save" },
  loading: { zh: "\u8A08\u7B97\u4E2D", en: "Calculating..." }
};
export {
  ALL_STAR_DEFINITIONS,
  AUXILIARY_STARS,
  AUXILIARY_STAR_IDS,
  BRANCH_INDEX,
  BRANCH_NAMES,
  BRIGHTNESS_COLORS,
  BRIGHTNESS_LABELS,
  BRIGHTNESS_TABLE,
  COMMON_TERMS,
  DECADE_CYCLE_TERMS,
  FIVE_ELEMENT_NAMES,
  GENDER_NAMES,
  INDEX_TO_BRANCH,
  INDEX_TO_STEM,
  MAJOR_STARS,
  MAJOR_STAR_IDS,
  PALACE_BY_ID,
  PALACE_DEFINITIONS,
  STAR_BY_ID,
  STEM_INDEX,
  STEM_NAMES,
  TRANSFORMATION_MAP,
  TRANSFORMATION_NAMES,
  WORLD_CITY_PRESETS,
  YIN_YANG_NAMES,
  assignPalaceStems,
  assignPalacesToBranches,
  calculateChart,
  calculateChartSync,
  calculateFourPillars,
  calculateMingPalace,
  calculateShenPalace,
  calculateTrueSolarTime,
  formatFourPillars,
  getBranchForPalace,
  getDecadeDirection,
  getFiveElementBureau,
  getHourBranch,
  getHourStem,
  getMonthBranch,
  getMonthStem,
  getPalaceAtBranch,
  getPalaceNameEn,
  getPalaceNameZh,
  getPalaceOrder,
  getSexagenaryPosition,
  getShichen,
  getStarBrightness,
  getStarNameEn,
  getStarNameZh,
  getTransformations,
  getYearBranch,
  getYearStem,
  isBeforeLichun,
  isYangYear
};
