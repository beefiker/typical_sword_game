import fs from 'node:fs';

const homePath = '/home/ubuntu/typical_sword_game/client/src/pages/Home.tsx';
const cssPath = '/home/ubuntu/typical_sword_game/client/src/index.css';
let home = fs.readFileSync(homePath, 'utf8');
let css = fs.readFileSync(cssPath, 'utf8');

home = home.replace('import { toast } from "sonner";\n', 'import { toast } from "sonner";\nimport { PixelMotion } from "@ga1az/react-pixel-motion";\n');

const marker = `const MATERIAL_LABELS: Record<MaterialKey, string> = {`;
const spriteBlock = `type PixelRect = readonly [number, number, number, number, string];
type MonsterKey = "slime" | "goblin" | "skeleton" | "zombie" | "vampire" | "orc" | "ghost" | "wolf" | "boss";

type MonsterProfile = {
  key: MonsterKey;
  name: string;
  title: string;
  habitat: string;
  cue: string;
  tone: LogTone;
  sprite: string;
};

function px(x: number, y: number, w: number, h: number, color: string): PixelRect {
  return [x, y, w, h, color];
}

function spriteSheet(frameWidth: number, frameHeight: number, frames: PixelRect[][]) {
  const rects = frames
    .map((frame, frameIndex) =>
      frame
        .map(([x, y, w, h, color]) => \`<rect x="\${x + frameIndex * frameWidth}" y="\${y}" width="\${w}" height="\${h}" fill="\${color}"/>\`)
        .join(""),
    )
    .join("");
  const svg = \`<svg xmlns="http://www.w3.org/2000/svg" width="\${frameWidth * frames.length}" height="\${frameHeight}" viewBox="0 0 \${frameWidth * frames.length} \${frameHeight}" shape-rendering="crispEdges">\${rects}</svg>\`;
  return \`data:image/svg+xml;utf8,\${encodeURIComponent(svg)}\`;
}

function heroFrame(capeLift = 0, step = 0): PixelRect[] {
  return [
    px(9, 14 - capeLift, 12, 4, "#7e1230"), px(7, 18 - capeLift, 18, 6, "#d12052"), px(5, 23 - capeLift, 17, 6, "#f45b4d"),
    px(4, 29 - capeLift, 14, 5, "#c01d3f"), px(3, 34 - capeLift, 8, 3, "#74142d"), px(12, 27 - capeLift, 8, 3, "#fa6f69"),
    px(24, 4, 9, 3, "#111014"), px(21, 7, 14, 5, "#111014"), px(20, 12, 15, 4, "#111014"), px(34, 10, 4, 3, "#111014"),
    px(22, 12, 11, 9, "#ffd5b9"), px(22, 17, 12, 6, "#f0b28f"), px(20, 16, 3, 4, "#ffd5b9"), px(33, 15, 3, 4, "#ffd5b9"),
    px(25, 15, 2, 4, "#171015"), px(31, 15, 2, 4, "#171015"), px(28, 20, 3, 2, "#c77d69"),
    px(22, 24, 13, 12, "#1f59b7"), px(24, 25, 8, 3, "#336ee1"), px(29, 25, 3, 3, "#f8de22"), px(27, 30, 3, 3, "#f8de22"),
    px(20, 35, 18, 3, "#5a3b2e"), px(22, 38, 5, 6 + step, "#4b352b"), px(33, 38, 5, 6 - step, "#4b352b"), px(20, 44, 9, 3, "#111014"), px(33, 44, 9, 3, "#111014"),
    px(17, 25, 5, 11, "#ffd5b9"), px(36, 24, 5, 11, "#ffd5b9"), px(39, 27, 3, 4, "#ffd5b9"),
    px(15, 32, 3, 10, "#b98218"), px(12, 38, 8, 2, "#b98218"), px(10, 40, 2, 5, "#d7e5db"), px(8, 45, 2, 2, "#d7e5db"),
    px(7, 47, 12, 2, "#aab9b1"), px(6, 49, 13, 2, "#e7f0e9"), px(13, 34, 3, 3, "#f8de22"),
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

const HERO_SPRITE = spriteSheet(48, 52, [heroFrame(0, 0), heroFrame(1, 1)]);

const MONSTER_PROFILES: Record<MonsterKey, MonsterProfile> = {
  slime: { key: "slime", name: "초록 슬라임", title: "젤리 점액체", habitat: "숲 바닥", cue: "둥근 몸통과 작은 눈으로 식별", tone: "cyan", sprite: spriteSheet(32, 32, [slimeFrame(0), slimeFrame(1)]) },
  goblin: { key: "goblin", name: "고블린 척후병", title: "단검 도적", habitat: "잿빛 숲", cue: "긴 귀, 초록 피부, 보라 튜닉", tone: "orange", sprite: spriteSheet(32, 32, [goblinFrame(0), goblinFrame(1)]) },
  skeleton: { key: "skeleton", name: "해골 병사", title: "뼈 갑주", habitat: "폐광 회랑", cue: "두개골과 갈비뼈 실루엣", tone: "gold", sprite: spriteSheet(32, 32, [skeletonFrame(0), skeletonFrame(1)]) },
  zombie: { key: "zombie", name: "좀비 광부", title: "느린 부패자", habitat: "폐광 회랑", cue: "녹색 피부와 앞으로 뻗은 팔", tone: "neutral", sprite: spriteSheet(32, 32, [zombieFrame(0), zombieFrame(1)]) },
  vampire: { key: "vampire", name: "밤의 흡혈귀", title: "붉은 망토 귀족", habitat: "붉은 성채", cue: "검은 머리, 붉은 눈, 펼친 망토", tone: "pink", sprite: spriteSheet(32, 32, [vampireFrame(0), vampireFrame(1)]) },
  orc: { key: "orc", name: "오크 돌격병", title: "도끼 전위", habitat: "붉은 성채", cue: "큰 턱, 송곳니, 도끼 실루엣", tone: "orange", sprite: spriteSheet(32, 32, [orcFrame(0), orcFrame(1)]) },
  ghost: { key: "ghost", name: "협곡 귀신", title: "떠도는 혼백", habitat: "서리 협곡", cue: "흰 천처럼 흔들리는 하단부", tone: "cyan", sprite: spriteSheet(32, 32, [ghostFrame(0), ghostFrame(-1)]) },
  wolf: { key: "wolf", name: "검은 늑대", title: "서리 추적자", habitat: "서리 협곡", cue: "낮은 네발 자세와 붉은 눈", tone: "neutral", sprite: spriteSheet(32, 32, [wolfFrame(0), wolfFrame(1)]) },
  boss: { key: "boss", name: "무명의 수문장", title: "왕좌의 그림자", habitat: "심연", cue: "거대한 검은 형체와 붉은 핵", tone: "pink", sprite: spriteSheet(32, 32, [bossFrame(0), bossFrame(2)]) },
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

`;
if (!home.includes('type PixelRect = readonly')) {
  home = home.replace(marker, spriteBlock + marker);
}

