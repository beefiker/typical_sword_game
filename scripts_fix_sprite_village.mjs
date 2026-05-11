import fs from 'node:fs';

const homePath = '/home/ubuntu/typical_sword_game/client/src/pages/Home.tsx';
const cssPath = '/home/ubuntu/typical_sword_game/client/src/index.css';
let home = fs.readFileSync(homePath, 'utf8');
let css = fs.readFileSync(cssPath, 'utf8');

home = home.replace('import { PixelMotion } from "@ga1az/react-pixel-motion";\n', '');
home = home.replace('  sprite: string;\n};', '  sprite: string;\n  frames: PixelRect[][];\n};');

const oldHeroFrame = `function heroFrame(capeLift = 0, step = 0): PixelRect[] {\n  return [\n    px(9, 14 - capeLift, 12, 4, "#7e1230"), px(7, 18 - capeLift, 18, 6, "#d12052"), px(5, 23 - capeLift, 17, 6, "#f45b4d"),\n    px(4, 29 - capeLift, 14, 5, "#c01d3f"), px(3, 34 - capeLift, 8, 3, "#74142d"), px(12, 27 - capeLift, 8, 3, "#fa6f69"),\n    px(24, 4, 9, 3, "#111014"), px(21, 7, 14, 5, "#111014"), px(20, 12, 15, 4, "#111014"), px(34, 10, 4, 3, "#111014"),\n    px(22, 12, 11, 9, "#ffd5b9"), px(22, 17, 12, 6, "#f0b28f"), px(20, 16, 3, 4, "#ffd5b9"), px(33, 15, 3, 4, "#ffd5b9"),\n    px(25, 15, 2, 4, "#171015"), px(31, 15, 2, 4, "#171015"), px(28, 20, 3, 2, "#c77d69"),\n    px(22, 24, 13, 12, "#1f59b7"), px(24, 25, 8, 3, "#336ee1"), px(29, 25, 3, 3, "#f8de22"), px(27, 30, 3, 3, "#f8de22"),\n    px(20, 35, 18, 3, "#5a3b2e"), px(22, 38, 5, 6 + step, "#4b352b"), px(33, 38, 5, 6 - step, "#4b352b"), px(20, 44, 9, 3, "#111014"), px(33, 44, 9, 3, "#111014"),\n    px(17, 25, 5, 11, "#ffd5b9"), px(36, 24, 5, 11, "#ffd5b9"), px(39, 27, 3, 4, "#ffd5b9"),\n    px(15, 32, 3, 10, "#b98218"), px(12, 38, 8, 2, "#b98218"), px(10, 40, 2, 5, "#d7e5db"), px(8, 45, 2, 2, "#d7e5db"),\n    px(7, 47, 12, 2, "#aab9b1"), px(6, 49, 13, 2, "#e7f0e9"), px(13, 34, 3, 3, "#f8de22"),\n    px(38, 29, 6, 8, "#7e1230"), px(39, 30, 5, 6, "#f8de22"), px(40, 31, 3, 4, "#d12052"),\n  ];\n}`;
const newHeroFrame = `function heroFrame(capeLift = 0, step = 0): PixelRect[] {\n  return [\n    // dark outline and red hero cape, kept saturated to avoid the washed-out white overlay look\n    px(8, 13 - capeLift, 13, 4, "#4a0b1f"), px(6, 17 - capeLift, 18, 6, "#b4143d"), px(4, 23 - capeLift, 20, 7, "#f0444f"),\n    px(3, 30 - capeLift, 16, 5, "#c01d3f"), px(3, 35 - capeLift, 8, 4, "#72152c"), px(11, 25 - capeLift, 9, 3, "#ff7670"),\n    // black hair silhouette, face, ears and readable expression\n    px(23, 4, 10, 3, "#0a0b0f"), px(20, 7, 15, 5, "#0a0b0f"), px(20, 12, 15, 4, "#0a0b0f"), px(34, 9, 5, 3, "#0a0b0f"), px(34, 13, 4, 2, "#0a0b0f"),\n    px(22, 12, 11, 9, "#ffd5b9"), px(22, 17, 12, 6, "#f0b28f"), px(20, 16, 3, 4, "#ffd5b9"), px(33, 15, 3, 4, "#ffd5b9"),\n    px(25, 15, 2, 4, "#171015"), px(31, 15, 2, 4, "#171015"), px(28, 20, 3, 2, "#b86b5c"),\n    // blue tunic and gold fasteners\n    px(22, 24, 13, 12, "#1f4fb0"), px(24, 25, 8, 3, "#336ee1"), px(29, 25, 3, 3, "#f8de22"), px(27, 30, 3, 3, "#f8de22"), px(31, 33, 3, 2, "#f8de22"),\n    px(20, 35, 18, 3, "#5a3b2e"), px(22, 38, 5, 6 + step, "#4b352b"), px(33, 38, 5, 6 - step, "#4b352b"), px(20, 44, 9, 3, "#101014"), px(33, 44, 9, 3, "#101014"),\n    px(17, 25, 5, 11, "#ffd5b9"), px(36, 24, 5, 11, "#ffd5b9"), px(39, 27, 3, 4, "#ffd5b9"),\n    // straight pixel sword: repeated diagonal blade blocks of the same size, not curved or bowed\n    px(15, 31, 3, 8, "#9f6815"), px(11, 37, 10, 2, "#b98218"), px(13, 34, 3, 3, "#f8de22"),\n    px(10, 39, 3, 3, "#e7f0e9"), px(8, 41, 3, 3, "#cbd7d1"), px(6, 43, 3, 3, "#e7f0e9"), px(4, 45, 3, 3, "#aab9b1"), px(2, 47, 3, 3, "#f2fbf5"),\n    px(11, 40, 2, 2, "#ffffff"), px(7, 44, 2, 2, "#ffffff"),\n    px(38, 29, 6, 8, "#7e1230"), px(39, 30, 5, 6, "#f8de22"), px(40, 31, 3, 4, "#d12052"),\n  ];\n}`;
if (!home.includes(oldHeroFrame)) throw new Error('heroFrame block not found');
home = home.replace(oldHeroFrame, newHeroFrame);

