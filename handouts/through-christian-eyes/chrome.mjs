/**
 * Shared headless-Chrome runner and pure-Node QR PNG encoder for the Through Christian Eyes
 * handout generators (`generate.mjs` and `build_slides.mjs`).
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
export const QR_JS_PATH = path.resolve(dir, '../../promo_cards/qrcode.min.js');
export const QR_JS_SOURCE = fs.readFileSync(QR_JS_PATH, 'utf8');

/** Resolves the Chrome/Chromium binary (respects `CHROME_BIN` env var, then standard system paths). */
export function resolveChromeBin() {
  if (process.env.CHROME_BIN) return process.env.CHROME_BIN;
  for (const candidate of ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser']) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return 'google-chrome';
}

/**
 * Executes headless Chrome via `execFileSync` (no shell interpolation) and surfaces stderr on failure.
 * @param {string[]} args
 * @param {{ maxBuffer?: number }} [opts]
 * @returns {string} stdout
 */
export function runChrome(args, { maxBuffer = 64 << 20 } = {}) {
  const bin = resolveChromeBin();
  try {
    return execFileSync(bin, ['--headless', '--disable-gpu', ...args], {
      encoding: 'utf8',
      maxBuffer,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (err) {
    const stderr = err?.stderr ? String(err.stderr).trim() : '';
    throw new Error(`Headless Chrome failed (${bin} ${args.join(' ')}): ${err.message}${stderr ? `\n${stderr}` : ''}`);
  }
}

// ---------------------------------------------------------------------------------------------
// Pure-Node QR PNG Encoder (uses promo_cards/qrcode.min.js matrix + node:zlib; 0 Chrome spawns)
// ---------------------------------------------------------------------------------------------
let QRCodeCtor = null;
function getQRCodeCtor() {
  if (QRCodeCtor) return QRCodeCtor;
  const sandbox = {
    document: { documentElement: { tagName: 'div' } },
    navigator: { userAgent: '' },
    window: { devicePixelRatio: 1 },
  };
  vm.runInNewContext(QR_JS_SOURCE, sandbox, { filename: QR_JS_PATH });
  QRCodeCtor = sandbox.QRCode;
  return QRCodeCtor;
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  if (typeof zlib.crc32 === 'function') return zlib.crc32(buf) >>> 0;
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcInput = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([lenBuf, crcInput, crcBuf]);
}

/**
 * Encodes `text` as a crisp, lossless 2-color indexed PNG QR code (`size × size` px with `pad` px quiet border).
 */
export function encodeQrPng(text, { size = 400, pad = 16, darkRgb = [0x2a, 0x0f, 0x0e], lightRgb = [0xff, 0xff, 0xff] } = {}) {
  const QRCode = getQRCodeCtor();
  const inner = size - 2 * pad;
  const dummyEl = {
    title: '',
    innerHTML: '',
    childNodes: [{ offsetWidth: inner, offsetHeight: inner, style: {} }],
  };
  const qr = new QRCode(dummyEl, {
    text,
    width: inner,
    height: inner,
    correctLevel: QRCode.CorrectLevel.M,
  });
  const count = qr._oQRCode.getModuleCount();

  const stride = 1 + size;
  const raw = Buffer.alloc(size * stride, 0); // 0 = filter byte None AND palette index 0 (lightRgb)
  for (let y = 0; y < inner; y++) {
    const row = Math.min(count - 1, Math.floor((y * count) / inner));
    const rowOffset = (y + pad) * stride + 1 + pad;
    for (let x = 0; x < inner; x++) {
      const col = Math.min(count - 1, Math.floor((x * count) / inner));
      if (qr._oQRCode.isDark(row, col)) raw[rowOffset + x] = 1;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // 8-bit palette index
  ihdr[9] = 3; // color type 3 = indexed-color

  const plte = Buffer.from([...lightRgb, ...darkRgb]);
  const idat = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('PLTE', plte),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

export function writeQrPng(text, outFile, opts) {
  fs.writeFileSync(outFile, encodeQrPng(text, opts));
}