home = home.replace('  const [logs, setLogs] = useState<GameLog[]>([\n    { id: 1, text: "제련 콘솔이 초기화되었습니다. +50 검과 무명의 왕좌가 최종 목표입니다.", tone: "cyan" },\n  ]);', '  const [logs, setLogs] = useState<GameLog[]>([\n    { id: 1, text: "낡은 검과 첫 원정이 준비되었습니다. +50 검과 무명의 왕좌가 최종 목표입니다.", tone: "cyan" },\n  ]);');

home = home.replace('  const hpPercent = (state.monsterHp / derived.monsterMaxHp) * 100;\n  const expPercent = (state.exp / derived.expToNext) * 100;\n', '  const hpPercent = (state.monsterHp / derived.monsterMaxHp) * 100;\n  const expPercent = (state.exp / derived.expToNext) * 100;\n  const currentMonster = useMemo(() => getMonsterProfile(state.regionId, state.regionStep, derived.isBoss), [state.regionId, state.regionStep, derived.isBoss]);\n  const encounterRoster = useMemo(() => getRegionRoster(state.regionId), [state.regionId]);\n');

home = home.replace('          <div className="hero-status-board character-board" aria-label="캐릭터 전투 상태">\n            <PixelAdventurer size="mini" />\n            <div>\n              <span>MAIN CHARACTER</span>\n              <strong>Lv.{state.level} 로안 · 숲길 검사</strong>\n              <small>EXP {pct(expPercent)} · DPS {compact(derived.dps)} · +{state.enhance} 검</small>\n            </div>\n          </div>', '          <div className="hero-status-board character-board" aria-label="캐릭터 전투 상태">\n            <PixelAdventurer size="mini" />\n            <div>\n              <span>MAIN CHARACTER</span>\n              <strong>Lv.{state.level} 로안 · 붉은 망토 용사</strong>\n              <small>EXP {pct(expPercent)} · DPS {compact(derived.dps)} · +{state.enhance} 검</small>\n            </div>\n          </div>');

