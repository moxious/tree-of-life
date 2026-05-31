import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { buildSvg, svgDimensions, DEFAULT_RENDER_CONFIG, type RenderConfig } from './build-svg.ts';

interface CliArgs {
  scale: number;
  out: string;
  svg?: string;
  includeDaath: boolean;
  featherFraction: number;
  pathStrokeWidth: number;
  circleRadius: number;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    scale: 4,
    out: 'dist/four-worlds-stacked.png',
    svg: undefined,
    includeDaath: false,
    featherFraction: DEFAULT_RENDER_CONFIG.bridgeFeatherFraction,
    pathStrokeWidth: DEFAULT_RENDER_CONFIG.pathStrokeWidth,
    circleRadius: DEFAULT_RENDER_CONFIG.circleRadius,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    switch (a) {
      case '--scale': args.scale = parseFloat(next()); break;
      case '--out': args.out = next(); break;
      case '--svg': args.svg = next(); break;
      case '--include-daath': args.includeDaath = true; break;
      case '--feather': args.featherFraction = parseFloat(next()); break;
      case '--stroke': args.pathStrokeWidth = parseFloat(next()); break;
      case '--radius': args.circleRadius = parseFloat(next()); break;
      case '-h':
      case '--help':
        console.log(`Usage: tsx scripts/render-stacked-tree/render.ts [options]

Options:
  --scale <n>        Output scale multiplier (default 4)
  --out <path>       PNG output path (default dist/four-worlds-stacked.png)
  --svg <path>       Optional: also write SVG to this path for inspection
  --include-daath    Render Daath as a solid black circle (default: omitted)
  --feather <0..1>   Bridge sphere gradient feather fraction (default 0.4)
  --stroke <n>       Path stroke width in viewBox units (default 2)
  --radius <n>       Sephirah circle radius in viewBox units (default 30)
`);
        process.exit(0);
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const cfg: RenderConfig = {
    ...DEFAULT_RENDER_CONFIG,
    includeDaath: args.includeDaath,
    bridgeFeatherFraction: args.featherFraction,
    pathStrokeWidth: args.pathStrokeWidth,
    circleRadius: args.circleRadius,
  };

  console.log('Building SVG...');
  const svg = buildSvg(cfg);
  const { width, height } = svgDimensions(cfg);
  console.log(`  viewBox: ${width} x ${height}`);
  console.log(`  scale: ${args.scale}x -> output ${Math.round(width * args.scale)} x ${Math.round(height * args.scale)}`);

  if (args.svg) {
    const svgPath = path.resolve(args.svg);
    fs.mkdirSync(path.dirname(svgPath), { recursive: true });
    fs.writeFileSync(svgPath, svg);
    console.log(`  SVG written: ${svgPath} (${(svg.length / 1024).toFixed(1)} KB)`);
  }

  console.log('Rasterizing via resvg...');
  const resvg = new Resvg(svg, {
    background: 'rgba(0,0,0,0)', // transparent
    fitTo: { mode: 'zoom', value: args.scale },
    font: { loadSystemFonts: false },
  });
  const pngData = resvg.render().asPng();

  const outPath = path.resolve(args.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, pngData);
  const stat = fs.statSync(outPath);
  console.log(`  PNG written: ${outPath} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
