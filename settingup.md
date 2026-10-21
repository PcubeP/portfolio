# Setting up & running the R3F portfolio

**Project root:** `C:\dev\workspace\Personal\portfolio`
**Package:** `digital-universe-portfolio` v0.1.0 (private, `type: module`)

This portfolio is not a page you scroll — it is a single continuous 3D world you *fly through*. One drone-like camera travels one authored spline from a dark ignition corridor to a closing desk, and the eight content chapters are physical places strung along that path. Environments **are** the content; headline text is discovered in-world as physical signage. Everything below is verified against the checked-in source.

**Stack:** Vite 5 · React 18 · TypeScript (strict, `tsc -b`) · Tailwind 3 · React Three Fiber (`@react-three/fiber` 8, `drei` 9, `@react-three/postprocessing` 2, `postprocessing` 6) · three 0.169.

---

## Table of contents

1. [Prerequisites & tooling](#1-prerequisites--tooling)
2. [Quick start](#2-quick-start)
3. [Asset pipeline (Poly Haven CC0)](#3-asset-pipeline-poly-haven-cc0)
4. [Rendering, materials & post-processing](#4-rendering-materials--post-processing)
5. [World & scene architecture](#5-world--scene-architecture)
6. [Dev workflow & screenshots](#6-dev-workflow--screenshots)
7. [HARD CONSTRAINTS — never violate](#7-hard-constraints--never-violate)
8. [Photoreal fidelity pass (current state)](#8-photoreal-fidelity-pass-current-state)
9. [Troubleshooting & gotchas](#9-troubleshooting--gotchas)

---

## 1. Prerequisites & tooling

Verified against `package.json`, `vite.config.ts`, the three `tsconfig*.json` files, `tailwind.config.js`, `postcss.config.js`, `index.html`. There is **no** `.nvmrc`, `.npmrc`, or `engines` field — no version is hard-enforced by the repo, so the recommendations below come from the pinned toolchain.

### What to install

- **Node.js 20 LTS** (recommended). `@types/node` is pinned to `^20.19.43`; Vite 5 requires Node 18/20/22 (odd-numbered releases are unsupported). Node 20 is the tested target.
- **npm** (whatever ships with Node 20 — npm 9/10). No alternate package manager is configured (no `pnpm-lock.yaml` / `yarn.lock`).
- No global tooling required — `tsc`, `vite`, `tailwindcss`, and `playwright` are all local devDependencies invoked via npm scripts / `npx`.

### Toolchain versions (exact, from `package.json`)

| Runtime | Version | | Dev / build | Version |
|---|---|---|---|---|
| `react` / `react-dom` | `^18.3.1` | | `vite` | `^5.4.11` |
| `three` | `^0.169.0` | | `@vitejs/plugin-react` | `^4.3.3` |
| `@react-three/fiber` | `^8.18.0` | | `typescript` | `^5.6.3` |
| `@react-three/drei` | `^9.122.0` | | `tailwindcss` | `^3.4.15` |
| `@react-three/postprocessing` | `^2.19.1` | | `postcss` | `^8.4.49` |
| `postprocessing` | `^6.39.5` | | `autoprefixer` | `^10.4.20` |
| `maath` | `^0.10.8` | | `playwright` | `^1.63.0` |
| `motion` | `^11.18.2` | | `@types/node` | `^20.19.43` |

### npm scripts

| Script | Command | What it does |
|--------|---------|--------------|
| `dev` | `vite` | Vite dev server with HMR. |
| `build` | `tsc -b && vite build` | TS project-reference build (type-checks `src` + `vite.config.ts`), then the production bundle into `dist/`. |
| `preview` | `vite preview` | Serves the built `dist/` for a local prod smoke test. |
| `typecheck` | `tsc -b --noEmit` | Type-checks the whole project via references, no emit. |

### TypeScript strictness

Project references: `tsconfig.json` → `tsconfig.app.json` (`src`, target ES2020, `moduleResolution: bundler`, `jsx: react-jsx`, `noEmit`, `isolatedModules`) and `tsconfig.node.json` (`vite.config.ts`, target ES2022). Both leaf configs enable:

- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true` (app config only)

Because `build` runs `tsc -b` first, **any** type error — including unused locals/params — fails the build before `vite build` runs.

### Path alias

`@/` → `src/`, configured in **two places that must stay in sync**:

- `vite.config.ts` (bundler): `'@': fileURLToPath(new URL('./src', import.meta.url))`
- `tsconfig.app.json` (editor/types): `"baseUrl": "."` + `"paths": { "@/*": ["./src/*"] }`

### Build / CSS notes

- `vite.config.ts` defines a `manualChunks` group named `three` bundling the whole 3D stack (`three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `postprocessing`, `maath`) into one cacheable vendor chunk, loaded lazily after the intro gate to keep the initial payload light.
- Tailwind 3 via PostCSS (`tailwindcss` + `autoprefixer`), scanning `./index.html` and `./src/**/*.{ts,tsx}`. Theme driven by CSS custom properties (`rgb(var(--token) / <alpha-value>)`) with per-world accent tokens.
- Signage fonts (Chakra Petch, Rubik Spray Paint, Permanent Marker) are downloaded as local TTFs by the asset script (troika needs TTF/OTF, not woff2). The DOM-layer UI fonts are pulled from Google Fonts via `<link>` in `index.html`.

---

## 2. Quick start

```bash
# 1. install
npm install

# 2. fetch assets (one-time; ~445 MB of CC0 4K textures/models/HDRIs)
node scripts/fetch-assets.mjs

# 3. dev server — pin :5174 so the screenshot harness matches
npm run dev -- --port 5174

# 4. (optional) type-check / production build
npm run typecheck
npm run build
```

> **Dev server port.** `vite.config.ts` sets no `server.port`, so Vite defaults to **5173** and auto-increments to 5174+ if busy. `scripts/shoot.mjs` hardcodes **5174**, so start the server with `--port 5174` explicitly when you intend to screenshot. (The README's mention of 5173 is stale relative to the screenshot workflow.)

---

## 3. Asset pipeline (Poly Haven CC0)

All 3D assets are license-clean and fetched by a single one-time downloader, `scripts/fetch-assets.mjs`. It pulls real PBR textures + HDRIs from Poly Haven (files API) and static TTF fonts from Google Fonts into `public/assets/`, and regenerates `public/assets/CREDITS.md` with a source URL + license line for every asset. Nothing copyrighted/trademarked ships in the repo.

```bash
node scripts/fetch-assets.mjs   # from repo root; no args, no env vars
```

### ⚠️ Idempotency trap — the script SKIPS files that already exist

`download()` short-circuits (`skip (exists)`) whenever the destination file is present and non-empty (`stat().size > 0`, `fetch-assets.mjs:97-102`). This makes re-runs cheap, but it means **you cannot upgrade a resolution or swap an asset just by editing the manifest and re-running** — the old files stay put. *This is the exact bug that once left "4K" surfaces silently stuck at 1024².*

To force an upgrade, delete the target folders first:

```bash
# force-refresh everything
rm -rf public/assets/textures public/assets/hdri public/assets/models public/assets/CREDITS.md
node scripts/fetch-assets.mjs

# or surgically, one set / model
rm -rf public/assets/textures/concrete public/assets/models/car
node scripts/fetch-assets.mjs
```

Second non-obvious trap: **displacement maps (`disp.jpg`) only produce relief on SUBDIVIDED plane geometry.** A flat 2-triangle plane has no vertices to displace, so hero floors must use a subdivided plane (e.g. `planeGeometry args={[w, h, 200, 140]}`).

### TEXTURES manifest (`fetch-assets.mjs:42-53`)

Hero surfaces the drone flies close to pull **4K + displacement**; props/accents stay **2K**.

| id | folder | res | disp | Use |
|---|---|---|---|---|
| `concrete_floor_02` | `concrete` | 4k | ✓ | garage / gallery / connect / arcade floors |
| `wood_planks` | `wood` | 4k | ✓ | CRT floor / easel / desk / crates |
| `baseball_playground` | `clay` | 4k | ✓ | tennis clay court |
| `blue_floor_tiles_01` | `pooltile` | 4k | ✓ | pool floor + walls |
| `asphalt_02` | `asphalt` | 4k | ✓ | journey road |
| `corrugated_iron_02` | `corrugated` | 4k | ✗ | warehouse walls + roof |
| `painted_metal_shutter` | `shutter` | 4k | ✗ | garage roller door |
| `metal_plate` | `metal` | 2k | ✗ | casings, cabinets, posts |
| `rusty_metal_02` | `rusty` | 2k | ✗ | weathered accents |
| `rubber_tiles` | `rubber` | 2k | ✗ | tires / lane ropes |

**Files each set downloads** (`fetchTexture`, `fetch-assets.mjs:143-173`):

- `diff.jpg` — diffuse/albedo at the set's `res`.
- `nor.jpg` — normal map from Poly Haven `nor_gl` (**OpenGL** green-channel convention, not DirectX).
- `arm.jpg` — the **packed ORM** map: **AO = red, Roughness = green, Metalness = blue**. (Falls back to separate `rough.jpg` + `ao.jpg` if the asset has no packed `arm`.)
- `disp.jpg` — displacement, only when `disp: true`.
- `diff_low.jpg` — **always** downloaded: a 2K diffuse-only variant (`LOW_RES = '2k'`) for the mobile / reduced-motion path, so phones never fetch the 4K albedo.

### MODELS (`fetch-assets.mjs:60-79`, `[slug, folder, res]`)

18 real photoscanned glTF props. Only the two the camera flies right up to are 4K; the rest are 2K.

- **4K:** `covered_car` → `car`, `Television_01` → `tv`
- **2K:** `weldingcart`, `toolchest`, `crate`, `militarycrate`, `spraycans`, `shoplamp`, `stove`, `plant`, `gameconsole`, `boombox`, `table`, `armchair`, `desklamp`, `camera`, `stool`, `cardboardbox`

`fetchModel` writes the glTF as `models/<folder>/model.gltf`, then downloads every entry in the API `include` map by its exact relative path (`.bin` + `textures/*.jpg`) so `GLTFLoader` resolves relative URIs intact.

### HDRIs (`fetch-assets.mjs:82-85`)

| id | file | res | Use |
|---|---|---|---|
| `studio_small_08` | `hdri/studio.hdr` | 2k | neutral global IBL |
| `autoshop_01` | `hdri/autoshop.hdr` | 4k | warm garage / car reflections |

HDRIs are fetched by **direct URL**, not the files API: `https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/<res>/<id>_<res>.hdr`.

### Fonts (Google Fonts, static TTF)

`display.ttf` = Chakra Petch (OFL-1.1), `graffiti.ttf` = Rubik Spray Paint (OFL-1.1), `marker.ttf` = Permanent Marker (Apache-2.0), from `raw.githubusercontent.com/google/fonts/main/...`.

### `pickJpg` is strict (`fetch-assets.mjs:127-141`)

Selects `node[res].jpg.url` at exactly the requested tier — **no silent downgrades** (silent downgrades were the original bug). Only if the tier is genuinely absent does it fall back with a printed warning (`low → 1k`, else highest available `\d+k`).

### Verify resolutions on disk (JPEG SOF header)

Read width/height from the JPEG marker rather than trusting the filename:

```bash
cd public/assets/textures
python -c "
import struct,sys
d=open(sys.argv[1],'rb').read(); i=2
while i<len(d):
    if d[i]!=0xFF: i+=1; continue
    if d[i+1] in (0xC0,0xC1,0xC2,0xC3):
        h=struct.unpack('>H',d[i+5:i+7])[0]; w=struct.unpack('>H',d[i+7:i+9])[0]
        print(f'{sys.argv[1]}: {w}x{h}'); break
    i+=2+struct.unpack('>H',d[i+2:i+4])[0]
" concrete/diff.jpg
```

Expected: hero `diff/disp` = 4096×4096; props = 2048×2048; every `diff_low.jpg` = 2048×2048.

### CREDITS.md

Fully regenerated from scratch on every run (`main()`, `fetch-assets.mjs:215-222`): a fixed header plus one bullet per asset (folder/file, Poly Haven slug + res or font name, source URL, license). `download()` retries 3× with a 90s timeout, treats <256-byte bodies as failures, and deletes partial files before retry — so an aborted run leaves no truncated file a later run would wrongly skip.

---

## 4. Rendering, materials & post-processing

The stage is a single fixed-viewport R3F `<Canvas>` (`src/world/WorldCanvas.tsx`), lazy-loaded after the intro gate, and a **sibling of `<main>`** in the DOM (never a descendant) so `position: fixed` isn't trapped by a transformed ancestor.

### Quality gate: `lowFi = reduced || mobile`

- `reduced` — reduced-motion preference, passed into `WorldCanvas` as a prop.
- `mobile` — `window.matchMedia('(max-width: 820px)').matches` (computed via `useMemo`; the same query is independently re-derived in `proceduralEnv.tsx` — change the breakpoint in **both**).

`lowFi` disables: PCSS `SoftShadows` (`<SoftShadows size={26} samples={12} focus={0.6} />`, mounted only when `!lowFi`); HDRI IBL (falls back to a Lightformer rig); the 4K albedo (worlds pass `diffuseOnly`, so `usePBR` loads only 2K `diff_low.jpg`).

Two finer gates that are **not** `lowFi`:
- **N8AO (SSAO)** is dropped on `mobile` specifically, not on `reduced`.
- **The entire `EffectComposer`** mounts only when `!reduced`. Under reduced-motion there is no composer at all; under mobile-but-not-reduced the composer still runs (N8AO removed, `multisampling={0}`).

### Materials — `usePBR` (`src/world/materials/usePBR.ts`)

`usePBR(set, options)` loads a set from `BASE = '/assets/textures'` (`${BASE}/${set}/…`) and returns props to spread onto `<meshStandardMaterial>`.

**`PBROptions`** (defaults): `repeat` `[1,1]` · `anisotropy` `16` · `normalScale` `1` · `diffuseOnly` `false` · `displacementScale` `0`.

**Which files load:**
- `diffuseOnly === true` → only `diff_low.jpg` as `map`.
- Full path → `diff.jpg` (`map`), `nor.jpg` (`normalMap`), and `arm.jpg` fed to **both** `roughnessMap` and `metalnessMap` (one fetch, ORM channels g/b).
- `disp.jpg` (`displacementMap`) loads **only** when `!diffuseOnly && displacementScale > 0`.

**Prep** (memoized, per-map): each texture is `clone()`d (so each surface owns its wrap/repeat without mutating the drei shared cache), `wrapS = wrapT = RepeatWrapping`, `repeat.set(rx, ry)`, `anisotropy` applied. Color space is `SRGBColorSpace` for the **diffuse `map` only**; all data maps (normal, arm, displacement) use `NoColorSpace` (linear). Loading suspends (`useTexture`) — callers must sit under `<Suspense>`.

### Image-based lighting — `ProceduralEnv` (`src/world/proceduralEnv.tsx`)

- **Full (`!lowFi`):** `<Environment files="/assets/hdri/studio.hdr" resolution={512} />` (Poly Haven `studio_small_08`).
- **`lowFi`:** zero-download `<Environment resolution={256} frames={1}>` wrapping four `Lightformer`s — broad key from above (`2.2`, `#fdf5e6`), cool rim from behind (`1.1`, `#8fb8ff`), two warm side fills (`0.8`, `#ffd9a0`).

### Scene lighting, fog & backdrop

- Background `#0d1a2e`; `fogExp2` `#0d1a2e` density `0.048`.
- `ambientLight 0.7`; `hemisphereLight` `#bcd3ff` / `#1c2740` at `0.8`; `directionalLight [18,30,12] intensity 1.5 #fff2dd` (key + cast direction).
- **`FogDirector`** lerps fog color 20% toward the current chapter accent each frame (accent HSL saturation capped at 0.5 so neon reads as haze, not a wash).
- **`Backdrop`** — camera-following BackSide gradient sky sphere (`renderOrder -1000`, `depthWrite false`, `fog false`); its `horizon` uniform copies the fog color each frame so geometry fogs out seamlessly into the sky.

### Post-processing (`WorldCanvas.tsx`) — mounts only when `!reduced`

`<EffectComposer enableNormalPass={false} multisampling={mobile ? 0 : 4}>`, passes in order:

1. **N8AO** — `aoRadius 1.4, intensity 1.3, distanceFalloff 1, quality "performance"`, **no** `halfRes`. Nulled when `mobile`.
2. **DiveEffect** — merged screen-space underwater pass (below).
3. **CRTEffect** — merged "inside the television" pass (below).
4. **Bloom** — `mipmapBlur, intensity 0.7, luminanceThreshold 0.7, luminanceSmoothing 0.3`.
5. **Vignette** — `eskil false, offset 0.25, darkness 0.45`.
6. **ToneMapping** — `ACES_FILMIC`, **last**, so bloom/AO run in linear HDR before ACES → sRGB.

**Tone-mapping split (mutually exclusive, must apply exactly once):**
- Reduced path (no composer): renderer owns it — `gl.toneMapping = ACESFilmicToneMapping`.
- Composer path: renderer `NoToneMapping`; the final `<ToneMapping>` effect does ACES.
- Both share `toneMappingExposure: 1.25`.

**Custom composer effects** (both `postprocessing` `Effect` subclasses, driven by scalars from the `worldFx` bus, no-ops at value 0 so they live permanently in the stack):
- **`DiveEffect`** (`src/world/effects/DiveEffect.tsx`) — as `submergence` 0→1: sine-ripple refraction, RGB chromatic aberration, palette sinking to deep teal, edge caustics; `droplets` adds breach lens-beads.
- **`CRTEffect`** (`src/world/effects/CRTEffect.tsx`) — as `crtEntry` 0→1: barrel curvature, aperture-grille phosphor mask, scanlines, RGB separation, rolling brightness bar, static, tube vignette.

### Canvas / renderer

`dpr={[1,2]}` + `<AdaptiveDpr pixelated />` · `shadows={{ type: PCFSoftShadowMap }}` · `frameloop={reduced ? 'demand' : 'always'}` · `gl: { antialias: true, powerPreference: 'high-performance' }` · camera `fov 55, near 0.1, far 400`.

---

## 5. World & scene architecture

### The guiding principle: environments ARE the content

There is no HTML overlaid on the 3D scene for the primary experience. Every headline, name, stat and label lives *in the world* as physical troika SDF text (`drei <Text>` via `src/world/components/Signage.tsx`) — copy is discovered as objects you fly past. Long-form accessible prose lives in a separate DOM `<main>` layer for a11y; the in-world signage carries only headlines. Signage uses bundled local fonts (no CDN).

### The camera spline — two decoupled Catmull-Rom curves (`src/world/spline.ts`)

- **`posCurve`** — where the camera *is* (17 `POSITION_POINTS`).
- **`lookCurve`** — where the camera *looks* (`LOOK_POINTS`).

Both are `CatmullRomCurve3` in `'centripetal'` mode (tension 0.5, so sharp turns never cusp), sampled by normalized arc-length `t ∈ [0,1]` via `positionAt(t)` / `lookAt(t)`. Decoupling gaze from position gives cinematic control (fly forward while looking sideways, dive while tilting down). **Both samplers return a shared reused temp `Vector3` — `.clone()` before retaining.** Worlds anchor geometry by sampling the same curve at their own `t`, so environments always sit exactly where the camera flies.

### `targetT` → the flown camera (`src/world/CameraRig.tsx`)

Scroll is converted to a target parameter `targetT` (a `MutableRefObject<number>`) handed to `CameraRig`. Per frame the rig:

1. **Momentum** — spring-integrates `targetT` (`springStep`) for inertia + slight overshoot (`WATER_SPRING` in the arena, `FLIGHT_SPRING` elsewhere). The settled value is published as `worldFx.t` — the single source of truth the reveal system and every world reads.
2. **Samples** both curves at the flown `t`.
3. **Damps** position toward the sample (0.22) and gaze toward the look sample (0.34) — position leads, gaze lags ("head turns after the body").
4. **Banks** into turns from the path tangent (`bankRoll`).
5. **Look-around** — a few degrees of pointer parallax from CSS custom props `--pxn`/`--pyn`.

Worlds can steer the gaze via the exported `lookOverride { target, weight }` (weight decays 0.9/frame) — the garage banks down onto the hero car this way. `worldFx` also carries screen-effect scalars `submergence` / `droplets` / `crtEntry` consumed by the post passes.

**Reduced-motion:** no springs/damping, `frameloop='demand'`; scroll snaps to the nearest world's hero framing (`worldMidT`) as a still diorama and sets `worldFx.t` to that midpoint.

### The `WORLDS` array — per-world `t` ranges

| id | range | chapter |
|---|---|---|
| identity | 0.00 – 0.09 | 01 IDENTITY |
| journey | 0.09 – 0.20 | 02 JOURNEY |
| creations | 0.20 – 0.30 | 03 CREATIONS |
| arena | 0.30 – 0.60 | 04 ARENA (widest — pool + tennis) |
| worlds | 0.60 – 0.69 | 05 WORLDS (the garage) |
| popculture | 0.69 – 0.86 | 06 POP CULTURE (the CRT) |
| arcade | 0.86 – 0.93 | 07 ARCADE |
| connect | 0.93 – 1.00 | 08 CONNECT |

Arena is widest because it holds a sub-sequence (`ARENA_BEATS`: poolApproach 0.31 → poolDive 0.37 → underwater 0.42 → breach 0.47 → tennis 0.52 → football 0.575). Pop culture has `CRT_BEATS` (approach 0.72 → screenEntry 0.79 → channels 0.83). Helpers: `worldIdAt`, `worldMidT`, `worldRange`, `localProgress`.

### Reveal-culling — ~1–2 worlds drawn at once (`src/world/useReveal.tsx`)

Every world is *mounted*, but only a couple are ever *drawn*. `useReveal(range, { lead, trail })` computes a reveal factor from `worldFx.t`: culled before `a − lead` (`visible=false`, zero draw calls); 0→1 emerge over `lead`; 1 through `[a,b]`; 1→0 swallow over `trail`. Adjacent worlds share their seam (one's `trail` overlaps the next's `lead`), so each transition is a two-world crossfade along the same continuous spline.

On mount the hook traverses the group once, caches materials + lights, and sets `material.transparent = true` **up front** so animating opacity never triggers a mid-flight shader recompile. It fades material `opacity` **and** light `intensity` together (lights faded, not snapped). Per-world lead/trail wired in `WorldCanvas.tsx`: identity `{0, 0.04}`, journey `{0.05, 0.045}`, creations `{0.05, 0.045}`, arena `{0.06, 0.05}`, worlds `{0.045, 0.04}`, popculture `{0.05, 0.045}`, arcade `{0.035, 0.03}`, connect `{0.035, 0}`.

### NearGate — lazy glTF loading (`src/world/components/Model.tsx`)

Reveal only toggles visibility, so an ungated `<Model>` would fetch all glTFs at startup. `NearGate` mounts its children (inside `<Suspense>`) only once `worldFx.t` enters the world's range ± a margin (default 0.06), then stays mounted (reload thrash on scrub-back is worse than the bounded memory). `Model` loads via `useGLTF`, clones the scene per instance, enables shadows, nudges `envMapIntensity`. Used by the garage, arcade, connect.

### Gateway — diegetic seam veils (`src/world/components/Gateway.tsx`)

At "dry" seams (no physical event like the pool dive or CRT glass) a thin additive torus ring on the spline flares as the drone crosses it. Rings at t = 0.09, 0.20, 0.30, 0.60, 0.86, 0.93 in each next chapter's accent. Disabled under reduced motion.

### The 8 chapters & accents (`src/content/index.ts`)

`accent` is an `"r g b"` string parsed by `WorldCanvas.accentColor()` into a linear `THREE.Color`. The whole site shifts hue as you fly: ENTER → DISCOVER → EXPLORE → EXPERIENCE → CONNECT.

| # | id | label | accent (r g b) |
|---|---|---|---|
| 01 | identity | IDENTITY | 255 91 46 (ember orange) |
| 02 | journey | JOURNEY | 245 197 66 (amber) |
| 03 | creations | CREATIONS | 0 255 65 (green) |
| 04 | arena | ARENA | 54 224 208 (teal) |
| 05 | worlds | WORLDS | 245 160 30 (orange) |
| 06 | popculture | POP CULTURE | 0 255 65 (phosphor green) |
| 07 | arcade | ARCADE | 150 240 90 (neon lime) |
| 08 | connect | CONNECT | 255 91 46 (ember orange — closes the loop) |

> Note: `creations` and `popculture` share the same green — accent does **not** uniquely identify a chapter.

### Content data → in-world text

Worlds import only from `@/content` (barrel, `src/content/index.ts`), never hardcoding biography:
- **profile** → identity signage (`name`, `tagline`)
- **journey** → Journey milestone plinths (title + period)
- **projects** → Creations plinths (first 6; name + stack)
- **interests.sports** → Pool (Swimming stats) + Tennis (Nadal figure + stats)
- **interests.automobiles / art / food** → garage's three zones
- **social** → Connect handles beside the desk (URLs are `[[ ... ]]` placeholders until real links are supplied)

The content model (`types.ts`) uses a `Placeholder<T>` marker + `[[ ... ]]` string markers so unfilled data is visually obvious — you make the site yours by editing the data files, not the components.

### The 8 worlds in flight order

1. **identity — `OpeningFlight.tsx` (0–0.09):** the ignition beat. Wet-obsidian reflector floor, igniting hex lattice with sonar pulse-rings, energy ribbons, god-rays, and a holographic monolith assembling the visitor's name. Custom raw shaders (`openingShaders.ts`) — the one world that is *not* a photo-textured surface; manages its own reveal fade and disposes its materials on unmount.
2. **journey — `Journey.tsx` (0.09–0.20):** a timeline corridor — dark asphalt road strip lined with concrete milestone plinths, one per career/education entry, each crowned with a glowing accent marker.
3. **creations — `Creations.tsx` (0.20–0.30):** an enclosed concrete gallery room; plinths in an arc, each holding a rotating faceted "hologram" artifact under a warm track spot, project name + stack on signage.
4. **arena — `Pool.tsx` + `Tennis.tsx` (0.30–0.60):** the widest chapter, two hero beats under one Reveal. **Pool:** a real tiled basin the drone dives through (CPU-displaced wave plane, lane ropes, bubbles, caustics via the canvas-level `DiveEffect`), glides underwater, then breaches. **Tennis:** a real clay court with proud white lines, a sagging net, and a ball on genuine ballistic physics, courtside scoreboard showing Nadal's record.
5. **worlds — `WorldsDiorama.tsx` (0.60–0.69):** the garage — enclosed corrugated-metal-and-concrete room, part-open roller shutter. Three hobby zones from real photoscanned glTF props (NearGate): covered car on a service lift, easel + spray-paint tag + spray cans, barrel stove with live embers — plus tool chest, welding cart, crates, plant. Anchored at `WORLDS_T = 0.6875` (not the range midpoint) so the enclosure clears the tennis court and occludes the CRT; the rig banks the gaze down onto the hero car via `lookOverride`.
6. **popculture — `CRT.tsx` (0.69–0.86):** a vintage CRT television built entirely from primitives (rounded casing, curved emissive glass showing a procedural SMPTE-ish colour-bar ident, dials, vent slats, rabbit-ears) on a wood console in a wood-floor + concrete-wall room. The drone "enters the screen" via the canvas-level `CRTEffect`.
7. **arcade — `Arcade.tsx` (0.86–0.93):** a neon room threaded down the middle — two mirrored rows of retro cabinets under an ARCADE sign, a game console + boombox prop (NearGate), enclosed by walls + ceiling.
8. **connect — `Connect.tsx` (0.93–1.00):** the closing beat where the flight rests. Real photoscanned desk, arm chair, articulated lamp, camera (NearGate), plus an accent-lit monitor, under a "LET'S TALK" sign with social handles beside it. Anchored at the **final gaze target** `lookAt(0.99)` (not the path point — the camera flies straight over it); enclosed on back + sides.

---

## 6. Dev workflow & screenshots

### Dev server

```bash
npm run dev -- --port 5174   # shoot.mjs hardcodes :5174
```

The heavy three.js chunk is code-split and only fetched after the intro gate (a real user gesture) — `src/App.tsx` (`const WorldCanvas = lazy(...)`). Any headless automation must send the **Enter** gesture or the world-canvas never mounts.

### Typecheck / build

```bash
npm run typecheck   # tsc -b --noEmit  (strict; must stay clean)
npm run build       # tsc -b && vite build -> /dist
```

### Screenshot harness — `scripts/shoot.mjs`

Dev server on `localhost:5174` **must already be running.**

```bash
# terminal 1
npm run dev -- --port 5174
# terminal 2
node scripts/shoot.mjs
```

- Playwright + installed Chrome (`channel: 'chrome', headless: true`) — no browser download. WebGL forced headless via `--use-angle=default --ignore-gpu-blocklist --enable-webgl --enable-unsafe-swiftshader`.
- Viewport 1600×900, `deviceScaleFactor: 1`. Navigates to `http://localhost:5174/`, waits `networkidle`, presses **Enter** to pass the intro gate, waits for `canvas.world-canvas`.
- Per stop: scrolls to `t * (scrollHeight - innerHeight)`, polls the live flight param `window.__fx.t` until the spring settles (3 stable reads <0.001 apart) + a 2 s beat for glTF decode, then screenshots. Prints `fx.t` and `window.__cam`.
- Output dir **`C:/tmp/shots/`** (one PNG per label). Collects console `error` + `pageerror` and prints them at the end (`no page errors` on a clean run).

**Verified STOPS `[label, t]` (`shoot.mjs` lines 10–19):**

| label | t | | label | t |
|---|---|---|---|---|
| identity | 0.02 | | garage | 0.6875 |
| creations | 0.25 | | crt | 0.75 |
| pool | 0.4 | | arcade | 0.89 |
| tennis | 0.52 | | connect | 0.995 |

> `shoot.mjs` depends on `window.__fx.t` and `window.__cam` being exposed globally; if those debug hooks are removed the settle-polling silently degrades (prints `(no dbg)`) and shots may be taken mid-transition. There is no `journey` stop — journey is not screenshotted.

---

## 7. HARD CONSTRAINTS — never violate

> Every item is enforced in code today. Treat any change that breaks one as a regression, not a tradeoff.

- [ ] **Music/audio NEVER autoplays.** Sound only starts on an explicit user toggle. `ExperienceContext` inits `audioOn: false`; `MusicInterface` calls `el.play()` only inside an effect gated on `audioOn && src`, `<audio preload="none">`, and a blocked play surfaces "AUDIO BLOCKED" rather than forcing it. The CRT `MusicChannel` and `FrequencyChapter` reuse the same gate. *Files: `src/context/ExperienceContext.tsx`, `src/components/chrome/MusicInterface.tsx`, `src/components/chapters/crt/MusicChannel.tsx`, `src/components/chapters/FrequencyChapter.tsx`.*
- [ ] **YouTube embeds use `youtube-nocookie.com`, never autoplay.** URLs in `src/content/interests.ts`, rendered by a lazy `<iframe>` in `src/components/shared/Media.tsx` with **no** `autoplay=1`.
- [ ] **`prefers-reduced-motion` = fully-usable STATIC diorama.** `src/hooks/useReducedMotion.ts` (`matchMedia('(prefers-reduced-motion: reduce)')`). Frameloop `'demand'`, post `EffectComposer` skipped, loops/glitch/rain collapse to static, intro instant, and `.world-copy` (sr-only in motion mode) revealed as readable prose (`src/components/world/WorldSection.tsx`). Nothing becomes unusable.
- [ ] **Fallbacks SIMPLIFY, never flat gradients.** `lowFi = reduced || mobile` (mobile = `matchMedia('(max-width: 820px)')`). lowFi loads 2K `diff_low.jpg` **diffuse-only** (still a real material, `usePBR.ts`); PCSS SoftShadows + N8AO dropped, multisampling 0 on mobile (`WorldCanvas.tsx`); HDRI → `<Lightformer>` rig (`proceduralEnv.tsx`). 4K albedo NEVER served to mobile/reduced; NO gradient placeholder for a surface.
- [ ] **Traditional nav stays subtle.** Desktop right rail: inactive labels `opacity-0` until hover, only active shown; real `<button>`s, `aria-current`, skip link (`Navigation.tsx`). Mobile collapses to one trigger + full-screen list. Not a loud persistent bar.
- [ ] **Performance-conscious.** Lazy three.js chunk after the gate; reveal-culling draws 1–2 worlds; lighter mobile pipeline; DPR `[1,2]` + `AdaptiveDpr`. Desktop 4K payload is ~445 MB — keep culling + the lowFi path intact.
- [ ] **Licensing CC0 / OFL / Apache ONLY.** Poly Haven (CC0) textures + HDRIs, Google Fonts (OFL/Apache), Wikimedia (CC). `fetch-assets.mjs` writes `CREDITS.md` per file. NO piracy, NO token/paid sources, NO unknown-license assets.

---

## 8. Photoreal fidelity pass (current state)

The most recent work was a fidelity jump from a soft, obviously-tiled look to genuine photographed materials. Three levers, all landed and verified:

1. **Resolution.** Textures were silently stuck at 1024² (the fetch-script skip trap above). Hero surfaces are now genuinely 4096² with real displacement relief; props 2048². Verified on disk via the JPEG SOF-header check.
2. **Killed over-tiling.** Hero surfaces were repeating textures 6–16× (obvious repetition defeats photorealism at any resolution). Every offender was roughly halved so texels stay sharp *and* the pattern doesn't read as tiled — e.g. garage/creations/connect concrete `[8,8]→[3,3]`, arcade floor `[6,16]→[3,8]`, pool `[7,13]→[4,7]`, tennis clay `[4,8]→[3,5]`, journey asphalt `[3,16]→[2,9]`, CRT wood `[8,7]→[4,4]`, garage corrugated `[10,3]→[5,2]` / roof `[10,10]→[6,6]`.
3. **Eased the detail-washing post stack.** N8AO `2.2→1.3` (dropped half-res), Bloom threshold `0.45→0.7` (only true emissives bloom, not mid-bright PBR), Vignette `0.7→0.45`, IBL env resolution `256→512`.

**Displacement** is applied on the Garage and Connect concrete floors — the planes are subdivided (`planeGeometry args={[w, h, 200, 140]}` / `[22,22,160,160]`) and driven by `displacementScale: lowFi ? 0 : 0.08` via `usePBR`. It can be extended to Creations/Arcade if it reads well without edge seams.

Build state at last check: typecheck clean under strict; `node scripts/shoot.mjs` exits 0 with no page errors.

---

## 9. Troubleshooting & gotchas

- **"My 4K texture upgrade didn't take."** The fetch script skips existing files. Delete the folder (`rm -rf public/assets/textures/<set>`) and re-run. This is the single most common trap.
- **Displacement shows no relief.** The plane isn't subdivided — a flat 2-triangle plane has no vertices to displace. Add segment args to `planeGeometry`.
- **Double tone-mapping / washed colors.** Tone mapping must apply exactly once: the composer path leaves the renderer `NoToneMapping` and lets the final `<ToneMapping>` effect do ACES; the reduced (no-composer) path flips the renderer to `ACESFilmicToneMapping`. Changing one path without the other double-tone-maps.
- **Unexpected bloom on a bright surface.** `luminanceThreshold` is 0.7 — ordinary bright PBR must stay under it. Intentional glow (Signage) sets `toneMapped={false}` + emissive to cross it deliberately.
- **A world flashes its neighbour when culling.** `material.transparent` must be set once up front (useReveal does this on its scan); flipping it mid-flight recompiles the shader and hitches. Lights are faded with the factor, not snapped.
- **A prop pops in late / blows the startup payload.** Heavy glTFs must sit under `NearGate`; reveal keeps worlds *mounted*, so an ungated `<Model>` fetches at startup.
- **Aliased camera position.** `positionAt(t)` / `lookAt(t)` return a shared temp `Vector3` — `.clone()` before retaining, or you alias the camera's live sample.
- **Breakpoint change didn't fully apply.** The `max-width: 820px` mobile query is duplicated in `WorldCanvas.tsx` and `proceduralEnv.tsx` — edit both.
- **Wrong dev port for screenshots.** `vite` defaults to 5173; `shoot.mjs` hardcodes 5174. Start with `--port 5174`. (The README's 5173 is stale relative to the harness.)
- **Node version.** No `.nvmrc`/`engines`, so nothing stops you running an unsupported odd Node release (21/23) that can break Vite 5 silently. Use Node 20 LTS.
