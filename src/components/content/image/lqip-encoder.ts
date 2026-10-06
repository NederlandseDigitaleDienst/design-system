/**
 * Encoder for the CSS-only multi-color LQIP technique used by nldd-image.
 *
 * Takes an image (File, ImageBitmap, or HTMLImageElement) and returns the
 * comma-separated string the `lqip` attribute expects:
 *
 *   "base,c1,c2,c3,c4,c5,c6"
 *
 * — seven 0-255 bytes, each packing an 8-bit Oklab triplet (2 bits L,
 * 3 bits a, 3 bits b). The first byte is the base color shown behind /
 * outside the cell gradients; the other six are per-cell colors laid out
 * row-major in a 3×2 grid (c1 top-left, c6 bottom-right).
 *
 * Inspired by Lean Rada's CSS-only LQIP technique
 * (https://leanrada.com/notes/css-only-lqip/) but intentionally
 * incompatible with his wire format: his 20-bit packed integer carries
 * only grayscale per cell, whereas this 56-bit CSV carries one quantized
 * Oklab color per cell so multi-hue subjects survive the placeholder.
 * Decoder lives in image.styles.ts and renders 7 background layers
 * (6 radial-gradient cells + base) natively, no JS / blend modes.
 *
 * This module is intentionally pure — no Lit imports, no custom-element
 * registration side effects. Consumers (Node build pipelines, Workers,
 * tests) can import just the encoder without dragging in the story
 * UI. The file-picker UI lives in `lqip-encoder-element.ts` and registers
 * `<nldd-lqip-encoder>` separately.
 */

/* --------------------------------------------------------------------- *
 *  Encoder
 *
 *  Extends Lean Rada's CSS-only LQIP technique with per-cell color.
 *  Lean's original format packs 6 × 2-bit grayscale cells + 1 × 8-bit
 *  Oklab base color into 20 bits, then uses CSS blend modes to fake
 *  multi-color from a grayscale payload. The cells can only modulate
 *  the base's lightness — there is no actual hue variation across the
 *  placeholder, so a photo with blue sky + warm lights collapses to "a
 *  bit darker / a bit lighter than that one dominant blue".
 *
 *  This encoder gives every cell its own 8-bit Oklab triplet (2 bits L,
 *  3 bits a, 3 bits b) — the same resolution Lean uses for his single
 *  global base — plus an 8-bit base color for pixels outside the cell
 *  gradients. Total payload: 7 × 8 = 56 bits, serialized as a
 *  comma-separated string "base,c1,c2,c3,c4,c5,c6" (each int 0-255).
 *
 *  Trade-off: wire-incompatible with Lean's reference tool. In exchange
 *  the CSS decoder is simpler (no blend modes), and the placeholder
 *  carries genuine multi-hue information.
 *
 *  Key implementation choices:
 *
 *   1. Per cell: linear-light average → Oklab → findOklabBits. Same
 *      brute-force scaled-Euclidean quantizer used for the base, applied
 *      6 more times.
 *
 *   2. Base color: histogram-dominant Oklab bucket → findOklabBits.
 *      The base shows through cell-gradient edges and outside the
 *      gradient radii, so it sets the "overall mood" of the placeholder.
 *
 *   3. Linear-light averaging via a 256-entry LUT keeps per-cell mean
 *      color photonically correct.
 *
 *  Pure entry point: `encodePixelDataToLqip(data, width, height)` →
 *  string. Async `encodeLqip(source)` is a browser wrapper that gets
 *  pixels via canvas getImageData. Node users can build their own
 *  wrapper using sharp / pngjs / etc.
 * --------------------------------------------------------------------- */

/** sRGB byte (0-255) → linear-light (0-1) lookup table. Precomputed because
 *  large images run this hundreds of thousands of times. */
const SRGB_TO_LINEAR_LUT = new Float32Array(256);
for (let i = 0; i < 256; i++) {
	const n = i / 255;
	SRGB_TO_LINEAR_LUT[i] = n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
}

/** Linear-light RGB triplet (0-1 per channel) → Oklab. Same constants as the
 *  spec, but skips the sRGB→linear step since the input is already linear. */
function linearRgbToOklab(rl: number, gl: number, bl: number): { L: number; a: number; b: number } {
	const l = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl;
	const m = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl;
	const s = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl;
	const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
	return {
		L: 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
		a: 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
		b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
	};
}

function clamp(v: number, lo: number, hi: number): number {
	return Math.max(lo, Math.min(hi, v));
}

/** Decode an 8-bit color triplet (2 + 3 + 3 bits) back to the Oklab L/a/b
 *  values the CSS decoder will reconstruct. Used by the brute-force quantizer
 *  to evaluate candidates and by the cell encoder for the cell's own bits.
 *
 *  Per-byte L/a/b decoding matches Lean Rada's reference implementation
 *  exactly — the same formulas produce the same colors. The overall wire
 *  format is NOT interchangeable though: Lean packs 6 grayscale cells + a
 *  single base color into one 20-bit integer; we ship 7 independent bytes
 *  in a CSV string. So an individual byte can be decoded with either
 *  decoder, but the LQIP attribute strings can't be swapped between tools. */
