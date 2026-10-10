/**
 * Nederlandse Digitale Dienst Hero Component (Lit + TypeScript)
 *
 * A page header with a media area and a text panel (the main) that can stand in
 * eight positions. Every area is rectangular.
 *
 * The image in a hero sets the mood and is never the main content, so the
 * panel always stands on it. Over an image the panel keeps a section gap from
 * its edges, so it reads as a panel on the image rather than a frame cut out of
 * it; with `main-width="full"` it is a strip across the whole image, the same
 * gap from the sides. On mobile the image comes first and the panel below it,
 * indented by the section gap and overlapping the image by 48px. For an
 * image beside text without that relation, use a section with an image beside
 * text instead. Without media the main fills the whole area; with
 * `main-background="base"` that area gets a border so it stays visible on the
 * base surface.
 *
 * The hero is the head of a page and sits right under the top bar, so its top
 * padding is half that of the other page sections: the full distance is meant
 * to separate two sections, and under the top bar it reads as a gap. The
 * bottom keeps the full distance to the section below. Set `padding-top` to
 * place a hero elsewhere.
 *
 * `layout="overlap"`, where the panel falls over the bottom of the image and
 * runs on below it, is the intended house style and will become the default in
 * a later release. Use it where the panel has enough content to run on below
 * the image; `contained` stays for a panel that should keep to the image.
 *
 * The height of a hero comes from its image: `media-aspect-ratio`, or a fixed
 * `media-height`. The `height` of the other page sections is not used here: as
 * a minimum height for the whole hero it stretched the panel once that sat
 * below the image. A hero given `height` says so in development.
 *
 * `main-background` gives the panel a surface color from the filled categories.
 * Those carry a pure white or black content color along, so components with
 * `color="inherit"` (title, rich-text) are guaranteed to keep their contrast.
 *
 * @element nldd-hero
 *
 * @attr {'inherit'|'base'|'tinted'} background - Surface behind the hero (section API)
 * @attr {string} width - Body max-width; 'full' removes the bound (section API)
 * @attr {boolean} grow - Takes the height the page has left, so the footer sits at the bottom of a short page. Without it, nldd-page lets its last section grow.
 * @attr {string} padding-block - Block padding override, also per edge and responsive (section API)
 * @attr {'contained'|'overlap'} layout - How the panel relates to the image (default: 'contained'). 'contained' keeps it on the image; 'overlap' lets it fall `overlap-size` over the bottom of the image and run on below as far as its content needs, so the image keeps its height whatever the content. In 'overlap' the image has a fixed height (320px on md, 400px on lg) unless `media-height` or `media-aspect-ratio` is set, and only the horizontal side of `main-position` counts. A panel shorter than `overlap-size` ends inside the image and says so in development
 * @attr {string} main-background - Surface color of the panel: 'base' (the base surface)
 *   or a category color — 'accent' (default) or a Rijkshuisstijl color such as
 *   'lintblauw'|'donkerblauw'|'oranje'
 * @attr {string} main-width - Width of the panel (default: 'auto'). 'auto' follows the content, between 480px and 640px and never wider than the image allows: a short title gets a narrow panel, a paragraph runs on to a readable line length. 'full' makes a strip across the whole image, at the top or the bottom, and is ignored with 'left'/'right'. Any CSS width (e.g. '560px', '60%') sets it exactly on md and lg, still never wider than the image allows; an invalid value falls back to 'auto'
 * @attr {'top-left'|'top-center'|'top-right'|'bottom-left'|'bottom-center'|'bottom-right'|'left'|'right'} main-position -
 *   Position of the text panel (default: 'bottom-left'); 'left'/'right' span the full height
 * @attr {string} overlap-size - With layout="overlap": how far the panel falls over the bottom of the image, any CSS length (default: 160px). The overlap stays the same whatever the height of the image; a panel shorter than this ends inside the image
 * @attr {string} media-aspect-ratio - Aspect ratio of the media area (CSS form, '16/9' or '16:9');
 *   default '21/9'. On md/lg it sets the height of the hero, on sm the height of the media area
 * @attr {string} media-height - Fixed height of the media area, any CSS length (e.g. '320px', '40vh'); wins over media-aspect-ratio. An invalid value falls back to the ratio
 * @attr {string} media-src - Source of the media area (an alternative to the media slot);
 *   ignored as soon as the media slot is filled
 * @attr {string} media-srcset - Responsive source set for media-src
 * @attr {string} media-sizes - Source sizes hint for media-src
 * @attr {string} media-alt - Alt text for media-src; empty means decorative
 *
 * @slot media - Image or illustration (img or nldd-image); fills the area and is clipped.
 *   Takes precedence over the media-src attributes. Set `alt=""` when the image is decorative;
 *   otherwise give a describing alt text.
 * @slot - Content of the text panel (nldd-title and nldd-rich-text with color="inherit", for instance)
 */
