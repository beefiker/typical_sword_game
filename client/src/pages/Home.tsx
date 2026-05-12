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
  Check,
  CircleDollarSign,
  Clock3,
  Flame,
  FlaskConical,
  Hammer,
  History,
  Lock,
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
type TabKey = "forge" | "battle" | "market" | "craft" | "traits" | "prestige" | "artifacts";
type ArtifactRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
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
  artifacts: string[];
  prestigeUpgrades: Partial<Record<string, number>>;
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
type MonsterKey = "slime" | "goblin" | "skeleton" | "zombie" | "vampire" | "orc" | "ghost" | "wolf" | "lizardman" | "harpy" | "golem" | "bandit" | "troll" | "mummy" | "demon" | "witch" | "boss_tribal" | "boss_mine_lord" | "boss_veteran" | "boss_assassin" | "boss_infected" | "boss";

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
    // red cape – deep crimson outline, vivid mid, bright highlight
    px(8, 13 - capeLift, 13, 4, "#3d0818"), px(6, 17 - capeLift, 18, 6, "#c41840"), px(4, 23 - capeLift, 20, 7, "#f04455"),
    px(3, 30 - capeLift, 16, 5, "#c8203a"), px(3, 35 - capeLift, 8, 4, "#7a1a30"), px(11, 25 - capeLift, 9, 3, "#ff8075"),
    px(7, 18 - capeLift, 4, 3, "#ff9080"), // cape highlight edge
    // hair – dark root, mid-brown, highlight strand
    px(23, 4, 10, 3, "#08090e"), px(20, 7, 15, 5, "#08090e"), px(20, 12, 15, 4, "#08090e"),
    px(34, 9, 5, 3, "#08090e"), px(34, 13, 4, 2, "#08090e"),
    px(24, 7, 4, 3, "#2c1a0e"), px(28, 8, 3, 2, "#402414"), // hair texture
    // face – warm skin highlight, midtone, ears
    px(22, 12, 11, 9, "#ffd8bc"), px(22, 17, 12, 6, "#f0b490"), px(23, 12, 4, 3, "#ffe8d4"),
    px(20, 16, 3, 4, "#ffd8bc"), px(33, 15, 3, 4, "#ffd8bc"),
    // eyes – dark with bright highlight dot
    px(25, 15, 2, 3, "#141018"), px(31, 15, 2, 3, "#141018"),
    px(25, 15, 1, 1, "#4898e8"), px(31, 15, 1, 1, "#4898e8"), // iris blue
    // mouth
    px(28, 20, 3, 2, "#b0604e"),
    // blue tunic – base, highlight stripe, shadow
    px(22, 24, 13, 12, "#1a44a8"), px(24, 25, 7, 3, "#2e60d8"), px(22, 24, 2, 4, "#3070e8"),
    // gold fasteners
    px(29, 25, 3, 3, "#f8de22"), px(27, 30, 3, 3, "#f8de22"), px(31, 33, 3, 2, "#ffe066"),
    // belt + legs
    px(20, 35, 18, 3, "#5e3e30"), px(22, 38, 5, 6 + step, "#4e3830"), px(33, 38, 5, 6 - step, "#4e3830"),
    px(20, 44, 9, 3, "#0e1014"), px(33, 44, 9, 3, "#0e1014"),
    // arms + hands
    px(17, 25, 5, 11, "#ffd8bc"), px(36, 24, 5, 11, "#ffd8bc"), px(39, 27, 3, 4, "#ffd8bc"),
    // sword guard + hilt
    px(15, 31, 3, 8, "#a87018"), px(11, 37, 10, 2, "#c49228"), px(13, 34, 3, 3, "#f8de22"),
    // sword blade – crisp pixel columns with highlight + edge
    px(10, 39, 3, 3, "#e8f4f0"), px(8, 41, 3, 3, "#d0deda"), px(6, 43, 3, 3, "#e8f4f0"),
    px(4, 45, 3, 3, "#b8cac4"), px(2, 47, 3, 3, "#f4fcf8"),
    px(11, 40, 1, 2, "#ffffff"), px(7, 44, 1, 2, "#ffffff"), // blade gleam
    // shield on left arm
    px(38, 29, 6, 8, "#8a1638"), px(39, 30, 5, 6, "#f8de22"), px(40, 31, 3, 4, "#d12052"),
    px(40, 31, 1, 1, "#ff6090"), // shield highlight
  ];
}

function slimeFrame(flat = 0): PixelRect[] {
  return [px(8, 22 + flat, 16, 4, "#1c592f"), px(5, 18 + flat, 22, 5, "#2b8a3f"), px(7, 14 + flat, 19, 5, "#67c63a"), px(11, 11 + flat, 12, 4, "#9ce052"), px(15, 15 + flat, 3, 4, "#3b1736"), px(22, 16 + flat, 3, 4, "#3b1736"), px(12, 13 + flat, 5, 2, "#c8ff73"), px(26, 23 + flat, 3, 2, "#77df48")];
}

function goblinFrame(arm = 0): PixelRect[] {
  return [px(9, 7, 14, 4, "#1b2a16"), px(6, 10, 20, 9, "#6eb34c"), px(3, 12, 5, 4, "#6eb34c"), px(24, 12, 5, 4, "#6eb34c"), px(10, 13, 3, 4, "#1a1620"), px(20, 13, 3, 4, "#1a1620"), px(14, 18, 6, 2, "#25461e"), px(10, 21, 14, 8, "#56326d"), px(8, 23 + arm, 4, 4, "#6eb34c"), px(24, 22 - arm, 4, 4, "#6eb34c"), px(27, 21 - arm, 4, 2, "#cbd6c8"), px(12, 29, 4, 3, "#353039"), px(20, 29, 4, 3, "#353039")];
}

function skeletonFrame(step = 0): PixelRect[] {
  return [
    // skull top – bone highlight + midtone
    px(12, 3, 8, 2, "#2a2018"), px(12, 4, 8, 5, "#f0e8cc"), px(13, 4, 4, 2, "#fffce8"),
    // skull face
    px(9, 8, 14, 7, "#e8ddb5"), px(10, 8, 5, 2, "#f5edca"),
    px(9, 8, 1, 7, "#2a2018"), px(22, 8, 1, 7, "#2a2018"),
    // eye sockets – dark + amber glow
    px(11, 10, 4, 4, "#0d0b10"), px(18, 10, 4, 4, "#0d0b10"),
    px(12, 11, 2, 2, "#c97800"), px(19, 11, 2, 2, "#c97800"),
    px(12, 11, 1, 1, "#ffd060"), px(19, 11, 1, 1, "#ffd060"),
    // nose void
    px(15, 15, 3, 2, "#0d0b10"),
    // jaw
    px(13, 16, 1, 4, "#2a2018"), px(20, 16, 1, 4, "#2a2018"),
    px(14, 16, 6, 1, "#e8ddb5"), px(14, 17, 6, 3, "#ccc298"),
    // teeth
    px(15, 18, 2, 2, "#f0e8cc"), px(18, 18, 2, 2, "#f0e8cc"),
    // ribcage frame
    px(11, 20, 11, 1, "#1e1a14"), px(11, 27, 11, 1, "#1e1a14"),
    px(11, 20, 1, 8, "#1e1a14"), px(21, 20, 1, 8, "#1e1a14"),
    // ribs interior fill + rib stripes
    px(12, 21, 9, 6, "#dbd1ad"),
    px(12, 22, 3, 2, "#b5aa82"), px(17, 22, 3, 2, "#b5aa82"),
    px(12, 25, 3, 1, "#b5aa82"), px(17, 25, 3, 1, "#b5aa82"),
    // spine column
    px(15, 16, 2, 12, "#c4ba90"),
    // arms (bone sticks with shadow side)
    px(8, 19, 3, 9, "#dbd1ad"), px(10, 19, 1, 9, "#b5aa82"),
    px(21, 19, 3, 9, "#dbd1ad"), px(21, 19, 1, 9, "#b5aa82"),
    // legs – clamped within 32px viewBox
    px(12, 27, 3, 2 + step, "#dbd1ad"), px(12, 28 + step, 3, 1, "#2a2018"),
    px(18, 27, 3, 2 - step, "#dbd1ad"), px(18, 28 - step, 3, 1, "#2a2018"),
  ];
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
  return [
    // body – cool white with inner glow tint
    px(10, 6 + float, 12, 4, "#f0f8f4"), px(9, 7 + float, 3, 2, "#dff0eb"),
    px(7, 10 + float, 18, 10, "#eaf5f0"), px(7, 10 + float, 4, 3, "#ffffff"),
    px(6, 20 + float, 20, 7, "#c0e4dc"),
    // wispy bottom tendrils
    px(8, 27 + float, 4, 3, "#b4d8d0"), px(16, 27 + float, 4, 3, "#c0e4dc"), px(23, 27 + float, 4, 3, "#b4d8d0"),
    // dark hollow eyes with cyan inner glow
    px(11, 13 + float, 4, 5, "#1c2040"), px(20, 13 + float, 4, 5, "#1c2040"),
    px(12, 14 + float, 2, 3, "#30b8d8"), px(21, 14 + float, 2, 3, "#30b8d8"), // eye glow
    px(12, 14 + float, 1, 1, "#80f0ff"), px(21, 14 + float, 1, 1, "#80f0ff"), // eye spark
    // translucent mouth
    px(15, 20 + float, 7, 2, "#8ab8c8"),
    // edge shimmer
    px(7, 10 + float, 1, 10, "#d8f0ea"), px(24, 10 + float, 1, 10, "#d8f0ea"),
  ];
}

