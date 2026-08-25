#!/usr/bin/env node

/**
 * Generate a dense 24x16 town scene using Kenney Tiny Town tiles.
 * 
 * Key tile indices from TINYTOWN_v2.md:
 * - 0: grass fill (tileable)
 * - 25: dirt fill (tileable)
 * - 1, 2: grass variants
 * - 37, 38: dirt-grass transitions
 * - 12-14, 24, 26, 36: dirt patch corners
 * - 39-42: dirt inner corners
 * - 48-55, 60-67: roof tiles (two variants)
 * - 72-79: facade walls (orange)
 * - 84-91: facade walls (blue)
 * - 96-101, 108-110, 120-122: assembly/roof blocks
 * - 123-126: brick wall
 * - 68-70: fence enclosure bottom
 * - 44-46: fence enclosure top
 * - 56, 58: fence sides
 * - 69: gate
 * - 80-82: posts/rails
 * - 83: sign
 * - 3-5, 15-17, 27-29: trees
 * - 103: window frame
 * - 105-107: tools/props
 * - 115-119: tools
 * - 127, 129-131: tools/buckets
 */

const width = 24;
const height = 16;

// Initialize grid with grass
const grid = Array(height).fill(null).map(() => Array(width).fill(0));

// Helper to place a rectangular building
// Uses facade walls (row 6-7) and roof blocks (rows 8-10)
function placeBuilding(x, y, w, h, variant = 'orange') {
  // Variant A (orange): cols 0-3 in rows 6-7
  // Variant B (blue): cols 4-7 in rows 6-7
  
  const wallRow = variant === 'orange' ? 6 : 6;
  const wallColOffset = variant === 'orange' ? 0 : 4;
  
  // Place walls (rows 6-7 map to facade tiles)
  for (let row = 0; row < h; row++) {
    for (let col = 0; col < w; col++) {
      const gx = x + col;
      const gy = y + row;
      
      if (gx < 0 || gx >= width || gy < 0 || gy >= height) continue;
      
      // Determine wall tile
      let tileIdx;
      if (row === h - 1) {
        // Bottom row - could have doors
        if (col === 0) {
          tileIdx = 72 + wallColOffset; // left end
        } else if (col === w - 1) {
          tileIdx = 75 + wallColOffset; // right end
        } else if (col === Math.floor(w / 2)) {
          tileIdx = 74 + wallColOffset; // doorway in middle
        } else {
          tileIdx = 73 + wallColOffset; // plain fill
        }
      } else {
        // Upper rows
        if (col === 0) {
          tileIdx = 72 + wallColOffset; // left end
        } else if (col === w - 1) {
          tileIdx = 75 + wallColOffset; // right end
        } else if (col === Math.floor(w / 2) && row === h - 2) {
          tileIdx = 85 + wallColOffset; // door with handle
        } else if (Math.random() > 0.5) {
          tileIdx = 84 + wallColOffset; // window
        } else {
          tileIdx = 73 + wallColOffset; // plain fill
        }
      }
      
      grid[gy][gx] = tileIdx;
    }
  }
  
  // Place roof on top (using assembly blocks from rows 8-10)
  const roofY = y - 1;
  if (roofY >= 0) {
    for (let col = 0; col < w; col++) {
      const gx = x + col;
      if (gx < 0 || gx >= width) continue;
      
      // Use roof tiles from rows 4-5 or assembly from rows 8-10
      // For simplicity, use assembly top pieces
      if (col === 0) {
        grid[roofY][gx] = 96; // top-left
      } else if (col === w - 1) {
        grid[roofY][gx] = 98; // top-right
      } else {
        grid[roofY][gx] = 97; // top-middle
      }
    }
  }
}

// Place a simple house with roof
function placeHouse(x, y, size = 'small') {
  const w = size === 'small' ? 3 : 4;
  const h = 3;
  
  // Walls
  for (let row = 0; row < h; row++) {
    for (let col = 0; col < w; col++) {
      const gx = x + col;
      const gy = y + row;
      
      if (gx < 0 || gx >= width || gy < 0 || gy >= height) continue;
      
      let tileIdx;
      if (row === h - 1) {
        // Bottom row - doors must be here
        if (col === 0) tileIdx = 72;
        else if (col === w - 1) tileIdx = 75;
        else if (col === Math.floor(w / 2)) tileIdx = 74; // door in middle
        else tileIdx = 73;
      } else {
        // Upper rows
        if (col === 0) tileIdx = 72;
        else if (col === w - 1) tileIdx = 75;
        else if (row === 1 && col === Math.floor(w / 2)) tileIdx = 84; // window above door
        else tileIdx = 73;
      }
      
      grid[gy][gx] = tileIdx;
    }
  }
  
  // Roof
  const roofY = y - 1;
  if (roofY >= 0) {
    for (let col = 0; col < w; col++) {
      const gx = x + col;
      if (gx < 0 || gx >= width) continue;
      
      if (col === 0) grid[roofY][gx] = 48; // left edge
      else if (col === w - 1) grid[roofY][gx] = 50; // right edge
      else grid[roofY][gx] = 49; // fill
    }
  }
}

// Place dirt path
function placePath(points) {
  for (const [x, y] of points) {
    if (x >= 0 && x < width && y >= 0 && y < height) {
      grid[y][x] = 25; // dirt fill
    }
  }
}

