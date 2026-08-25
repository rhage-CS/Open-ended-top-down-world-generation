#!/usr/bin/env node

const width = 24;
const height = 16;

// Initialize grids
const ground = Array(height).fill(null).map(() => Array(width).fill(0));
const objects = Array(height).fill(null).map(() => Array(width).fill(-1));

// Helper: set ground tile
function setGround(x, y, tile) {
  if (x >= 0 && x < width && y >= 0 && y < height) {
    ground[y][x] = tile;
  }
}

// Helper: set object tile
function setObject(x, y, tile) {
  if (x >= 0 && x < width && y >= 0 && y < height) {
    objects[y][x] = tile;
  }
}

// ===== LAYER 0: GROUND =====

// Fill with grass base
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const rand = Math.random();
    if (rand < 0.12) ground[y][x] = 1; // grass tufts
    else if (rand < 0.22) ground[y][x] = 2; // grass flowers
    else ground[y][x] = 0; // plain grass
  }
}

// Dirt path at row 12, x=2 to x=15 with transitions
// Main path
for (let x = 4; x <= 13; x++) {
  setGround(x, 12, 25); // dirt fill
}

// Left transition (dirt to grass)
setGround(2, 12, 36); // lower-left corner of dirt patch
setGround(3, 12, 37); // lower-middle
setGround(4, 12, 25); // already set

// Right transition
setGround(13, 12, 25); // already set
setGround(14, 12, 38); // lower-right corner

// Add some dirt patches near buildings for variety
// Near building 1
setGround(5, 9, 25);
setGround(6, 9, 25);
setGround(5, 10, 25);

// Near building 2
setGround(15, 8, 25);
setGround(16, 8, 25);

// ===== LAYER 1: OBJECTS =====

// 1. Building 1 (orange variant) - (4,8) to (7,10), 4x3
// Walls at y=8,9,10
// y=8 (top wall row)
setObject(4, 8, 72); // left end
setObject(5, 8, 73); // fill
setObject(6, 8, 84); // window
setObject(7, 8, 75); // right end

// y=9 (middle wall row)
setObject(4, 9, 72); // left end
setObject(5, 9, 73); // fill
setObject(6, 9, 73); // fill
setObject(7, 9, 75); // right end

// y=10 (bottom wall row - door here)
setObject(4, 10, 72); // left end
setObject(5, 10, 73); // fill
setObject(6, 10, 74); // door (center)
setObject(7, 10, 75); // right end

// 2. Building 2 (blue variant) - (14,7) to (17,9), 4x3
// Walls at y=7,8,9
// y=7 (top wall row)
setObject(14, 7, 76); // left end (blue)
setObject(15, 7, 77); // fill (blue)
setObject(16, 7, 88); // window (blue)
setObject(17, 7, 79); // right end (blue)

// y=8 (middle wall row)
setObject(14, 8, 76); // left end
setObject(15, 8, 77); // fill
setObject(16, 8, 77); // fill
setObject(17, 8, 79); // right end

// y=9 (bottom wall row - double doors, blue variant)
setObject(14, 9, 76); // left end (blue)
setObject(15, 9, 90); // double door LEFT leaf (blue)
setObject(16, 9, 91); // double door RIGHT leaf (blue)
setObject(17, 9, 79); // right end (blue)

// 3. Roof run (variant A) above Building 1 at y=7, x=4 to x=7
setObject(4, 7, 48); // left edge
setObject(5, 7, 49); // fill
setObject(6, 7, 49); // fill
setObject(7, 7, 50); // right edge

// 4. Stone arch (wide span) at (10,11) and (11,11)
setObject(10, 11, 113); // left half
setObject(11, 11, 114); // right half

// 5. Fence enclosure (closed) at (8,4) to (10,6)
// Top row y=4
setObject(8, 4, 44); // corner TL
setObject(9, 4, 45); // straight
setObject(10, 4, 46); // corner TR

// Middle row y=5
setObject(8, 5, 56); // side
setObject(9, 5, 57); // cart inside
setObject(10, 5, 58); // side

// Bottom row y=6
setObject(8, 6, 68); // corner BL
setObject(9, 6, 69); // gate
setObject(10, 6, 70); // corner BR

// 6. Rail fence section at (18,10) to (20,10)
setObject(18, 10, 80); // left post with rail extending right
setObject(19, 10, 81); // horizontal rail
setObject(20, 10, 82); // right post with rail extending left

// 7. Large assembly structure at (2,2) to (4,4), 3x3
// Top row y=2
setObject(2, 2, 96); // top-left
setObject(3, 2, 97); // top-middle
setObject(4, 2, 98); // top-right

// Body row y=3
setObject(2, 3, 108); // body left
setObject(3, 3, 109); // body interior
setObject(4, 3, 110); // body right

// Bottom row y=4
setObject(2, 4, 120); // lower left
setObject(3, 4, 121); // lower middle
setObject(4, 4, 122); // lower right

// 8. Well at (12,6) and (12,7)
setObject(12, 6, 92); // well top
setObject(12, 7, 104); // well bottom

// 9. Signpost at (6,3) and (6,4)
setObject(6, 3, 83); // sign board
setObject(6, 4, 71); // post

// 10. Tree group (block-locked 3x3 green variant) at (19,0) to (21,2)
// Row 0 (cols 6-8 in sheet map to indices 6,7,8)
setObject(19, 0, 6);
setObject(20, 0, 7);
setObject(21, 0, 8);

// Row 1 (cols 6-8 map to indices 18,19,20)
setObject(19, 1, 18);
setObject(20, 1, 19);
setObject(21, 1, 20);

// Row 2 (cols 6-8 map to indices 30,31,32)
setObject(19, 2, 30);
setObject(20, 2, 31);
setObject(21, 2, 32);

// Add some scattered individual trees
setObject(1, 5, 3); // tall autumn canopy
setObject(1, 6, 15); // tall autumn trunk
setObject(13, 3, 5); // bush
setObject(22, 8, 27); // tree autumn
setObject(0, 13, 17); // shrub

// Add some props
setObject(3, 10, 107); // barrel near building 1
setObject(13, 9, 130); // bucket near building 2
setObject(11, 8, 115); // hammer
setObject(15, 5, 106); // log near fence

// ===== OUTPUT =====

const level = {
  width,
  height,
  tileSize: 16,
  layers: [
    {
      name: "ground",
      data: ground
    },
    {
      name: "objects",
      data: objects
    }
  ]
};

console.log(JSON.stringify(level, null, 2));