function wolfFrame(step = 0): PixelRect[] {
  return [px(5, 12, 8, 5, "#10151b"), px(2, 14, 5, 4, "#10151b"), px(7, 8, 3, 5, "#1b222c"), px(13, 10, 14, 8, "#28323f"), px(24, 13, 6, 5, "#28323f"), px(29, 10, 2, 6, "#10151b"), px(4, 15, 2, 2, "#d12052"), px(15, 18, 4, 9 + step, "#10151b"), px(24, 18, 4, 9 - step, "#10151b"), px(10, 18, 4, 7, "#1b222c"), px(28, 17, 3, 7, "#1b222c"), px(15, 12, 8, 3, "#3b4654")];
}

function bossFrame(pulse = 0): PixelRect[] {
  return [
    // dark massive body silhouette
    px(5, 4, 22, 5, "#0c0510"), px(3, 9, 26, 11, "#200f33"), px(6, 20, 20, 8, "#0e0614"),
    // outline edges
    px(3, 9, 1, 11, "#3a1250"), px(28, 9, 1, 11, "#3a1250"),
    // glowing red eyes – large and menacing
    px(9, 11, 4, 6, "#c0103a"), px(20, 11, 4, 6, "#c0103a"),
    px(10, 12, 2, 4, "#ff2060"), px(21, 12, 2, 4, "#ff2060"), // eye inner glow
    px(10, 12, 1, 1, "#ffb0c0"), px(21, 12, 1, 1, "#ffb0c0"), // eye spark
    // golden core – pulsing size
    px(14, 19, 5 + pulse, 3, "#f8de22"), px(14 + 1, 19, 3 + pulse, 1, "#fffcb0"),
    // purple shoulder masses
    px(2, 15, 5, 6, "#421566"), px(4, 15, 2, 4, "#6024a0"),
    px(26, 15, 5, 6, "#421566"), px(26, 15, 2, 4, "#6024a0"),
    // legs / base
    px(10, 28, 4, 4, "#240f36"), px(20, 28, 4, 4, "#240f36"),
    px(10, 28, 2, 2, "#3a1850"), px(20, 28, 2, 2, "#3a1850"),
    // dark aura fringe top
    px(7, 4, 2, 2, "#2a0840"), px(14, 3, 4, 2, "#2a0840"), px(21, 4, 2, 2, "#2a0840"),
  ];
}

function lizardmanFrame(step = 0): PixelRect[] {
  return [px(11,4,10,7,"#7aaa2c"),px(13,4,6,2,"#8cc030"),px(12,7,2,2,"#ffcc00"),px(18,7,2,2,"#ffcc00"),px(13,8,1,1,"#0a1a05"),px(19,8,1,1,"#0a1a05"),px(11,10,10,12,"#5a7a20"),px(10,9,12,3,"#6b8c28"),px(8,12,3,7+step,"#5a7a20"),px(21,12,3,7-step,"#5a7a20"),px(7,18,6,3,"#4a6418"),px(4,20,4,2,"#3c5010"),px(12,23,4,6,"#4a6418"),px(18,23,4,6,"#4a6418"),px(9,22+step,3,2,"#2e3e08"),px(21,21-step,3,2,"#2e3e08")];
}

function harpyFrame(wing = 0): PixelRect[] {
  return [px(12,2,8,6,"#e8c890"),px(12,1,8,3,"#8b5e2a"),px(14,4,2,3,"#3a1510"),px(18,4,2,3,"#3a1510"),px(2,8-wing,10,8,"#8b5e2a"),px(1,10-wing,6,4,"#6b4020"),px(20,8-wing,10,8,"#8b5e2a"),px(21,10-wing,6,4,"#6b4020"),px(3,14+wing,5,4,"#c4944a"),px(24,14+wing,4,4,"#c4944a"),px(11,7,10,10,"#c4944a"),px(13,8,6,3,"#e0b870"),px(12,17,4,8,"#8b5e2a"),px(18,17,4,8,"#8b5e2a"),px(10,24,4,3,"#6b4020"),px(20,24,4,3,"#6b4020"),px(8,25,3,2,"#6b4020"),px(21,25,3,2,"#6b4020")];
}

function golemFrame(sway = 0): PixelRect[] {
  return [px(8,4+sway,16,5,"#4a4a4a"),px(6,8+sway,20,15,"#5c5c5c"),px(7,8+sway,18,4,"#6e6e6e"),px(4,10+sway,4,8,"#5c5c5c"),px(24,10+sway,4,8,"#5c5c5c"),px(10,12+sway,2,6,"#3a3a3a"),px(20,10+sway,2,4,"#3a3a3a"),px(13,14+sway,6,6,"#ff8800"),px(14,15+sway,4,4,"#ffaa00"),px(15,16+sway,2,2,"#ffee44"),px(10,9+sway,3,3,"#ff6600"),px(19,9+sway,3,3,"#ff6600"),px(9,23+sway,5,5,"#4a4a4a"),px(18,23+sway,5,5,"#4a4a4a"),px(2,17+sway,4,4,"#3a3a3a"),px(26,17+sway,4,4,"#3a3a3a")];
}

function banditFrame(arm = 0): PixelRect[] {
  return [px(10,2,12,8,"#1a1a2e"),px(11,3,10,6,"#2a2a40"),px(12,7,8,6,"#d4a880"),px(13,8,3,2,"#2a1510"),px(18,8,3,2,"#2a1510"),px(9,13,14,12,"#1a1a2e"),px(10,14,12,4,"#2a2a40"),px(10,20,12,2,"#5a3a1a"),px(15,20,2,2,"#c0a020"),px(7,13,3,9+arm,"#2a2a40"),px(22,13,3,9-arm,"#2a2a40"),px(5,20+arm,3,8,"#d0d8e8"),px(5,20+arm,1,4,"#e8eef8"),px(24,18-arm,3,8,"#d0d8e8"),px(25,18-arm,1,4,"#e8eef8"),px(11,26,4,4,"#2a1a0e"),px(17,26,4,4,"#2a1a0e")];
}

function trollFrame(step = 0): PixelRect[] {
  return [px(9,3,14,10,"#5a7a5a"),px(11,4,10,4,"#7a9a7a"),px(14,9,4,3,"#3a5a3a"),px(11,7,3,3,"#1a1a1a"),px(18,7,3,3,"#1a1a1a"),px(12,7,2,2,"#ff4400"),px(19,7,2,2,"#ff4400"),px(6,12,20,14,"#4a6a4a"),px(7,12,18,5,"#5a7a5a"),px(2,11,6,12+step,"#4a6a4a"),px(24,11,6,12-step,"#4a6a4a"),px(1,22+step,7,5,"#3a5a3a"),px(24,20-step,7,5,"#3a5a3a"),px(26,4,3,14-step,"#7a5a3a"),px(24,2,7,6,"#8a6a4a"),px(9,26,5,4,"#3a5a3a"),px(17,26,5,4,"#3a5a3a")];
}

function mummyFrame(wrap = 0): PixelRect[] {
  return [px(11,3,10,9,"#e8dcc0"),px(11,3,10,2,"#d4c8a8"),px(11,6,10,2,"#c0b490"),px(13,5,3,3,"#00aa44"),px(19,5,3,3,"#00aa44"),px(14,6,1,2,"#44ff88"),px(20,6,1,2,"#44ff88"),px(10,11,12,14,"#d4c8a8"),px(10,14,12,2,"#b8ac88"),px(10,18,12,2,"#b8ac88"),px(2,12,8+wrap,4,"#d4c8a8"),px(22,12,8+wrap,4,"#d4c8a8"),px(11,25,4,5,"#c0b490"),px(17,25,4,5,"#c0b490"),px(10,28,5,2,"#b0a480"),px(17,28,5,2,"#b0a480")];
}

