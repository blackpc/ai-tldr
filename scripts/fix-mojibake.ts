#!/usr/bin/env bun
/**
 * Fix UTF-8 mojibake from PowerShell 5.1 ConvertTo-Json round-trip.
 *
 * Some items got round-tripped twice → DOUBLE mojibake.
 * We do byte-level pattern matching and replacement.
 *
 * The core marker for any UTF-8 char run through Latin-1→UTF-8 once is:
 * each original 0xXX byte (>= 0x80) becomes 0xC2 0xXX or 0xC3 (0xXX-0x40),
 * with extra translations for chars that are special in Win-1252.
 *
 * Strategy: build a mapping from "byte sequence as it appears in file"
 * to "byte sequence it should be" for each known corrupt pattern.
 */
import { readFileSync, writeFileSync } from "node:fs";

const path = process.argv[2];
if (!path) {
  console.error("Usage: bun scripts/fix-mojibake.ts <file>");
  process.exit(1);
}

let buf = readFileSync(path);

// Each entry: { name, bad: byte array, good: byte array }
const fixes: Array<{ name: string; bad: number[]; good: number[] }> = [
  // ===== DOUBLE mojibake (highest priority — must run before single) =====
  // Double em dash: original — (E2 80 94) → outer corrupted bytes
  // â (C3 A2) → Ã¢ (C3 83 C2 A2)
  // € (E2 82 AC) → â‚¬ (C3 A2 E2 80 9A C2 AC)
  // ” (E2 80 9D) → â€ (C3 A2 E2 82 AC) + ? (the 0x9D may be lost; varies)
  // Actual seen pattern: Ã¢â‚¬" = C3 83 C2 A2 C3 A2 E2 80 9A C2 AC E2 80 9D
  {
    name: "double em dash",
    bad: [0xc3, 0x83, 0xc2, 0xa2, 0xc3, 0xa2, 0xe2, 0x80, 0x9a, 0xc2, 0xac, 0xe2, 0x80, 0x9d],
    good: [0xe2, 0x80, 0x94],
  },
  // Double en dash: original – (E2 80 93)
  // The third char inside is U+201C (E2 80 9C) → outer Ã¢â‚¬"
  {
    name: "double en dash",
    bad: [0xc3, 0x83, 0xc2, 0xa2, 0xc3, 0xa2, 0xe2, 0x80, 0x9a, 0xc2, 0xac, 0xe2, 0x80, 0x9c],
    good: [0xe2, 0x80, 0x93],
  },
  // Double × (multiplication sign U+00D7, UTF-8: C3 97)
  // C3 → Ã (C3 83), 97 → " (C2 97)? actually 0x97 in Win-1252 = — (em dash U+2014, UTF-8: E2 80 94)
  // So Ã— double-encoded: Ãƒ— = C3 83 C6 92 E2 80 94? Let me reconsider.
  // Actually: × (U+00D7) UTF-8 is C3 97. Latin-1 reading: Ã(C3)+—(97 win1252→U+2014)
  // Mojibake1: C3 83 + E2 80 94 = "Ãƒ—" but that's "Ã" + "ƒ" + "—" = 3 chars
  // So `Ãƒâ€"` (Ãƒ + double-em-dash mojibake) wait this is getting complex
  // Looking at grep: "1.2Ãƒâ€"2.4Ãƒ—" — context shows mojibake of "1.2×2.4×"
  // The pattern Ãƒ— = C3 83 C6 92 E2 80 94 (Ã+ƒ+—). After first mojibake of × it would be Ãƒ—.
  {
    name: "double times sign",
    bad: [0xc3, 0x83, 0xc6, 0x92, 0xe2, 0x80, 0x94],
    good: [0xc3, 0x97],
  },
  // Asymmetric em dash where only the first byte (0xE2) got double-mojibaked.
  // Original — (E2 80 94). Outer: Ã¢ + € + (asymmetric)
  // Variant 1: with C2 9D control instead of right-double-quote at end
  {
    name: "double em dash (asym, control end)",
    bad: [0xc3, 0x83, 0xc2, 0xa2, 0xe2, 0x82, 0xac, 0xc3, 0xa2, 0xe2, 0x82, 0xac, 0xc2, 0x9d],
    good: [0xe2, 0x80, 0x94],
  },
  // Asymmetric em dash where only first byte double-mojibaked
  // Pattern: Ã¢ (C3 83 C2 A2) + € (E2 82 AC) + control (C2 9D)
  {
    name: "double em dash (single-pass on tail, control)",
    bad: [0xc3, 0x83, 0xc2, 0xa2, 0xe2, 0x82, 0xac, 0xc2, 0x9d],
    good: [0xe2, 0x80, 0x94],
  },
  // Asymmetric en dash where only first byte double-mojibaked
  // Pattern: Ã¢ (C3 83 C2 A2) + € (E2 82 AC) + " (E2 80 9C left dbl quote)
  {
    name: "double en dash (single-pass on tail)",
    bad: [0xc3, 0x83, 0xc2, 0xa2, 0xe2, 0x82, 0xac, 0xe2, 0x80, 0x9c],
    good: [0xe2, 0x80, 0x93],
  },
  // Single em dash where byte 0x94 ended up as C2 94 (control U+0094)
  // instead of the more common Win-1252 mapping E2 80 9D (U+201D)
  {
    name: "em dash (with control 0x94)",
    bad: [0xc3, 0xa2, 0xe2, 0x82, 0xac, 0xc2, 0x94],
    good: [0xe2, 0x80, 0x94],
  },
  // Single right double quote where 0x9D became C2 9D (control U+009D)
  {
    name: "right double quote (with control 0x9D)",
    bad: [0xc3, 0xa2, 0xe2, 0x82, 0xac, 0xc2, 0x9d],
    good: [0xe2, 0x80, 0x9d],
  },
  // Asymmetric → (right arrow U+2192, UTF-8: E2 86 92).
  // First byte became double-mojibake, rest stayed plain. Observed:
  // Ã¢†' = C3 83 C2 A2 E2 80 A0 E2 80 99
  {
    name: "right arrow",
    bad: [0xc3, 0x83, 0xc2, 0xa2, 0xe2, 0x80, 0xa0, 0xe2, 0x80, 0x99],
    good: [0xe2, 0x86, 0x92],
  },
  // Asymmetric ⭐ (star U+2B50, UTF-8: E2 AD 90). Double-mojibake.
  // Ã¢Â­Â = C3 83 C2 A2 C3 82 C2 AD C3 82 C2 90
  {
    name: "star emoji",
    bad: [0xc3, 0x83, 0xc2, 0xa2, 0xc3, 0x82, 0xc2, 0xad, 0xc3, 0x82, 0xc2, 0x90],
    good: [0xe2, 0xad, 0x90],
  },
  // ===== SINGLE mojibake =====
  // single em dash: â€" = C3 A2 E2 82 AC E2 80 9D → — (E2 80 94)
  {
    name: "em dash",
    bad: [0xc3, 0xa2, 0xe2, 0x82, 0xac, 0xe2, 0x80, 0x9d],
    good: [0xe2, 0x80, 0x94],
  },
  // single en dash: â€" = C3 A2 E2 82 AC E2 80 9C → – (E2 80 93)
  {
    name: "en dash",
    bad: [0xc3, 0xa2, 0xe2, 0x82, 0xac, 0xe2, 0x80, 0x9c],
    good: [0xe2, 0x80, 0x93],
  },
  // single ' (right single quote U+2019, UTF-8: E2 80 99)
  // 0x99 in Win-1252 = ™ (U+2122, UTF-8: E2 84 A2)
  {
    name: "right single quote",
    bad: [0xc3, 0xa2, 0xe2, 0x82, 0xac, 0xe2, 0x84, 0xa2],
    good: [0xe2, 0x80, 0x99],
  },
  // single ' (left single quote U+2018, UTF-8: E2 80 98)
  // 0x98 in Win-1252 = ˜ (U+02DC, UTF-8: CB 9C)
  {
    name: "left single quote",
    bad: [0xc3, 0xa2, 0xe2, 0x82, 0xac, 0xcb, 0x9c],
    good: [0xe2, 0x80, 0x98],
  },
  // single " (left double quote U+201C, UTF-8: E2 80 9C)
  // 0x9C in Win-1252 = œ (U+0153, UTF-8: C5 93)
  {
    name: "left double quote",
    bad: [0xc3, 0xa2, 0xe2, 0x82, 0xac, 0xc5, 0x93],
    good: [0xe2, 0x80, 0x9c],
  },
  // single ellipsis (U+2026, UTF-8: E2 80 A6)
  // 0xA6 in Win-1252 = ¦ (U+00A6, UTF-8: C2 A6)
  {
    name: "ellipsis",
    bad: [0xc3, 0xa2, 0xe2, 0x82, 0xac, 0xc2, 0xa6],
    good: [0xe2, 0x80, 0xa6],
  },
  // single × (multiplication sign): Ã— = C3 83 E2 80 94 → C3 97
  {
    name: "times sign",
    bad: [0xc3, 0x83, 0xe2, 0x80, 0x94],
    good: [0xc3, 0x97],
  },
  // single € (euro): â‚¬ = C3 A2 E2 80 9A C2 AC → E2 82 AC
  {
    name: "euro sign",
    bad: [0xc3, 0xa2, 0xe2, 0x80, 0x9a, 0xc2, 0xac],
    good: [0xe2, 0x82, 0xac],
  },
  // ≤ (E2 89 A4): â‰¤ = C3 A2 E2 80 B0 C2 A4 → E2 89 A4
  {
    name: "less-or-equal",
    bad: [0xc3, 0xa2, 0xe2, 0x80, 0xb0, 0xc2, 0xa4],
    good: [0xe2, 0x89, 0xa4],
  },
  // † (dagger U+2020, UTF-8: E2 80 A0): â€  with NBSP = C3 A2 E2 82 AC C2 A0
  {
    name: "dagger",
    bad: [0xc3, 0xa2, 0xe2, 0x82, 0xac, 0xc2, 0xa0],
    good: [0xe2, 0x80, 0xa0],
  },
];

