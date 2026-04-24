#!/usr/bin/env node
/**
 * postinstall.cjs
 * Patches html-encoding-sniffer@6 to be CJS-compatible on Node 18.
 *
 * Problem: html-encoding-sniffer@6 uses require('@exodus/bytes/encoding-lite.js')
 * which is ESM-only — crashes with ERR_REQUIRE_ESM on Node 18.
 *
 * This script runs after pnpm install (via package.json "postinstall" hook)
 * and rewrites the offending line with inlined CJS-safe implementations.
 * No lockfile changes needed.
 */

const fs = require("fs");
const path = require("path");

const TARGET = path.join(
  __dirname,
  "node_modules",
  ".pnpm",
  "html-encoding-sniffer@6.0.0",
  "node_modules",
  "html-encoding-sniffer",
  "lib",
  "html-encoding-sniffer.js"
);

if (!fs.existsSync(TARGET)) {
  console.log("[postinstall] html-encoding-sniffer not found, skipping patch.");
  process.exit(0);
}

const content = fs.readFileSync(TARGET, "utf8");
const BAD_LINE = 'const { getBOMEncoding, labelToName } = require("@exodus/bytes/encoding-lite.js");';

if (!content.includes(BAD_LINE)) {
  console.log("[postinstall] html-encoding-sniffer already patched, skipping.");
  process.exit(0);
}

const PATCH = `// Patched by postinstall.cjs — CJS-safe replacement for ESM-only @exodus/bytes
function getBOMEncoding(u8) {
  if (u8.length >= 3 && u8[0] === 0xef && u8[1] === 0xbb && u8[2] === 0xbf) return "UTF-8";
  if (u8.length < 2) return null;
  if (u8[0] === 0xff && u8[1] === 0xfe) return "UTF-16LE";
  if (u8[0] === 0xfe && u8[1] === 0xff) return "UTF-16BE";
  return null;
}
const _LABEL_MAP = {
  "utf-8":"UTF-8","utf8":"UTF-8","unicode-1-1-utf-8":"UTF-8",
  "utf-16le":"UTF-16LE","utf-16":"UTF-16LE","utf-16be":"UTF-16BE",
  "windows-1252":"windows-1252","iso-8859-1":"windows-1252","latin1":"windows-1252",
};
function labelToName(label) {
  if (!label) return null;
  return _LABEL_MAP[String(label).trim().toLowerCase()] || null;
}`;

const patched = content.replace(BAD_LINE, PATCH);
fs.writeFileSync(TARGET, patched, "utf8");
console.log("[postinstall] ✓ Patched html-encoding-sniffer@6.0.0 for Node 18 CJS compatibility.");