function demonFrame(pulse = 0): PixelRect[] {
  return [px(12,0,3,5,"#8a1010"),px(19,0,3,5,"#8a1010"),px(13,0,1,3,"#c02020"),px(20,0,1,3,"#c02020"),px(11,4,10,8,"#c43020"),px(12,5,8,4,"#d84030"),px(13,7,3,3,"#ff2020"),px(18,7,3,3,"#ff2020"),px(14,7,1,2,"#ff8080"),px(19,7,1,2,"#ff8080"),px(10,12,12,12,"#8a1010"),px(11,12,10,4,"#c43020"),px(1,8,10,14-pulse,"#4a0808"),px(2,7,7,3,"#6a1010"),px(21,8,10,14-pulse,"#4a0808"),px(23,7,7,3,"#6a1010"),px(8,13,4,10+pulse,"#c43020"),px(20,13,4,10-pulse,"#c43020"),px(7,22+pulse,5,3,"#8a1010"),px(20,21-pulse,5,3,"#8a1010"),px(12,24,4,6,"#8a1010"),px(17,24,4,6,"#8a1010")];
}

function witchFrame(float = 0): PixelRect[] {
  return [px(13,0,6,3,"#1a1428"),px(11,2,10,4,"#2a2040"),px(9,5,14,3,"#2a2040"),px(7,7,18,2,"#1a1428"),px(12,8,8,7,"#a8c890"),px(13,9,6,3,"#c0e0a8"),px(13,10,2,2,"#ddbb00"),px(19,10,2,2,"#ddbb00"),px(17,13,2,3,"#88a870"),px(14,15,6,2,"#88a870"),px(8,14,16,13,"#2a2040"),px(10,14,12,4,"#3a3060"),px(5,4-float,3,24,"#7a5a2a"),px(2,2-float,6,4,"#2040b0"),px(3,3-float,4,2,"#6080ff"),px(4,3-float,2,1,"#d0e0ff"),px(6,17,4,6,"#2a2040"),px(22,17,4,6,"#2a2040"),px(5,23,4,3,"#a8c890"),px(23,23,4,3,"#a8c890"),px(11,27,4,4,"#1a1428"),px(17,27,4,4,"#1a1428")];
}

function bossTribalFrame(arm = 0): PixelRect[] {
  return [px(9,0,14,3,"#c88000"),px(8,0,2,5,"#c88000"),px(14,0,4,5,"#c88000"),px(22,0,2,5,"#c88000"),px(9,1,14,2,"#f8d040"),px(6,0,3,4,"#d02020"),px(23,0,3,4,"#d02020"),px(8,4,16,11,"#6eb34c"),px(10,5,12,5,"#88cc5c"),px(4,7,5,5,"#6eb34c"),px(23,7,5,5,"#6eb34c"),px(10,8,4,4,"#cc8800"),px(19,8,4,4,"#cc8800"),px(11,9,2,2,"#ffc000"),px(20,9,2,2,"#ffc000"),px(12,13,3,4,"#e8e0c0"),px(18,13,3,4,"#e8e0c0"),px(6,14,20,12,"#5c9a3c"),px(8,14,16,4,"#6eb34c"),px(27,3,4,15-arm,"#7a5a2a"),px(24,2,8,5,"#b0b8c0"),px(25,1,6,3,"#d0d8e8"),px(3,17+arm,4,4,"#6eb34c"),px(9,26,5,5,"#4a7a30"),px(18,26,5,5,"#4a7a30")];
}

function bossMineFrame(step = 0): PixelRect[] {
  return [px(9,3,14,2,"#6a6a70"),px(8,5,16,8,"#7a7a80"),px(9,5,14,3,"#9a9aa8"),px(10,4,3,2,"#c89060"),px(19,4,3,2,"#c89060"),px(10,8,5,5,"#e8ddb5"),px(18,8,5,5,"#e8ddb5"),px(12,9,3,4,"#0d0b10"),px(18,9,3,4,"#0d0b10"),px(13,10,1,2,"#c97800"),px(19,10,1,2,"#c97800"),px(7,13,18,12,"#6a6a70"),px(9,13,14,4,"#8a8a98"),px(4,12,5,5,"#7a7a80"),px(23,12,5,5,"#7a7a80"),px(5,16,4,8+step,"#dbd1ad"),px(23,16,4,8-step,"#dbd1ad"),px(25,4,2,15+step,"#7a5a2a"),px(22,3,8,5,"#8a8a98"),px(23,2,6,3,"#aaaabc"),px(10,25,5,5,"#5a5a68"),px(17,25,5,5,"#5a5a68")];
}

function bossVeteranFrame(step = 0): PixelRect[] {
  return [px(10,1,12,4,"#8a8a9a"),px(9,5,14,6,"#9a9aac"),px(10,5,12,3,"#b0b0c0"),px(11,8,10,2,"#1a1a2a"),px(12,8,8,1,"#3a3a50"),px(7,11,18,15,"#8a8a9a"),px(9,11,14,4,"#a8a8b8"),px(15,13,2,8,"#c8a020"),px(11,16,10,2,"#c8a020"),px(3,10,6,6,"#9a9aac"),px(23,10,6,6,"#9a9aac"),px(4,10,4,3,"#b0b0c0"),px(24,10,4,3,"#b0b0c0"),px(4,15,4,8,"#8a8a9a"),px(24,15,4,8,"#8a8a9a"),px(0,12,6,10,"#8a1638"),px(1,13,4,8,"#f8de22"),px(2,14,2,6,"#d12052"),px(29,4+step,2,16,"#d0d8e8"),px(27,3+step,5,3,"#c49228"),px(29,5+step,1,6,"#ffffff"),px(10,26,5,4,"#7a7a8a"),px(17,26,5,4,"#7a7a8a"),px(9,28,6,3,"#5a5a6a"),px(17,28,6,3,"#5a5a6a")];
}

function bossAssassinFrame(flash = 0): PixelRect[] {
  return [px(11,4,10,8,"#08101a"),px(12,5,8,4,"#102030"),px(9,2,14,5,"#060e18"),px(10,3,12,3,"#0c1828"),px(13,7,3,2,"#60c0f0"),px(18,7,3,2,"#60c0f0"),px(14,7,1,1,"#c0f0ff"),px(19,7,1,1,"#c0f0ff"),px(9,11,14,13,"#081018"),px(10,11,12,3,"#0c1828"),px(9,13,2,8,"#204060"),px(21,13,2,8,"#204060"),px(5,12,6,10+flash,"#081018"),px(21,12,6,10-flash,"#081018"),px(2,16+flash,3,12,"#80d0f8"),px(3,16+flash,1,8,"#c8f0ff"),px(27,14-flash,3,12,"#80d0f8"),px(28,14-flash,1,8,"#c8f0ff"),px(0,10,2,2,"#a0e8ff"),px(30,8,2,2,"#a0e8ff")];
}

function bossInfectedFrame(pulse = 0): PixelRect[] {
  return [px(8,12-pulse,12,4,"#2a0835"),px(6,16-pulse,16,6,"#4a1060"),px(4,22-pulse,18,5,"#3a0848"),px(11,14,10,12,"#1a1468"),px(12,14,8,3,"#2a2888"),px(9,16,4,4,"#8a20c8"),px(19,15,5,5,"#8a20c8"),px(14,22,5,5,"#7018b0"),px(10,24,3,3,"#9030e0"),px(12,4,8,6,"#ffd8bc"),px(12,4,3,3,"#ffe8d4"),px(14,4,4,2,"#6010a0"),px(20,6,3,4,"#7020b0"),px(14,7,2,2,"#4898e8"),px(18,7,2,2,"#c030ff"),px(11,4,10,3,"#1a0828"),px(8,15,4,9+pulse,"#1a1468"),px(20,15,4,9-pulse,"#1a1468"),px(5,19+pulse,2,10,"#4a2868"),px(4,22+pulse,5,2,"#7a4a98"),px(12,26,4,5,"#14105a"),px(17,26,4,5,"#14105a"),px(11,30,3,2,"#8a20c8"),px(18,30,3,2,"#8a20c8")];
}

const HERO_FRAMES = [heroFrame(0, 0), heroFrame(1, 1)];
const HERO_SPRITE = spriteSheet(48, 52, HERO_FRAMES);

