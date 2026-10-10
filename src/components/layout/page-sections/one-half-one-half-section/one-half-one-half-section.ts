/**
 * Nederlandse Digitale Dienst One Half One Half Section Component (Lit + TypeScript)
 *
 * A section with two equal columns side by side.
 * The columns wrap automatically when they become smaller than 280px.
 * Padding and gap adjust via container queries.
 *
 * @element nldd-one-half-one-half-section
 *
 * @attr {'inherit'|'base'|'tinted'} [background] - Surface background ('inherit' default; 'base'/'tinted' paint and cascade a surface).
 * @attr {string} [width] - Body max-width: 'full' removes the constraint so the section spans the full available width. Any CSS length (e.g. '480px') overrides the default max-width.
 * @attr {string} [height] - Minimum section height (any CSS length, e.g. '400px', '100dvh') (mirrors width, which sets the body max-width).
 * @attr {boolean} grow - Takes the height the page has left, so the footer sits at the bottom of a short page. Without it, nldd-page lets its last section grow.
 * @attr {string} [padding-block] - Block (top and bottom) padding override (token 0-96; '0' strips it).
 * @attr {string} [padding-top] - Top padding override.
 * @attr {string} [padding-bottom] - Bottom padding override.
 * @attr {string} [sm-padding-block] - Responsive block padding (sm/md/lg, also per edge: {sm,md,lg}-padding-{top,bottom}).
 * @attr {'top'|'center'|'bottom'} [vertical-alignment] - Where the shorter column sits next to the longer one ('top' default). Only where the columns stand side by side; stacked, they follow each other.
 *
 * @slot header - Content above the columns
 * @slot - Left column (1/2), alternative for slot="left"
 * @slot left - Left column (1/2)
 * @slot right - Right column (1/2)
 * @slot footer - Content below the columns
 */
import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../../utilities/reflect-non-default.js';
import { PageSectionMixin } from '../../../../utilities/page-section-mixin.js';
import { oneHalfOneHalfSectionStyles } from './one-half-one-half-section.styles.js';
import { oneHalfOneHalfSectionTemplate } from './one-half-one-half-section.template.js';

@customElement('nldd-one-half-one-half-section')
export class NLDDOneHalfOneHalfSection extends PageSectionMixin(LitElement) {
	static override styles = oneHalfOneHalfSectionStyles;

	/** Width mode: 'full' (removes body max-width) or any CSS length. */
	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	width = '';

	@property({ reflect: true, attribute: 'vertical-alignment', converter: reflectNonDefault<'top' | 'center' | 'bottom'>('top') })
	verticalAlignment: 'top' | 'center' | 'bottom' = 'top';

	override updated(changedProperties: Map<string, unknown>): void {
		super.updated(changedProperties);
		if (changedProperties.has('width')) {
			const w = this.width;
			// Sections constrain the body's max-width rather than the host's
			// outer width. The keyword 'full' is handled by CSS (sets
			// --_one-half-one-half-section-max-width: none); CSS lengths feed --_one-half-one-half-section-max-width here.
			if (w && w !== 'full' && CSS.supports('max-width', w)) {
				this.style.setProperty('--_one-half-one-half-section-max-width', w);
			} else {
				this.style.removeProperty('--_one-half-one-half-section-max-width');
			}
		}
	}

	override render() {
		return oneHalfOneHalfSectionTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-one-half-one-half-section': NLDDOneHalfOneHalfSection;
	}
}
