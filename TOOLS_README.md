Tools for generation, packing, and screenshots
=============================================

Scripts:

- `npm run generate-tile -- "prompt text" [filename.png]` — calls the MCP (configured in `crush.json`) to request a 16×16 PNG and saves it to `assets/custom/`.
- `npm run pack-tiles` — packs all PNGs in `assets/custom/` into `assets/custom_packed.png` (keeps `margin=0` `spacing=1`).
- `npm run screenshot` — uses Puppeteer to open `http://localhost:8000` and save the viewer canvas to `screenshots/viewer.png`.

Notes:

- Set `PIXELLAB_API_KEY` in your environment before running `generate-tile` if `crush.json` references it.
- Install dependencies with `npm install` before running scripts.