const MONSTER_PROFILES: Record<MonsterKey, MonsterProfile> = {
  slime: { key: "slime", name: "초록 슬라임", title: "젤리 점액체", habitat: "숲 바닥", cue: "둥근 몸통과 작은 눈으로 식별", tone: "cyan", sprite: spriteSheet(32, 32, [slimeFrame(0), slimeFrame(1)]), frames: [slimeFrame(0), slimeFrame(1)] },
  goblin: { key: "goblin", name: "고블린 척후병", title: "단검 도적", habitat: "잿빛 숲", cue: "긴 귀, 초록 피부, 보라 튜닉", tone: "orange", sprite: spriteSheet(32, 32, [goblinFrame(0), goblinFrame(1)]), frames: [goblinFrame(0), goblinFrame(1)] },
  bandit: { key: "bandit", name: "산적 용병", title: "이중 단검 도적", habitat: "잿빛 숲 외곽", cue: "검은 두건과 쌍 단검", tone: "neutral", sprite: spriteSheet(32, 32, [banditFrame(0), banditFrame(1)]), frames: [banditFrame(0), banditFrame(1)] },
  harpy: { key: "harpy", name: "하피 약탈자", title: "날개 포식자", habitat: "잿빛 숲 상공", cue: "갈색 깃털과 날카로운 발톱", tone: "gold", sprite: spriteSheet(32, 32, [harpyFrame(0), harpyFrame(1)]), frames: [harpyFrame(0), harpyFrame(1)] },
  lizardman: { key: "lizardman", name: "도마뱀 전사", title: "비늘 사냥꾼", habitat: "잿빛 숲 깊은 곳", cue: "황금빛 눈과 올리브 비늘", tone: "orange", sprite: spriteSheet(32, 32, [lizardmanFrame(0), lizardmanFrame(1)]), frames: [lizardmanFrame(0), lizardmanFrame(1)] },
  zombie: { key: "zombie", name: "좀비 광부", title: "느린 부패자", habitat: "폐광 회랑", cue: "녹색 피부와 앞으로 뻗은 팔", tone: "neutral", sprite: spriteSheet(32, 32, [zombieFrame(0), zombieFrame(1)]), frames: [zombieFrame(0), zombieFrame(1)] },
  skeleton: { key: "skeleton", name: "해골 병사", title: "뼈 갑주", habitat: "폐광 회랑", cue: "두개골과 갈비뼈 실루엣", tone: "gold", sprite: spriteSheet(32, 32, [skeletonFrame(0), skeletonFrame(1)]), frames: [skeletonFrame(0), skeletonFrame(1)] },
  mummy: { key: "mummy", name: "미라 수호자", title: "붕대 망자", habitat: "폐광 고대 유적", cue: "붕대에 싸인 몸과 초록 눈빛", tone: "cyan", sprite: spriteSheet(32, 32, [mummyFrame(0), mummyFrame(1)]), frames: [mummyFrame(0), mummyFrame(1)] },
  troll: { key: "troll", name: "동굴 트롤", title: "거대 몽둥이 야수", habitat: "폐광 심층", cue: "회녹색 거대 몸통과 붉은 눈", tone: "orange", sprite: spriteSheet(32, 32, [trollFrame(0), trollFrame(1)]), frames: [trollFrame(0), trollFrame(1)] },
  golem: { key: "golem", name: "석조 골렘", title: "광물 수호자", habitat: "폐광 핵", cue: "돌덩이 몸통과 주황 불꽃 핵", tone: "gold", sprite: spriteSheet(32, 32, [golemFrame(0), golemFrame(1)]), frames: [golemFrame(0), golemFrame(1)] },
  orc: { key: "orc", name: "오크 돌격병", title: "도끼 전위", habitat: "붉은 성채", cue: "큰 턱, 송곳니, 도끼 실루엣", tone: "orange", sprite: spriteSheet(32, 32, [orcFrame(0), orcFrame(1)]), frames: [orcFrame(0), orcFrame(1)] },
  vampire: { key: "vampire", name: "밤의 흡혈귀", title: "붉은 망토 귀족", habitat: "붉은 성채", cue: "검은 머리, 붉은 눈, 펼친 망토", tone: "pink", sprite: spriteSheet(32, 32, [vampireFrame(0), vampireFrame(1)]), frames: [vampireFrame(0), vampireFrame(1)] },
  witch: { key: "witch", name: "어둠 마녀", title: "긴 모자 주술사", habitat: "서리 협곡", cue: "뾰족한 모자와 빛나는 마법 지팡이", tone: "gold", sprite: spriteSheet(32, 32, [witchFrame(0), witchFrame(1)]), frames: [witchFrame(0), witchFrame(1)] },
  demon: { key: "demon", name: "심연 악마", title: "박쥐날개 악령", habitat: "심연 제련소", cue: "진홍 몸통과 넓게 펼친 박쥐 날개", tone: "pink", sprite: spriteSheet(32, 32, [demonFrame(0), demonFrame(1)]), frames: [demonFrame(0), demonFrame(1)] },
  wolf: { key: "wolf", name: "검은 늑대", title: "서리 추적자", habitat: "서리 협곡", cue: "낮은 네발 자세와 붉은 눈", tone: "neutral", sprite: spriteSheet(32, 32, [wolfFrame(0), wolfFrame(1)]), frames: [wolfFrame(0), wolfFrame(1)] },
  ghost: { key: "ghost", name: "협곡 귀신", title: "떠도는 혼백", habitat: "서리 협곡", cue: "흰 천처럼 흔들리는 하단부", tone: "cyan", sprite: spriteSheet(32, 32, [ghostFrame(0), ghostFrame(-1)]), frames: [ghostFrame(0), ghostFrame(-1)] },
  boss_tribal: { key: "boss_tribal", name: "부족장 그롬", title: "잿빛 숲의 지배자", habitat: "잿빛 숲 심연", cue: "금빛 왕관과 거대한 전쟁 도끼", tone: "orange", sprite: spriteSheet(32, 32, [bossTribalFrame(0), bossTribalFrame(1)]), frames: [bossTribalFrame(0), bossTribalFrame(1)] },
  boss_mine_lord: { key: "boss_mine_lord", name: "갱도 감독관", title: "어둠 회랑의 통치자", habitat: "폐광 최심층", cue: "갑옷 입은 해골 감독관과 거대 곡괭이", tone: "gold", sprite: spriteSheet(32, 32, [bossMineFrame(0), bossMineFrame(1)]), frames: [bossMineFrame(0), bossMineFrame(1)] },
  boss_veteran: { key: "boss_veteran", name: "퇴역 기사단장", title: "붉은 성채의 수호자", habitat: "붉은 성채 왕좌", cue: "완전 판금 갑옷과 방패의 십자 문장", tone: "cyan", sprite: spriteSheet(32, 32, [bossVeteranFrame(0), bossVeteranFrame(1)]), frames: [bossVeteranFrame(0), bossVeteranFrame(1)] },
  boss_assassin: { key: "boss_assassin", name: "빙하 암살자", title: "서리 협곡의 그림자", habitat: "서리 협곡 심부", cue: "얼음 단검 두 자루와 거의 보이지 않는 형체", tone: "cyan", sprite: spriteSheet(32, 32, [bossAssassinFrame(0), bossAssassinFrame(1)]), frames: [bossAssassinFrame(0), bossAssassinFrame(1)] },
  boss_infected: { key: "boss_infected", name: "감염된 용사", title: "심연에 물든 영웅", habitat: "심연 제련소 중심", cue: "자주빛 부패가 퍼진 타락한 전사의 형체", tone: "pink", sprite: spriteSheet(32, 32, [bossInfectedFrame(0), bossInfectedFrame(1)]), frames: [bossInfectedFrame(0), bossInfectedFrame(1)] },
  boss: { key: "boss", name: "무명의 수문장", title: "왕좌의 그림자", habitat: "심연", cue: "거대한 검은 형체와 붉은 핵", tone: "pink", sprite: spriteSheet(32, 32, [bossFrame(0), bossFrame(2)]), frames: [bossFrame(0), bossFrame(2)] },
};

type RegionMonsters = { progression: MonsterKey[]; boss: MonsterKey };

