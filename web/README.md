# 信号接线实验室 · Wiring Lab

An original, browser-only Chinese learning exhibit: rotate actual hardware GLBs, inspect semantic ports, connect **OUT → CH1**, and send an illustrative pulse. This is a concept demonstration, **not** an electrical simulator, compatibility certification, or real-device wiring instruction.

## Develop

Node.js 22 or later.

```sh
npm ci
npm test
npm run build
npm run dev
```

Open the printed local URL. All runtime assets are self-hosted and paths are relative, so the static build works under a GitHub Pages project path. No backend, account, analytics, third-party runtime API or secret is required.

## Browser verification

```sh
npx playwright install --with-deps chromium
npm run test:browser
```

Desktop, mobile touch, keyboard, reduced-motion, invalid-port recovery, viewport bounds, loading fallback, and real model loading are covered. Browser screenshots and the Playwright report are generated separately, not copied into `dist/`. A browser run is required before claiming visual/functional acceptance; passing Node tests is not a substitute.

## Files

- `src/scene.js` — actual Three.js viewer; GLTFLoader, OrbitControls, runtime outlines and conceptual cable.
- `src/scene-config.js` — camera framing, collision-aware port labels and pulse timing.
- `src/lesson.js` — pure lesson state machine shared by all input paths.
- `public/assets/hardware.glb` — display-only derivative of the repository's original generic sample scene; geometry, hierarchy and semantic anchors retained.
- `tests/` — state, GLB, geometry, camera and browser checks.
- `dist/` — generated public website only; never copy authoring `.blend`, source scripts, QA notes or secrets here.

The GLB exporter has already converted Blender Z-up to glTF Y-up. Do not apply that conversion again. The scene resolves anchors by semantic `sid` and uses their world positions; glTF local +Y maps to the authored port's outward axis. Connector-tip alignment is tested. Compatibility metadata remains unknown. All served models can be downloaded by visitors.

## Publication

Repository workflow `.github/workflows/deploy-pages.yml` runs Node tests, builds, performs real Chromium QA, preserves screenshot artifacts, and publishes **only** `web/dist` after the verification job succeeds. The repository's Pages source must be **GitHub Actions**. The workflow uses no custom credentials and grants deployment permissions only to the deploy job.

Three.js is MIT-licensed; see `public/third-party-notices.txt`.
