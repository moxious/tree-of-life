# Tree of Life

Etz Chaim - deployed via GitHub pages [here](https://moxious.github.io/tree-of-life/)

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository and navigate to the project directory
2. Install the dependencies:
```bash
npm install
```

### Development Server

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

## Rendering the Four-Worlds Stacked Tree (Static PNG)

In addition to the interactive React app, this repo includes a script that renders a single static PNG depicting all four worlds (Atziluth, Briah, Yetzirah, Assiah) stacked vertically as one conjoined tree.

The output:
- Transparent background, same width as a single tree
- Four trees stacked top-to-bottom: Atziluth → Briah → Yetzirah → Assiah
- Adjacent worlds share a "bridge" sphere where the malkuth of the world above merges into the keter of the world below via a soft vertical gradient blend
- All 22 paths per tree rendered as plain black lines (no labels, no tarot cards, no Hebrew letters)
- Daath omitted by default (it has no image and does not participate in any path edges); can be enabled as a solid black circle via `--include-daath`

### Quick start

```bash
# Default 4x print-quality render to dist/four-worlds-stacked.png (3200x9640)
npm run render-stacked-tree

# Fast low-res preview
npm run render-stacked-tree -- --scale 1 --out dist/preview.png

# Also write the SVG alongside the PNG (useful for inspection / manual editing)
npm run render-stacked-tree -- --svg dist/four-worlds-stacked.svg
```

### CLI flags

| Flag | Default | Description |
|---|---|---|
| `--scale <n>` | `4` | Output scale multiplier. The intrinsic viewBox is 800×2410; output PNG is `scale × viewBox`. |
| `--out <path>` | `dist/four-worlds-stacked.png` | Output PNG path. |
| `--svg <path>` | _(none)_ | If set, also writes the intermediate SVG to this path. |
| `--include-daath` | off | Renders Daath as a solid black circle on the central pillar of every tree. Off by default — Daath has no image and may occlude paths if enabled. |
| `--feather <0..1>` | `0.4` | Fraction of the bridge sphere's diameter used as the soft gradient band where upper-world malkuth fades into lower-world keter. `0` = hard horizontal split; `1` = full circle feather. |
| `--stroke <n>` | `2` | Path stroke width in viewBox units. |
| `--radius <n>` | `30` | Sephirah circle radius in viewBox units. |

### How it works (pipeline)

The script lives in `scripts/render-stacked-tree/` and is a two-stage pipeline:

1. **`build-svg.ts`** — pure function that reads `src/treeOfLifeConfig.json` (the same config the React app uses for sephirot positions and paths), embeds the per-world sephirah PNGs from `public/images/` as base64 data URIs, computes the stacked layout, and emits an SVG string. Bridge spheres are rendered as two stacked image circles (lower keter on bottom, upper malkuth on top) with the upper masked by a vertical alpha gradient.
2. **`render.ts`** — CLI entry that calls `build-svg`, optionally dumps the SVG to disk, then rasterizes via `@resvg/resvg-js` (Rust-backed renderer) to a transparent-background PNG.

### Tweaking the output

- **Spatial geometry** (sephirot positions, path topology) is shared with the React app via `src/treeOfLifeConfig.json`. Editing positions there will affect both the interactive view and the stacked render.
- **Render-only knobs** (sphere radius, path stroke/color, feather amount, world order, top/bottom margins, Daath visibility) live in `DEFAULT_RENDER_CONFIG` at the top of `scripts/render-stacked-tree/build-svg.ts`. Many of these are also exposed as CLI flags.
- **Source artwork**: each sephira's PNG lives at `public/images/{world}-{sephira}.png` (40 files total). Replacing a file and re-running the script picks up the new artwork. Image quality is the limiting factor for poster-resolution output.

## About This Template

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
