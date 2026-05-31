import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import treeConfig from '../../src/treeOfLifeConfig.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const PUBLIC_DIR = path.join(REPO_ROOT, 'public');

export interface RenderConfig {
  worldOrder: string[];
  circleRadius: number;
  pathStrokeWidth: number;
  pathColor: string;
  bridgeFeatherFraction: number;
  topMargin: number;
  bottomMargin: number;
  includeDaath: boolean;
  daathFill: string;
}

export const DEFAULT_RENDER_CONFIG: RenderConfig = {
  worldOrder: ['atziluth', 'briah', 'yetzirah', 'assiah'],
  circleRadius: 30,
  pathStrokeWidth: 2,
  pathColor: '#000000',
  bridgeFeatherFraction: 0.4,
  topMargin: 50,
  bottomMargin: 80,
  includeDaath: false,
  daathFill: '#000000',
};

const TREE_WIDTH = 800;
const KETER_Y = 50;
const MALKUTH_Y = 620;
const TREE_VERTICAL_SPAN = MALKUTH_Y - KETER_Y; // 570

function loadImageAsDataUri(relPath: string): string {
  const abs = path.join(PUBLIC_DIR, relPath);
  const bytes = fs.readFileSync(abs);
  const b64 = bytes.toString('base64');
  return `data:image/png;base64,${b64}`;
}

function escapeXml(s: string): string {
  return s.replace(/[<>&"']/g, c => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;',
  }[c]!));
}