import { LitElement, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { PageSectionMixin } from '../../../../utilities/page-section-mixin.js';
import { reflectNonDefault } from '../../../../utilities/reflect-non-default.js';
import { heroStyles } from './hero.styles.js';
import { heroTemplate } from './hero.template.js';

export type HeroMainPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'left' | 'right';
export type HeroMainWidth = 'auto' | 'full' | (string & {});
export type HeroLayout = 'contained' | 'overlap';
export type HeroMainBackground =
	| 'base' | 'accent'
	| 'lintblauw' | 'donkerblauw' | 'hemelblauw' | 'lichtblauw'
	| 'paars' | 'violet'
	| 'robijnrood' | 'roze' | 'rood' | 'oranje'
	| 'donkergeel' | 'geel'
	| 'donkerbruin' | 'bruin'
	| 'donkergroen' | 'groen' | 'mosgroen' | 'mintgroen';

@customElement('nldd-hero')
export class NLDDHero extends PageSectionMixin(LitElement) {
	static override styles = heroStyles;

	/** Width mode: 'full' (removes body max-width) or any CSS length. */
	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	width = '';

	@property({ reflect: true, converter: reflectNonDefault<HeroLayout>('contained') })
	layout: HeroLayout = 'contained';

	@property({ reflect: true, attribute: 'main-background', converter: reflectNonDefault<HeroMainBackground>('accent') })
	mainBackground: HeroMainBackground = 'accent';

	@property({ reflect: true, attribute: 'main-width', converter: reflectNonDefault<HeroMainWidth>('auto') })
	mainWidth: HeroMainWidth = 'auto';

	@property({ reflect: true, attribute: 'main-position', converter: reflectNonDefault<HeroMainPosition>('bottom-left') })
	mainPosition: HeroMainPosition = 'bottom-left';

	/** Media aspect-ratio in CSS form ('16/9' or '16:9'); default '21/9'. Drives
	 *  the hero height on md/lg and the media strip height on sm. */
	@property({ reflect: true, attribute: 'media-aspect-ratio', converter: reflectNonDefault<string>('') })
	mediaAspectRatio = '';

	@property({ reflect: true, attribute: 'overlap-size', converter: reflectNonDefault<string>('') })
	overlapSize = '';

	@property({ reflect: true, attribute: 'media-height', converter: reflectNonDefault<string>('') })
	mediaHeight = '';

	/** Hybrid media source: media-src renders an internal <img>, but a slotted
	 *  media element wins (mirrors nldd-image / nldd-identity). srcset/sizes/alt
	 *  feed that internal img. */
	@property({ type: String, attribute: 'media-src' })
	mediaSrc = '';

	@property({ type: String, attribute: 'media-srcset' })
	mediaSrcset = '';

	@property({ type: String, attribute: 'media-sizes' })
	mediaSizes = '';

	@property({ type: String, attribute: 'media-alt' })
	mediaAlt = '';

	@state()
	_slotHasMedia = false;

	/** Media is present when the slot has content or media-src is set. */
	get _hasMedia(): boolean {
		return this.mediaSrc !== '' || this._slotHasMedia;
	}

	override willUpdate(changed: PropertyValues): void {
		super.willUpdate(changed);
		// The stylesheet only keys off whether media is present.
		this.toggleAttribute('data-has-media', this._hasMedia);
	}

	override connectedCallback(): void {
		super.connectedCallback();
		if (import.meta.env?.DEV && this.hasUpdated) this._watchOverlap();
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this._overlapObserver?.disconnect();
		this._overlapObserver = null;
	}

	override updated(changed: PropertyValues): void {
		super.updated(changed);
		if (changed.has('width')) {
			// Same contract as the other page sections: the keyword 'full' is
			// handled by CSS; CSS lengths feed --_hero-max-width inline.
			const w = this.width;
			if (w && w !== 'full' && CSS.supports('max-width', w)) {
				this.style.setProperty('--_hero-max-width', w);
			} else {
				this.style.removeProperty('--_hero-max-width');
			}
		}
		if (import.meta.env?.DEV && changed.has('layout')) this._watchOverlap();
		if (changed.has('mainWidth')) {
			const width = (this.mainWidth ?? '').trim();
			const length = width !== '' && width !== 'auto' && width !== 'full';
			const valid = length && CSS.supports('width', width);
			if (valid) this.style.setProperty('--_hero-main-width', width);
			else this.style.removeProperty('--_hero-main-width');
			this.toggleAttribute('data-main-width-length', valid);
			if (import.meta.env?.DEV && length && !valid) {
				console.warn(`<nldd-hero>: main-width="${width}" is not "auto", "full" or a CSS width, and falls back to "auto", which follows the content between 480px and 640px.`, this);
			}
		}
		if (changed.has('overlapSize')) {
			const size = (this.overlapSize ?? '').trim();
			if (size && CSS.supports('margin-top', size)) {
				this.style.setProperty('--_hero-overlap-size', size);
			} else {
				this.style.removeProperty('--_hero-overlap-size');
			}
		}
		if (changed.has('mediaHeight')) {
			const height = (this.mediaHeight ?? '').trim();
			if (height && CSS.supports('height', height)) {
				this.style.setProperty('--_hero-media-height', height);
			} else {
				this.style.removeProperty('--_hero-media-height');
			}
		}
		if (changed.has('height') && this.height) {
			// The section API turns `height` into the host's min-height; a hero
			// takes its height from its image instead.
			this.style.removeProperty('min-height');
			if (import.meta.env?.DEV && !this._warnedHeight) {
				this._warnedHeight = true;
				console.warn('<nldd-hero>: `height` is not used on a hero, whose height comes from its image. Use `media-height` for a fixed height, or `media-aspect-ratio`.', this);
			}
		}
		if (changed.has('mediaAspectRatio')) {
			// Accept '16:9' as well as '16/9' (like nldd-image). Clearing the
			// attribute makes Lit set the property to null, so guard with ?? '';
			// the empty value falls back to the stylesheet's --_hero-media-aspect-ratio.
			const ratio = (this.mediaAspectRatio ?? '').replace(':', '/').trim();
			if (ratio && CSS.supports('aspect-ratio', ratio)) {
				this.style.setProperty('--_hero-media-aspect-ratio', ratio);
			} else {
				this.style.removeProperty('--_hero-media-aspect-ratio');
			}
		}
	}

	/** DEV-only latch for the `height` warning. */
	private _warnedHeight = false;

	/** DEV-only: watches an overlap hero for a panel that does not reach below its image. */
	private _overlapObserver: ResizeObserver | null = null;
	private _warnedOverlap = false;

	private _watchOverlap(): void {
		const watch = this.layout === 'overlap' && typeof ResizeObserver !== 'undefined';
		if (!watch) {
			this._overlapObserver?.disconnect();
			this._overlapObserver = null;
			return;
		}
		if (this._overlapObserver) return;
		const media = this.shadowRoot?.querySelector('.hero__media');
		const main = this.shadowRoot?.querySelector('.hero__main');
		if (!media || !main) return;
		this._overlapObserver = new ResizeObserver(() => this._checkOverlap(media, main));
		this._overlapObserver.observe(media);
		this._overlapObserver.observe(main);
	}

	/**
	 * In an overlap hero the panel is meant to run on below the image. When it
	 * ends inside it, the content is shorter than `overlap-size`; the consumer
	 * decides how far it runs on, so this only says so, in development.
	 */
	private _checkOverlap(media: Element, main: Element): void {
		if (!this._hasMedia || getComputedStyle(media).position === 'static') return;
		const falls = main.getBoundingClientRect().bottom <= media.getBoundingClientRect().bottom;
		if (!falls) {
			this._warnedOverlap = false;
			return;
		}
		if (this._warnedOverlap) return;
		this._warnedOverlap = true;
		console.warn('<nldd-hero>: With layout="overlap" the panel is shorter than `overlap-size` and ends inside the image. Give it more content or a smaller `overlap-size`.', this);
	}

	/** @internal Tracks the media slot so the no-media mode can collapse it. */
	_onMediaSlotChange(e: Event): void {
		const slot = e.target as HTMLSlotElement;
		this._slotHasMedia = slot.assignedElements().length > 0;
	}

	override render() {
		return heroTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-hero': NLDDHero;
	}
}
