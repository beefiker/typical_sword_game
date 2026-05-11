/*
 * Design Philosophy: Pixel Quest Forge.
 * The UI must feel like a compact handheld RPG status screen: chunky pixel panels,
 * tactile command buttons, readable mobile hierarchy, and only four functional accent colors:
 * #03AED2 progress/action, #F8DE22 reward/gold, #F45B26 warning/heat, #D12052 failure/lethal.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Award,
  BadgePercent,
  Boxes,
  CircleDollarSign,
  Clock3,
  Flame,
  FlaskConical,
  Hammer,
  History,
  PackageOpen,
  Pickaxe,
  ShieldCheck,
  ShoppingCart,
  Skull,
  Sparkles,
  Sword,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

const ASSETS = {
  swordHero:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663648530884/PmHnVUFzGQDDX3pqUCUnTv/typical-sword-hero-palette-Q2RhvpKrPnVsr7uXDj5Nzo.webp",
  forgeBg:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663648530884/PmHnVUFzGQDDX3pqUCUnTv/typical-forge-background-palette-hbK8AJzUnjsxwSCEj2VzrZ.webp",
  monster:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663648530884/PmHnVUFzGQDDX3pqUCUnTv/typical-monster-silhouette-palette-oWYQckyb3XXQhrpmT6Rqnn.webp",
  boss:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663648530884/PmHnVUFzGQDDX3pqUCUnTv/typical-boss-core-palette-fAQNsGiGS8P5FhfXgjiEXQ.webp",
};

const STORAGE_KEY = "typical-sword-game:v1";
const SECOND = 1000;
const OFFLINE_CAP_HOURS = 12;
const ENDING_PRESTIGE_REQUIREMENT = 3;

const REGIONS = [
  {
    id: "ash_forest",
    name: "잿빛 숲",
    short: "FOREST",
    unlock: "기본 해금",
    requiredEnhance: 0,
    requiredLevel: 1,
    baseHp: 54,
    hpGrowth: 1.085,
    gold: 24,
    exp: 11,
    material: "scraps",
    materialName: "금속 파편",
    materialChance: 0.44,
    bossEvery: 15,
    bossMultiplier: 2.6,
  },
  {
    id: "mine_corridor",
    name: "폐광 회랑",
    short: "MINE",
    unlock: "+10 검 또는 Lv.8",
    requiredEnhance: 10,
    requiredLevel: 8,
    baseHp: 300,
    hpGrowth: 1.13,
    gold: 92,
    exp: 34,
    material: "ore",
    materialName: "철광석",
    materialChance: 0.35,
    bossEvery: 18,
    bossMultiplier: 4.2,
  },
  {
    id: "red_citadel",
    name: "붉은 성채",
    short: "CITADEL",
    unlock: "+18 검 또는 Lv.18",
    requiredEnhance: 18,
    requiredLevel: 18,
    baseHp: 1450,
    hpGrowth: 1.155,
    gold: 380,
    exp: 100,
    material: "soul",
    materialName: "영혼 결정",
    materialChance: 0.25,
    bossEvery: 22,
    bossMultiplier: 5.0,
  },
  {
    id: "frost_rift",
    name: "서리 협곡",
    short: "RIFT",
    unlock: "+28 검 또는 Lv.35",
    requiredEnhance: 28,
    requiredLevel: 35,
    baseHp: 7600,
    hpGrowth: 1.175,
    gold: 1520,
    exp: 270,
    material: "frost",
    materialName: "냉각 결정",
    materialChance: 0.19,
    bossEvery: 28,
    bossMultiplier: 6.0,
  },
  {
    id: "abyss_forge",
    name: "심연 제련소",
    short: "ABYSS",
    unlock: "+40 검 또는 명성 1",
    requiredEnhance: 40,
    requiredLevel: 45,
    prestigeRequired: 1,
    baseHp: 52000,
    hpGrowth: 1.195,
    gold: 7600,
    exp: 860,
    material: "abyssCore",
    materialName: "심연핵",
    materialChance: 0.11,
    bossEvery: 34,
    bossMultiplier: 7.2,
  },
  {
    id: "nameless_throne",
    name: "무명의 왕좌",
    short: "THRONE",
    unlock: "+50 검, Lv.60, 명성 3",
    requiredEnhance: 50,
    requiredLevel: 60,
    prestigeRequired: 3,
    baseHp: 760000,
    hpGrowth: 1.215,
    gold: 54000,
    exp: 5400,
    material: "abyssCore",
    materialName: "심연핵",
    materialChance: 0.22,
    bossEvery: 1,
    bossMultiplier: 5.4,
    final: true,
  },
] as const;

type RegionId = (typeof REGIONS)[number]["id"];
type MaterialKey = "scraps" | "ore" | "soul" | "frost" | "abyssCore";
type TabKey = "forge" | "battle" | "market" | "craft" | "traits" | "prestige";
type TraitBranch = "smith" | "hunter" | "merchant";

type LogTone = "cyan" | "gold" | "orange" | "pink" | "neutral";

type GameLog = {
  id: number;
  text: string;
  tone: LogTone;
};

type Traits = Record<TraitBranch, number>;

type Inventory = Record<MaterialKey, number> & {
  guards: number;
  stabilizers: number;
  warpTickets: number;
};

type GameState = {
  gold: number;
  level: number;
  exp: number;
  enhance: number;
  bestEnhance: number;
  swordsSold: number;
  monstersKilled: number;
  bossesKilled: number;
  regionId: RegionId;
  regionStep: number;
  monsterHp: number;
  inventory: Inventory;
  traits: Traits;
  prestige: number;
  prestigeStones: number;
  totalPrestigeStones: number;
  endingSeen: boolean;
  lastSavedAt: number;
  createdAt: number;
};

type Derived = {
  attack: number;
  dps: number;
  clickDamage: number;
  saleValue: number;
  cumulativeInvestment: number;
  saleProfit: number;
  upgradeCost: number;
  successRate: number;
  destroyRate: number;
  expToNext: number;
  traitPointsEarned: number;
  traitPointsSpent: number;
  traitPointsAvailable: number;
  currentRegion: (typeof REGIONS)[number];
  monsterMaxHp: number;
  isBoss: boolean;
};

type PixelRect = readonly [number, number, number, number, string];
type MonsterKey = "slime" | "goblin" | "skeleton" | "zombie" | "vampire" | "orc" | "ghost" | "wolf" | "boss";

type MonsterProfile = {
  key: MonsterKey;
  name: string;
  title: string;
  habitat: string;
  cue: string;
  tone: LogTone;
  sprite: string;
  frames: PixelRect[][];
};

function px(x: number, y: number, w: number, h: number, color: string): PixelRect {
  return [x, y, w, h, color];
}

function spriteSheet(frameWidth: number, frameHeight: number, frames: PixelRect[][]) {
  const rects = frames
    .map((frame, frameIndex) =>
      frame
        .map(([x, y, w, h, color]) => `<rect x="${x + frameIndex * frameWidth}" y="${y}" width="${w}" height="${h}" fill="${color}"/>`)
        .join(""),
    )
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${frameWidth * frames.length}" height="${frameHeight}" viewBox="0 0 ${frameWidth * frames.length} ${frameHeight}" shape-rendering="crispEdges">${rects}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function heroFrame(capeLift = 0, step = 0): PixelRect[] {
  return [
    // dark outline and red hero cape, kept saturated to avoid the washed-out white overlay look
    px(8, 13 - capeLift, 13, 4, "#4a0b1f"), px(6, 17 - capeLift, 18, 6, "#b4143d"), px(4, 23 - capeLift, 20, 7, "#f0444f"),
    px(3, 30 - capeLift, 16, 5, "#c01d3f"), px(3, 35 - capeLift, 8, 4, "#72152c"), px(11, 25 - capeLift, 9, 3, "#ff7670"),
    // black hair silhouette, face, ears and readable expression
    px(23, 4, 10, 3, "#0a0b0f"), px(20, 7, 15, 5, "#0a0b0f"), px(20, 12, 15, 4, "#0a0b0f"), px(34, 9, 5, 3, "#0a0b0f"), px(34, 13, 4, 2, "#0a0b0f"),
    px(22, 12, 11, 9, "#ffd5b9"), px(22, 17, 12, 6, "#f0b28f"), px(20, 16, 3, 4, "#ffd5b9"), px(33, 15, 3, 4, "#ffd5b9"),
    px(25, 15, 2, 4, "#171015"), px(31, 15, 2, 4, "#171015"), px(28, 20, 3, 2, "#b86b5c"),
    // blue tunic and gold fasteners
    px(22, 24, 13, 12, "#1f4fb0"), px(24, 25, 8, 3, "#336ee1"), px(29, 25, 3, 3, "#f8de22"), px(27, 30, 3, 3, "#f8de22"), px(31, 33, 3, 2, "#f8de22"),
    px(20, 35, 18, 3, "#5a3b2e"), px(22, 38, 5, 6 + step, "#4b352b"), px(33, 38, 5, 6 - step, "#4b352b"), px(20, 44, 9, 3, "#101014"), px(33, 44, 9, 3, "#101014"),
    px(17, 25, 5, 11, "#ffd5b9"), px(36, 24, 5, 11, "#ffd5b9"), px(39, 27, 3, 4, "#ffd5b9"),
    // straight pixel sword: repeated diagonal blade blocks of the same size, not curved or bowed
    px(15, 31, 3, 8, "#9f6815"), px(11, 37, 10, 2, "#b98218"), px(13, 34, 3, 3, "#f8de22"),
    px(10, 39, 3, 3, "#e7f0e9"), px(8, 41, 3, 3, "#cbd7d1"), px(6, 43, 3, 3, "#e7f0e9"), px(4, 45, 3, 3, "#aab9b1"), px(2, 47, 3, 3, "#f2fbf5"),
    px(11, 40, 2, 2, "#ffffff"), px(7, 44, 2, 2, "#ffffff"),
    px(38, 29, 6, 8, "#7e1230"), px(39, 30, 5, 6, "#f8de22"), px(40, 31, 3, 4, "#d12052"),
  ];
}

function slimeFrame(flat = 0): PixelRect[] {
  return [px(8, 22 + flat, 16, 4, "#1c592f"), px(5, 18 + flat, 22, 5, "#2b8a3f"), px(7, 14 + flat, 19, 5, "#67c63a"), px(11, 11 + flat, 12, 4, "#9ce052"), px(15, 15 + flat, 3, 4, "#3b1736"), px(22, 16 + flat, 3, 4, "#3b1736"), px(12, 13 + flat, 5, 2, "#c8ff73"), px(26, 23 + flat, 3, 2, "#77df48")];
}

function goblinFrame(arm = 0): PixelRect[] {
  return [px(9, 7, 14, 4, "#1b2a16"), px(6, 10, 20, 9, "#6eb34c"), px(3, 12, 5, 4, "#6eb34c"), px(24, 12, 5, 4, "#6eb34c"), px(10, 13, 3, 4, "#1a1620"), px(20, 13, 3, 4, "#1a1620"), px(14, 18, 6, 2, "#25461e"), px(10, 21, 14, 8, "#56326d"), px(8, 23 + arm, 4, 4, "#6eb34c"), px(24, 22 - arm, 4, 4, "#6eb34c"), px(27, 21 - arm, 4, 2, "#cbd6c8"), px(12, 29, 4, 3, "#353039"), px(20, 29, 4, 3, "#353039")];
}

function skeletonFrame(step = 0): PixelRect[] {
  return [px(11, 4, 11, 4, "#efe7bf"), px(9, 8, 15, 8, "#efe7bf"), px(12, 10, 3, 4, "#10151a"), px(19, 10, 3, 4, "#10151a"), px(15, 15, 4, 2, "#10151a"), px(14, 17, 6, 3, "#d8d39f"), px(13, 20, 8, 2, "#efe7bf"), px(12, 23, 10, 2, "#efe7bf"), px(15, 20, 2, 10, "#efe7bf"), px(20, 18, 3, 11, "#efe7bf"), px(9, 18, 3, 11, "#efe7bf"), px(11, 29, 4, 3 + step, "#efe7bf"), px(20, 29, 4, 3 - step, "#efe7bf")];
}

function zombieFrame(arm = 0): PixelRect[] {
  return [px(9, 5, 14, 4, "#244b24"), px(7, 9, 18, 10, "#6aa35a"), px(11, 12, 4, 5, "#2d2350"), px(20, 12, 4, 5, "#2d2350"), px(13, 18, 7, 2, "#172319"), px(9, 21, 15, 8, "#2e3157"), px(7, 23 + arm, 4, 6, "#6aa35a"), px(24, 22 - arm, 6, 4, "#6aa35a"), px(10, 29, 6, 3, "#79543a"), px(19, 29, 6, 3, "#79543a"), px(12, 8, 5, 2, "#9ccc73")];
}

function vampireFrame(cape = 0): PixelRect[] {
  return [px(4, 12 + cape, 9, 13, "#2a1739"), px(19, 12 - cape, 10, 13, "#2a1739"), px(5, 19 + cape, 9, 9, "#f45b4d"), px(19, 19 - cape, 9, 9, "#f45b4d"), px(12, 4, 10, 5, "#08080d"), px(10, 9, 13, 9, "#f1d0b4"), px(12, 12, 2, 3, "#d12052"), px(20, 12, 2, 3, "#d12052"), px(15, 17, 5, 2, "#401014"), px(12, 19, 12, 9, "#27308d"), px(14, 20, 3, 3, "#f8de22"), px(12, 28, 5, 4, "#4a1421"), px(20, 28, 5, 4, "#4a1421")];
}

function orcFrame(arm = 0): PixelRect[] {
  return [px(8, 7, 18, 5, "#2c3d21"), px(6, 11, 22, 10, "#5f9a38"), px(4, 13, 4, 5, "#5f9a38"), px(26, 13, 4, 5, "#5f9a38"), px(11, 14, 4, 4, "#151515"), px(22, 14, 4, 4, "#151515"), px(14, 19, 4, 3, "#efe7bf"), px(22, 19, 4, 3, "#efe7bf"), px(9, 22, 17, 8, "#5a3327"), px(5, 23 + arm, 5, 6, "#5f9a38"), px(26, 22 - arm, 5, 6, "#5f9a38"), px(29, 18 - arm, 2, 12, "#7c4a26"), px(27, 17 - arm, 6, 3, "#c7c9c2")];
}

function ghostFrame(float = 0): PixelRect[] {
  return [px(10, 6 + float, 12, 4, "#edf5e8"), px(7, 10 + float, 18, 10, "#edf5e8"), px(6, 20 + float, 20, 7, "#c9e7e0"), px(8, 27 + float, 4, 3, "#c9e7e0"), px(16, 27 + float, 4, 3, "#c9e7e0"), px(23, 27 + float, 4, 3, "#c9e7e0"), px(11, 13 + float, 4, 5, "#22243d"), px(20, 13 + float, 4, 5, "#22243d"), px(15, 20 + float, 7, 2, "#91b9c8")];
}

function wolfFrame(step = 0): PixelRect[] {
  return [px(5, 12, 8, 5, "#10151b"), px(2, 14, 5, 4, "#10151b"), px(7, 8, 3, 5, "#1b222c"), px(13, 10, 14, 8, "#28323f"), px(24, 13, 6, 5, "#28323f"), px(29, 10, 2, 6, "#10151b"), px(4, 15, 2, 2, "#d12052"), px(15, 18, 4, 9 + step, "#10151b"), px(24, 18, 4, 9 - step, "#10151b"), px(10, 18, 4, 7, "#1b222c"), px(28, 17, 3, 7, "#1b222c"), px(15, 12, 8, 3, "#3b4654")];
}

function bossFrame(pulse = 0): PixelRect[] {
  return [px(5, 4, 22, 5, "#100713"), px(3, 9, 26, 11, "#26143b"), px(6, 20, 20, 8, "#120817"), px(9, 11, 4, 6, "#d12052"), px(20, 11, 4, 6, "#d12052"), px(14, 19, 5 + pulse, 3, "#f8de22"), px(2, 15, 5, 6, "#4e1b66"), px(26, 15, 5, 6, "#4e1b66"), px(10, 28, 4, 4, "#2a1739"), px(20, 28, 4, 4, "#2a1739")];
}

const HERO_FRAMES = [heroFrame(0, 0), heroFrame(1, 1)];
const HERO_SPRITE = spriteSheet(48, 52, HERO_FRAMES);

const MONSTER_PROFILES: Record<MonsterKey, MonsterProfile> = {
  slime: { key: "slime", name: "초록 슬라임", title: "젤리 점액체", habitat: "숲 바닥", cue: "둥근 몸통과 작은 눈으로 식별", tone: "cyan", sprite: spriteSheet(32, 32, [slimeFrame(0), slimeFrame(1)]), frames: [slimeFrame(0), slimeFrame(1)] },
  goblin: { key: "goblin", name: "고블린 척후병", title: "단검 도적", habitat: "잿빛 숲", cue: "긴 귀, 초록 피부, 보라 튜닉", tone: "orange", sprite: spriteSheet(32, 32, [goblinFrame(0), goblinFrame(1)]), frames: [goblinFrame(0), goblinFrame(1)] },
  skeleton: { key: "skeleton", name: "해골 병사", title: "뼈 갑주", habitat: "폐광 회랑", cue: "두개골과 갈비뼈 실루엣", tone: "gold", sprite: spriteSheet(32, 32, [skeletonFrame(0), skeletonFrame(1)]), frames: [skeletonFrame(0), skeletonFrame(1)] },
  zombie: { key: "zombie", name: "좀비 광부", title: "느린 부패자", habitat: "폐광 회랑", cue: "녹색 피부와 앞으로 뻗은 팔", tone: "neutral", sprite: spriteSheet(32, 32, [zombieFrame(0), zombieFrame(1)]), frames: [zombieFrame(0), zombieFrame(1)] },
  vampire: { key: "vampire", name: "밤의 흡혈귀", title: "붉은 망토 귀족", habitat: "붉은 성채", cue: "검은 머리, 붉은 눈, 펼친 망토", tone: "pink", sprite: spriteSheet(32, 32, [vampireFrame(0), vampireFrame(1)]), frames: [vampireFrame(0), vampireFrame(1)] },
  orc: { key: "orc", name: "오크 돌격병", title: "도끼 전위", habitat: "붉은 성채", cue: "큰 턱, 송곳니, 도끼 실루엣", tone: "orange", sprite: spriteSheet(32, 32, [orcFrame(0), orcFrame(1)]), frames: [orcFrame(0), orcFrame(1)] },
  ghost: { key: "ghost", name: "협곡 귀신", title: "떠도는 혼백", habitat: "서리 협곡", cue: "흰 천처럼 흔들리는 하단부", tone: "cyan", sprite: spriteSheet(32, 32, [ghostFrame(0), ghostFrame(-1)]), frames: [ghostFrame(0), ghostFrame(-1)] },
  wolf: { key: "wolf", name: "검은 늑대", title: "서리 추적자", habitat: "서리 협곡", cue: "낮은 네발 자세와 붉은 눈", tone: "neutral", sprite: spriteSheet(32, 32, [wolfFrame(0), wolfFrame(1)]), frames: [wolfFrame(0), wolfFrame(1)] },
  boss: { key: "boss", name: "무명의 수문장", title: "왕좌의 그림자", habitat: "심연", cue: "거대한 검은 형체와 붉은 핵", tone: "pink", sprite: spriteSheet(32, 32, [bossFrame(0), bossFrame(2)]), frames: [bossFrame(0), bossFrame(2)] },
};

const REGION_MONSTER_KEYS: Record<RegionId, MonsterKey[]> = {
  ash_forest: ["slime", "goblin", "wolf"],
  mine_corridor: ["goblin", "skeleton", "zombie"],
  red_citadel: ["orc", "vampire", "skeleton"],
  frost_rift: ["wolf", "ghost", "skeleton"],
  abyss_forge: ["orc", "vampire", "ghost", "boss"],
  nameless_throne: ["boss", "vampire", "ghost"],
};

function getMonsterProfile(regionId: RegionId, regionStep: number, isBoss: boolean) {
  if (isBoss || regionId === "nameless_throne") return MONSTER_PROFILES.boss;
  const keys = REGION_MONSTER_KEYS[regionId];
  return MONSTER_PROFILES[keys[Math.abs(regionStep - 1) % keys.length]];
}

function getRegionRoster(regionId: RegionId) {
  return REGION_MONSTER_KEYS[regionId].map((key) => MONSTER_PROFILES[key]);
}

const MATERIAL_LABELS: Record<MaterialKey, string> = {
  scraps: "금속 파편",
  ore: "철광석",
  soul: "영혼 결정",
  frost: "냉각 결정",
  abyssCore: "심연핵",
};

const TRAIT_INFO: Record<
  TraitBranch,
  {
    label: string;
    icon: typeof Hammer;
    tone: LogTone;
    summary: string;
    nodes: string[];
  }
> = {
  smith: {
    label: "대장장이",
    icon: Hammer,
    tone: "cyan",
    summary: "강화 비용과 실패 리스크를 줄입니다.",
    nodes: ["정밀 담금질", "균열 감지", "안정화 각인", "고대 제련법"],
  },
  hunter: {
    label: "사냥꾼",
    icon: Target,
    tone: "orange",
    summary: "전투 피해량, 경험치, 드롭률을 높입니다.",
    nodes: ["약점 간파", "전리품 추적", "보스 해체", "심연 추적자"],
  },
  merchant: {
    label: "상인",
    icon: CircleDollarSign,
    tone: "gold",
    summary: "판매가, 상점 할인, 방치 보상을 강화합니다.",
    nodes: ["감정가", "도매 계약", "자동 정산", "명성 회계"],
  },
};

const initialState = (): GameState => ({
  gold: 450,
  level: 1,
  exp: 0,
  enhance: 0,
  bestEnhance: 0,
  swordsSold: 0,
  monstersKilled: 0,
  bossesKilled: 0,
  regionId: "ash_forest",
  regionStep: 1,
  monsterHp: 54,
  inventory: {
    scraps: 0,
    ore: 0,
    soul: 0,
    frost: 0,
    abyssCore: 0,
    guards: 1,
    stabilizers: 1,
    warpTickets: 0,
  },
  traits: {
    smith: 0,
    hunter: 0,
    merchant: 0,
  },
  prestige: 0,
  prestigeStones: 0,
  totalPrestigeStones: 0,
  endingSeen: false,
  lastSavedAt: Date.now(),
  createdAt: Date.now(),
});

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function compact(value: number) {
  if (!Number.isFinite(value)) return "0";
  if (value < 1000) return Math.floor(value).toLocaleString("ko-KR");
  const units = ["", "K", "M", "B", "T", "Qa", "Qi"];
  let v = value;
  let unit = 0;
  while (v >= 1000 && unit < units.length - 1) {
    v /= 1000;
    unit += 1;
  }
  return `${v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2)}${units[unit]}`;
}

function pct(value: number) {
  return `${clamp(value, 0, 100).toFixed(value < 10 ? 1 : 0)}%`;
}

function getRegion(id: RegionId) {
  return REGIONS.find((region) => region.id === id) ?? REGIONS[0];
}

function regionPrestigeRequired(region: (typeof REGIONS)[number]) {
  return "prestigeRequired" in region ? region.prestigeRequired : 0;
}

function isFinalRegion(region: (typeof REGIONS)[number]) {
  return "final" in region && region.final === true;
}

function isRegionUnlocked(region: (typeof REGIONS)[number], state: GameState) {
  const enhanceOk = state.enhance >= region.requiredEnhance;
  const levelOk = state.level >= region.requiredLevel;
  const prestigeRequired = regionPrestigeRequired(region);
  const prestigeOk = !prestigeRequired || state.prestige >= prestigeRequired;
  if (isFinalRegion(region)) {
    return (
      state.enhance >= 50 &&
      state.level >= 60 &&
      state.prestige >= ENDING_PRESTIGE_REQUIREMENT &&
      state.inventory.abyssCore >= 10
    );
  }
  return prestigeOk && (enhanceOk || levelOk);
}

function getMonsterMaxHp(state: GameState, region = getRegion(state.regionId)) {
  const regionBossMultiplier = "bossMultiplier" in region ? region.bossMultiplier : 5.4;
  const bossMultiplier = state.regionStep % region.bossEvery === 0 ? regionBossMultiplier + state.prestige * 1.05 : 1;
  return Math.floor(region.baseHp * Math.pow(region.hpGrowth, state.regionStep - 1) * bossMultiplier);
}

function getBaseUpgradeCost(enhance: number) {
  return Math.floor(120 * Math.pow(1.42, enhance));
}

function getCumulativeEnhanceCost(enhance: number) {
  let total = 0;
  for (let step = 0; step < enhance; step += 1) total += getBaseUpgradeCost(step);
  return total;
}

function getSwordSaleValue(enhance: number, merchant: number) {
  const cumulativeInvestment = getCumulativeEnhanceCost(enhance);
  const legacyValue = Math.floor(
    (120 + Math.pow(1.36, enhance) * 55) * (1 + merchant * 0.055),
  );
  const guaranteedProfitValue = Math.floor(
    cumulativeInvestment * (1.18 + Math.min(enhance, 50) * 0.006) + 90 * enhance + 120,
  );
  return Math.floor(Math.max(legacyValue, guaranteedProfitValue) * (1 + merchant * 0.035));
}

function derive(state: GameState): Derived {
  const currentRegion = getRegion(state.regionId);
  const prestigeMultiplier = 1 + state.totalPrestigeStones * 0.035 + state.prestige * 0.08;
  const attack = Math.floor(10 * Math.pow(1.24, state.enhance) * prestigeMultiplier * (1 + state.traits.hunter * 0.035));
  const dps = Math.floor(attack * (0.5 + state.level * 0.015) * (1 + state.traits.hunter * 0.045));
  const clickDamage = Math.max(1, Math.floor(attack * (0.4 + state.traits.hunter * 0.012)));
  const cumulativeInvestment = getCumulativeEnhanceCost(state.enhance);
  const saleValue = getSwordSaleValue(state.enhance, state.traits.merchant);
  const saleProfit = saleValue - cumulativeInvestment;
  const upgradeCost = Math.floor(getBaseUpgradeCost(state.enhance) * (1 - clamp(state.traits.smith * 0.012, 0, 0.3)));
  const baseRate =
    state.enhance < 10
      ? 95 - state.enhance * 2.8
      : state.enhance < 20
        ? 68 - (state.enhance - 10) * 2.8
        : state.enhance < 30
          ? 40 - (state.enhance - 20) * 1.8
          : state.enhance < 40
            ? 20 - (state.enhance - 30) * 1.0
            : 9 - (state.enhance - 40) * 0.6;
  const successRate = clamp(baseRate + state.traits.smith * 0.75 + state.prestigeStones * 0.05, 1.5, 97);
  const destroyRate =
    state.enhance < 10 ? 0 : state.enhance < 20 ? 35 : state.enhance < 30 ? 54 : state.enhance < 40 ? 72 : 86;
  const expToNext = Math.floor(80 * Math.pow(1.21, state.level - 1));
  const traitPointsEarned = Math.max(0, state.level - 1) + state.prestige * 2;
  const traitPointsSpent = state.traits.smith + state.traits.hunter + state.traits.merchant;
  const traitPointsAvailable = traitPointsEarned - traitPointsSpent;
  const monsterMaxHp = getMonsterMaxHp(state, currentRegion);
  return {
    attack,
    dps,
    clickDamage,
    saleValue,
    cumulativeInvestment,
    saleProfit,
    upgradeCost,
    successRate,
    destroyRate,
    expToNext,
    traitPointsEarned,
    traitPointsSpent,
    traitPointsAvailable,
    currentRegion,
    monsterMaxHp,
    isBoss: state.regionStep % currentRegion.bossEvery === 0,
  };
}

function normalizeLoadedState(raw: unknown): GameState | null {
  if (!raw || typeof raw !== "object") return null;
  const state = raw as Partial<GameState>;
  const base = initialState();
  return {
    ...base,
    ...state,
    inventory: { ...base.inventory, ...(state.inventory ?? {}) },
    traits: { ...base.traits, ...(state.traits ?? {}) },
    regionId: REGIONS.some((region) => region.id === state.regionId) ? (state.regionId as RegionId) : base.regionId,
  };
}

function calculateKillRewards(state: GameState, derived = derive(state)) {
  const region = derived.currentRegion;
  const boss = derived.isBoss;
  const gold = Math.floor(region.gold * (1 + state.regionStep * 0.035) * (boss ? 7 : 1) * (1 + state.traits.merchant * 0.018));
  const exp = Math.floor(region.exp * (1 + state.regionStep * 0.025) * (boss ? 5 : 1) * (1 + state.traits.hunter * 0.018));
  const materialRollChance = clamp(region.materialChance + state.traits.hunter * 0.006 + (boss ? 0.35 : 0), 0, 0.95);
  const materialAmount = boss ? 2 + Math.floor(state.regionStep / 25) : 1;
  return { gold, exp, materialKey: region.material as MaterialKey, materialAmount, materialRollChance, boss };
}

function awardExperience(draft: GameState, exp: number) {
  draft.exp += exp;
  let leveled = 0;
  while (draft.exp >= Math.floor(80 * Math.pow(1.21, draft.level - 1))) {
    const needed = Math.floor(80 * Math.pow(1.21, draft.level - 1));
    draft.exp -= needed;
    draft.level += 1;
    draft.gold += 75 + draft.level * 18;
    leveled += 1;
  }
  return leveled;
}

function addLog(logs: GameLog[], text: string, tone: LogTone = "neutral") {
  return [{ id: Date.now() + Math.random(), text, tone }, ...logs].slice(0, 14);
}

function ProgressBar({ value, tone = "cyan" }: { value: number; tone?: LogTone }) {
  return (
    <div className="meter" aria-hidden="true">
      <div className={`meter-fill tone-${tone}`} style={{ width: `${clamp(value, 0, 100)}%` }} />
    </div>
  );
}

function StatCard({ label, value, hint, tone = "neutral" }: { label: string; value: string; hint?: string; tone?: LogTone }) {
  return (
    <div className={`stat-card tone-border-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {hint ? <small>{hint}</small> : null}
    </div>
  );
}

function SectionTitle({ icon: Icon, title, eyebrow }: { icon: typeof Sword; title: string; eyebrow?: string }) {
  return (
    <div className="section-title">
      <div className="section-title-icon">
        <Icon size={17} />
      </div>
      <div>
        {eyebrow ? <span>{eyebrow}</span> : null}
        <h2>{title}</h2>
      </div>
    </div>
  );
}

export default function Home() {
  const [state, setState] = useState<GameState>(() => initialState());
  const [activeTab, setActiveTab] = useState<TabKey>("forge");
  const [logs, setLogs] = useState<GameLog[]>([
    { id: 1, text: "낡은 검과 첫 원정이 준비되었습니다. +50 검과 무명의 왕좌가 최종 목표입니다.", tone: "cyan" },
  ]);
  const [offlineSummary, setOfflineSummary] = useState<string | null>(null);
  const [dangerMode, setDangerMode] = useState(false);
  const [showGoldHud, setShowGoldHud] = useState(false);
  const initialized = useRef(false);
  const derived = useMemo(() => derive(state), [state]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = normalizeLoadedState(JSON.parse(saved));
      if (!parsed) return;
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - (parsed.lastSavedAt || now)) / 1000);
      const capSeconds = Math.floor(OFFLINE_CAP_HOURS * 3600 * (1 + parsed.traits.merchant * 0.015));
      const appliedSeconds = clamp(elapsedSeconds, 0, capSeconds);
      if (appliedSeconds > 10) {
        const d = derive(parsed);
        const killSeconds = Math.max(2.5, getMonsterMaxHp(parsed) / Math.max(1, d.dps));
        const kills = Math.floor(appliedSeconds / killSeconds);
        if (kills > 0) {
          const reward = calculateKillRewards(parsed, d);
          parsed.gold += Math.floor(reward.gold * kills * 0.72);
          const leveled = awardExperience(parsed, Math.floor(reward.exp * kills * 0.65));
          parsed.monstersKilled += kills;
          const materialDrops = Math.floor(kills * reward.materialRollChance * 0.45);
          parsed.inventory[reward.materialKey] += materialDrops;
          setOfflineSummary(
            `${Math.floor(appliedSeconds / 60).toLocaleString("ko-KR")}분 동안 몬스터 ${kills.toLocaleString(
              "ko-KR",
            )}체를 처리하고 ${compact(reward.gold * kills * 0.72)}G, ${compact(reward.exp * kills * 0.65)}EXP를 회수했습니다.`,
          );
          setLogs((prev) =>
            addLog(
              prev,
              `오프라인 정산: ${kills.toLocaleString("ko-KR")}체 처치, 재료 ${materialDrops.toLocaleString("ko-KR")}개 회수${
                leveled ? `, Lv.${parsed.level} 도달` : ""
              }`,
              "gold",
            ),
          );
        }
      }
      parsed.lastSavedAt = now;
      parsed.monsterHp = clamp(parsed.monsterHp || getMonsterMaxHp(parsed), 1, getMonsterMaxHp(parsed));
      setState(parsed);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setState((prev) => {
        const d = derive(prev);
        if (isFinalRegion(d.currentRegion) && prev.endingSeen) return { ...prev, lastSavedAt: Date.now() };
        let next: GameState = { ...prev, inventory: { ...prev.inventory }, traits: { ...prev.traits } };
        next.monsterHp -= d.dps;
        let killCount = 0;
        let goldGain = 0;
        let expGain = 0;
        let materialGain = 0;
        let bossKilled = false;

        while (next.monsterHp <= 0 && killCount < 25) {
          const liveDerived = derive(next);
          const reward = calculateKillRewards(next, liveDerived);
          killCount += 1;
          goldGain += reward.gold;
          expGain += reward.exp;
          if (Math.random() < reward.materialRollChance) {
            next.inventory[reward.materialKey] += reward.materialAmount;
            materialGain += reward.materialAmount;
          }
          if (reward.boss) {
            next.bossesKilled += 1;
            bossKilled = true;
            if (Math.random() < 0.32) next.inventory.stabilizers += 1;
            if (next.regionId === "mine_corridor") next.inventory.guards += 1;
            if (next.regionId === "abyss_forge") next.inventory.abyssCore += 1;
          }
          next.monstersKilled += 1;
          next.regionStep += 1;
          const nextMax = getMonsterMaxHp(next);
          next.monsterHp += nextMax;
        }

        if (killCount > 0) {
          next.gold += goldGain;
          awardExperience(next, expGain);
          if (bossKilled) {
            setLogs((prevLogs) => addLog(prevLogs, `보스 격파: ${d.currentRegion.name}의 방어선이 붕괴되었습니다.`, "orange"));
          } else if (killCount >= 3) {
            setLogs((prevLogs) => addLog(prevLogs, `자동 전투: ${killCount}체 처치, ${compact(goldGain)}G 회수`, "cyan"));
          }
          if (materialGain > 0 && Math.random() < 0.35) {
            setLogs((prevLogs) => addLog(prevLogs, `${d.currentRegion.materialName} ${materialGain}개를 회수했습니다.`, "gold"));
          }
        }

        const finalUnlocked = isRegionUnlocked(REGIONS[5], next);
        if (finalUnlocked && next.regionId === "nameless_throne" && next.regionStep > 1 && !next.endingSeen) {
          next.endingSeen = true;
          setLogs((prevLogs) => addLog(prevLogs, "엔딩 도달: 무명의 왕좌가 침묵했습니다.", "gold"));
          toast.success("엔딩 도달", { description: "무명의 왕좌를 제압했습니다. 하지만 명성 루프는 계속됩니다." });
        }
        next.lastSavedAt = Date.now();
        return next;
      });
    }, SECOND);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const saveTimer = window.setInterval(() => {
      setState((prev) => {
        const next = { ...prev, lastSavedAt: Date.now() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }, 5000);
    return () => window.clearInterval(saveTimer);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, lastSavedAt: Date.now() }));
  }, [state]);

  useEffect(() => {
    const updateGoldHud = () => setShowGoldHud(window.scrollY > 360);
    updateGoldHud();
    window.addEventListener("scroll", updateGoldHud, { passive: true });
    return () => window.removeEventListener("scroll", updateGoldHud);
  }, []);

  const hpPercent = (state.monsterHp / derived.monsterMaxHp) * 100;
  const expPercent = (state.exp / derived.expToNext) * 100;
  const currentMonster = useMemo(() => getMonsterProfile(state.regionId, state.regionStep, derived.isBoss), [state.regionId, state.regionStep, derived.isBoss]);
  const encounterRoster = useMemo(() => getRegionRoster(state.regionId), [state.regionId]);
  const nextMilestone = useMemo(() => {
    if (state.enhance < 10) return "+10 검 제작과 폐광 회랑 해금";
    if (state.level < 18) return "Lv.18 달성 또는 +18 검으로 붉은 성채 개방";
    if (state.enhance < 28) return "+28 검과 서리 협곡 진입";
    if (state.prestige < 1) return "서리 협곡 보스 처치 후 첫 명성 준비";
    if (state.enhance < 40) return "+40 검으로 심연 제련소 진입";
    if (state.prestige < ENDING_PRESTIGE_REQUIREMENT) return `명성 ${ENDING_PRESTIGE_REQUIREMENT}회 달성`;
    if (state.enhance < 50) return "+50 최종 검 제작";
    if (state.inventory.abyssCore < 10) return "심연핵 10개 확보";
    return "무명의 왕좌 최종 보스 처치";
  }, [state.enhance, state.inventory.abyssCore, state.level, state.prestige]);

  function mutate(mutator: (draft: GameState) => string | void, tone: LogTone = "neutral") {
    setState((prev) => {
      const draft: GameState = { ...prev, inventory: { ...prev.inventory }, traits: { ...prev.traits } };
      const message = mutator(draft);
      draft.lastSavedAt = Date.now();
      if (message) setLogs((old) => addLog(old, message, tone));
      return draft;
    });
  }

  function enhanceSword(useGuard = false, useStabilizer = false) {
    mutate((draft) => {
      const d = derive(draft);
      if (draft.enhance >= 50) return "이미 +50 최종 검입니다. 이제 무명의 왕좌를 노리십시오.";
      if (draft.gold < d.upgradeCost) {
        toast.error("골드 부족", { description: `${compact(d.upgradeCost)}G가 필요합니다.` });
        return;
      }
      if (useGuard && draft.inventory.guards <= 0) return "방지권이 부족합니다.";
      if (useStabilizer && draft.inventory.stabilizers <= 0) return "안정화석이 부족합니다.";
      draft.gold -= d.upgradeCost;
      if (useGuard) draft.inventory.guards -= 1;
      if (useStabilizer) draft.inventory.stabilizers -= 1;
      const stabilizerBonus = useStabilizer ? (draft.enhance >= 35 ? 5 : 9) : 0;
      const finalRate = clamp(d.successRate + stabilizerBonus, 1, 98);
      const success = Math.random() * 100 < finalRate;
      if (success) {
        draft.enhance += 1;
        draft.bestEnhance = Math.max(draft.bestEnhance, draft.enhance);
        draft.inventory.scraps += draft.enhance >= 20 ? 1 : 0;
        setDangerMode(false);
        toast.success(`강화 성공: +${draft.enhance}`, { description: `공격력이 ${compact(derive(draft).attack)}로 상승했습니다.` });
        return `강화 성공: 검이 +${draft.enhance} 단계에 도달했습니다.`;
      }
      const destroyed = draft.enhance >= 10 && Math.random() * 100 < d.destroyRate;
      const saved = destroyed && useGuard;
      draft.inventory.scraps += Math.max(1, Math.floor(draft.enhance / 3));
      if (destroyed && !saved) {
        const previous = draft.enhance;
        draft.enhance = Math.max(0, Math.floor(draft.enhance * 0.18));
        draft.monsterHp = Math.min(draft.monsterHp, getMonsterMaxHp(draft));
        setDangerMode(true);
        toast.error("검 파괴", { description: `+${previous} 검이 손상되어 +${draft.enhance}로 복원되었습니다.` });
        return `강화 실패 및 파괴: +${previous} → +${draft.enhance}. 파편을 회수했습니다.`;
      }
      setDangerMode(true);
      return saved ? "강화 실패: 방지권이 파괴를 막았습니다." : "강화 실패: 파편을 회수했습니다.";
    }, "pink");
  }

  function manualAttack() {
    mutate((draft) => {
      const d = derive(draft);
      draft.monsterHp -= d.clickDamage;
      if (draft.monsterHp <= 0) {
        const reward = calculateKillRewards(draft, d);
        draft.gold += reward.gold;
        awardExperience(draft, reward.exp);
        draft.monstersKilled += 1;
        if (Math.random() < reward.materialRollChance) draft.inventory[reward.materialKey] += reward.materialAmount;
        if (reward.boss) draft.bossesKilled += 1;
        draft.regionStep += 1;
        draft.monsterHp += getMonsterMaxHp(draft);
        return `${reward.boss ? "보스" : "몬스터"} 직접 처치: ${compact(reward.gold)}G와 ${compact(reward.exp)}EXP 획득`;
      }
    }, "cyan");
  }

  function sellSword() {
    mutate((draft) => {
      const d = derive(draft);
      if (draft.enhance <= 0) return "판매할 가치가 있는 강화 검이 없습니다.";
      draft.gold += d.saleValue;
      draft.inventory.scraps += Math.max(1, Math.floor(draft.enhance / 2));
      draft.swordsSold += 1;
      const soldLevel = draft.enhance;
      draft.enhance = 0;
      draft.monsterHp = Math.min(draft.monsterHp, getMonsterMaxHp(draft));
      toast("검 판매 완료", { description: `누적 투자 ${compact(d.cumulativeInvestment)}G 대비 +${compact(Math.max(0, d.saleProfit))}G 이익을 확보했습니다.` });
      return `+${soldLevel} 검을 ${compact(d.saleValue)}G에 판매했습니다. 누적 투자 대비 +${compact(Math.max(0, d.saleProfit))}G 이익입니다.`;
    }, "gold");
  }

  function buyItem(item: "guard" | "stabilizer" | "warp") {
    mutate((draft) => {
      const discount = 1 - clamp(draft.traits.merchant * 0.01, 0, 0.25);
      const price = item === "guard" ? Math.floor(2200 * discount) : item === "stabilizer" ? Math.floor(1400 * discount) : Math.floor(4800 * discount);
      if (draft.gold < price) return "상점 구매에 필요한 골드가 부족합니다.";
      draft.gold -= price;
      if (item === "guard") draft.inventory.guards += 1;
      if (item === "stabilizer") draft.inventory.stabilizers += 1;
      if (item === "warp") draft.inventory.warpTickets += 1;
      return `${item === "guard" ? "방지권" : item === "stabilizer" ? "안정화석" : "워프권"}을 구매했습니다.`;
    }, "gold");
  }

  function craft(recipe: "guard" | "stabilizer" | "warp") {
    mutate((draft) => {
      if (recipe === "guard") {
        if (draft.inventory.scraps < 28 || draft.inventory.ore < 5) return "방지권 제작에는 금속 파편 28개와 철광석 5개가 필요합니다.";
        draft.inventory.scraps -= 28;
        draft.inventory.ore -= 5;
        draft.inventory.guards += 1;
        return "조합 완료: 방지권 1개 제작";
      }
      if (recipe === "stabilizer") {
        if (draft.inventory.scraps < 18 || draft.inventory.soul < 3) return "안정화석 제작에는 금속 파편 18개와 영혼 결정 3개가 필요합니다.";
        draft.inventory.scraps -= 18;
        draft.inventory.soul -= 3;
        draft.inventory.stabilizers += 1;
        return "조합 완료: 안정화석 1개 제작";
      }
      if (draft.inventory.ore < 18 || draft.inventory.frost < 4) return "워프권 제작에는 철광석 18개와 냉각 결정 4개가 필요합니다.";
      draft.inventory.ore -= 18;
      draft.inventory.frost -= 4;
      draft.inventory.warpTickets += 1;
      return "조합 완료: 워프권 1개 제작";
    }, "cyan");
  }

  function investTrait(branch: TraitBranch) {
    mutate((draft) => {
      const d = derive(draft);
      const current = draft.traits[branch];
      const cost = 1 + Math.floor(current / 5);
      if (d.traitPointsAvailable < cost) return `특성 포인트가 부족합니다. 필요 포인트: ${cost}`;
      if (current >= 30) return "해당 특성 트리는 이미 최대 단계입니다.";
      draft.traits[branch] += 1;
      return `${TRAIT_INFO[branch].label} 특성 +1. 현재 ${draft.traits[branch]}단계입니다.`;
    }, TRAIT_INFO[branch].tone);
  }

  function switchRegion(regionId: RegionId) {
    mutate((draft) => {
      const region = getRegion(regionId);
      if (!isRegionUnlocked(region, draft)) return `${region.name}은 아직 잠겨 있습니다. 조건: ${region.unlock}`;
      draft.regionId = regionId;
      draft.regionStep = Math.max(1, Math.min(draft.regionStep, 5));
      draft.monsterHp = getMonsterMaxHp(draft, region);
      return `전투 지역 변경: ${region.name}`;
    }, "cyan");
  }

  function useWarp() {
    mutate((draft) => {
      if (draft.inventory.warpTickets <= 0) return "워프권이 없습니다.";
      draft.inventory.warpTickets -= 1;
      draft.regionStep += 5;
      draft.monsterHp = getMonsterMaxHp(draft);
      return "워프권 사용: 현재 지역 진행도가 5단계 상승했습니다.";
    }, "cyan");
  }

  function prestigeReset() {
    mutate((draft) => {
      const canPrestige = draft.enhance >= 32 && draft.level >= 35 && draft.bossesKilled >= 5;
      if (!canPrestige) return "명성 조건이 부족합니다. +32 검, Lv.35, 보스 처치 5회가 필요합니다.";
      const gained = Math.max(1, Math.floor((draft.bestEnhance - 25) / 4) + Math.floor(draft.level / 25));
      const keepTraits = draft.traits;
      const keepCreatedAt = draft.createdAt;
      const next = initialState();
      Object.assign(draft, next, {
        gold: 900 + gained * 300,
        level: 1,
        exp: 0,
        enhance: 0,
        bestEnhance: 0,
        prestige: draft.prestige + 1,
        prestigeStones: draft.prestigeStones + gained,
        totalPrestigeStones: draft.totalPrestigeStones + gained,
        traits: keepTraits,
        createdAt: keepCreatedAt,
        inventory: {
          ...next.inventory,
          guards: 1 + Math.floor(gained / 2),
          stabilizers: 1 + gained,
          scraps: gained * 12,
          ore: gained * 3,
          soul: 0,
          frost: 0,
          abyssCore: 0,
          warpTickets: 0,
        },
      });
      toast.success("명성 완료", { description: `명성석 ${gained}개를 획득했습니다.` });
      return `명성 완료: 영구 보너스 자원 ${gained}개 획득. 더 긴 회차가 시작됩니다.`;
    }, "gold");
  }


  const finalUnlocked = isRegionUnlocked(REGIONS[5], state);

  return (
    <main className={`game-shell ${dangerMode ? "danger-mode" : ""}`}>
      <div className="background-plate" />
      <div className={`floating-gold-hud ${showGoldHud ? "visible" : ""}`} aria-live="polite" aria-hidden={!showGoldHud}>
        <CircleDollarSign size={16} />
        <span>현재 골드</span>
        <strong>{compact(state.gold)}G</strong>
      </div>
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark"><Sword size={18} /></div>
          <div>
            <p>Typical Sword Game</p>
            <h1>픽셀 검 강화 RPG</h1>
          </div>
        </div>
        <div className="topbar-actions">
          <span className="system-pill"><Activity size={14} /> 자동 전투 가동 중</span>
        </div>
      </header>

      {offlineSummary ? (
        <section className="offline-panel">
          <Clock3 size={18} />
          <div>
            <strong>오프라인 보상 정산</strong>
            <p>{offlineSummary}</p>
          </div>
          <button onClick={() => setOfflineSummary(null)}>확인</button>
        </section>
      ) : null}

      <section className="hero-console world-hero">
        <div className="hero-copy">
          <span className="eyebrow">GREENVALE QUEST / IDLE SWORD RPG</span>
          <h2><span>숲속 마을의</span><span>작은 검사</span><span>장비 성장기</span></h2>
          <p>
            주인공 <strong>로안</strong>은 낡은 숲길 마을에서 검을 벼리며 성장합니다. 현재 목표는 <strong>{nextMilestone}</strong>이고,
            강화한 검은 누적 투자보다 높은 가격으로 판매해 다음 모험 장비를 마련합니다.
          </p>
          <div className="hero-status-board character-board" aria-label="캐릭터 전투 상태">
            <PixelAdventurer size="mini" />
            <div>
              <span>MAIN CHARACTER</span>
              <strong>Lv.{state.level} 로안 · 붉은 망토 용사</strong>
              <small>EXP {pct(expPercent)} · DPS {compact(derived.dps)} · +{state.enhance} 검</small>
            </div>
          </div>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => enhanceSword(false, false)}><Hammer size={17} /> 검 벼리기</button>
            <button className="secondary-button" onClick={manualAttack}><Sword size={17} /> 로안 공격</button>
          </div>
        </div>
        <div className="hero-visual pixel-world" aria-label="숲속 마을에서 검을 든 주인공 로안">
          <div className="world-sky" />
          <div className="world-hills hill-back" />
          <div className="world-hills hill-front" />
          <div className="world-village house-one"><span /><i /></div>
          <div className="world-village tower-one"><span /><i /></div>
          <div className="world-path" />
          <div className="world-tree tree-left"><span /><i /></div>
          <div className="world-tree tree-right"><span /><i /></div>
          <div className="world-lamp lamp-left" />
          <div className="world-lamp lamp-right" />
          <div className="world-forge"><span /></div>
          <PixelAdventurer size="hero" />
          <PixelMonster profile={currentMonster} variant="world" />
          <div className="world-label">QUEST READY</div>
          <div className="scanline" />
        </div>
      </section>

      <section className="stat-grid">
        <StatCard label="골드" value={`${compact(state.gold)}G`} hint="판매·전투 수익" tone="gold" />
        <StatCard label="검 강화" value={`+${state.enhance}`} hint={`최고 +${state.bestEnhance}`} tone={state.enhance >= 35 ? "orange" : "cyan"} />
        <StatCard label="공격력" value={compact(derived.attack)} hint={`${compact(derived.dps)} DPS`} tone="cyan" />
        <StatCard label="플레이어" value={`Lv.${state.level}`} hint={`${pct(expPercent)} 다음 레벨`} tone="neutral" />
        <StatCard label="명성" value={`${state.prestige}회`} hint={`석 ${state.prestigeStones}개`} tone="gold" />
        <StatCard label="처치" value={compact(state.monstersKilled)} hint={`보스 ${state.bossesKilled}회`} tone="orange" />
      </section>

      <section className="main-grid">
        <aside className="left-stack">
          <div className="panel sword-panel">
            <SectionTitle icon={Sword} title="로안의 장비" eyebrow="HERO EQUIPMENT" />
            <div className="hero-identity-card">
              <PixelAdventurer size="card" />
              <div>
                <span>주인공</span>
                <strong>로안, 붉은 망토 용사</strong>
                <small>대검과 작은 방패를 들고 숲길에서 왕좌까지 나아가는 픽셀 아트 모험가</small>
              </div>
            </div>
            <div className="sword-level-row">
              <strong>+{state.enhance}</strong>
              <div>
                <span>공격력 {compact(derived.attack)} · 판매가 {compact(derived.saleValue)}G</span>
                <ProgressBar value={derived.successRate} tone={state.enhance >= 30 ? "orange" : "cyan"} />
                <small>성공률 {pct(derived.successRate)} · 다음 비용 {compact(derived.upgradeCost)}G · 이익 +{compact(Math.max(0, derived.saleProfit))}G</small>
              </div>
            </div>
            <div className="quick-actions">
              <button onClick={() => enhanceSword(false, false)} disabled={state.gold < derived.upgradeCost}>강화</button>
              <button onClick={() => enhanceSword(true, false)} disabled={state.inventory.guards <= 0 || state.gold < derived.upgradeCost}>방지 강화</button>
              <button onClick={() => enhanceSword(false, true)} disabled={state.inventory.stabilizers <= 0 || state.gold < derived.upgradeCost}>안정화</button>
              <button onClick={sellSword} disabled={state.enhance <= 0}>확정 이익 판매</button>
            </div>
          </div>

          <div className="panel battle-panel">
            <SectionTitle icon={Skull} title="필드 전투" eyebrow={derived.currentRegion.short} />
            <div className={`monster-card pixel-encounter tone-border-${currentMonster.tone}`}>
              <div className="monster-stage" aria-label={`현재 적: ${currentMonster.name}`}>
                <PixelMonster profile={currentMonster} variant="large" />
                <div className="monster-shadow" />
              </div>
              <div className="monster-info">
                <span>{derived.isBoss || isFinalRegion(derived.currentRegion) ? "보스 개체" : currentMonster.title}</span>
                <h3>{isFinalRegion(derived.currentRegion) ? "무명의 왕좌" : currentMonster.name}</h3>
                <p>{currentMonster.cue}</p>
                <ProgressBar value={hpPercent} tone={derived.isBoss ? "orange" : currentMonster.tone} />
                <small>{derived.currentRegion.name} #{state.regionStep} · {compact(Math.max(0, state.monsterHp))} / {compact(derived.monsterMaxHp)} HP</small>
              </div>
            </div>
            <div className="monster-roster" aria-label="이 지역에서 마주치는 몬스터 종류">
              {encounterRoster.map((monster) => (
                <div className={monster.key === currentMonster.key ? "monster-chip active" : "monster-chip"} key={monster.key}>
                  <PixelMonster profile={monster} variant="chip" />
                  <span>{monster.name}</span>
                </div>
              ))}
            </div>
            <button className="wide-action" onClick={manualAttack}><Target size={16} /> 직접 공격 +{compact(derived.clickDamage)}</button>
          </div>

          <div className="panel log-panel">
            <SectionTitle icon={History} title="제련 기록" eyebrow="EVENT LOG" />
            <div className="logs">
              {logs.map((log) => (
                <p key={log.id} className={`log tone-text-${log.tone}`}>{log.text}</p>
              ))}
            </div>
          </div>
        </aside>

        <section className="right-console">
          <nav className="tabbar" aria-label="게임 메뉴">
            {[
              ["forge", Hammer, "강화"],
              ["battle", Skull, "지역"],
              ["market", ShoppingCart, "상점"],
              ["craft", FlaskConical, "조합"],
              ["traits", Sparkles, "특성"],
              ["prestige", Trophy, "명성"],
            ].map(([key, Icon, label]) => {
              const TypedIcon = Icon as typeof Hammer;
              return (
                <button key={key as string} className={activeTab === key ? "active" : ""} onClick={() => setActiveTab(key as TabKey)}>
                  <TypedIcon size={15} /> {label as string}
                </button>
              );
            })}
          </nav>

          {activeTab === "forge" ? (
            <div className="panel console-panel">
              <SectionTitle icon={Hammer} title="대장간 명령" eyebrow="UPGRADE COMMAND" />
              <div className="risk-table">
                <div><span>성공률</span><strong className="tone-text-cyan">{pct(derived.successRate)}</strong></div>
                <div><span>파괴율</span><strong className="tone-text-pink">{state.enhance < 10 ? "0%" : pct(derived.destroyRate)}</strong></div>
                <div><span>판매가</span><strong className="tone-text-gold">{compact(derived.saleValue)}G</strong></div>
                <div><span>누적 비용</span><strong>{compact(derived.cumulativeInvestment)}G</strong></div>
                <div><span>판매 이익</span><strong className="tone-text-gold">+{compact(Math.max(0, derived.saleProfit))}G</strong></div>
                <div><span>다음 비용</span><strong>{compact(derived.upgradeCost)}G</strong></div>
              </div>
              <div className="strategy-card">
                <h3>강화 판단</h3>
                <p>
                  검을 더 벼릴지, 지금 팔아 다음 원정 자금을 마련할지 고르는 구간입니다. +10 전까지는 재료와 골드를 모으며 손맛을 익히고, +10 이후에는 방지권과 안정화석을 보스 돌파용 검에 아껴 쓰십시오. 판매 이익이 충분히 쌓였을 때 한 번 정리하면 다음 지역 준비가 한결 수월해집니다.
                </p>
              </div>
            </div>
          ) : null}

          {activeTab === "battle" ? (
            <div className="panel console-panel">
              <SectionTitle icon={Skull} title="전투 지역" eyebrow="IDLE COMBAT" />
              <div className="region-list">
                {REGIONS.map((region) => {
                  const unlocked = isRegionUnlocked(region, state);
                  return (
                    <button key={region.id} className={state.regionId === region.id ? "region-card active" : "region-card"} onClick={() => switchRegion(region.id)}>
                      <div>
                        <strong>{region.name}</strong>
                        <span>{region.unlock}</span>
                      </div>
                      <small>{unlocked ? "해금" : "잠김"}</small>
                    </button>
                  );
                })}
              </div>
              <button className="wide-action" onClick={useWarp} disabled={state.inventory.warpTickets <= 0}><Zap size={16} /> 워프권 사용 · 현재 {state.inventory.warpTickets}개</button>
            </div>
          ) : null}

          {activeTab === "market" ? (
            <div className="panel console-panel">
              <SectionTitle icon={ShoppingCart} title="상점" eyebrow="PROFIT LOOP" />
              <div className="shop-grid">
                <ShopItem icon={ShieldCheck} title="방지권" price="2.2K G" text="강화 실패 시 파괴를 1회 방지합니다." onBuy={() => buyItem("guard")} />
                <ShopItem icon={FlaskConical} title="안정화석" price="1.4K G" text="다음 강화 성공률을 보정합니다." onBuy={() => buyItem("stabilizer")} />
                <ShopItem icon={ArrowUpRight} title="워프권" price="4.8K G" text="현재 지역 진행도를 빠르게 밀어 올립니다." onBuy={() => buyItem("warp")} />
              </div>
            </div>
          ) : null}

          {activeTab === "craft" ? (
            <div className="panel console-panel">
              <SectionTitle icon={FlaskConical} title="조합소" eyebrow="FAILURE RECOVERY" />
              <InventoryGrid inventory={state.inventory} />
              <div className="craft-list">
                <Recipe title="방지권 제작" cost="파편 28 · 철광석 5" onClick={() => craft("guard")} />
                <Recipe title="안정화석 제작" cost="파편 18 · 영혼 결정 3" onClick={() => craft("stabilizer")} />
                <Recipe title="워프권 제작" cost="철광석 18 · 냉각 결정 4" onClick={() => craft("warp")} />
              </div>
            </div>
          ) : null}

          {activeTab === "traits" ? (
            <div className="panel console-panel">
              <SectionTitle icon={Sparkles} title="특성 트리" eyebrow={`${derived.traitPointsAvailable} POINTS AVAILABLE`} />
              <div className="trait-grid">
                {(Object.keys(TRAIT_INFO) as TraitBranch[]).map((branch) => {
                  const info = TRAIT_INFO[branch];
                  const Icon = info.icon;
                  return (
                    <div className={`trait-card tone-border-${info.tone}`} key={branch}>
                      <div className="trait-head"><Icon size={18} /><strong>{info.label}</strong><span>{state.traits[branch]}/30</span></div>
                      <p>{info.summary}</p>
                      <div className="node-row">
                        {info.nodes.map((node, index) => (
                          <span key={node} className={state.traits[branch] >= (index + 1) * 7 ? "node active" : "node"}>{node}</span>
                        ))}
                      </div>
                      <button onClick={() => investTrait(branch)}>투자</button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {activeTab === "prestige" ? (
            <div className="panel console-panel">
              <SectionTitle icon={Trophy} title="명성과 엔딩" eyebrow="LONG ARC" />
              <div className="ending-grid">
                <CheckItem done={state.enhance >= 50} text="+50 검 보유" />
                <CheckItem done={state.level >= 60} text="플레이어 Lv.60 이상" />
                <CheckItem done={state.prestige >= ENDING_PRESTIGE_REQUIREMENT} text="명성 3회 이상" />
                <CheckItem done={state.inventory.abyssCore >= 10} text="심연핵 10개 보유" />
                <CheckItem done={finalUnlocked} text="무명의 왕좌 입장 조건 충족" />
              </div>
              <div className="strategy-card">
                <h3>명성 규칙</h3>
                <p>+32 검, Lv.35, 보스 처치 5회를 넘기면 명성으로 회차를 초기화하고 영구 보너스 자원인 명성석을 얻습니다.</p>
              </div>
              <button className="wide-action prestige" onClick={prestigeReset}><Award size={16} /> 명성 실행</button>
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
}

function ShopItem({ icon: Icon, title, price, text, onBuy }: { icon: typeof Hammer; title: string; price: string; text: string; onBuy: () => void }) {
  return (
    <div className="shop-item">
      <div className="shop-icon"><Icon size={18} /></div>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
        <button onClick={onBuy}><BadgePercent size={14} /> {price}</button>
      </div>
    </div>
  );
}

function DirectPixelSprite({ frames, width, height, className, title }: { frames: PixelRect[][]; width: number; height: number; className: string; title?: string }) {
  return (
    <svg className={`direct-pixel-sprite ${className}`} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title ?? "pixel sprite"} shapeRendering="crispEdges">
      {frames.map((frame, frameIndex) => (
        <g className={`sprite-frame sprite-frame-${frameIndex}`} key={frameIndex}>
          {frame.map(([x, y, w, h, color], index) => (
            <rect key={`${frameIndex}-${index}`} x={x} y={y} width={w} height={h} fill={color} />
          ))}
        </g>
      ))}
    </svg>
  );
}

function PixelAdventurer({ size = "hero" }: { size?: "hero" | "card" | "mini" }) {
  return (
    <div className={`pixel-adventurer pixel-adventurer-${size}`} aria-hidden="true">
      <span className="pa-shadow" />
      <div className="pixel-motion-frame hero-sprite-frame">
        <DirectPixelSprite frames={HERO_FRAMES} width={48} height={52} className="hero-direct-sprite" title="붉은 망토 용사 로안" />
      </div>
    </div>
  );
}

function PixelMonster({ profile, variant = "large" }: { profile: MonsterProfile; variant?: "large" | "chip" | "world" }) {
  return (
    <div className={`pixel-monster pixel-monster-${variant} monster-${profile.key}`} aria-hidden="true">
      <DirectPixelSprite frames={profile.frames} width={32} height={32} className="monster-direct-sprite" title={profile.name} />
    </div>
  );
}

function InventoryGrid({ inventory }: { inventory: Inventory }) {
  const rows: Array<[string, number, typeof Boxes, LogTone]> = [
    [MATERIAL_LABELS.scraps, inventory.scraps, Pickaxe, "neutral"],
    [MATERIAL_LABELS.ore, inventory.ore, Boxes, "neutral"],
    [MATERIAL_LABELS.soul, inventory.soul, Flame, "orange"],
    [MATERIAL_LABELS.frost, inventory.frost, PackageOpen, "cyan"],
    [MATERIAL_LABELS.abyssCore, inventory.abyssCore, Skull, "pink"],
    ["방지권", inventory.guards, ShieldCheck, "cyan"],
    ["안정화석", inventory.stabilizers, FlaskConical, "gold"],
    ["워프권", inventory.warpTickets, Zap, "orange"],
  ];
  return (
    <div className="inventory-grid">
      {rows.map(([name, amount, Icon, tone]) => (
        <div className={`inventory-item tone-border-${tone}`} key={name}>
          <Icon size={15} />
          <span>{name}</span>
          <strong>{compact(amount)}</strong>
        </div>
      ))}
    </div>
  );
}

function Recipe({ title, cost, onClick }: { title: string; cost: string; onClick: () => void }) {
  return (
    <button className="recipe" onClick={onClick}>
      <div><strong>{title}</strong><span>{cost}</span></div>
      <ArrowUpRight size={16} />
    </button>
  );
}

function CheckItem({ done, text }: { done: boolean; text: string }) {
  return (
    <div className={done ? "check-item done" : "check-item"}>
      <span>{done ? "완료" : "진행"}</span>
      <strong>{text}</strong>
    </div>
  );
}