// Place tree
function placeTree(x, y, type = 'tall') {
  if (type === 'tall') {
    // Two-tile tree
    if (y - 1 >= 0) grid[y - 1][x] = 3; // canopy
    grid[y][x] = 15; // trunk
  } else if (type === 'bush') {
    grid[y][x] = 5; // round bush
  } else if (type === 'shrub') {
    grid[y][x] = 17; // small shrub
  }
}

// Place fence enclosure
function placeFence(x, y) {
  // 3x3 enclosure
  // Top row
  if (y - 2 >= 0) {
    grid[y - 2][x] = 44; // corner TL
    grid[y - 2][x + 1] = 45; // straight
    grid[y - 2][x + 2] = 46; // corner TR
  }
  // Middle row
  if (y - 1 >= 0) {
    grid[y - 1][x] = 56; // side
    grid[y - 1][x + 1] = 57; // cart inside
    grid[y - 1][x + 2] = 58; // side
  }
  // Bottom row
  grid[y][x] = 68; // corner BL
  grid[y][x + 1] = 69; // gate
  grid[y][x + 2] = 70; // corner BR
}

// Place well
function placeWell(x, y) {
  if (y - 1 >= 0) {
    grid[y - 1][x] = 92; // well top
  }
  grid[y][x] = 104; // well bottom
}

// Place signpost
function placeSign(x, y) {
  if (y - 1 >= 0) {
    grid[y - 1][x] = 83; // sign board
  }
  grid[y][x] = 71; // post
}

// Place prop
function placeProp(x, y, type = 'barrel') {
  if (x >= 0 && x < width && y >= 0 && y < height) {
    switch (type) {
      case 'barrel': grid[y][x] = 107; break;
      case 'bucket': grid[y][x] = 130; break;
      case 'bucket-full': grid[y][x] = 131; break;
      case 'axe': grid[y][x] = 127; break;
      case 'hammer': grid[y][x] = 115; break;
      case 'log': grid[y][x] = 106; break;
      default: grid[y][x] = 107;
    }
  }
}

// ===== BUILD THE TOWN =====

// 1. Base terrain - mostly grass with some variation
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    // Add grass variants randomly
    if (grid[y][x] === 0) {
      const rand = Math.random();
      if (rand < 0.15) grid[y][x] = 1; // grass with tufts
      else if (rand < 0.25) grid[y][x] = 2; // grass with flowers
      else grid[y][x] = 0; // plain grass
    }
  }
}

// 2. Create a main dirt path through the center
// Horizontal path at row 8
for (let x = 2; x < 22; x++) {
  grid[8][x] = 25;
}

// Vertical path from center going up
for (let y = 4; y < 8; y++) {
  grid[y][12] = 25;
}

// Vertical path from center going down
for (let y = 8; y < 13; y++) {
  grid[y][12] = 25;
}

// Branch path to the left
for (let x = 6; x < 12; x++) {
  grid[5][x] = 25;
}

// Branch path to the right
for (let x = 12; x < 18; x++) {
  grid[11][x] = 25;
}

// 3. Place houses along paths

// House 1: Small house north of intersection
placeHouse(10, 4);

// House 2: Larger house west (moved down to avoid overlap)
placeHouse(3, 8, 'large');

// House 3: House east
placeHouse(17, 9);

// House 4: House south
placeHouse(10, 13);

// House 5: Small house northwest (moved up)
placeHouse(2, 2);

// House 6: House northeast
placeHouse(19, 3);

// 4. Place fence enclosure near one house
placeFence(6, 9);

// 5. Place well near center
placeWell(14, 7);

// 6. Place signpost
placeSign(8, 4);

// 7. Place trees scattered around
// Cluster near houses
placeTree(2, 2, 'tall');
placeTree(1, 4, 'bush');
placeTree(7, 2, 'tall');
placeTree(8, 2, 'shrub');
placeTree(18, 2, 'tall');
placeTree(20, 3, 'bush');
placeTree(21, 5, 'tall');
placeTree(2, 10, 'tall');
placeTree(3, 12, 'bush');
placeTree(5, 13, 'shrub');
placeTree(18, 13, 'tall');
placeTree(20, 12, 'bush');
placeTree(22, 10, 'tall');
placeTree(15, 14, 'shrub');
placeTree(7, 14, 'tall');

// More scattered trees
placeTree(0, 7, 'bush');
placeTree(23, 6, 'tall');
placeTree(0, 14, 'shrub');
placeTree(23, 14, 'tall');

// 8. Place props near buildings and paths
placeProp(5, 7, 'barrel');
placeProp(11, 6, 'bucket');
placeProp(17, 11, 'axe');
placeProp(9, 13, 'hammer');
placeProp(13, 8, 'log');
placeProp(4, 8, 'bucket-full');
placeProp(15, 6, 'barrel');

// 9. Fill any remaining empty cells with grass
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (grid[y][x] === 0) {
      // Already grass, but ensure no -1
      const rand = Math.random();
      if (rand < 0.1) grid[y][x] = 1;
      else if (rand < 0.18) grid[y][x] = 2;
    }
  }
}

// Output the level
const level = {
  width,
  height,
  tileSize: 16,
  layers: [
    {
      name: "ground",
      data: grid
    }
  ]
};

console.log(JSON.stringify(level, null, 2));
