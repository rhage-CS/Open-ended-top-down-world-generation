const fs = require('fs');

// Scene: 24x16 grid
const W = 24;
const H = 16;

// Initialize ground layer with grass (index 0)
const ground = Array.from({ length: H }, () => Array(W).fill(0));
// Initialize objects layer with empty (-1)
const objects = Array.from({ length: H }, () => Array(W).fill(-1));

// Helper to set a cell in objects layer
function setObj(row, col, tile) {
  if (row >= 0 && row < H && col >= 0 && col < W) {
    objects[row][col] = tile;
  }
}

// Helper to set ground
function setGround(row, col, tile) {
  if (row >= 0 && row < H && col >= 0 && col < W) {
    ground[row][col] = tile;
  }
}

// === 1. Dirt patches under buildings and path ===
// Building A base (rows 3-5, cols 3-6)
for (let r = 3; r <= 5; r++) {
  for (let c = 3; c <= 6; c++) {
    setGround(r, c, 25); // dirt
  }
}

// Building B base (rows 8-11, cols 14-18)
for (let r = 8; r <= 11; r++) {
  for (let c = 14; c <= 18; c++) {
    setGround(r, c, 25); // dirt
  }
}

// Large assembly base (rows 13-14, cols 18-21)
for (let r = 13; r <= 14; r++) {
  for (let c = 18; c <= 21; c++) {
    setGround(r, c, 25);
  }
}

// Fence enclosure base (rows 12-14, cols 4-6)
for (let r = 12; r <= 14; r++) {
  for (let c = 4; c <= 6; c++) {
    setGround(r, c, 25);
  }
}

// === 2. Dirt path (row 6, cols 3-9) - 7 tiles ===
for (let c = 3; c <= 9; c++) {
  setGround(6, c, 25);
}

// Transition tiles at path edges where dirt meets grass
setGround(6, 2, 26); // dirt-grass transition left
setGround(5, 3, 28); // dirt-grass transition top-left
setGround(7, 3, 30); // dirt-grass transition bottom-left
setGround(6, 10, 27); // dirt-grass transition right
setGround(5, 9, 29); // dirt-grass transition top-right
setGround(7, 9, 31); // dirt-grass transition bottom-right

// === 3. Building A - Orange house with single door (rows 3-5, cols 3-6) ===
// Roof row (row 2) - use variant A only
setObj(2, 3, 48); // roof left edge (A)
setObj(2, 4, 49); // roof fill (A)
setObj(2, 5, 50); // roof right edge (A)

// Wall rows (rows 3-4) - orange facade
setObj(3, 3, 72); // orange wall left-end
setObj(3, 4, 73); // orange wall middle
setObj(3, 5, 73); // orange wall middle
setObj(3, 6, 75); // orange wall right-end

setObj(4, 3, 73); // orange wall middle
setObj(4, 4, 73); // orange wall middle
setObj(4, 5, 74); // open doorway (door, no tile below)
setObj(4, 6, 73); // orange wall middle

// Foundation/base row (row 5) - must be ground or non-facade below door
setObj(5, 3, 73);
setObj(5, 4, 73);
// col 5 has door above, so leave as -1 (empty/grass)
setObj(5, 6, 73);

// === 4. Building B - Blue house with double doors (rows 8-11, cols 14-18) ===
// Roof row (row 7) - use variant B only (different from Building A's variant A)
setObj(7, 14, 52);  // roof left edge (B)
setObj(7, 15, 53);  // roof fill (B)
setObj(7, 16, 53);  // roof fill (B)
setObj(7, 17, 53);  // roof fill (B)
setObj(7, 18, 54);  // roof right edge (B)

// Wall rows (rows 8-10) - blue facade (76-79 range matches blue doors 90/91)
setObj(8, 14, 76);  // blue wall left-end
setObj(8, 15, 77);  // blue wall middle
setObj(8, 16, 77);  // blue wall middle
setObj(8, 17, 77);  // blue wall middle
setObj(8, 18, 79);  // blue wall right-end

setObj(9, 14, 77);  // blue wall middle
setObj(9, 15, 90);  // double door left leaf (blue)
setObj(9, 16, 91);  // double door right leaf (blue)
setObj(9, 17, 77);  // blue wall middle
setObj(9, 18, 77);  // blue wall middle