home = home.replace('const HERO_SPRITE = spriteSheet(48, 52, [heroFrame(0, 0), heroFrame(1, 1)]);', 'const HERO_FRAMES = [heroFrame(0, 0), heroFrame(1, 1)];\nconst HERO_SPRITE = spriteSheet(48, 52, HERO_FRAMES);');

const profiles = {
  slime: 'slimeFrame(0), slimeFrame(1)',
  goblin: 'goblinFrame(0), goblinFrame(1)',
  skeleton: 'skeletonFrame(0), skeletonFrame(1)',
  zombie: 'zombieFrame(0), zombieFrame(1)',
  vampire: 'vampireFrame(0), vampireFrame(1)',
  orc: 'orcFrame(0), orcFrame(1)',
  ghost: 'ghostFrame(0), ghostFrame(-1)',
  wolf: 'wolfFrame(0), wolfFrame(1)',
  boss: 'bossFrame(0), bossFrame(2)',
};
for (const [key, frames] of Object.entries(profiles)) {
  const re = new RegExp(`sprite: spriteSheet\\(32, 32, \\[${frames.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]\\)`, 'g');
  home = home.replace(re, `sprite: spriteSheet(32, 32, [${frames}]), frames: [${frames}]`);
}

const oldPixelComponents = `function PixelAdventurer({ size = "hero" }: { size?: "hero" | "card" | "mini" }) {\n  const scale = size === "hero" ? 3.7 : size === "card" ? 2.2 : 1.2;\n  return (\n    <div className={\`pixel-adventurer pixel-adventurer-\${size}\`} aria-hidden="true">\n      <span className="pa-shadow" />\n      <div className="pixel-motion-frame hero-sprite-frame">\n        <PixelMotion sprite={HERO_SPRITE} width={48} height={52} frameCount={2} fps={2} scale={scale} shouldAnimate direction="horizontal" />\n      </div>\n    </div>\n  );\n}\n\nfunction PixelMonster({ profile, variant = "large" }: { profile: MonsterProfile; variant?: "large" | "chip" | "world" }) {\n  const scale = variant === "large" ? 4.1 : variant === "world" ? 2.35 : 1.35;\n  return (\n    <div className={\`pixel-monster pixel-monster-\${variant} monster-\${profile.key}\`} aria-hidden="true">\n      <PixelMotion sprite={profile.sprite} width={32} height={32} frameCount={2} fps={variant === "chip" ? 1.5 : 2.2} scale={scale} shouldAnimate direction="horizontal" />\n    </div>\n  );\n}`;
const newPixelComponents = `function DirectPixelSprite({ frames, width, height, className, title }: { frames: PixelRect[][]; width: number; height: number; className: string; title?: string }) {\n  return (\n    <svg className={\`direct-pixel-sprite \${className}\`} viewBox={\`0 0 \${width} \${height}\`} role="img" aria-label={title ?? "pixel sprite"} shapeRendering="crispEdges">\n      {frames.map((frame, frameIndex) => (\n        <g className={\`sprite-frame sprite-frame-\${frameIndex}\`} key={frameIndex}>\n          {frame.map(([x, y, w, h, color], index) => (\n            <rect key={\`\${frameIndex}-\${index}\`} x={x} y={y} width={w} height={h} fill={color} />\n          ))}\n        </g>\n      ))}\n    </svg>\n  );\n}\n\nfunction PixelAdventurer({ size = "hero" }: { size?: "hero" | "card" | "mini" }) {\n  return (\n    <div className={\`pixel-adventurer pixel-adventurer-\${size}\`} aria-hidden="true">\n      <span className="pa-shadow" />\n      <div className="pixel-motion-frame hero-sprite-frame">\n        <DirectPixelSprite frames={HERO_FRAMES} width={48} height={52} className="hero-direct-sprite" title="붉은 망토 용사 로안" />\n      </div>\n    </div>\n  );\n}\n\nfunction PixelMonster({ profile, variant = "large" }: { profile: MonsterProfile; variant?: "large" | "chip" | "world" }) {\n  return (\n    <div className={\`pixel-monster pixel-monster-\${variant} monster-\${profile.key}\`} aria-hidden="true">\n      <DirectPixelSprite frames={profile.frames} width={32} height={32} className="monster-direct-sprite" title={profile.name} />\n    </div>\n  );\n}`;
if (!home.includes(oldPixelComponents)) throw new Error('Pixel components block not found');
home = home.replace(oldPixelComponents, newPixelComponents);