home = home.replace('          <PixelAdventurer size="hero" />\n          <div className="monster-sprite" aria-hidden="true"><span /></div>', '          <PixelAdventurer size="hero" />\n          <PixelMonster profile={currentMonster} variant="world" />');

home = home.replace('                <span>주인공</span>\n                <strong>로안, 숲길 검사</strong>\n                <small>마을 대장간에서 검을 키워 원정 자금을 만드는 한손 조작형 모험가</small>', '                <span>주인공</span>\n                <strong>로안, 붉은 망토 용사</strong>\n                <small>대검과 작은 방패를 들고 숲길에서 왕좌까지 나아가는 픽셀 아트 모험가</small>');

home = home.replace(`            <div className="monster-card">
              <img src={isFinalRegion(derived.currentRegion) ? ASSETS.boss : ASSETS.monster} alt="현재 몬스터" />
              <div className="monster-info">
                <span>{derived.isBoss || isFinalRegion(derived.currentRegion) ? "보스 개체" : "일반 개체"}</span>
                <h3>{isFinalRegion(derived.currentRegion) ? "무명의 왕좌" : \`\${derived.currentRegion.name} #\${state.regionStep}\`}</h3>
                <ProgressBar value={hpPercent} tone={derived.isBoss ? "orange" : "cyan"} />
                <small>{compact(Math.max(0, state.monsterHp))} / {compact(derived.monsterMaxHp)} HP</small>
              </div>
            </div>`, `            <div className={\`monster-card pixel-encounter tone-border-\${currentMonster.tone}\`}>
              <div className="monster-stage" aria-label={\`현재 적: \${currentMonster.name}\`}>
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
            </div>`);

home = home.replace(`                <p>
                  판매가는 현재 강화 단계까지의 누적 강화 비용보다 항상 높게 보정됩니다. 초반 필드는 14단계 전후에도 지나치게 막히지 않도록 완만해졌고, +10 이후에는 파괴 위험이 생기므로 방지권과 안정화석으로 장기 목표를 보호하십시오.
                </p>`, `                <p>
                  검을 더 벼릴지, 지금 팔아 다음 원정 자금을 마련할지 고르는 구간입니다. +10 전까지는 재료와 골드를 모으며 손맛을 익히고, +10 이후에는 방지권과 안정화석을 보스 돌파용 검에 아껴 쓰십시오. 판매 이익이 충분히 쌓였을 때 한 번 정리하면 다음 지역 준비가 한결 수월해집니다.
                </p>`);

