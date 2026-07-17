import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import sharp from "sharp";

const PUBLIC = new URL("../public/", import.meta.url);
const MASTER = join(PUBLIC.pathname, "assets/brand/applycraft-logo-navbar.png");
const BACKGROUND = { r: 6, g: 8, b: 15, alpha: 1 };
const FAVICON_SIZES = [16, 32, 48];

function publicPath(pathname) {
  return join(PUBLIC.pathname, pathname);
}

async function metadata(pathname) {
  return sharp(pathname).metadata();
}

async function extractCurrentMark() {
  const { width, height } = await metadata(MASTER);
  const markWidth = Math.min(width, Math.round(width * 0.235));
  const crop = await sharp(MASTER)
    .extract({ left: 0, top: 0, width: Number(markWidth), height: Number(height) })
    .png()
    .toBuffer();

  return sharp(crop)
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

async function squareIcon(mark, size, { padding = 0.1, maskable = false } = {}) {
  const inner = Math.round(size * (1 - padding * 2));
  const resizedMark = await sharp(mark)
    .resize(inner, inner, { fit: "contain", withoutEnlargement: false })
    .png()
    .toBuffer();

  const rounded = size >= 180 && !maskable
    ? Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${Math.round(size * 0.18)}" fill="#06080F"/></svg>`)
    : null;

  const base = rounded
    ? sharp(rounded)
    : sharp({ create: { width: size, height: size, channels: 4, background: BACKGROUND } });

  return base
    .composite([{ input: resizedMark, gravity: "center" }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

function writeIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  const entries = [];
  let offset = 6 + images.length * 16;
  for (const { size, buffer } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += buffer.length;
  }

  return Buffer.concat([header, ...entries, ...images.map((image) => image.buffer)]);
}

async function writePng(pathname, buffer) {
  const output = publicPath(pathname);
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, buffer);
  console.log(`Generated public/${pathname}`);
}

const mark = await extractCurrentMark();
const faviconBuffers = [];

for (const size of FAVICON_SIZES) {
  const buffer = await squareIcon(mark, size, { padding: size <= 16 ? 0.03 : 0.08 });
  faviconBuffers.push({ size, buffer });
  if (size === 16 || size === 32) await writePng(`favicon-${size}x${size}.png`, buffer);
}

await writePng("favicon.png", faviconBuffers.find((image) => image.size === 32).buffer);
const faviconSvgPng = await squareIcon(mark, 256, { padding: 0.1 });
writeFileSync(
  publicPath("favicon.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><image href="data:image/png;base64,${faviconSvgPng.toString("base64")}" width="256" height="256"/></svg>\n`,
);
console.log("Generated public/favicon.svg");
writeFileSync(publicPath("favicon.ico"), writeIco(faviconBuffers));
console.log("Generated public/favicon.ico");

await writePng("apple-touch-icon.png", await squareIcon(mark, 180, { padding: 0.12 }));
await writePng("android-chrome-192x192.png", await squareIcon(mark, 192, { padding: 0.1 }));
await writePng("android-chrome-512x512.png", await squareIcon(mark, 512, { padding: 0.1 }));
await writePng("maskable-icon-192x192.png", await squareIcon(mark, 192, { padding: 0.23, maskable: true }));
await writePng("maskable-icon-512x512.png", await squareIcon(mark, 512, { padding: 0.23, maskable: true }));