css += `

/* 2026-05-11 Sprite Color Normalization & Pixel Village Kit Pass
   Design Philosophy: Pixel Quest Forge. Direct SVG sprites preserve saturated fills with no white filter, while the hero stage borrows top-down village tileset grammar: grass tile noise, stone path, roofed cottages, fences, lamps, trees, barrels, and a small forge square. */
.direct-pixel-sprite {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  image-rendering: pixelated;
  shape-rendering: crispEdges;
  filter: none !important;
  opacity: 1 !important;
  mix-blend-mode: normal !important;
  color-rendering: optimizeSpeed;
}

.direct-pixel-sprite .sprite-frame {
  transform-box: fill-box;
  transform-origin: center bottom;
}

.direct-pixel-sprite .sprite-frame-0 { animation: directSpriteFrameA 0.9s steps(1, end) infinite; }
.direct-pixel-sprite .sprite-frame-1 { animation: directSpriteFrameB 0.9s steps(1, end) infinite; }

@keyframes directSpriteFrameA { 0%, 49.9% { opacity: 1; } 50%, 100% { opacity: 0; } }
@keyframes directSpriteFrameB { 0%, 49.9% { opacity: 0; } 50%, 100% { opacity: 1; } }

.pixel-motion-frame {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  filter: none !important;
  overflow: visible;
}

.hero-sprite-frame {
  width: calc(48px * 3.7);
  height: calc(52px * 3.7);
}

.pixel-adventurer-card .hero-sprite-frame {
  width: calc(48px * 2.2);
  height: calc(52px * 2.2);
}

.pixel-adventurer-mini .hero-sprite-frame {
  width: calc(48px * 1.2);
  height: calc(52px * 1.2);
}

.pixel-monster-large .direct-pixel-sprite { width: calc(32px * 4.1); height: calc(32px * 4.1); }
.pixel-monster-world .direct-pixel-sprite { width: calc(32px * 2.35); height: calc(32px * 2.35); }
.pixel-monster-chip .direct-pixel-sprite { width: calc(32px * 1.35); height: calc(32px * 1.35); }

.pixel-adventurer,
.pixel-monster,
.pixel-adventurer svg,
.pixel-monster svg {
  filter: none !important;
  opacity: 1 !important;
  mix-blend-mode: normal !important;
}

.pixel-world {
  background:
    linear-gradient(180deg, rgba(118, 203, 223, 0.95) 0 29%, transparent 29%),
    repeating-linear-gradient(0deg, transparent 0 13px, rgba(23, 75, 43, 0.11) 13px 15px),
    repeating-linear-gradient(90deg, transparent 0 13px, rgba(255, 255, 255, 0.07) 13px 15px),
    linear-gradient(180deg, #7fcf76 0%, #5eaa55 60%, #3f7f42 100%) !important;
  border-color: #1f3f2d !important;
  box-shadow: inset 0 0 0 4px #6b3f2a, inset 0 0 0 8px #f8de22, 0 22px 0 rgba(18, 25, 20, 0.45) !important;
}

.pixel-world::before {
  content: "";
  position: absolute;
  inset: 30% 0 0;
  z-index: 1;
  background:
    linear-gradient(45deg, transparent 0 47%, rgba(31, 63, 45, 0.22) 47% 53%, transparent 53%) 0 0 / 22px 22px,
    radial-gradient(circle at 10% 60%, #355f34 0 2px, transparent 2px),
    radial-gradient(circle at 70% 72%, #a3d46d 0 2px, transparent 2px),
    radial-gradient(circle at 38% 45%, #294d31 0 1.5px, transparent 1.5px),
    repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 10px);
  opacity: 0.86;
  pointer-events: none;
}

.pixel-world::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 17;
  pointer-events: none;
  background:
    linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px) 0 0 / 4px 4px,
    linear-gradient(90deg, rgba(36,25,22,0.12) 1px, transparent 1px) 0 0 / 4px 4px;
  opacity: 0.16;
  mix-blend-mode: normal;
}

.world-sky {
  background:
    radial-gradient(circle at 74% 23%, #fff3a6 0 14px, #f8de22 15px 21px, transparent 22px),
    linear-gradient(180deg, #80d8ee 0%, #7fcf76 92%);
  box-shadow: inset 0 -10px 0 rgba(73, 139, 82, 0.42);
}

.world-village {
  z-index: 7 !important;
  width: 76px !important;
  height: 70px !important;
  bottom: 37% !important;
  background:
    linear-gradient(180deg, transparent 0 22px, #f2c078 22px 52px, #8b5a32 52px 56px, transparent 56px) !important;
  border: 0 !important;
  box-shadow:
    0 0 0 4px #35211b,
    inset 0 -7px 0 #b46b39,
    inset 0 0 0 4px #ffe0a0,
    6px 8px 0 rgba(21, 33, 25, 0.33) !important;
}

.world-village::before {
  content: "";
  position: absolute;
  left: -8px;
  top: 7px;
  width: 92px;
  height: 22px;
  background:
    linear-gradient(135deg, transparent 0 12px, #6e1d2b 12px 20px, #d12052 20px 70px, #7e1230 70px 78px, transparent 78px),
    repeating-linear-gradient(90deg, transparent 0 9px, rgba(255,255,255,0.17) 9px 12px) !important;
  box-shadow: 0 4px 0 #35151b, 0 8px 0 #f45b4d;
}

.world-village span {
  left: 12px !important;
  top: 35px !important;
  width: 14px !important;
  height: 16px !important;
  background: #2c6b70 !important;
  box-shadow: 22px 0 0 #2c6b70, 0 0 0 3px #36241d, 22px 0 0 3px #36241d !important;
}

.world-village i {
  left: 43px !important;
  top: 35px !important;
  width: 16px !important;
  height: 22px !important;
  background: #573722 !important;
  box-shadow: inset 4px 0 0 #9d6136, 0 0 0 3px #312019 !important;
}

.world-village.house-one { left: 9% !important; bottom: 40% !important; }
.world-village.tower-one {
  left: auto !important;
  right: 9% !important;
  bottom: 41% !important;
  width: 58px !important;
  height: 92px !important;
  background: linear-gradient(180deg, transparent 0 18px, #d8b276 18px 78px, #795133 78px 84px, transparent 84px) !important;
}
.world-village.tower-one::before { width: 72px; left: -7px; top: 0; }

.world-path {
  z-index: 5 !important;
  left: 23% !important;
  bottom: -9% !important;
  width: 55% !important;
  height: 68% !important;
  border-radius: 45% 45% 0 0 / 100% 100% 0 0 !important;
  background:
    radial-gradient(circle at 50% 12%, #d9c48f 0 5px, transparent 6px),
    radial-gradient(circle at 42% 28%, #a88655 0 5px, transparent 6px),
    radial-gradient(circle at 58% 43%, #f0dca0 0 6px, transparent 7px),
    radial-gradient(circle at 47% 61%, #9a7648 0 6px, transparent 7px),
    repeating-linear-gradient(90deg, #c49b63 0 10px, #a67b4c 10px 14px, #dec486 14px 24px) !important;
  clip-path: polygon(42% 0, 58% 0, 78% 100%, 20% 100%) !important;
  box-shadow: inset 0 0 0 4px #6b4b31, inset 0 8px 0 rgba(255,255,255,0.18) !important;
}

.world-forge {
  z-index: 8 !important;
  right: 21% !important;
  bottom: 33% !important;
  background: linear-gradient(180deg, #6f3f2e 0 22px, #2a2525 22px 46px, #181618 46px 58px) !important;
  box-shadow: 0 0 0 4px #211714, inset 8px 0 0 #a25d34, 8px 8px 0 rgba(0,0,0,0.22) !important;
}

.world-forge::before,
.world-forge::after {
  content: "";
  position: absolute;
  background: #5a3827;
  box-shadow: 0 0 0 3px #211714;
}
.world-forge::before { left: -44px; bottom: -2px; width: 34px; height: 18px; }
.world-forge::after { right: -38px; bottom: -2px; width: 28px; height: 16px; }

.world-tree { z-index: 9 !important; }
.world-lamp { z-index: 10 !important; filter: saturate(1.2); }
.pixel-world .pixel-adventurer { z-index: 14 !important; }
.pixel-world .pixel-monster-world { z-index: 13 !important; }

@media (max-width: 760px) {
  .hero-sprite-frame { width: calc(48px * 3); height: calc(52px * 3); }
  .pixel-monster-world .direct-pixel-sprite { width: calc(32px * 2.05); height: calc(32px * 2.05); }
  .world-village.house-one { left: 5% !important; }
  .world-village.tower-one { right: 4% !important; transform: scale(0.82); }
  .world-forge { display: block !important; transform: scale(0.75); right: 16% !important; bottom: 31% !important; }
}
`;

fs.writeFileSync(homePath, home);
fs.writeFileSync(cssPath, css);