export function buildSvg(cfg: RenderConfig = DEFAULT_RENDER_CONFIG): string {
  const { sephirot, paths, worlds } = treeConfig as any;
  const { worldOrder, circleRadius, pathStrokeWidth, pathColor,
          bridgeFeatherFraction, topMargin, bottomMargin,
          includeDaath, daathFill } = cfg;

  const totalTreeSpan = TREE_VERTICAL_SPAN * worldOrder.length; // 4 * 570 = 2280
  const totalHeight = topMargin + totalTreeSpan + bottomMargin;
  // The first tree's keter y in image-space:
  // keter at y=KETER_Y in each tree; world i adds yOffset = i*TREE_VERTICAL_SPAN
  // The bridge between world i and world i+1 sits at y = KETER_Y + (i+1)*TREE_VERTICAL_SPAN
  // For i=0: y = 50 + 570 = 620 (matches malkuth of atziluth and keter of briah at yOffset=570: 50+570=620 ✓)

  // Preload all sephirah images for every world we'll render.
  // Map: `${world}:${sephira}` -> data URI
  const imageCache: Record<string, string> = {};
  for (const world of worldOrder) {
    const worldImages = worlds[world]?.images ?? {};
    for (const [sephKey, relPath] of Object.entries(worldImages)) {
      if (typeof relPath === 'string') {
        imageCache[`${world}:${sephKey}`] = loadImageAsDataUri(relPath);
      }
    }
  }

  // Identify which sephira positions are "bridge" positions.
  // A bridge exists between world i and world i+1 at the position of i's malkuth
  // (== i+1's keter). It uses world i's malkuth image on top, world i+1's keter
  // image on bottom, with a vertical alpha gradient blend.
  // Sephirot rendered as normal (non-bridge):
  //   - world 0 (top): all sephirot except malkuth (which becomes a bridge)
  //   - intermediate worlds: all sephirot except keter (bridge above) and malkuth (bridge below)
  //   - world last: all sephirot except keter (bridge above)
  // Bridges: one per gap between worlds (worldOrder.length - 1).

  const sephKeys = Object.keys(sephirot);

  // ---- Build <defs> ----
  const defs: string[] = [];

  // Patterns for non-bridge sephirot. Pattern id includes world+sephira.
  // We use objectBoundingBox so the image fills the circle's bounding box.
  for (let i = 0; i < worldOrder.length; i++) {
    const world = worldOrder[i];
    const yOffset = i * TREE_VERTICAL_SPAN;
    for (const sephKey of sephKeys) {
      // Skip patterns we'd never use:
      const isBridgeAbove = i > 0 && sephKey === 'keter';
      const isBridgeBelow = i < worldOrder.length - 1 && sephKey === 'malkuth';
      if (isBridgeAbove || isBridgeBelow) continue;
      if (sephKey === 'daath') continue; // no image
      const dataUri = imageCache[`${world}:${sephKey}`];
      if (!dataUri) continue;

      const pos = sephirot[sephKey].position;
      const cx = pos.x;
      const cy = pos.y + yOffset;
      const x = cx - circleRadius;
      const y = cy - circleRadius;
      const size = circleRadius * 2;

      defs.push(
        `<pattern id="pat-${world}-${sephKey}" patternUnits="userSpaceOnUse" ` +
        `x="${x}" y="${y}" width="${size}" height="${size}">` +
        `<image href="${dataUri}" x="0" y="0" width="${size}" height="${size}" ` +
        `preserveAspectRatio="xMidYMid slice"/></pattern>`
      );
    }
  }

  // Bridge patterns + masks
  const bridges: Array<{ y: number; upper: string; lower: string; id: string }> = [];
  for (let i = 0; i < worldOrder.length - 1; i++) {
    const upper = worldOrder[i];
    const lower = worldOrder[i + 1];
    const bridgeY = KETER_Y + (i + 1) * TREE_VERTICAL_SPAN; // world i's malkuth y in stacked space
    const id = `bridge-${i}`;
    bridges.push({ y: bridgeY, upper, lower, id });

    const cx = 400; // both malkuth and keter sit on center pillar at x=400
    const cy = bridgeY;
    const r = circleRadius;
    const x = cx - r;
    const y = cy - r;
    const size = r * 2;

    // Upper image pattern (world i's malkuth)
    const upperUri = imageCache[`${upper}:malkuth`];
    // Lower image pattern (world i+1's keter)
    const lowerUri = imageCache[`${lower}:keter`];

    defs.push(
      `<pattern id="pat-${id}-upper" patternUnits="userSpaceOnUse" ` +
      `x="${x}" y="${y}" width="${size}" height="${size}">` +
      `<image href="${upperUri}" x="0" y="0" width="${size}" height="${size}" ` +
      `preserveAspectRatio="xMidYMid slice"/></pattern>`
    );
    defs.push(
      `<pattern id="pat-${id}-lower" patternUnits="userSpaceOnUse" ` +
      `x="${x}" y="${y}" width="${size}" height="${size}">` +
      `<image href="${lowerUri}" x="0" y="0" width="${size}" height="${size}" ` +
      `preserveAspectRatio="xMidYMid slice"/></pattern>`
    );

    // Gradient mask for the upper half — opaque at top, fading to transparent at bottom.
    // Feather band is centered on the equator (cy), height = bridgeFeatherFraction * 2r.
    const feather = Math.min(1, Math.max(0, bridgeFeatherFraction)) * size;
    const featherTopY = cy - feather / 2;
    const featherBotY = cy + feather / 2;
    // Convert to gradient stop offsets (0..1) over the full circle's y range (y..y+size)
    const offTop = (featherTopY - y) / size;
    const offBot = (featherBotY - y) / size;

    defs.push(
      `<linearGradient id="grad-${id}" x1="0" y1="${y}" x2="0" y2="${y + size}" gradientUnits="userSpaceOnUse">` +
      `<stop offset="0" stop-color="#ffffff" stop-opacity="1"/>` +
      `<stop offset="${offTop.toFixed(4)}" stop-color="#ffffff" stop-opacity="1"/>` +
      `<stop offset="${offBot.toFixed(4)}" stop-color="#000000" stop-opacity="1"/>` +
      `<stop offset="1" stop-color="#000000" stop-opacity="1"/>` +
      `</linearGradient>`
    );

    defs.push(
      `<mask id="mask-${id}" maskUnits="userSpaceOnUse" x="${x}" y="${y}" width="${size}" height="${size}">` +
      `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="url(#grad-${id})"/>` +
      `</mask>`
    );
  }

  // ---- Build paths (lines) ----
  const lineEls: string[] = [];
  for (let i = 0; i < worldOrder.length; i++) {
    const yOffset = i * TREE_VERTICAL_SPAN;
    for (const p of paths) {
      const from = sephirot[p.from].position;
      const to = sephirot[p.to].position;
      lineEls.push(
        `<line x1="${from.x}" y1="${from.y + yOffset}" x2="${to.x}" y2="${to.y + yOffset}" ` +
        `stroke="${pathColor}" stroke-width="${pathStrokeWidth}" stroke-linecap="round"/>`
      );
    }
  }

  // ---- Build sephirot circles ----
  const circleEls: string[] = [];
  for (let i = 0; i < worldOrder.length; i++) {
    const world = worldOrder[i];
    const yOffset = i * TREE_VERTICAL_SPAN;
    for (const sephKey of sephKeys) {
      if (sephKey === 'daath') {
        if (!includeDaath) continue;
        const pos = sephirot[sephKey].position;
        circleEls.push(
          `<circle cx="${pos.x}" cy="${pos.y + yOffset}" r="${circleRadius}" fill="${daathFill}"/>`
        );
        continue;
      }
      const isBridgeAbove = i > 0 && sephKey === 'keter';
      const isBridgeBelow = i < worldOrder.length - 1 && sephKey === 'malkuth';
      if (isBridgeAbove || isBridgeBelow) continue; // rendered as a bridge below

      const pos = sephirot[sephKey].position;
      const cx = pos.x;
      const cy = pos.y + yOffset;
      circleEls.push(
        `<circle cx="${cx}" cy="${cy}" r="${circleRadius}" fill="url(#pat-${world}-${sephKey})"/>`
      );
    }
  }

  // ---- Build bridge spheres ----
  // For each bridge: lower circle drawn first (full), then upper circle drawn on top with gradient mask.
  // Clip both to the circle so the rectangular pattern fill doesn't bleed outside.
  const bridgeEls: string[] = [];
  for (const b of bridges) {
    const cx = 400;
    const cy = b.y;
    const r = circleRadius;
    // Lower (keter of world below) — full circle
    bridgeEls.push(
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#pat-${b.id}-lower)"/>`
    );
    // Upper (malkuth of world above) — same circle, masked to fade from opaque top to transparent bottom
    bridgeEls.push(
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#pat-${b.id}-upper)" mask="url(#mask-${b.id})"/>`
    );
  }

  // ---- Assemble SVG ----
  // viewBox starts at y=0; our world-0 keter is at y=KETER_Y=50, providing topMargin.
  // If user changes topMargin we shift everything by (topMargin - KETER_Y).
  const shiftY = topMargin - KETER_Y;
  const innerGroup = shiftY === 0
    ? `${lineEls.join('\n  ')}\n  ${circleEls.join('\n  ')}\n  ${bridgeEls.join('\n  ')}`
    : `<g transform="translate(0,${shiftY})">\n  ${lineEls.join('\n  ')}\n  ${circleEls.join('\n  ')}\n  ${bridgeEls.join('\n  ')}\n</g>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${TREE_WIDTH}" height="${totalHeight}" viewBox="0 0 ${TREE_WIDTH} ${totalHeight}">
  <defs>
    ${defs.join('\n    ')}
  </defs>
  ${innerGroup}
</svg>
`;
}

// Surface dimensions for the CLI / consumer
export function svgDimensions(cfg: RenderConfig = DEFAULT_RENDER_CONFIG): { width: number; height: number } {
  const totalTreeSpan = TREE_VERTICAL_SPAN * cfg.worldOrder.length;
  return { width: TREE_WIDTH, height: cfg.topMargin + totalTreeSpan + cfg.bottomMargin };
}
