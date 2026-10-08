/**
 * Nederlandse Digitale Dienst Full Bleed Section Component (Lit + TypeScript)
 *
 * A section that spans the full width without horizontal padding.
 * Useful for background colors, images, or other content that runs
 * edge to edge. Vertical padding and gap adjust via container queries.
 *
 * @element nldd-full-bleed-section
 *
 * @attr {'inherit'|'base'|'tinted'} [background] - Surface background ('inherit' default; 'base'/'tinted' paint and cascade a surface).
 * @attr {string} [width] - Body max-width: 'full' removes the constraint so the section spans the full available width. Any CSS length (e.g. '480px') overrides the default max-width.
 * @attr {string} [height] - Minimum section height (any CSS length, e.g. '400px', '100dvh') (mirrors width, which sets the body max-width).
 * @attr {boolean} grow - Takes the height the page has left, so the footer sits at the bottom of a short page. Without it, nldd-page lets its last section grow.
 * @attr {string} [padding-block] - Block (top and bottom) padding override (token 0-96; '0' strips it).
 * @attr {string} [padding-top] - Top padding override.
 * @attr {string} [padding-bottom] - Bottom padding override.
 * @attr {string} [sm-padding-block] - Responsive block padding (sm/md/lg, also per edge: {sm,md,lg}-padding-{top,bottom}).
 *
 * @slot header - Content above the main content
 * @slot - Main content
 * @slot footer - Content below the main content
 */
import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { PageSectionMixin } from '../../../../utilities/page-section-mixin.js';
import { fullBleedSectionStyles } from './full-bleed-section.styles.js';
import { fullBleedSectionTemplate } from './full-bleed-section.template.js';

@customElement('nldd-full-bleed-section')
export class NLDDFullBleedSection extends PageSectionMixin(LitElement) {
	static override styles = fullBleedSectionStyles;

	/** Width mode: 'full' (removes body max-width) or any CSS length. */
	@property({ type: String, reflect: true })
	width = '';

	override updated(changedProperties: Map<string, unknown>): void {
		super.updated(changedProperties);
		if (changedProperties.has('width')) {
			const w = this.width;
			// Sections constrain the body's max-width rather than the host's
			// outer width. The keyword 'full' is handled by CSS (sets
			// --_full-bleed-section-max-width: none); CSS lengths feed --_full-bleed-section-max-width here.
			if (w && w !== 'full' && CSS.supports('max-width', w)) {
				this.style.setProperty('--_full-bleed-section-max-width', w);
			} else {
				this.style.removeProperty('--_full-bleed-section-max-width');
			}
		}
	}

	override render() {
		return fullBleedSectionTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-full-bleed-section': NLDDFullBleedSection;
	}
}