function indexOfBytes(haystack: Buffer, needle: number[], from: number): number {
  outer: for (let i = from; i <= haystack.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) continue outer;
    }
    return i;
  }
  return -1;
}

for (const { name, bad, good } of fixes) {
  let count = 0;
  const out: number[] = [];
  let i = 0;
  while (i < buf.length) {
    if (i <= buf.length - bad.length) {
      let match = true;
      for (let j = 0; j < bad.length; j++) {
        if (buf[i + j] !== bad[j]) { match = false; break; }
      }
      if (match) {
        for (const b of good) out.push(b);
        i += bad.length;
        count++;
        continue;
      }
    }
    out.push(buf[i]);
    i++;
  }
  if (count > 0) {
    buf = Buffer.from(out);
    console.log(`  ${name}: ${count} fixed`);
  }
}

writeFileSync(path, buf);

// Verification: any remaining 0xC3 0xA2 0xE2 sequences?
let remaining = 0;
for (let i = 0; i < buf.length - 2; i++) {
  if (buf[i] === 0xc3 && buf[i + 1] === 0xa2 && buf[i + 2] === 0xe2) remaining++;
}
let doubleRemaining = 0;
for (let i = 0; i < buf.length - 3; i++) {
  if (buf[i] === 0xc3 && buf[i + 1] === 0x83 && buf[i + 2] === 0xc2 && buf[i + 3] === 0xa2) doubleRemaining++;
}
console.log(`Remaining single mojibake markers: ${remaining}`);
console.log(`Remaining double mojibake markers: ${doubleRemaining}`);