const REGION_MONSTER_KEYS: Record<RegionId, RegionMonsters> = {
  ash_forest:      { progression: ["slime", "goblin", "bandit", "harpy", "lizardman"],      boss: "boss_tribal" },
  mine_corridor:   { progression: ["zombie", "skeleton", "mummy", "troll", "golem"],        boss: "boss_mine_lord" },
  red_citadel:     { progression: ["orc", "vampire", "witch", "troll", "demon"],            boss: "boss_veteran" },
  frost_rift:      { progression: ["wolf", "ghost", "witch", "lizardman", "vampire"],       boss: "boss_assassin" },
  abyss_forge:     { progression: ["demon", "orc", "vampire", "golem", "witch", "ghost"],  boss: "boss_infected" },
  nameless_throne: { progression: ["demon", "ghost", "vampire"],                            boss: "boss" },
};

function getMonsterProfile(regionId: RegionId, regionStep: number, isBoss: boolean) {
  const regionMonsters = REGION_MONSTER_KEYS[regionId];
  if (isBoss) return MONSTER_PROFILES[regionMonsters.boss];
  const keys = regionMonsters.progression;
  const unlocked = Math.min(Math.ceil(regionStep / 6), keys.length);
  return MONSTER_PROFILES[keys[(regionStep - 1) % unlocked]];
}

const MATERIAL_LABELS: Record<MaterialKey, string> = {
  scraps: "금속 파편",
  ore: "철광석",
  soul: "영혼 결정",
  frost: "냉각 결정",
  abyssCore: "심연핵",
};

// Node thresholds: cumulative trait points required to reach each node
const TRAIT_NODE_THRESHOLDS = [1, 3, 7, 12, 19, 27] as const;

type TraitNodeDef = { name: string; desc: string };

const TRAIT_BRANCHES: Record<TraitBranch, {
  label: string; icon: typeof Hammer; tone: LogTone; nodes: TraitNodeDef[];
}> = {
  smith: {
    label: "대장장이", icon: Hammer, tone: "cyan",
    nodes: [
      { name: "날카로운 날",    desc: "강화 비용 -5%" },
      { name: "안정된 손목",    desc: "성공률 +3%" },
      { name: "균열 감지",      desc: "파괴율 -10%" },
      { name: "제련 마스터",    desc: "강화 비용 -10% · 성공률 +3%" },
      { name: "완벽한 담금질",  desc: "성공률 +7%" },
      { name: "전설의 검객",    desc: "강화 비용 -15% · 파괴율 -15%" },
    ],
  },
  hunter: {
    label: "사냥꾼", icon: Target, tone: "orange",
    nodes: [
      { name: "날카로운 시야",  desc: "공격력 +5%" },
      { name: "빠른 발걸음",    desc: "DPS +8%" },
      { name: "약점 포착",      desc: "클릭 피해 +15%" },
      { name: "사냥 본능",      desc: "재료 확률 +8% · 경험치 +10%" },
      { name: "전투 광기",      desc: "공격력 +15% · DPS +10%" },
      { name: "왕의 사냥꾼",    desc: "공격력 +25% · 클릭 피해 +25%" },
    ],
  },
  merchant: {
    label: "상인", icon: CircleDollarSign, tone: "gold",
    nodes: [
      { name: "흥정의 기술",    desc: "상점 할인 -8%" },
      { name: "시장 안목",      desc: "판매 이익 +10%" },
      { name: "단골 상인",      desc: "상점 할인 -12%" },
      { name: "무역 전문가",    desc: "골드 +10% · 판매 이익 +12%" },
      { name: "상인의 직감",    desc: "골드 +15% · 상점 할인 -15%" },
      { name: "황금 제국",      desc: "골드 +25% · 판매 이익 +25%" },
    ],
  },
};

// ── ARTIFACT SYSTEM ──────────────────────────────────────────
type ArtifactDef = {
  id: string; name: string; desc: string; flavor: string;
  rarity: ArtifactRarity;
  attackMult?: number; dpsMult?: number; clickMult?: number;
  goldMult?: number; expMult?: number;
  successRateAdd?: number; destroyRateAdd?: number;
  materialChanceAdd?: number; costMult?: number;
};

const ARTIFACT_DEFS: ArtifactDef[] = [
  // common
  { id: "fortune_shard",    rarity: "common",   name: "행운의 파편",       desc: "골드 획득 +8%",                           flavor: "낡은 동전 조각. 아직도 빛난다.",                     goldMult: 0.08 },
  { id: "scout_badge",      rarity: "common",   name: "척후대 휘장",       desc: "경험치 +10%",                             flavor: "잿빛 숲의 오랜 척후대가 남긴 것.",                   expMult: 0.10 },
  { id: "rusty_grip",       rarity: "common",   name: "녹슨 손잡이 붕대",  desc: "클릭 피해 +12%",                          flavor: "수백 번 검을 쥐어 낡아버린 붕대.",                   clickMult: 0.12 },
  // uncommon
  { id: "return_stone",     rarity: "uncommon", name: "귀환의 돌",         desc: "강화 성공률 +3%",                         flavor: "돌아온 자만이 간직할 수 있는 표식.",                 successRateAdd: 3 },
  { id: "forest_charm",     rarity: "uncommon", name: "숲 뿌리 부적",      desc: "재료 확률 +6%",                           flavor: "고목의 뿌리에서 채취한 기이한 부적.",                materialChanceAdd: 0.06 },
  { id: "iron_ring",        rarity: "uncommon", name: "연마한 철반지",     desc: "공격력 +12%",                             flavor: "폐광의 장인이 마지막으로 연마한 반지.",              attackMult: 0.12 },
  // rare
  { id: "blood_coin",       rarity: "rare",     name: "핏빛 동전",         desc: "골드 +20% · 공격력 +8%",                  flavor: "핏값으로 얻은 동전. 무게가 남다르다.",               goldMult: 0.20, attackMult: 0.08 },
  { id: "fractured_lens",   rarity: "rare",     name: "균열 렌즈",         desc: "성공률 +6% · 파괴율 -8%",                 flavor: "망원경의 파편. 미래가 보이는 것 같다.",             successRateAdd: 6, destroyRateAdd: -8 },
  { id: "echo_crystal",     rarity: "rare",     name: "울림 결정",         desc: "DPS +15% · 경험치 +12%",                  flavor: "두드리면 과거의 전투가 울린다.",                     dpsMult: 0.15, expMult: 0.12 },
  { id: "twin_fang",        rarity: "rare",     name: "쌍독니 목걸이",     desc: "클릭 피해 +20% · 공격력 +10%",            flavor: "독사 두 마리를 맨손으로 잡은 사냥꾼의 전리품.",     clickMult: 0.20, attackMult: 0.10 },
  // epic
  { id: "dragon_scale",     rarity: "epic",     name: "고룡의 비늘",       desc: "공격력 +25% · 파괴율 -15%",               flavor: "전설의 용이 떨군 단 한 장의 비늘.",                 attackMult: 0.25, destroyRateAdd: -15 },
  { id: "void_shard",       rarity: "epic",     name: "심연 수정 파편",    desc: "DPS +25% · 골드 +15%",                    flavor: "심연에서 캐낸 결정. 손에 닿으면 이상하게 차갑다.",  dpsMult: 0.25, goldMult: 0.15 },
  { id: "sage_robe",        rarity: "epic",     name: "진홍 현자의 로브",  desc: "성공률 +10% · 경험치 +25%",               flavor: "붉은 성채의 현자가 입던 로브 조각.",                successRateAdd: 10, expMult: 0.25 },
  // legendary
  { id: "nameless_heart",   rarity: "legendary", name: "무명의 심장",      desc: "공격력 +40% · 성공률 +15% · 파괴율 -20%", flavor: "왕좌를 지키던 무언가의 심장. 아직도 뛰는 것 같다.", attackMult: 0.40, successRateAdd: 15, destroyRateAdd: -20 },
  { id: "forge_ember",      rarity: "legendary", name: "영원한 제련 불씨", desc: "골드 +40% · DPS +30% · 강화비용 -20%",   flavor: "영원히 꺼지지 않는 제련소의 불꽃 조각.",           goldMult: 0.40, dpsMult: 0.30, costMult: -0.20 },
];

const ARTIFACT_DROP_TABLE: { rarity: ArtifactRarity; threshold: number }[] = [
  { rarity: "legendary", threshold: 0.03 },
  { rarity: "epic",      threshold: 0.15 },
  { rarity: "rare",      threshold: 0.65 },
  { rarity: "uncommon",  threshold: 2.15 },
  { rarity: "common",    threshold: 5.15 },
];

const RARITY_LABELS: Record<ArtifactRarity, string> = {
  common: "일반", uncommon: "고급", rare: "희귀", epic: "서사", legendary: "전설",
};

