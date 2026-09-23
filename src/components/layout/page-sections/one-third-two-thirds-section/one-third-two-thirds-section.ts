/**
 * Nederlandse Digitale Dienst One Third Two Thirds Section Component (Lit + TypeScript)
 *
 * A section with a 1/3 sidebar on the left and 2/3 main content on the right.
 * The columns wrap automatically when they become smaller than 280px.
 * Padding and gap adjust via container queries.
 *
 * @element nldd-one-third-two-thirds-section
 *
 * @attr {'inherit'|'base'|'tinted'} [background] - Surface background ('inherit' default; 'base'/'tinted' paint and cascade a surface).
 * @attr {'inherit'|'light'|'dark'|'inverted'} [scheme] - Color scheme ('inherit' default; 'inverted' = opposite of the surrounding page scheme).
 * @attr {string} [width] - Body max-width: 'full' removes the constraint so the section spans the full available width. Any CSS length (e.g. '480px') overrides the default max-width.
 * @attr {string} [height] - Minimum section height (any CSS length, e.g. '400px', '100dvh') (mirrors width, which sets the body max-width).
 * @attr {string} [padding-block] - Block (top and bottom) padding override (token 0-96; '0' strips it).
 * @attr {string} [padding-top] - Top padding override.
 * @attr {string} [padding-bottom] - Bottom padding override.
 * @attr {string} [sm-padding-block] - Responsive block padding (sm/md/lg, also per edge: {sm,md,lg}-padding-{top,bottom}).
 *
 * @slot header - Content above the columns
 * @slot left - Left column (1/3)
 * @slot - Right column (2/3), alternative for slot="right"
 * @slot right - Right column (2/3)
 * @slot footer - Content below the columns
 */
import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { PageSectionMixin } from '../../../../utilities/page-section-mixin.js';
import { oneThirdTwoThirdsSectionStyles } from './one-third-two-thirds-section.styles.js';
import { oneThirdTwoThirdsSectionTemplate } from './one-third-two-thirds-section.template.js';

@customElement('nldd-one-third-two-thirds-section')
export class NLDDOneThirdTwoThirdsSection extends PageSectionMixin(LitElement) {
	static override styles = oneThirdTwoThirdsSectionStyles;

	/** Width mode: 'full' (removes body max-width) or any CSS length. */
	@property({ type: String, reflect: true })
	width = '';

	override updated(changedProperties: Map<string, unknown>): void {
		super.updated(changedProperties);
		if (changedProperties.has('width')) {
			const w = this.width;
			// Sections constrain the body's max-width rather than the host's
			// outer width. The keyword 'full' is handled by CSS (sets
			// --_max-width: none); CSS lengths feed --_max-width here.
			if (w && w !== 'full' && CSS.supports('max-width', w)) {
				this.style.setProperty('--_max-width', w);
			} else {
				this.style.removeProperty('--_max-width');
			}
		}
	}

	override render() {
		return oneThirdTwoThirdsSectionTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-one-third-two-thirds-section': NLDDOneThirdTwoThirdsSection;
	}
}