// Row 10: below doors at row 9, must NOT be facade
setObj(10, 14, 76); // blue wall left-end
setObj(10, 15, -1); // empty below double door left
setObj(10, 16, -1); // empty below double door right
setObj(10, 17, 77); // blue wall middle
setObj(10, 18, 79); // blue wall right-end

// Foundation row (row 11)
setObj(11, 14, 77);
setObj(11, 15, 77);
setObj(11, 16, 77);
setObj(11, 17, 77);
setObj(11, 18, 77);

// === 5. Complete roof run (row 2, cols 8-15) - variant A ===
setObj(2, 8, 48);   // left edge
setObj(2, 9, 49);   // fill
setObj(2, 10, 49);  // fill
setObj(2, 11, 49);  // fill
setObj(2, 12, 49);  // fill
setObj(2, 13, 49);  // fill
setObj(2, 14, 49);  // fill
setObj(2, 15, 50);  // right edge

// === 6. Stone arch matched pair (rows 6-7, cols 10-11) ===
// Rock pairs: 111+112, 113+114
setObj(6, 10, 111); // rock left half
setObj(6, 11, 112); // rock right half

// === 7. Closed fence enclosure (rows 12-14, cols 4-6) - 3x3 with cart in middle ===
// Following GOOD scene pattern exactly
// Top row (row 12): SE, EW, SW corners
setObj(12, 4, 44);  // ES (SE corner)
setObj(12, 5, 45);  // EW horizontal
setObj(12, 6, 46);  // SW corner

// Middle row (row 13): NS vertical, cart, NS vertical
setObj(13, 4, 56);  // NS vertical
setObj(13, 5, 57);  // cart (inside pen, not a fence piece)
setObj(13, 6, 58);  // NS vertical

// Bottom row (row 14): NE, EW, NW corners
setObj(14, 4, 68);  // NE corner
setObj(14, 5, 69);  // EW horizontal
setObj(14, 6, 70);  // NW corner

// === 8. Rail fence section (row 6, cols 1-5) ===
// Rail system: 80 (post-rail-right), 81 (rail), 82 (post-rail-left)
setObj(6, 1, 80);   // post with rail extending right
setObj(6, 2, 81);   // rail segment
setObj(6, 3, 81);   // rail segment
setObj(6, 4, 81);   // rail segment
setObj(6, 5, 82);   // post with rail extending left

// === 9. Large assembly structure (rows 13-14, cols 18-21) ===
// Assembly: left=96/99/108/120, mid=97/100/109/121, right=98/101/110/122
// Use row 0 of assembly (96,97,98)
setObj(13, 18, 96);  // left edge
setObj(13, 19, 97);  // middle
setObj(13, 20, 97);  // middle
setObj(13, 21, 98);  // right edge
setObj(14, 18, 96);  // left edge
setObj(14, 19, 97);  // middle
setObj(14, 20, 97);  // middle
setObj(14, 21, 98);  // right edge

// === 10. Well (row 9, col 2) ===
// Well: 92 top, 104 bottom
setObj(9, 2, 92);   // well top
setObj(10, 2, 104); // well bottom

// === 11. Signpost (row 10, col 3) ===
// Sign 83 mounts above post 71
setObj(9, 3, 83);   // sign board
setObj(10, 3, 71);  // post with stem rising

// === 12. Tree group 3x3 (rows 1-3, cols 18-20) ===
// Trees from top row of tileset - these are just decorative, no specific rules
setObj(1, 18, 12);
setObj(1, 19, 13);
setObj(1, 20, 14);
setObj(2, 18, 15);
setObj(2, 19, 16); // center tree
setObj(2, 20, 17);
setObj(3, 18, 18);
setObj(3, 19, 19);
setObj(3, 20, 20);

// Build the level JSON
const level = {
  width: W,
  height: H,
  tileSize: 16,
  layers: [
    { name: "ground", data: ground },
    { name: "objects", data: objects }
  ]
};

fs.writeFileSync('levels/gen_nodict_1.json', JSON.stringify(level, null, 2));
console.log('Written levels/gen_nodict_1.json');
