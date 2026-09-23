/**
 * Nederlandse Digitale Dienst Simple Section Component (Lit + TypeScript)
 *
 * A basic section with responsive padding and gap based on container size.
 * Contains optional header and footer slots. The padding and spacing between
 * slots adjust automatically via container queries.
 *
 * Use one section per content block and repeat the section rather than
 * building columns inside one: the section sets the reading width and the
 * padding itself. For two columns there are nldd-one-half-one-half-section,
 * nldd-two-thirds-one-third-section, nldd-one-third-two-thirds-section and
 * nldd-sidebar-section. Give a section its surface with `background` instead
 * of a background color of your own; that is how the components inside know
 * which surface they are on.
 *
 * @element nldd-simple-section
 *
 * @attr {'inherit'|'base'|'tinted'} [background] - Surface background ('inherit' default; 'base'/'tinted' paint and cascade a surface).
 * @attr {'inherit'|'light'|'dark'|'inverted'} [scheme] - Color scheme ('inherit' default; 'inverted' = opposite of the surrounding page scheme).
 * @attr {string} [width] - Body max-width: 'full' removes the constraint so the section spans the full available width. Any CSS length (e.g. '480px') overrides the default max-width.
 * @attr {string} [height] - Minimum section height (any CSS length, e.g. '400px', '100dvh') (mirrors width, which sets the body max-width).
 * @attr {string} [padding-block] - Block (top and bottom) padding override (token 0-96; '0' strips it).
 * @attr {string} [padding-top] - Top padding override.
 * @attr {string} [padding-bottom] - Bottom padding override.
 * @attr {string} [sm-padding-block] - Responsive block padding (sm/md/lg, also per edge: {sm,md,lg}-padding-{top,bottom}).
 * @attr {'left'|'center'|'right'} [horizontal-alignment] - Where the body's children sit across the body ('left' default). Use it to place something narrower than the body, such as a container with a max-width.
 * @attr {'top'|'center'|'bottom'} [vertical-alignment] - Where the body's children sit down the section ('top' default). Only visible when the section is taller than its content.
 *
 * @slot header - Content above the main content
 * @slot - Main content
 * @slot footer - Content below the main content
 */
import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { PageSectionMixin } from '../../../../utilities/page-section-mixin.js';
import { reflectNonDefault } from '../../../../utilities/reflect-non-default.js';
import { simpleSectionStyles } from './simple-section.styles.js';
import { simpleSectionTemplate } from './simple-section.template.js';

type HorizontalAlignment = 'left' | 'center' | 'right';
type VerticalAlignment = 'top' | 'center' | 'bottom';

@customElement('nldd-simple-section')
export class NLDDSimpleSection extends PageSectionMixin(LitElement) {
	static override styles = simpleSectionStyles;

	/** Width mode: 'full' (removes body max-width) or any CSS length. */
	@property({ type: String, reflect: true })
	width = '';

	/** Where the body's children sit; the body itself keeps its own max-width. */
	@property({ reflect: true, attribute: 'horizontal-alignment', converter: reflectNonDefault<HorizontalAlignment>('left') })
	horizontalAlignment: HorizontalAlignment = 'left';

	@property({ reflect: true, attribute: 'vertical-alignment', converter: reflectNonDefault<VerticalAlignment>('top') })
	verticalAlignment: VerticalAlignment = 'top';

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
		return simpleSectionTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-simple-section': NLDDSimpleSection;
	}
}
