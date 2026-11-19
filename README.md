# Portfolio — two static routes

No build step or package installation is required. Serve the repository with:

```sh
python3 -m http.server 8000
```

- `/` serves the existing standard portfolio
- `/island/` serves the imported Sky Island experience
- `src/data/portfolioData.js` is the shared editorial data source
- `src/routes.js` resolves route/asset URLs from its own location
- `island/js/bootstrap.js` loads Three.js and game scripts sequentially, exclusively on the island route

## GitHub Pages

Publish the repository root, keeping `index.html` and `island/index.html` in place.
Static directory routes support direct visits and refresh without a SPA fallback or hash router.
A project site serves the same routes beneath `/portfolio/` (i.e. `/portfolio/island/`).
A user site or custom domain serves them at `/` and `/island/`.
Use `PortfolioRoutes.root`, `PortfolioRoutes.island`, and `PortfolioRoutes.asset(path)`
for links generated in either route; do not hardcode domain-root URLs.
There is no change to the existing online deployment during these implementation checkpoints.

## Shared content and island HUD

`src/standard.js` renders the standard page from `PortfolioData`.
`island/js/content.js` maps `PortfolioData.island.stations` to the seven course layouts.
Station HTML is generated from escaped shared text when opened; gameplay constants and
course geometry stay in the island directory. Edit portfolio content only in
`src/data/portfolioData.js`.

The island HUD exposes Back to portfolio, CV download, and Contact before Three.js loads.
It stays above the intro, station overlays, loading screen, and dependency/WebGL errors.
The CV and contact use the same data as the standard page. The HUD does not intercept
canvas input; game gesture/key handling excludes its links.

## Verification

No compilation/build command is required for this static site. Syntax checks:

```sh
for file in src/*.js src/data/*.js island/js/*.js; do node --check "$file" || exit; done
```

Checked in headless Chromium at the site root and a simulated `/portfolio/` base:
standard-route content, mobile layout and menu, CV download, zero game requests before
navigation, direct island load and refresh with real Three.js, shared station content,
HUD visibility/clickability over panels, keyboard return, and dependency-failure fallback.
This is not full mini-golf completion testing or a real-device performance benchmark.
No runtime/performance improvement is claimed for the imported physics and world.

The island loads its bundled copy of Three.js r128, including when the extracted game is opened offline.
Opening the main route does not prefetch the island, Three.js, or any game assets.
The original game documentation is in `island/README.md`.
