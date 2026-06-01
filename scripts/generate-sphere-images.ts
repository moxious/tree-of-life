import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileP = promisify(execFile);

type Size = '1024x1024' | '1536x1024' | '1024x1536';
type Quality = 'low' | 'medium' | 'high' | 'auto';

interface Args {
  outDir: string;
  size: Size;
  quality: Quality;
  only?: Set<string>;
  worlds?: Set<string>;
  concurrency: number;
  dryRun: boolean;
  force: boolean;
  promptOnly: boolean;
  recenter: boolean;
  paddingPct: number;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const configPath = path.join(projectRoot, 'src/treeOfLifeConfig.json');

const WORLDS = ['atziluth', 'briah', 'yetzirah', 'assiah'] as const;
const SEPHIROT = [
  'keter', 'hockmah', 'binah',
  'hesed', 'gevurah', 'tiferet',
  'netzach', 'hod', 'yesod', 'malkuth',
] as const;

function parseArgs(argv: string[]): Args {
  const args: Args = {
    outDir: 'public/images-v2',
    size: '1024x1024',
    quality: 'high',
    concurrency: 3,
    dryRun: false,
    force: false,
    promptOnly: false,
    recenter: true,
    paddingPct: 8,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    switch (a) {
      case '--out': args.outDir = next(); break;
      case '--size': args.size = next() as Size; break;
      case '--quality': args.quality = next() as Quality; break;
      case '--only': args.only = new Set(next().split(',')); break;
      case '--worlds': args.worlds = new Set(next().split(',')); break;
      case '--concurrency': args.concurrency = parseInt(next(), 10); break;
      case '--dry-run': args.dryRun = true; break;
      case '--force': args.force = true; break;
      case '--prompt-only': args.promptOnly = true; break;
      case '--no-recenter': args.recenter = false; break;
      case '--padding': args.paddingPct = parseFloat(next()); break;
      case '-h':
      case '--help':
        printHelp();
        process.exit(0);
        break;
      default:
        console.error(`Unknown arg: ${a}`);
        process.exit(1);
    }
  }
  return args;
}

function printHelp() {
  console.log(`Usage: tsx scripts/generate-sphere-images.ts [options]

Options:
  --out <dir>           Output directory (default: public/images-v2)
  --size <WxH>          1024x1024 | 1536x1024 | 1024x1536 (default: 1024x1024)
  --quality <q>         low | medium | high | auto (default: high)
  --worlds <list>       comma-separated, e.g. atziluth,briah
  --only <list>         comma-separated world-sephira, e.g. briah-keter,assiah-malkuth
  --concurrency <n>     parallel requests (default: 3)
  --force               overwrite existing files
  --dry-run             do not call API, just print prompts
  --prompt-only         print all prompts and exit
  --no-recenter         skip the ImageMagick alpha-bbox recenter post-process
  --padding <pct>       padding around sphere as % of frame (default: 8)
  -h, --help

Env:
  OPENAI_API_KEY        required (unless --dry-run / --prompt-only)
  OPENAI_MODEL          override model (default: gpt-image-1)

Examples:
  tsx scripts/generate-sphere-images.ts --only briah-keter,yetzirah-gevurah --dry-run
  tsx scripts/generate-sphere-images.ts --worlds briah --quality medium
  tsx scripts/generate-sphere-images.ts                       # generate all 40
`);
}

interface SephiraColors {
  in: Record<string, { color: string }>;
}
interface Config {
  sephirot: Record<string, SephiraColors & { name: string }>;
}

function colorEmphasis(color: string): string {
  const c = color.toLowerCase();
  const isMalkuthFour = c.includes('citrine') && c.includes('olive') && c.includes('russet');
  if (isMalkuthFour) {
    const flecked = c.includes('flecked');
    const base = `The sphere is divided into four equal quadrants of distinct solid color with sharp clean boundaries between them, NOT blended, NOT a gradient. The quadrants are arranged as follows: citrine (pale yellow-green) fills the top quadrant, russet (reddish-brown) fills the bottom quadrant, olive (dark yellow-green) fills the right quadrant, black fills the left quadrant. Each quadrant occupies one quarter of the sphere's visible surface, meeting at the center.`;
    if (flecked) return `${base} Over the entire four-quadrant sphere, scatter clearly visible saturated gold flecks (small specks).`;
    return base;
  }
  if (c.includes('flecked')) {
    return `The flecks must be clearly visible, saturated, and distinct against the base color — not desaturated, not blurred, not blended into a wash. The flecks are small individual specks scattered evenly across the entire surface.`;
  }
  if (c.includes('rayed')) {
    return `The rays appear as sharp, high-contrast longitudinal stripes running vertically from the top pole to the bottom pole of the sphere (like the meridians on a globe). Evenly spaced stripes of the secondary color on the base color. NOT a sunburst, NOT a star pattern, NOT rays radiating from a center point — strictly vertical pole-to-pole longitudinal stripes.`;
  }
  if (c.includes('iridescent') || c.includes('pearl')) {
    return `The iridescent / pearl quality should be subtle but visible as soft shifts in hue across the surface.`;
  }
  return `Render this color literally and accurately, with full saturation, not desaturated.`;
}

async function recenterImage(filePath: string, size: number, paddingPct: number): Promise<void> {
  const inner = Math.round(size * (1 - paddingPct / 100 * 2));
  const tmp = filePath + '.tmp.png';
  // Compute a tight bbox from a thresholded alpha channel — this ignores soft halos
  // and gives us the bounding box of the visually opaque sphere.
  const { stdout: bbox } = await execFileP('magick', [
    filePath,
    '-channel', 'A', '-threshold', '50%', '+channel',
    '-format', '%@', 'info:',
  ]);
  const trimmed = bbox.trim();
  if (!/^\d+x\d+\+\d+\+\d+$/.test(trimmed)) {
    throw new Error(`Unexpected bbox format for ${filePath}: "${trimmed}"`);
  }
  // Crop the ORIGINAL (soft alpha intact) to the tight bbox, then fit & extent.
  await execFileP('magick', [
    filePath,
    '-crop', trimmed, '+repage',
    '-resize', `${inner}x${inner}`,
    '-background', 'none',
    '-gravity', 'center',
    '-extent', `${size}x${size}`,
    tmp,
  ]);
  fs.renameSync(tmp, filePath);
}

function buildPrompt(sephiraKey: string, sephiraName: string, world: string, colorDescription: string): string {
  return [
    `A single matte sphere, perfectly centered in a square frame, on a fully transparent background.`,
    `The sphere is colored exactly as described: "${colorDescription}".`,
    colorEmphasis(colorDescription),
    `Style: smooth matte finish, even soft ambient studio lighting, subtle form shading so the sphere reads as 3D.`,
    `Strict requirements: transparent background (PNG alpha), absolutely no drop shadow, no cast shadow, no floor, no reflection, no gradient backdrop, no rim light flare, no text, no border, no signature.`,
    `Composition: square 1:1 aspect ratio; the sphere is dead-centered both horizontally and vertically; equal margin of approximately 8% on top, bottom, left, and right; the sphere does NOT touch any edge of the frame.`,
    `Context (do not depict): represents the sephira ${sephiraName} in the kabbalistic world of ${world}.`,
  ].join(' ');
}

async function callOpenAI(prompt: string, args: Args, apiKey: string): Promise<Buffer> {
  const model = process.env.OPENAI_MODEL || 'gpt-image-1';
  const body = {
    model,
    prompt,
    n: 1,
    size: args.size,
    quality: args.quality,
    background: 'transparent',
    output_format: 'png',
  };
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI API ${res.status}: ${text}`);
  }
  const json = await res.json() as { data: Array<{ b64_json?: string; url?: string }> };
  const item = json.data?.[0];
  if (!item) throw new Error('No image in response');
  if (item.b64_json) return Buffer.from(item.b64_json, 'base64');
  if (item.url) {
    const imgRes = await fetch(item.url);
    if (!imgRes.ok) throw new Error(`Image fetch failed: ${imgRes.status}`);
    return Buffer.from(await imgRes.arrayBuffer());
  }
  throw new Error('No b64_json or url in response');
}

interface Job {
  world: string;
  sephira: string;
  sephiraName: string;
  color: string;
  filename: string;
  prompt: string;
}

function buildJobs(config: Config, args: Args): Job[] {
  const jobs: Job[] = [];
  for (const world of WORLDS) {
    if (args.worlds && !args.worlds.has(world)) continue;
    for (const sephira of SEPHIROT) {
      const key = `${world}-${sephira}`;
      if (args.only && !args.only.has(key)) continue;
      const node = config.sephirot[sephira];
      if (!node) continue;
      const color = node.in[world]?.color;
      if (!color) continue;
      jobs.push({
        world,
        sephira,
        sephiraName: node.name,
        color,
        filename: `${world}-${sephira}.png`,
        prompt: buildPrompt(sephira, node.name, world, color),
      });
    }
  }
  return jobs;
}

async function runWithConcurrency<T>(items: T[], limit: number, worker: (item: T, idx: number) => Promise<void>): Promise<void> {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const idx = cursor++;
      if (idx >= items.length) return;
      await worker(items[idx], idx);
    }
  });
  await Promise.all(runners);
}

function writeComparisonHtml(outDir: string, jobs: Job[]) {
  const rel = path.relative(path.join(projectRoot, 'public'), path.resolve(outDir));
  const newPrefix = rel.replace(/\\/g, '/');
  const rows = jobs.map(j => `
    <tr>
      <td>${j.world}<br><b>${j.sephiraName}</b></td>
      <td class="color">${j.color}</td>
      <td><img src="/images/${j.filename}" alt="old"></td>
      <td><img src="/${newPrefix}/${j.filename}" alt="new"></td>
    </tr>`).join('');
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Sphere generation comparison</title>
<style>
body { font-family: system-ui, sans-serif; background: #1a1a1a; color: #eee; padding: 16px; }
table { border-collapse: collapse; width: 100%; }
th, td { border: 1px solid #333; padding: 8px; vertical-align: middle; }
th { background: #222; position: sticky; top: 0; }
td.color { font-style: italic; color: #aaa; max-width: 240px; }
img { width: 240px; height: 240px; object-fit: contain; background: repeating-conic-gradient(#333 0% 25%, #444 0% 50%) 50% / 20px 20px; }
</style></head><body>
<h1>Sphere comparison — old (public/images) vs new (${newPrefix})</h1>
<table>
<thead><tr><th>Node</th><th>Color (JSON)</th><th>Old</th><th>New</th></tr></thead>
<tbody>${rows}</tbody></table>
</body></html>`;
  const outPath = path.join(projectRoot, 'public', 'sphere-comparison.html');
  fs.writeFileSync(outPath, html);
  console.log(`Wrote comparison page: ${outPath} (open via vite at /sphere-comparison.html)`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8')) as Config;
  const jobs = buildJobs(config, args);
  console.log(`${jobs.length} job(s) planned`);

  if (args.promptOnly) {
    for (const j of jobs) console.log(`\n--- ${j.filename} (${j.color})\n${j.prompt}`);
    return;
  }

  const absOut = path.isAbsolute(args.outDir) ? args.outDir : path.join(projectRoot, args.outDir);
  fs.mkdirSync(absOut, { recursive: true });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!args.dryRun && !apiKey) {
    console.error('OPENAI_API_KEY env var is required');
    process.exit(1);
  }

  let done = 0;
  let failed = 0;
  const errors: Array<{ job: Job; error: string }> = [];

  await runWithConcurrency(jobs, args.concurrency, async (job) => {
    const target = path.join(absOut, job.filename);
    if (!args.force && fs.existsSync(target)) {
      console.log(`[skip exists] ${job.filename}`);
      done++;
      return;
    }
    if (args.dryRun) {
      console.log(`[dry-run] ${job.filename}\n  prompt: ${job.prompt}`);
      done++;
      return;
    }
    const start = Date.now();
    try {
      const png = await callOpenAI(job.prompt, args, apiKey!);
      fs.writeFileSync(target, png);
      if (args.recenter) {
        const sz = parseInt(args.size.split('x')[0], 10);
        await recenterImage(target, sz, args.paddingPct);
      }
      const finalSize = fs.statSync(target).size;
      done++;
      console.log(`[ok ${done}/${jobs.length}] ${job.filename} (${finalSize} bytes, ${Date.now() - start}ms${args.recenter ? ', recentered' : ''})`);
    } catch (err) {
      failed++;
      const msg = err instanceof Error ? err.message : String(err);
      errors.push({ job, error: msg });
      console.error(`[FAIL] ${job.filename}: ${msg}`);
    }
  });

  writeComparisonHtml(absOut, jobs);

  console.log(`\nDone. ${done} ok, ${failed} failed.`);
  if (errors.length) {
    console.log('\nFailures:');
    for (const e of errors) console.log(`  ${e.job.filename}: ${e.error}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