function bitsToLab(ll: number, aaa: number, bbb: number): { L: number; a: number; b: number } {
	return {
		L: (ll / 0b11) * 0.6 + 0.2,
		a: (aaa / 0b1000) * 0.7 - 0.35,
		b: ((bbb + 1) / 0b1000) * 0.7 - 0.35,
	};
}

/** Find the 2 + 3 + 3 bit Oklab triplet whose decoded color is visually
 *  closest to the target. Brute-forces all 256 combinations because the
 *  search space is tiny and round-to-nearest under-performs near the
 *  quantization boundaries.
 *
 *  Distance is *scaled* Euclidean: a/b are divided by sqrt(chroma) before
 *  comparison so that vivid targets aren't crushed in favour of nearby
 *  lower-chroma buckets that happen to have a smaller raw delta. Matches
 *  Lean's reference implementation. */
function findOklabBits(targetL: number, targetA: number, targetB: number): { ll: number; aaa: number; bbb: number } {
	const targetChroma = Math.hypot(targetA, targetB);
	const scaledTargetA = targetA / (1e-6 + Math.pow(targetChroma, 0.5));
	const scaledTargetB = targetB / (1e-6 + Math.pow(targetChroma, 0.5));
	let bestBits: [number, number, number] = [0, 0, 0];
	let bestDifference = Infinity;
	for (let lli = 0; lli <= 0b11; lli++) {
		for (let aaai = 0; aaai <= 0b111; aaai++) {
			for (let bbbi = 0; bbbi <= 0b111; bbbi++) {
				const { L, a, b } = bitsToLab(lli, aaai, bbbi);
				const chroma = Math.hypot(a, b);
				const scaledA = a / (1e-6 + Math.pow(chroma, 0.5));
				const scaledB = b / (1e-6 + Math.pow(chroma, 0.5));
				const difference = Math.hypot(L - targetL, scaledA - scaledTargetA, scaledB - scaledTargetB);
				if (difference < bestDifference) {
					bestDifference = difference;
					bestBits = [lli, aaai, bbbi];
				}
			}
		}
	}
	return { ll: bestBits[0], aaa: bestBits[1], bbb: bestBits[2] };
}

/** Find the dominant color in the image by histogram bucketing in Oklab
 *  space. Quantises every pixel into an 8×8×8 grid (512 buckets), then
 *  returns the linear-RGB mean of the most-populated bucket.
 *
 *  Using "dominant" instead of "average" is what makes the placeholder pick
 *  up the subject's color (sky blue, foliage green, the pier's amber
 *  lights) rather than collapsing foreground and background into a muddy
 *  midpoint. The bucket grid resolution is intentionally coarse so that
 *  perceptually-similar tones share a bucket — fine quantization would
 *  scatter near-identical pixels across many tiny buckets and lose the
 *  dominance signal we want. */
function findDominantColor(
	data: Uint8ClampedArray | Uint8Array,
	width: number,
	height: number,
): { rl: number; gl: number; bl: number } {
	const L_BUCKETS = 8, A_BUCKETS = 8, B_BUCKETS = 8;
	const TOTAL = L_BUCKETS * A_BUCKETS * B_BUCKETS;
	const counts = new Uint32Array(TOTAL);
	const sumR = new Float64Array(TOTAL);
	const sumG = new Float64Array(TOTAL);
	const sumB = new Float64Array(TOTAL);
	const pixelCount = width * height;
	for (let p = 0; p < pixelCount; p++) {
		const i = p * 4;
		const rl = SRGB_TO_LINEAR_LUT[data[i]];
		const gl = SRGB_TO_LINEAR_LUT[data[i + 1]];
		const bl = SRGB_TO_LINEAR_LUT[data[i + 2]];
		const { L, a, b } = linearRgbToOklab(rl, gl, bl);
		// L is roughly [0, 1]; a/b for sRGB stay roughly within [-0.4, 0.4].
		const li = clamp(Math.floor(L * L_BUCKETS), 0, L_BUCKETS - 1);
		const ai = clamp(Math.floor((a + 0.4) / 0.8 * A_BUCKETS), 0, A_BUCKETS - 1);
		const bi = clamp(Math.floor((b + 0.4) / 0.8 * B_BUCKETS), 0, B_BUCKETS - 1);
		const idx = li * A_BUCKETS * B_BUCKETS + ai * B_BUCKETS + bi;
		counts[idx]++;
		sumR[idx] += rl;
		sumG[idx] += gl;
		sumB[idx] += bl;
	}
	let bestIdx = 0, bestCount = 0;
	for (let i = 0; i < TOTAL; i++) {
		if (counts[i] > bestCount) {
			bestCount = counts[i];
			bestIdx = i;
		}
	}
	const n = counts[bestIdx];
	return { rl: sumR[bestIdx] / n, gl: sumG[bestIdx] / n, bl: sumB[bestIdx] / n };
}

