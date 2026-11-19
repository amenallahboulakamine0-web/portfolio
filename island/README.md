# Sky Island Portfolio

A static Three.js portfolio: a floating voxel island to explore, with seven mini-golf holes that unlock the portfolio sections. No build step, no package manager.

## Run locally

Open `index.html`, or serve the folder (`python3 -m http.server`). The game loads Three.js r128 from the included vendor directory and works offline with WebGL.

## Controls

- Desktop: drag to look, scroll to zoom, WASD / arrows to walk, Space to jump, Shift+Space for a super jump, `G` or the golf-ball button for golf mode.
- Mobile: joystick to walk, SAUT / SUPER buttons, drag to look, golf-ball button for golf mode (drag back to aim, release to shoot, ⟲ ⟳ to rotate).

## Project map

- `index.html`: page structure and script order.
- `css/styles.css`: page, overlay, HUD and touch-control styling.
- `js/courses.js`: course layouts (walls, bumpers, hills, hazards, doors, boost pads, bridges).
- `js/content.js`: profile links, world constants, and the text of each section (merged with the layouts).
- `js/world.js`: Three.js scene, island, courses, decor; static geometry is merged into chunks.
- `js/touch.js`: shared input state and on-screen touch controls.
- `js/game.js`: input, camera modes, player, golf physics, UI transitions, main loop.
- `js/main.js`: bootstrap with a friendly error if WebGL or Three.js is unavailable.
- `deepseek_html_20260930_3ef087.html`: redirect to `index.html` for the original URL.

Scripts load in this order: `courses.js`, `content.js`, `world.js`, `touch.js`, `game.js`, `main.js`.
