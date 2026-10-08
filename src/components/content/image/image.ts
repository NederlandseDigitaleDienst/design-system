/**
 * Nederlandse Digitale Dienst Image Component (Lit + TypeScript)
 *
 * Wraps a native `<img>` with design-system styling: corner radius variants,
 * aspect-ratio reservation, object-fit/position control, optional caption +
 * credit. Renders as `<figure>` + `<figcaption>` only when a caption or credit
 * is set — otherwise just the image, no extra wrapping.
 *
 * Hybrid source: the `src` attribute renders an internal `<img>`. To use a
 * custom `<img>` or `<picture>` (e.g. with art-direction sources), slot it
 * into the default slot and we'll style and wrap it like our own image.
 *
 * Without an image (no `src`, `srcset`, `lqip` or slotted media) it shows a
 * neutral area with an image icon, in the box, shape and caption a real image
 * would get: a place where an image belongs, for a prototype or a pattern, or
 * an image someone forgot. Without `aspect-ratio` that area is 16/9. While the
 * built-in `<img>` loads without an `lqip`, the same area shows without the
 * icon, and it goes once the image is in.
 *
 * @element nldd-image
 *
 * @attr {string} src - Image URL
 * @attr {string} alt - Alt text for the image from `src`. Required unless `decorative`; slotted media carries its own.
 * @attr {string} srcset - Responsive source set
 * @attr {string} sizes - Source sizes hint
 * @attr {number|'full'} width - Display width. `full` (default) fills the parent.
 *   A numeric value sets host `max-width` AND the `<img>` layout-hint width.
 * @attr {number} height - Intrinsic height (for layout reservation)
 * @attr {'lazy'|'eager'} loading - Loading strategy (default: 'lazy').
 *   Lazy defers fetch until the image is near the viewport — the right
 *   choice for below-the-fold content. Set to 'eager' on images that
 *   appear in the initial viewport, especially the LCP candidate (hero
 *   illustration, top-of-list thumbnail); leaving them lazy silently
 *   regresses Core Web Vitals because the LCP fetch waits for the
 *   intersection observer. Pair with `fetchpriority="high"` on the LCP
 *   image for the strongest signal.
 * @attr {'async'|'sync'|'auto'} decoding - Decoding hint (default: 'async')
 * @attr {'high'|'low'|'auto'} fetchpriority - Fetch priority hint
 * @attr {string} aspect-ratio - Aspect ratio in CSS form (e.g. "16/9", "1/1", "4/3").
 *   "16:9" colon notation is also accepted for convenience.
 * @attr {'cover'|'contain'|'fill'|'scale-down'|'none'} object-fit - default: 'cover'
 * @attr {'center'|'top'|'bottom'|'left'|'right'} object-position - default: 'center'
 * @attr {'square'|'rounded'|'circle'} shape - Corner shape (default: 'square')
 * @attr {string} caption - Caption text shown below the image
 * @attr {string} credit - Smaller credit/attribution text shown beside the caption
 * @attr {boolean} decorative - Decorative image: alt is forced empty + aria-hidden
 * @attr {string} lqip - Loading preview (LQIP, low-quality image placeholder) as a CSV string
 *   `"base,c1,c2,c3,c4,c5,c6"` — seven 0-255 bytes, each packing an 8-bit
 *   Oklab triplet (2 bits L, 3 bits a, 3 bits b). The first is the base
 *   color shown outside the cell gradients; the other six are per-cell
 *   colors in row-major 3×2 order. Generate via the encoder in
 *   `lqip-encoder.ts` or via the "LQIP encoder tool" Storybook story.
 *   Extends Lean Rada's CSS-only LQIP (https://leanrada.com/notes/css-only-lqip/)
 *   with per-cell hue — Lean's original format encodes grayscale cells only;
 *   ours encodes a color per cell so multi-color subjects survive the
 *   preview.
 * @attr {object} translations - Override translation keys (e.g. the message
 *   shown when the image fails to load); unset keys fall back to Dutch.
 *
 * @slot - Custom `<img>`, `<picture>` or inline `<svg>` (overrides the src-based default). An inline svg keeps its own colors and scales by its viewBox, so a drawing gets the same box, ratio and caption as a photo. Slotted media carries its own text alternative: an `alt` on the img (empty when it conveys nothing), or `role="img"` with an `aria-label`, `aria-labelledby` or `<title>` on the svg.
 *   The internal `error` listener is attached only to the built-in `<img>`, so
 *   slotted content does not trigger the error-state overlay automatically.
 *   Consumers slotting their own image are responsible for handling its
 *   error state (e.g. swapping the slot content or styling a fallback).
 * @slot caption - Rich caption content (overrides the `caption` attribute)
 */

import { LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { imageStyles } from './image.styles.js';
import { imageTemplate } from './image.template.js';
import { nlddImageTranslations } from './image.i18n.js';
import type { NLDDImageTranslations } from './image.i18n.js';
import '../icon/icon.js';
import { translate } from '../../../utilities/translations.js';

export type ImageShape = 'square' | 'rounded' | 'circle';
export type ImageObjectFit = 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
export type ImageObjectPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';
export type ImageLoading = 'lazy' | 'eager';
export type ImageDecoding = 'async' | 'sync' | 'auto';
export type ImageFetchPriority = 'high' | 'low' | 'auto';

/**
 * Whether slotted media carries a text alternative, or takes itself out of the
 * accessibility tree the way HTML and ARIA intend. An element that is not media
 * itself is judged by the first media inside it; with none, there is nothing to
 * judge and it passes.
 */
function hasTextAlternative(el: Element): boolean {
	const media = el.matches('img, picture, svg') ? el : el.querySelector('img, picture, svg');
	if (!media) return true;
	if (media.getAttribute('aria-hidden') === 'true') return true;
	if (media.localName === 'picture') {
		const img = media.querySelector('img');
		return img !== null && hasTextAlternative(img);
	}
	if (media.localName === 'svg') {
		const title = media.querySelector(':scope > title')?.textContent?.trim();
		return media.getAttribute('role') === 'img' && (hasAriaName(media) || Boolean(title));
	}
	// An empty alt counts too: that is how an img says it is decorative.
	return media.hasAttribute('alt') || hasAriaName(media);
}

function hasAriaName(el: Element): boolean {
	return Boolean(el.getAttribute('aria-label')?.trim() || el.getAttribute('aria-labelledby')?.trim());
}

@customElement('nldd-image')
export class NLDDImage extends LitElement {
	static override styles = imageStyles;

	@property({ type: String, reflect: true })
	src = '';

	@property({ type: String })
	alt = '';

	@property({ type: String })
	srcset = '';

	@property({ type: String })
	sizes = '';

	/** `'full'` (fills the parent) or a numeric pixel string like `'320'`.
	 *  Typed as `string` because `type: String` means a `width="320"`
	 *  attribute arrives as the string `"320"`, not the number `320` — the
	 *  `_numericWidth` getter owns all parsing. A consumer setting the
	 *  property directly should pass a string (`el.width = '320'`). */
	@property({ reflect: true, converter: reflectNonDefault<string>('full') })
	width: string = 'full';

	@property({ type: Number, reflect: true })
	height?: number;

	@property({ type: String })
	loading: ImageLoading = 'lazy';

	@property({ type: String })
	decoding: ImageDecoding = 'async';

	@property({ type: String, attribute: 'fetchpriority' })
	fetchPriority?: ImageFetchPriority;

	@property({ type: String, attribute: 'aspect-ratio', reflect: true })
	aspectRatio = '';

	@property({ reflect: true, attribute: 'object-fit', converter: reflectNonDefault<ImageObjectFit>('cover') })
	objectFit: ImageObjectFit = 'cover';

	@property({ reflect: true, attribute: 'object-position', converter: reflectNonDefault<ImageObjectPosition>('center') })
	objectPosition: ImageObjectPosition = 'center';

	@property({ reflect: true, converter: reflectNonDefault<ImageShape>('square') })
	shape: ImageShape = 'square';

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	caption = '';

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	credit = '';

	@property({ type: Boolean, reflect: true })
	decorative = false;


	@property({ type: String })
	lqip = '';

	/** Override one or more translation keys. Unspecified keys fall back to Dutch. */
	@property({ type: Object })
	translations: Partial<NLDDImageTranslations> = {};

	public _t(key: keyof NLDDImageTranslations): string {
		return translate(this.translations, nlddImageTranslations, key);
	}

	/** Cache key — the raw lqip attribute string at the time of the last
	 *  parse. Lit dirty-checks by reference, so without caching every render
	 *  would emit a fresh object + array and force downstream re-evaluation
	 *  even when the attribute hasn't changed. Matters when many images live
	 *  in a virtualised list. */
	private _parsedLqipKey?: string;
	private _parsedLqipValue: { base: number; cells: number[] } | null = null;

	/** Parsed LQIP: 7 numbers in [0, 255] — base + 6 cells — or null when the
	 *  attribute is empty or malformed. Memoised against the raw lqip string,
	 *  so successive reads return the same object reference until the
	 *  attribute changes. */
	get _parsedLqip(): { base: number; cells: number[] } | null {
		if (this._parsedLqipKey === this.lqip) return this._parsedLqipValue;
		this._parsedLqipKey = this.lqip;
		if (!this.lqip) {
			this._parsedLqipValue = null;
			return null;
		}
		const parts = this.lqip.split(',').map(s => s.trim());
		if (parts.length !== 7) {
			this._parsedLqipValue = null;
			return null;
		}
		const nums = parts.map(s => {
			const n = Number(s);
			return Number.isInteger(n) && n >= 0 && n <= 255 ? n : NaN;
		});
		this._parsedLqipValue = nums.some(Number.isNaN)
			? null
			: { base: nums[0], cells: nums.slice(1) };
		return this._parsedLqipValue;
	}

	@state()
	_hasSlottedCaption = false;

	/** Tracks whether the internal <img> has finished loading. While false and
	 *  an LQIP value is set, the image stays hidden so the loading preview shows. */
	@state()
	_imageLoaded = false;

	/** Set when the internal <img> fires an error event (404, network error,
	 *  decode failure, …). The template uses this to render a fallback UI
	 *  with an icon + the alt text. */
	@state()
	_imageErrored = false;

	/** Convert "16:9" → "16/9" so the CSS `aspect-ratio` parser accepts it.
	 *  Already-slashed values pass through untouched. */
	get _cssAspectRatio(): string {
		if (!this.aspectRatio) return '';
		return this.aspectRatio.replace(':', '/');
	}

	/** Width parsed as a positive number if it isn't 'full'. Undefined when
	 *  the host should fill its parent (no max-width and no <img width> hint).
	 *  Empty / NaN / non-positive values fall back to undefined.
	 *
	 *  Sentinel behavior: `width="0"` (and any other non-positive value)
	 *  silently behaves as `width="full"`. A zero-width image is meaningless,
	 *  so we treat the input as the consumer's mistake rather than a literal
	 *  request — a DEV-mode warn flags it during development. */
	get _numericWidth(): number | undefined {
		if (this.width === 'full') return undefined;
		const n = Number(this.width);
		if (Number.isFinite(n) && n > 0) return n;
		if (import.meta.env?.DEV && this.width !== null && this.width !== undefined && String(this.width) !== '' && !this._warnedWidth) {
			this._warnedWidth = true;
			console.warn(`<nldd-image>: width="${this.width}" is not a positive number. Falling back to "full".`);
		}
		return undefined;
	}

	/** DEV-only "bad width" warning latch; see _numericWidth. */
	private _warnedWidth = false;

	get _hasCaption(): boolean {
		return !!this.caption || !!this.credit || this._hasSlottedCaption;
	}

	override willUpdate(changed: Map<string, unknown>): void {
		// Reset load/error flags when the src changes so the LQIP shows again
		// for the new image until it finishes loading (or errors out anew).
		// Also re-arm the alt-warning latch so swapping to a new src with a
		// missing alt warns again instead of staying silent after the first hit.
		if (changed.has('src')) {
			this._imageLoaded = false;
			this._imageErrored = false;
			this._warnedAlt = false;
		}
	}

	override updated(changed: Map<string, unknown>): void {
		// Apply the numeric `width` as a custom property the stylesheet picks
		// up. Setting style.maxWidth directly would override any consumer CSS
		// targeting the host's max-width; routing through --_image-max-width lets
		// the consumer's cascade win for the rare case where they need a
		// different cap. 'full' clears the constraint.
		if (changed.has('width')) {
			const n = this._numericWidth;
			if (n !== undefined) {
				this.style.setProperty('--_image-max-width', `${n}px`);
			} else {
				this.style.removeProperty('--_image-max-width');
			}
		}
		this._warnMissingAlt();
		// Reflect load/error state to host attributes so the whole component —
		// and consumer CSS (`nldd-image[loaded]` / `[errored]`) — can react to
		// it, not just the internal <img>.
		this.toggleAttribute('loaded', this._imageLoaded);
		this.toggleAttribute('errored', this._imageErrored);
	}

	/**
	 * Says in DEV when an image has no text alternative. A non-decorative image
	 * without one is a silent a11y failure (WCAG H37), so this surfaces it
	 * during build and Storybook and stays quiet in production.
	 *
	 * Slotted media replaces the built-in `<img>` and carries its own
	 * alternative, so once something is slotted, that is what gets judged.
	 * With neither slotted media nor a `src` or `srcset` there is no image yet:
	 * a source or media that arrives later is judged when it does. The latch
	 * resets once the problem is solved, so bringing it back warns again.
	 */
	private _warnMissingAlt(): void {
		if (!import.meta.env?.DEV) return;
		const slotted = this._slottedMedia();
		const inaccessible = !this.decorative && (slotted.length > 0
			? !slotted.every(hasTextAlternative)
			: Boolean(this.src || this.srcset) && !this.alt.trim());
		if (!inaccessible) {
			this._warnedAlt = false;
			return;
		}
		if (this._warnedAlt) return;
		this._warnedAlt = true;
		console.warn(
			slotted.length > 0
				? '<nldd-image>: The slotted image has no text alternative. Give the `<img>` an `alt` (empty when the image conveys no information), or give the `<svg>` `role="img"` and an `aria-label`, `aria-labelledby` or `<title>`.'
				: '<nldd-image>: Non-decorative images need a non-empty `alt`. Set `decorative` if the image conveys no information.',
			this,
		);
	}

	/** DEV-only "missing alt" warning latch; see _warnMissingAlt(). */
	private _warnedAlt = false;

	/**
	 * What the consumer put in the default slot, followed through a forwarded
	 * slot. The top level is deliberately not flattened: with nothing assigned,
	 * flattening returns the built-in fallback `<img>`, which always has an
	 * `alt` attribute and would pass every time.
	 */
	private _slottedMedia(): Element[] {
		const slot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot:not([name])');
		return (slot?.assignedElements() ?? []).flatMap(el => el instanceof HTMLSlotElement
			? el.assignedElements({ flatten: true })
			: [el]);
	}

	/** Whether anything sits in the default slot. Read off the light DOM, so
	 *  the first render already knows and an image does not flash empty. */
	get _hasSlottedMedia(): boolean {
		return Array.from(this.children).some(el => !el.hasAttribute('slot'));
	}

	/** No image at all: the component shows where one belongs. */
	get _isEmpty(): boolean {
		return !this.src && !this.srcset && !this._parsedLqip && !this._hasSlottedMedia;
	}

	_onMediaSlotChange = (): void => {
		this.requestUpdate();
		this._warnMissingAlt();
	};

	override firstUpdated(): void {
		// If the image was cached or already loaded by the time the listener
		// attached, the load event won't fire — sync state directly.
		const img = this.shadowRoot?.querySelector<HTMLImageElement>('.image__img');
		if (img?.complete && img.naturalWidth > 0) {
			this._imageLoaded = true;
		}
		// Sync the slotted-caption flag from the initial assignment. Without
		// this, consumer-provided `<span slot="caption">` content in the
		// page's initial HTML wouldn't show up until the FIRST slotchange
		// (which doesn't fire for static initial content) — producing a
		// flash of no figure / caption on first paint.
		const captionSlot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="caption"]');
		if (captionSlot) this._syncSlottedCaption(captionSlot);
	}

	_onImageLoad = (): void => {
		this._imageLoaded = true;
		this._imageErrored = false;
	};

	_onImageError = (): void => {
		this._imageErrored = true;
		this._imageLoaded = false;
	};

	/** Recompute _hasSlottedCaption from a caption slot's assigned nodes.
	 *  Takes the slot directly so both the slotchange handler and the
	 *  firstUpdated initial-sync can call it — no synthetic Event needed. */
	_syncSlottedCaption(slot: HTMLSlotElement): void {
		this._hasSlottedCaption = slot.assignedNodes({ flatten: true })
			.some(node => {
				if (node.nodeType === Node.TEXT_NODE) {
					return (node.textContent || '').trim() !== '';
				}
				return true;
			});
	}

	_onCaptionSlotChange = (e: Event): void => {
		this._syncSlottedCaption(e.target as HTMLSlotElement);
	};

	override render() {
		return imageTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-image': NLDDImage;
	}
}
