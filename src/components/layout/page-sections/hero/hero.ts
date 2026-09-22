/**
 * Nederlandse Digitale Dienst Hero Component (Lit + TypeScript)
 *
 * A page header with a media area and a text panel (the main) that can stand in
 * six positions. Every area is rectangular.
 *
 * With `main-width="full"` the media area sits as its own strip above or below
 * the panel rather than behind it. On mobile the media always stacks above the
 * full-width panel. Without media the main fills the whole area; with
 * `main-background="base"` that area gets a border so it stays visible on the
 * base surface.
 *
 * `main-background` gives the panel a surface color from the filled categories.
 * Those carry a pure white or black content color along, so components with
 * `color="inherit"` (title, rich-text) are guaranteed to keep their contrast.
 *
 * @element nldd-hero
 *
 * @attr {'top-left'|'top-right'|'bottom-left'|'bottom-right'|'left'|'right'} main-position -
 *   Position of the text panel (default: 'bottom-left'); 'left'/'right' span the full height
 * @attr {'1/2'|'2/3'|'3/4'|'full'} main-width - Width of the panel (default: '1/2');
 *   'full' makes a full top or bottom strip and is ignored with 'left'/'right'
 * @attr {string} main-background - Surface color of the panel: 'base' (the base surface)
 *   or a category color — 'accent' (default) or a Rijkshuisstijl color such as
 *   'lintblauw'|'donkerblauw'|'oranje'
 * @attr {string} media-aspect-ratio - Aspect ratio of the media area (CSS form, '16/9' or '16:9');
 *   default '21/9'. On md/lg it sets the height of the hero, on sm the height of the media area
 * @attr {string} media-src - Source of the media area (an alternative to the media slot);
 *   ignored as soon as the media slot is filled
 * @attr {string} media-srcset - Responsive source set for media-src
 * @attr {string} media-sizes - Source sizes hint for media-src
 * @attr {string} media-alt - Alt text for media-src; empty means decorative
 * @attr {'inherit'|'base'|'tinted'} background - Surface behind the hero (section API)
 * @attr {'inherit'|'light'|'dark'|'inverted'} scheme - Color scheme (section API)
 * @attr {string} width - Body max-width; 'full' removes the bound (section API)
 * @attr {string} height - Minimum height of the section (section API)
 * @attr {string} padding-block - Block padding override, also per edge and responsive (section API)
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

export type HeroMainPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'left' | 'right';
export type HeroMainWidth = '1/2' | '2/3' | '3/4' | 'full';
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

	@property({ reflect: true, attribute: 'main-position', converter: reflectNonDefault<HeroMainPosition>('bottom-left') })
	mainPosition: HeroMainPosition = 'bottom-left';

	@property({ reflect: true, attribute: 'main-width', converter: reflectNonDefault<HeroMainWidth>('1/2') })
	mainWidth: HeroMainWidth = '1/2';

	@property({ reflect: true, attribute: 'main-background', converter: reflectNonDefault<HeroMainBackground>('accent') })
	mainBackground: HeroMainBackground = 'accent';

	/** Media aspect-ratio in CSS form ('16/9' or '16:9'); default '21/9'. Drives
	 *  the hero height on md/lg and the media strip height on sm. */
	@property({ type: String, reflect: true, attribute: 'media-aspect-ratio' })
	mediaAspectRatio = '';

	/** Width mode: 'full' (removes body max-width) or any CSS length. */
	@property({ type: String, reflect: true })
	width = '';

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

	override updated(changed: PropertyValues): void {
		super.updated(changed);
		if (changed.has('width')) {
			// Same contract as the other page sections: the keyword 'full' is
			// handled by CSS; CSS lengths feed --_max-width inline.
			const w = this.width;
			if (w && w !== 'full' && CSS.supports('max-width', w)) {
				this.style.setProperty('--_max-width', w);
			} else {
				this.style.removeProperty('--_max-width');
			}
		}
		if (changed.has('mediaAspectRatio')) {
			// Accept '16:9' as well as '16/9' (like nldd-image). Clearing the
			// attribute makes Lit set the property to null, so guard with ?? '';
			// the empty value falls back to the stylesheet's --_media-aspect-ratio.
			const ratio = (this.mediaAspectRatio ?? '').replace(':', '/').trim();
			if (ratio && CSS.supports('aspect-ratio', ratio)) {
				this.style.setProperty('--_media-aspect-ratio', ratio);
			} else {
				this.style.removeProperty('--_media-aspect-ratio');
			}
		}
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
