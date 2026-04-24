/**
 * ESM compatibility patch for html-encoding-sniffer@6 on Node 18
 *
 * Problem: html-encoding-sniffer@6 calls require('@exodus/bytes/encoding-lite.js')
 * which is ESM-only → ERR_REQUIRE_ESM crash on Node 18.
 *
 * Fix: Pre-populate Node's require cache with a CJS-safe stub so the
 * require() call resolves to our implementation instead of the ESM file.
 * No lockfile changes, no new dependencies.
 *
 * Must be imported BEFORE anything that loads jsdom/html-encoding-sniffer.
 */

import { createRequire } from "module";

const _require = createRequire(import.meta.url);

const stub = {
  getBOMEncoding(u8: Uint8Array): string | null {
    if (u8.length >= 3 && u8[0] === 0xef && u8[1] === 0xbb && u8[2] === 0xbf) return "UTF-8";
    if (u8.length < 2) return null;
    if (u8[0] === 0xff && u8[1] === 0xfe) return "UTF-16LE";
    if (u8[0] === 0xfe && u8[1] === 0xff) return "UTF-16BE";
    return null;
  },
  labelToName(label: string | null): string | null {
    if (!label) return null;
    const map: Record<string, string> = {
      "utf-8": "UTF-8", utf8: "UTF-8", "unicode-1-1-utf-8": "UTF-8",
      "utf-16le": "UTF-16LE", "utf-16": "UTF-16LE",
      "utf-16be": "UTF-16BE",
      "windows-1252": "windows-1252", "iso-8859-1": "windows-1252", "latin1": "windows-1252",
    };
    return map[String(label).trim().toLowerCase()] ?? null;
  },
  TextDecoder, TextEncoder,
  normalizeEncoding: (s: string) => s,
  isomorphicDecode: (b: Uint8Array) => new TextDecoder().decode(b),
  isomorphicEncode: (s: string) => new TextEncoder().encode(s),
};

function injectCache(key: string) {
  const cache = (_require as any).cache as Record<string, unknown>;
  cache[key] = { id: key, filename: key, loaded: true, exports: stub, children: [], paths: [], parent: null };
}

injectCache("@exodus/bytes/encoding-lite.js");

try {
  const resolved = _require.resolve("@exodus/bytes/encoding-lite.js");
  injectCache(resolved);
} catch { /* not resolvable as CJS — bare key is sufficient */ }

export {};
