# Design probe: Open-ended top-down world generation with Phaser & Pixel Lab

Goal

Use an agentic IDE (crush) + Pixel Lab to iteratively author top-down tilemaps and generated tiles, viewed in the Phaser tilemap viewer in this repo.

High-level plan

1. Provide a clear style guide and TinyTown tile mapping (`TINYTOWN.md`).
2. Use `crush` with `crush.json` configured to call Pixel Lab's MCP for tile generation.
3. When the LLM requests a missing tile, call Pixel Lab to generate a 16×16 tile with matching palette/style.
4. Pack generated tiles into `assets/custom_packed.png` (match `margin:0, spacing:1`).
5. Update the level JSON to reference new tile IDs (use IDs >=1000 for custom tiles).
6. Reload the viewer to inspect; capture a screenshot for the agent to evaluate and iterate.

Practical integration notes

- `crush.json` already configures `pixellab` under `mcp` — set the `PIXELLAB_API_KEY` env var before running.
- Pixel Lab requests: prefer 16×16 PNG tiles, transparent background, and a short `style` prompt taken from `STYLE.md`.
- Use consistent naming: put generated single tiles in `assets/custom/` during generation, then pack into `assets/custom_packed.png` for runtime.
- Tools to pack a spritesheet: `texturepacker` (GUI/CLI), or a small Node script using `sharp` or `spritesmith`.

Screenshot workflow

- Use headless Chromium (Puppeteer) to load `index.html` and take a canvas screenshot after the scene is created. This lets the agent "see" the result and iterate.

Example Pixel Lab prompt template

"Create a 16x16 pixel-art tile, transparent background, palette matching Kenney Tiny Town (soft desaturated colors). Subject: small pond water tile with subtle ripple. Output PNG." 

Next steps (concrete tasks you can ask me to run)

- Create a small Node packing script to combine `/assets/custom/*.png` into `assets/custom_packed.png`.
- Add a Puppeteer screenshot helper to `tools/screenshot.js`.
- Wire a simple `generate-tile` script that calls the MCP and stores output into `assets/custom/`.