const oldPixelAdventurer = `function PixelAdventurer({ size = "hero" }: { size?: "hero" | "card" | "mini" }) {
  return (
    <div className={\`pixel-adventurer pixel-adventurer-\${size}\`} aria-hidden="true">
      <span className="pa-shadow" />
      <span className="pa-tail" />
      <span className="pa-leg pa-leg-left" />
      <span className="pa-leg pa-leg-right" />
      <span className="pa-body" />
      <span className="pa-cloak" />
      <span className="pa-head" />
      <span className="pa-hair" />
      <span className="pa-ear pa-ear-left" />
      <span className="pa-ear pa-ear-right" />
      <span className="pa-arm pa-arm-left" />
      <span className="pa-arm pa-arm-right" />
      <span className="pa-shield" />
      <span className="pa-sword" />
      <span className="pa-sword-glint" />
    </div>
  );
}
`;
const newPixelAdventurer = `function PixelAdventurer({ size = "hero" }: { size?: "hero" | "card" | "mini" }) {
  const scale = size === "hero" ? 3.7 : size === "card" ? 2.2 : 1.2;
  return (
    <div className={\`pixel-adventurer pixel-adventurer-\${size}\`} aria-hidden="true">
      <span className="pa-shadow" />
      <div className="pixel-motion-frame hero-sprite-frame">
        <PixelMotion sprite={HERO_SPRITE} width={48} height={52} frameCount={2} fps={2} scale={scale} shouldAnimate direction="horizontal" />
      </div>
    </div>
  );
}

function PixelMonster({ profile, variant = "large" }: { profile: MonsterProfile; variant?: "large" | "chip" | "world" }) {
  const scale = variant === "large" ? 4.1 : variant === "world" ? 2.35 : 1.35;
  return (
    <div className={\`pixel-monster pixel-monster-\${variant} monster-\${profile.key}\`} aria-hidden="true">
      <PixelMotion sprite={profile.sprite} width={32} height={32} frameCount={2} fps={variant === "chip" ? 1.5 : 2.2} scale={scale} shouldAnimate direction="horizontal" />
    </div>
  );
}
`;
if (home.includes(oldPixelAdventurer)) {
  home = home.replace(oldPixelAdventurer, newPixelAdventurer);
} else if (!home.includes('function PixelMonster')) {
  throw new Error('PixelAdventurer replacement target not found');
}