function rollArtifactDrop(isBoss: boolean): ArtifactDef | null {
  const roll = Math.random() * 100;
  const bossBonus = isBoss ? 3 : 0;
  for (const entry of ARTIFACT_DROP_TABLE) {
    if (roll < entry.threshold + bossBonus) {
      const pool = ARTIFACT_DEFS.filter(a => a.rarity === entry.rarity);
      return pool[Math.floor(Math.random() * pool.length)] ?? null;
    }
  }
  return null;
}

function getArtifactBonuses(artifacts: string[]) {
  const unique = [...new Set(artifacts)];
  let attackMult = 1, dpsMult = 1, clickMult = 1, goldMult = 1, expMult = 1;
  let successRateAdd = 0, destroyRateAdd = 0, materialChanceAdd = 0, costMult = 1;
  for (const id of unique) {
    const a = ARTIFACT_DEFS.find(d => d.id === id);
    if (!a) continue;
    if (a.attackMult)        attackMult      *= (1 + a.attackMult);
    if (a.dpsMult)           dpsMult         *= (1 + a.dpsMult);
    if (a.clickMult)         clickMult       *= (1 + a.clickMult);
    if (a.goldMult)          goldMult        *= (1 + a.goldMult);
    if (a.expMult)           expMult         *= (1 + a.expMult);
    if (a.successRateAdd)    successRateAdd  += a.successRateAdd;
    if (a.destroyRateAdd)    destroyRateAdd  += a.destroyRateAdd;
    if (a.materialChanceAdd) materialChanceAdd += a.materialChanceAdd;
    if (a.costMult)          costMult        *= (1 + a.costMult);
  }
  return { attackMult, dpsMult, clickMult, goldMult, expMult, successRateAdd, destroyRateAdd, materialChanceAdd, costMult };
}

// ── PRESTIGE UPGRADE SHOP ──────────────────────────────────
type PrestigeUpgradeDef = {
  id: string; name: string; icon: typeof Hammer;
  desc: (level: number) => string;
  maxLevel: number; cost: (level: number) => number;
};

const PRESTIGE_UPGRADES: PrestigeUpgradeDef[] = [
  { id: "start_gold",    name: "황금 유산",    icon: CircleDollarSign, desc: l => `시작 골드 +${l * 1000}G`,          maxLevel: 5, cost: l => l + 1 },
  { id: "start_enhance", name: "전수된 기술",  icon: Hammer,           desc: l => `시작 강화 +${l}`,                  maxLevel: 5, cost: l => (l + 1) * 2 },
  { id: "perm_attack",   name: "강인한 전투력", icon: Sword,            desc: l => `영구 공격력 +${l * 10}%`,          maxLevel: 6, cost: () => 2 },
  { id: "mat_hunter",    name: "숙련된 사냥꾼", icon: Target,           desc: l => `재료 확률 +${l * 6}%`,             maxLevel: 5, cost: () => 2 },
  { id: "safety_net",    name: "강화 수련",     icon: ShieldCheck,      desc: l => `성공률 영구 +${l * 4}%`,           maxLevel: 4, cost: () => 3 },
  { id: "quick_start",   name: "든든한 준비",   icon: Boxes,            desc: l => `시작 방지권·안정화석 +${l}개씩`,   maxLevel: 3, cost: () => 3 },
];

const PRESTIGE_TIERS = [
  { name: "신예 검사",       title: "이제 막 칼을 쥔 자",           color: "#c9b798" },
  { name: "견습 대장장이",   title: "첫 번째 명성의 증인",          color: "#f8de22" },
  { name: "숲의 재련사",     title: "두 번의 시련을 넘은 자",       color: "#03aed2" },
  { name: "왕좌의 도전자",   title: "세 번의 굴곡을 아는 전사",     color: "#f45b26" },
  { name: "심연의 지배자",   title: "심연의 끝을 본 자",            color: "#d12052" },
  { name: "전설의 검성",     title: "세계를 초월한 전설",           color: "#c030ff" },
];

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
  artifacts: [],
  prestigeUpgrades: {},
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
  const art = getArtifactBonuses(state.artifacts ?? []);
  const pu = (id: string) => state.prestigeUpgrades?.[id] ?? 0;
  const prestigeMultiplier = 1 + state.totalPrestigeStones * 0.035 + state.prestige * 0.08;
  const permAttackMult = 1 + pu("perm_attack") * 0.10;
  const attack = Math.floor(10 * Math.pow(1.24, state.enhance) * prestigeMultiplier * (1 + state.traits.hunter * 0.035) * art.attackMult * permAttackMult);
  const dps = Math.floor(attack * (0.5 + state.level * 0.015) * (1 + state.traits.hunter * 0.045) * art.dpsMult);
  const clickDamage = Math.max(1, Math.floor(attack * (0.4 + state.traits.hunter * 0.012) * art.clickMult));
  const cumulativeInvestment = getCumulativeEnhanceCost(state.enhance);
  const saleValue = getSwordSaleValue(state.enhance, state.traits.merchant);
  const saleProfit = saleValue - cumulativeInvestment;
  const costReduction = clamp(state.traits.smith * 0.012, 0, 0.3) + clamp(-(art.costMult - 1), 0, 0.3);
  const upgradeCost = Math.floor(getBaseUpgradeCost(state.enhance) * (1 - costReduction));
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
  const successRate = clamp(
    baseRate + state.traits.smith * 0.75 + state.prestigeStones * 0.05
    + art.successRateAdd + pu("safety_net") * 4,
    1.5, 97,
  );
  const rawDestroyRate = state.enhance < 10 ? 0 : state.enhance < 20 ? 35 : state.enhance < 30 ? 54 : state.enhance < 40 ? 72 : 86;
  const destroyRate = Math.max(0, rawDestroyRate + art.destroyRateAdd);
  const expToNext = Math.floor(80 * Math.pow(1.21, state.level - 1));
  const traitPointsEarned = Math.max(0, state.level - 1) + state.prestige * 5;
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
    artifacts: Array.isArray(state.artifacts) ? state.artifacts : [],
    prestigeUpgrades: (state.prestigeUpgrades && typeof state.prestigeUpgrades === "object") ? state.prestigeUpgrades : {},
    regionId: REGIONS.some((region) => region.id === state.regionId) ? (state.regionId as RegionId) : base.regionId,
  };
}

