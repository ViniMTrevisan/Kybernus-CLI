
const fs = require('fs');
const path = require('path');

const svgPath = path.join(process.cwd(), 'apps/web/src/app/icon.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

// Regex to find path d attributes
const pathRegex = /d="([^"]+)"/g;
let match;

let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

while ((match = pathRegex.exec(svgContent)) !== null) {
    const d = match[1];

    // Naive parsing of coordinates. 
    // We look for numbers. 
    // If a path starts with "M 0.00 205.50 L 0.00 0.00" and covers the whole viewbox (0 0 879 411), we should skip it if we want to remove background.
    // The background path in the file was line 6: "M 0.00 205.50 ... L 879.00 411.00 ..."
    // Let's check bounds of each path first.

    let pMinX = Infinity, pMinY = Infinity, pMaxX = -Infinity, pMaxY = -Infinity;

    const numbers = d.match(/-?\d+(\.\d+)?/g).map(Number);

    // SVG path commands have coordinates. We iterate neighbors (x, y) roughly.
    // Actually, simply collecting all numbers and finding min/max is not strictly correct because some numbers are flags or arc radii, but for M/L/C commands it's mostly coordinates.
    // However, for calculating the bounding box of the LOGO, taking all numbers (if they are coordinates) gives a "loose" bounding box which is usually safe for cropping whitespace, 
    // as long as we don't include arc flags which are usually 0 or 1.
    // But coordinate values > 1 are likely coordinates.

    // A better heuristic:
    // If we assume the background path is the one that touches 0,0 and 879,411.

    for (let i = 0; i < numbers.length; i += 2) { // Pair assumption is simplistic but often holds for absolute simple paths
        if (i + 1 >= numbers.length) break;
        const x = numbers[i];
        const y = numbers[i + 1];

        if (x < pMinX) pMinX = x;
        if (x > pMaxX) pMaxX = x;
        if (y < pMinY) pMinY = y;
        if (y > pMaxY) pMaxY = y;
    }

    // Check if this path looks like the background (covers approx the whole viewbox specificed in header 879x411)
    if (pMinX <= 1 && pMinY <= 1 && pMaxX >= 870 && pMaxY >= 400) {
        console.log("Skipping background path");
        continue;
    }

    if (pMinX < minX) minX = pMinX;
    if (pMaxX > maxX) maxX = pMaxX;
    if (pMinY < minY) minY = pMinY;
    if (pMaxY > maxY) maxY = pMaxY;
}

console.log(`BBox: ${minX} ${minY} ${maxX} ${maxY}`);
console.log(`Width: ${maxX - minX}`);
console.log(`Height: ${maxY - minY}`);