const cssBlock = `

/* Design Philosophy: Pixel Quest Forge. PixelMotion-driven sprites must read as handmade game sprites: limited colors, stepped silhouettes, visible feet shadows, and monster cards that look like encounter windows rather than generic web cards. */
.pixel-motion-frame,
.pixel-monster {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

.pixel-adventurer {
  position: absolute;
  display: grid;
  place-items: center;
  overflow: visible;
  filter: drop-shadow(0 4px 0 rgba(16, 8, 18, 0.82));
}

.pixel-adventurer > span:not(.pa-shadow) {
  display: none !important;
}

.pixel-adventurer .pa-shadow {
  position: absolute;
  left: 50%;
  bottom: -4px;
  width: 54%;
  height: 8%;
  transform: translateX(-50%);
  background: rgba(20, 10, 16, 0.62);
  box-shadow: 0 0 0 2px rgba(20, 10, 16, 0.34);
  z-index: 0;
}

.hero-sprite-frame {
  position: relative;
  z-index: 1;
  transform-origin: center bottom;
}

.pixel-adventurer-hero {
  left: 46%;
  bottom: 7.5%;
  width: 190px;
  height: 206px;
  transform: translateX(-50%);
}

.pixel-adventurer-card {
  position: relative;
  width: 112px;
  height: 122px;
  flex: 0 0 112px;
  background:
    linear-gradient(180deg, rgba(248, 222, 34, 0.12), transparent 48%),
    repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 4px),
    #1d2e24;
  border: 4px solid #f4e0a6;
  border-color: #fff2c4 #67401f #221519 #f4e0a6;
  box-shadow: inset -5px -5px 0 rgba(0,0,0,0.25), 0 5px 0 #120d16;
}

.pixel-adventurer-mini {
  position: relative;
  width: 58px;
  height: 64px;
  flex: 0 0 58px;
}

.pixel-encounter.monster-card {
  align-items: stretch;
  grid-template-columns: minmax(128px, 170px) minmax(0, 1fr);
  gap: 16px;
  padding: 14px;
  border-width: 4px;
  background:
    linear-gradient(180deg, rgba(12, 19, 24, 0.18), rgba(19, 13, 21, 0.78)),
    repeating-linear-gradient(0deg, rgba(255,255,255,0.055) 0 1px, transparent 1px 5px),
    linear-gradient(135deg, #223b36, #2a1d30 58%, #1a111d);
  box-shadow: inset -6px -6px 0 rgba(0,0,0,0.34), inset 4px 4px 0 rgba(255,242,196,0.12), 0 7px 0 #120d16;
}

.monster-stage {
  position: relative;
  min-height: 142px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 3px solid rgba(244, 224, 166, 0.72);
  border-color: #fff2c4 #67401f #24151f #f4e0a6;
  background:
    radial-gradient(circle at 48% 66%, rgba(248, 222, 34, 0.18), transparent 24%),
    linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px),
    linear-gradient(180deg, #6ea46e 0 48%, #416937 48% 100%);
  background-size: auto, 8px 8px, 8px 8px, auto;
}

.monster-stage::before {
  content: "FIELD";
  position: absolute;
  top: 7px;
  left: 8px;
  padding: 3px 6px 2px;
  font-family: "Press Start 2P", monospace;
  font-size: 0.44rem;
  letter-spacing: 0.14em;
  color: #211a23;
  background: #f8de22;
  box-shadow: 2px 2px 0 #120d16;
}

.monster-shadow {
  position: absolute;
  bottom: 18px;
  width: 86px;
  height: 10px;
  background: rgba(17, 10, 18, 0.58);
  box-shadow: 0 0 0 2px rgba(17, 10, 18, 0.28);
}

.pixel-monster {
  position: relative;
  z-index: 1;
  filter: drop-shadow(3px 4px 0 rgba(12, 7, 12, 0.72));
}

.pixel-monster-world {
  position: absolute;
  right: 13%;
  bottom: 8%;
  opacity: 0.96;
  transform: scaleX(-1);
}

.pixel-monster-chip {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  flex: 0 0 44px;
  overflow: hidden;
}

.monster-info p {
  margin: 4px 0 9px;
  color: rgba(255, 242, 196, 0.72);
  font-size: 0.82rem;
  line-height: 1.45;
}

.monster-roster {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 10px;
}

.monster-chip {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  padding: 6px;
  border: 3px solid rgba(244, 224, 166, 0.52);
  background: rgba(23, 16, 25, 0.72);
  box-shadow: inset -3px -3px 0 rgba(0,0,0,0.22);
}

.monster-chip.active {
  border-color: #f8de22;
  background: rgba(248, 222, 34, 0.12);
}

.monster-chip span {
  overflow: hidden;
  color: #fff2c4;
  font-size: 0.72rem;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.strategy-card p {
  line-height: 1.72;
}

@media (max-width: 760px) {
  .pixel-adventurer-hero {
    left: 48%;
    width: 142px;
    height: 154px;
  }

  .pixel-encounter.monster-card {
    grid-template-columns: 1fr;
  }

  .monster-stage {
    min-height: 132px;
  }

  .monster-roster {
    grid-template-columns: 1fr;
  }

  .pixel-monster-world {
    right: 4%;
    bottom: 7%;
    transform: scaleX(-1) scale(0.86);
  }
}
`;
if (!css.includes('PixelMotion-driven sprites')) {
  css += cssBlock;
}

fs.writeFileSync(homePath, home);
fs.writeFileSync(cssPath, css);