function calculateKillRewards(state: GameState, derived = derive(state)) {
  const region = derived.currentRegion;
  const boss = derived.isBoss;
  const art = getArtifactBonuses(state.artifacts ?? []);
  const gold = Math.floor(region.gold * (1 + state.regionStep * 0.035) * (boss ? 7 : 1) * (1 + state.traits.merchant * 0.018) * art.goldMult);
  const exp = Math.floor(region.exp * (1 + state.regionStep * 0.025) * (boss ? 5 : 1) * (1 + state.traits.hunter * 0.018) * art.expMult);
  const materialRollChance = clamp(region.materialChance + state.traits.hunter * 0.006 + (boss ? 0.35 : 0) + art.materialChanceAdd + (state.prestigeUpgrades?.["mat_hunter"] ?? 0) * 0.06, 0, 0.95);
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
  const [traitBranchIdx, setTraitBranchIdx] = useState(0);
  const [selectedTraitNode, setSelectedTraitNode] = useState<{ branch: TraitBranch; idx: number } | null>(null);
  const traitTouchX = useRef(0);
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
          // artifact drop (auto-battle)
          const dropped = rollArtifactDrop(reward.boss);
          if (dropped && !next.artifacts.includes(dropped.id)) {
            next.artifacts = [...next.artifacts, dropped.id];
            const rarityLabel = RARITY_LABELS[dropped.rarity];
            setLogs((prevLogs) => addLog(prevLogs, `유물 발견: [${rarityLabel}] ${dropped.name} — ${dropped.desc}`, "gold"));
            toast.success(`유물 획득: ${dropped.name}`, { description: `[${rarityLabel}] ${dropped.desc}` });
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

  function applyKill(draft: GameState, d: ReturnType<typeof derive>) {
    const reward = calculateKillRewards(draft, d);
    draft.gold += reward.gold;
    awardExperience(draft, reward.exp);
    draft.monstersKilled += 1;
    if (Math.random() < reward.materialRollChance) draft.inventory[reward.materialKey] += reward.materialAmount;
    if (reward.boss) draft.bossesKilled += 1;
    draft.regionStep += 1;
    draft.monsterHp = getMonsterMaxHp(draft);
    // artifact drop
    const dropped = rollArtifactDrop(reward.boss);
    if (dropped && !draft.artifacts.includes(dropped.id)) {
      draft.artifacts.push(dropped.id);
      const rarityLabel = RARITY_LABELS[dropped.rarity];
      toast.success(`유물 획득: ${dropped.name}`, { description: `[${rarityLabel}] ${dropped.desc}` });
      return `${reward.boss ? "보스" : "몬스터"} 처치 — ${compact(reward.gold)}G · ${compact(reward.exp)}EXP · 유물 [${dropped.name}] 발견!`;
    }
    return `${reward.boss ? "보스" : "몬스터"} 처치 — ${compact(reward.gold)}G · ${compact(reward.exp)}EXP 획득`;
  }

  function manualAttack() {
    mutate((draft) => {
      const d = derive(draft);
      draft.monsterHp -= d.clickDamage;
      if (draft.monsterHp <= 0) return applyKill(draft, d);
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

  function activateTraitNode(branch: TraitBranch, nodeIndex: number) {
    const info = TRAIT_BRANCHES[branch];
    mutate((draft) => {
      const d = derive(draft);
      const prevThreshold = nodeIndex === 0 ? 0 : TRAIT_NODE_THRESHOLDS[nodeIndex - 1];
      const nextThreshold = TRAIT_NODE_THRESHOLDS[nodeIndex];
      if (draft.traits[branch] >= nextThreshold) return "이미 활성화된 노드입니다.";
      if (draft.traits[branch] < prevThreshold) return "이전 노드를 먼저 활성화하세요.";
      const cost = nextThreshold - draft.traits[branch];
      if (d.traitPointsAvailable < cost) return `특성 포인트 부족. 필요: ${cost}pt`;
      draft.traits[branch] = nextThreshold;
      return `[${info.label}] ${info.nodes[nodeIndex].name} 활성화!`;
    }, info.tone);
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

  function buyPrestigeUpgrade(id: string) {
    mutate((draft) => {
      const upgDef = PRESTIGE_UPGRADES.find(u => u.id === id);
      if (!upgDef) return;
      const currentLevel = draft.prestigeUpgrades[id] ?? 0;
      if (currentLevel >= upgDef.maxLevel) return "이미 최대 레벨입니다.";
      const cost = upgDef.cost(currentLevel);
      if (draft.prestigeStones < cost) return `명성석이 부족합니다. 필요: ${cost}개`;
      draft.prestigeStones -= cost;
      draft.prestigeUpgrades = { ...draft.prestigeUpgrades, [id]: currentLevel + 1 };
      return `[명성 강화] ${upgDef.name} Lv.${currentLevel + 1} 달성`;
    }, "gold");
  }

  function prestigeReset() {
    mutate((draft) => {
      const canPrestige = draft.enhance >= 32 && draft.level >= 35 && draft.bossesKilled >= 5;
      if (!canPrestige) return "명성 조건 미달: +32 검, Lv.35, 보스 5회 처치가 필요합니다.";
      const gained = Math.max(1, Math.floor((draft.bestEnhance - 25) / 4) + Math.floor(draft.level / 25));
      const keepTraits      = draft.traits;
      const keepArtifacts   = draft.artifacts;
      const keepUpgrades    = draft.prestigeUpgrades;
      const keepCreatedAt   = draft.createdAt;
      const keepPrestige    = draft.prestige + 1;
      const keepStones      = draft.prestigeStones + gained;
      const keepTotalStones = draft.totalPrestigeStones + gained;
      const startGoldLevel   = draft.prestigeUpgrades["start_gold"]    ?? 0;
      const startEnhLevel    = draft.prestigeUpgrades["start_enhance"]  ?? 0;
      const quickStartLevel  = draft.prestigeUpgrades["quick_start"]    ?? 0;
      const next = initialState();
      Object.assign(draft, next, {
        gold: 900 + gained * 300 + startGoldLevel * 1000,
        level: 1,
        exp: 0,
        enhance: startEnhLevel,
        bestEnhance: startEnhLevel,
        prestige: keepPrestige,
        prestigeStones: keepStones,
        totalPrestigeStones: keepTotalStones,
        traits: keepTraits,
        artifacts: keepArtifacts,
        prestigeUpgrades: keepUpgrades,
        createdAt: keepCreatedAt,
        inventory: {
          ...next.inventory,
          guards: 1 + Math.floor(gained / 2) + quickStartLevel,
          stabilizers: 1 + gained + quickStartLevel,
          scraps: gained * 12,
          ore: gained * 3,
        },
      });
      toast.success(`명성 ${keepPrestige}회 완료`, { description: `명성석 +${gained}개 획득. 영구 성장이 강화되었습니다.` });
      return `명성 ${keepPrestige}회 완료 — 명성석 ${gained}개 획득, 새 회차 시작`;
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
            {([
              ["forge",     Hammer,          "강화"],
              ["battle",    Skull,           "지역"],
              ["market",    ShoppingCart,    "상점"],
              ["craft",     FlaskConical,    "조합"],
              ["traits",    Sparkles,        "특성"],
              ["prestige",  Trophy,          "명성"],
              ["artifacts", PackageOpen,     "유물"],
            ] as const).map(([key, Icon, label]) => (
              <button key={key} className={activeTab === key ? "active" : ""} onClick={() => setActiveTab(key as TabKey)}>
                <span className="tab-icon" aria-hidden="true"><Icon size={15} /></span>
                <span className="tab-label">{label}</span>
              </button>
            ))}
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

          {activeTab === "traits" ? (() => {
            const branches = Object.keys(TRAIT_BRANCHES) as TraitBranch[];
            const currentBranch = branches[traitBranchIdx];
            const CurrentIcon = TRAIT_BRANCHES[currentBranch].icon;
            const currentTraitVal = state.traits[currentBranch];

            const goToBranch = (i: number) => {
              setTraitBranchIdx(Math.max(0, Math.min(i, branches.length - 1)));
              setSelectedTraitNode(null);
            };

            const handleTouchStart = (e: React.TouchEvent) => {
              traitTouchX.current = e.touches[0].clientX;
            };
            const handleTouchEnd = (e: React.TouchEvent) => {
              const dx = e.changedTouches[0].clientX - traitTouchX.current;
              if (Math.abs(dx) > 44) {
                goToBranch(traitBranchIdx + (dx < 0 ? 1 : -1));
              }
            };

            const floatBranch = selectedTraitNode?.branch;
            const floatIdx    = selectedTraitNode?.idx ?? -1;
            const floatNode   = floatBranch != null ? TRAIT_BRANCHES[floatBranch].nodes[floatIdx] : null;
            const floatThresh = floatIdx >= 0 ? TRAIT_NODE_THRESHOLDS[floatIdx] : 0;
            const floatPrev   = floatIdx > 0 ? TRAIT_NODE_THRESHOLDS[floatIdx - 1] : 0;
            const floatVal    = floatBranch != null ? state.traits[floatBranch] : 0;
            const floatActive = floatVal >= floatThresh;
            const floatNext   = !floatActive && floatVal >= floatPrev;
            const floatHidden = !floatActive && !floatNext;
            const floatCost   = floatThresh - floatVal;
            const floatAfford = derived.traitPointsAvailable >= floatCost;

            return (
              <div className="skt-panel">
                {/* Branch navigator */}
                <div className="skt-nav">
                  <button className="skt-nav-btn" onClick={() => goToBranch(traitBranchIdx - 1)} disabled={traitBranchIdx === 0} aria-label="이전 특성">‹</button>
                  <div className="skt-nav-center">
                    <CurrentIcon size={16} />
                    <span className="skt-branch-name">{TRAIT_BRANCHES[currentBranch].label}</span>
                    <span className="skt-pts-badge">{currentTraitVal} / {TRAIT_NODE_THRESHOLDS[TRAIT_NODE_THRESHOLDS.length - 1]}</span>
                  </div>
                  <button className="skt-nav-btn" onClick={() => goToBranch(traitBranchIdx + 1)} disabled={traitBranchIdx === branches.length - 1} aria-label="다음 특성">›</button>
                </div>

                {/* Dot indicators + points */}
                <div className="skt-sub-bar">
                  <div className="skt-dots">
                    {branches.map((b, i) => (
                      <button key={b} className={`skt-dot${i === traitBranchIdx ? " on" : ""}`} onClick={() => goToBranch(i)} aria-label={TRAIT_BRANCHES[b].label} />
                    ))}
                  </div>
                  <span className="skt-avail-pts"><Sparkles size={11} /> {derived.traitPointsAvailable}pt 보유</span>
                </div>

                {/* Sliding viewport */}
                <div className="skt-viewport" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                  <div className="skt-track" style={{ transform: `translateX(-${traitBranchIdx * 100}%)` }}>
                    {branches.map((branch) => {
                      const bInfo = TRAIT_BRANCHES[branch];
                      const BIcon = bInfo.icon;
                      const bVal  = state.traits[branch];
                      return (
                        <div className="skt-branch-page" key={branch}>
                          {bInfo.nodes.map((node, idx) => {
                            const threshold = TRAIT_NODE_THRESHOLDS[idx];
                            const prevThreshold = idx === 0 ? 0 : TRAIT_NODE_THRESHOLDS[idx - 1];
                            const isActive  = bVal >= threshold;
                            const isNext    = !isActive && bVal >= prevThreshold;
                            const isHidden  = !isActive && !isNext;
                            const isSelected = selectedTraitNode?.branch === branch && selectedTraitNode.idx === idx;
                            const lineLit   = idx > 0 && bVal >= prevThreshold;

                            return (
                              <div className="skt-node-row" key={idx}>
                                {idx > 0 && <div className={`skt-line${lineLit ? " lit" : ""} skt-tone-${bInfo.tone}`} />}
                                <div className={`skt-node-wrap${isSelected ? " selected" : ""}`}>
                                  <button
                                    className={`skt-node skt-${isActive ? "active" : isNext ? "next" : "locked"} skt-tone-${bInfo.tone}`}
                                    onClick={() => setSelectedTraitNode(
                                      isSelected ? null : { branch, idx }
                                    )}
                                    aria-pressed={isSelected}
                                  >
                                    {isActive  ? <Check size={22} strokeWidth={3} /> :
                                     isHidden  ? <Lock  size={18} /> :
                                                 <BIcon size={22} />}
                                  </button>
                                  <div className="skt-node-info">
                                    <span className="skt-node-name">{isHidden ? "???" : node.name}</span>
                                    {isSelected && !isHidden && <span className="skt-node-desc">{node.desc}</span>}
                                    {isActive && !isSelected && <span className="skt-active-label">✓ 활성화</span>}
                                    {isNext   && !isSelected && <span className="skt-cost-label">{threshold - bVal}pt</span>}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Floating detail + action panel */}
                {selectedTraitNode && floatNode && (
                  <div className="skt-float-panel">
                    <div className="skt-float-info">
                      <strong>{floatHidden ? "???" : floatNode.name}</strong>
                      {!floatHidden && <span>{floatNode.desc}</span>}
                      {floatActive && <span className="skt-float-done">이미 활성화됨</span>}
                      {floatNext   && <span className="skt-float-cost">{floatCost}pt 필요</span>}
                      {floatHidden && <span className="skt-float-locked">이전 노드를 먼저 활성화하세요</span>}
                    </div>
                    {floatNext && (
                      <button
                        className="skt-float-btn"
                        disabled={!floatAfford}
                        onClick={() => { activateTraitNode(floatBranch!, floatIdx); setSelectedTraitNode(null); }}
                      >
                        {floatAfford ? `활성화 (${floatCost}pt)` : `부족 (${floatCost}pt)`}
                      </button>
                    )}
                    {(floatActive || floatHidden) && (
                      <button className="skt-float-close" onClick={() => setSelectedTraitNode(null)}>✕</button>
                    )}
                  </div>
                )}
              </div>
            );
          })() : null}

          {activeTab === "prestige" ? (() => {
            const canPrestige = state.enhance >= 32 && state.level >= 35 && state.bossesKilled >= 5;
            const previewGained = Math.max(1, Math.floor((state.bestEnhance - 25) / 4) + Math.floor(state.level / 25));
            const tierIndex = Math.min(state.prestige, PRESTIGE_TIERS.length - 1);
            const tier = PRESTIGE_TIERS[tierIndex];
            return (
              <div className="panel console-panel">
                <SectionTitle icon={Trophy} title="명성" eyebrow={`${state.prestige}회 완료`} />

                <div className="prestige-tier-card" style={{ borderColor: tier.color }}>
                  <Trophy size={28} style={{ color: tier.color }} />
                  <div>
                    <span className="prestige-tier-title">{tier.title}</span>
                    <strong className="prestige-tier-name" style={{ color: tier.color }}>{tier.name}</strong>
                  </div>
                  <div className="prestige-stone-badge">
                    <Award size={14} />
                    <span>명성석 {state.prestigeStones}개</span>
                  </div>
                </div>

                <div className="prestige-req-section">
                  <h3 className="prestige-section-label">다음 명성 조건</h3>
                  <PrestigeReqBar label="+32 검" current={state.enhance} target={32} />
                  <PrestigeReqBar label="Lv.35" current={state.level} target={35} />
                  <PrestigeReqBar label="보스 처치 5회" current={Math.min(state.bossesKilled, 5)} target={5} />
                </div>

                {canPrestige && (
                  <div className="prestige-preview">
                    <Sparkles size={14} />
                    <span>명성석 <strong>+{previewGained}개</strong> 획득 예정 · 특성·유물 유지됨</span>
                  </div>
                )}

                <button className="wide-action prestige" onClick={prestigeReset} disabled={!canPrestige}>
                  <Award size={16} /> {canPrestige ? `명성 실행 (+${previewGained}석 예상)` : "명성 조건 미달"}
                </button>

                <SectionTitle icon={Sparkles} title="명성석 상점" eyebrow="PERMANENT UPGRADES" />
                <div className="prestige-shop">
                  {PRESTIGE_UPGRADES.map((upgDef) => {
                    const UpgIcon = upgDef.icon;
                    const level = state.prestigeUpgrades[upgDef.id] ?? 0;
                    const maxed = level >= upgDef.maxLevel;
                    const cost  = upgDef.cost(level);
                    const canBuy = !maxed && state.prestigeStones >= cost;
                    return (
                      <button key={upgDef.id} className={`prestige-upgrade ${maxed ? "maxed" : ""}`} onClick={() => buyPrestigeUpgrade(upgDef.id)} disabled={!canBuy && !maxed}>
                        <div className="pu-icon"><UpgIcon size={16} /></div>
                        <div className="pu-body">
                          <strong>{upgDef.name}</strong>
                          <span>{level > 0 ? upgDef.desc(level) : "미구매"}</span>
                        </div>
                        <div className="pu-badge">
                          {maxed ? <span className="pu-max">MAX</span> : <><Award size={12} /><span>{cost}석</span></>}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <SectionTitle icon={Trophy} title="최종 해금 조건" eyebrow="ENDING" />
                <div className="ending-grid">
                  <CheckItem done={state.enhance >= 50} text="+50 검" />
                  <CheckItem done={state.level >= 60} text="Lv.60" />
                  <CheckItem done={state.prestige >= ENDING_PRESTIGE_REQUIREMENT} text="명성 3회" />
                  <CheckItem done={state.inventory.abyssCore >= 10} text="심연핵 10개" />
                  <CheckItem done={finalUnlocked} text="왕좌 입장 가능" />
                </div>
              </div>
            );
          })() : null}

          {activeTab === "artifacts" ? (
            <div className="panel console-panel">
              <SectionTitle icon={PackageOpen} title="유물" eyebrow={`${state.artifacts.length} / ${ARTIFACT_DEFS.length} 수집`} />
              <p className="trait-hint">몬스터 처치 시 낮은 확률로 유물을 획득합니다. 전설 유물은 극히 희귀합니다.</p>
              <div className="artifact-grid">
                {ARTIFACT_DEFS.map((art) => {
                  const owned = state.artifacts.includes(art.id);
                  return (
                    <div key={art.id} className={`artifact-card rarity-${art.rarity} ${owned ? "owned" : "unknown"}`}>
                      {owned ? (
                        <>
                          <span className={`artifact-rarity-badge rarity-${art.rarity}`}>{RARITY_LABELS[art.rarity]}</span>
                          <strong className="artifact-name">{art.name}</strong>
                          <p className="artifact-desc">{art.desc}</p>
                          <small className="artifact-flavor">{art.flavor}</small>
                        </>
                      ) : (
                        <div className="artifact-unknown">
                          <span>???</span>
                          <small>미발견</small>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
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

function PrestigeReqBar({ label, current, target }: { label: string; current: number; target: number }) {
  const pct = Math.min(100, (current / target) * 100);
  const done = current >= target;
  return (
    <div className={`prestige-req-bar ${done ? "done" : ""}`}>
      <div className="prb-label">
        <span>{label}</span>
        <strong>{done ? "완료" : `${current} / ${target}`}</strong>
      </div>
      <div className="prb-track">
        <div className="prb-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