/** Pack a quantized Oklab triplet into a single byte: 2 bits L (high), 3 bits
 *  a, 3 bits b (low). Matches the format Lean uses for his global base
 *  color, so the CSS decoder for each cell uses the same math as Lean's
 *  base decoder — just one byte at a time, seven times. */
function packLab(ll: number, aaa: number, bbb: number): number {
	return (ll << 6) | (aaa << 3) | bbb;
}

/**
 * Pure LQIP encoder. Operates on a raw RGBA pixel buffer (no DOM, no Node
 * APIs) so the same function can be called from a browser, a Node script,
 * a Worker, or any other runtime.
 *
 * Returns a comma-separated string `"base,c1,c2,c3,c4,c5,c6"` where each
 * value is an integer 0-255 packing 2 bits L + 3 bits a + 3 bits b. The
 * `nldd-image` component parses this string into seven CSS variables; its
 * decoder turns each one back into an `oklab()` color.
 *
 * Buffer layout matches ImageData.data: 4 bytes per pixel in RGBA, row-major.
 *
 * Algorithm:
 *   1. Per cell: linear-light average → Oklab → findOklabBits → packed byte.
 *   2. Base: histogram-dominant linear-RGB → Oklab → findOklabBits → packed
 *      byte. The base shows through cell-gradient transparent edges and
 *      sets the placeholder's overall mood; the cells carry the per-zone
 *      hue variation.
 */
export function encodePixelDataToLqip(
	data: Uint8ClampedArray | Uint8Array,
	width: number,
	height: number,
): string {
	if (width < 3 || height < 2) {
		throw new Error(`encodePixelDataToLqip: image must be at least 3×2, got ${width}×${height}`);
	}

	// Per-cell quantized Oklab bytes.
	const cellBytes: number[] = [];
	for (let cellRow = 0; cellRow < 2; cellRow++) {
		const yStart = Math.floor(cellRow * height / 2);
		const yEnd = Math.floor((cellRow + 1) * height / 2);
		for (let cellCol = 0; cellCol < 3; cellCol++) {
			const xStart = Math.floor(cellCol * width / 3);
			const xEnd = Math.floor((cellCol + 1) * width / 3);
			let cellR = 0, cellG = 0, cellB = 0, cellCount = 0;
			for (let y = yStart; y < yEnd; y++) {
				for (let x = xStart; x < xEnd; x++) {
					const i = (y * width + x) * 4;
					cellR += SRGB_TO_LINEAR_LUT[data[i]];
					cellG += SRGB_TO_LINEAR_LUT[data[i + 1]];
					cellB += SRGB_TO_LINEAR_LUT[data[i + 2]];
					cellCount++;
				}
			}
			const { L, a, b } = linearRgbToOklab(cellR / cellCount, cellG / cellCount, cellB / cellCount);
			const { ll, aaa, bbb } = findOklabBits(L, a, b);
			cellBytes.push(packLab(ll, aaa, bbb));
		}
	}

	// Base: dominant Oklab bucket → quantized byte.
	const dom = findDominantColor(data, width, height);
	const domLab = linearRgbToOklab(dom.rl, dom.gl, dom.bl);
	const base = findOklabBits(domLab.L, domLab.a, domLab.b);
	const baseByte = packLab(base.ll, base.aaa, base.bbb);

	return [baseByte, ...cellBytes].join(',');
}

/**
 * Browser-friendly wrapper around `encodePixelDataToLqip`. Accepts a File
 * (e.g. from <input type="file">), an HTMLImageElement, or an ImageBitmap;
 * decodes it to pixels via the Canvas API; and forwards to the pure encoder.
 *
 * When passing an HTMLImageElement loaded from a different origin, set
 * `img.crossOrigin = 'anonymous'` BEFORE assigning `src` — otherwise the
 * underlying canvas read taints and throws a SecurityError. Files and
 * same-origin ImageBitmaps are unaffected.
 */
export async function encodeLqip(source: File | HTMLImageElement | ImageBitmap): Promise<string> {
	// When we create the bitmap from a File / HTMLImageElement we own its
	// lifecycle and must close it. When the caller passes an ImageBitmap they
	// own it (the encoder element of the stories, for one, reuses + closes its own),
	// so we leave that case untouched.
	const ownsBitmap = source instanceof File || source instanceof HTMLImageElement;
	const bitmap: ImageBitmap = ownsBitmap ? await createImageBitmap(source) : source;

	try {
		const canvas = document.createElement('canvas');
		canvas.width = bitmap.width;
		canvas.height = bitmap.height;
		const ctx = canvas.getContext('2d');
		if (!ctx) throw new Error('encodeLqip: could not acquire a 2D canvas context');
		ctx.drawImage(bitmap, 0, 0);
		const { data } = ctx.getImageData(0, 0, bitmap.width, bitmap.height);

		return encodePixelDataToLqip(data, bitmap.width, bitmap.height);
	} finally {
		// Close only the bitmap we allocated; never the caller's. Runs on the
		// success path and on a thrown SecurityError / context failure.
		if (ownsBitmap) bitmap.close();
	}
}
