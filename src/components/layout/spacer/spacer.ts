/**
 * Nederlandse Digitale Dienst Spacer Component (Lit + TypeScript)
 *
 * Add explicit space between elements. Components here have no margins
 * of their own — all whitespace is set by a spacer.
 *
 * A spacer is fixed space between two different things. For padding around an
 * area, or the gaps between the children of one area, use `nldd-container`
 * with `padding` and `gap` instead.
 *
 * ### Sizing
 * Use a single `size` attribute for whitespace that's the same at every
 * viewport. Combine with `sm-size`, `md-size` and/or `lg-size` to override
 * the size at specific breakpoints (mobile-first cascade is intentionally
 * avoided — each breakpoint that needs a different value declares it
 * explicitly):
 *
 * - `size` applies at every breakpoint that has no per-viewport override.
 * - `sm-size` overrides at sm (max-width: 640px).
 * - `md-size` overrides at md (641px–1007px).
 * - `lg-size` overrides at lg (min-width: 1008px).
 *
 * Use `flexible` (in any of the four attributes) to fill the remaining
 * space in a flex container.
 *
 * @element nldd-spacer
 *
 * @attr {string} size - Base spacer size. 'flexible' or one of the fixed
 *   tokens (2–96). Default: '16'.
 * @attr {string} sm-size - Spacer size at sm breakpoint (max-width: 640px).
 * @attr {string} md-size - Spacer size at md breakpoint (641px–1007px).
 * @attr {string} lg-size - Spacer size at lg breakpoint (min-width: 1008px).
 * @attr {string} direction - Direction: 'horizontal' | 'vertical' | 'both' (default: 'both')
 */
import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { spacerStyles } from './spacer.styles.js';

type SpacerSize =
	| 'flexible'
	| '2'
	| '4'
	| '6'
	| '8'
	| '10'
	| '12'
	| '16'
	| '20'
	| '24'
	| '28'
	| '32'
	| '40'
	| '44'
	| '48'
	| '56'
	| '64'
	| '80'
	| '96';
type Direction = 'horizontal' | 'vertical' | 'both';

@customElement('nldd-spacer')
export class NLDDSpacer extends LitElement {
	static override styles = spacerStyles;

	@property({ type: String, reflect: true })
	size: SpacerSize = '16';

	@property({ type: String, reflect: true, attribute: 'sm-size' })
	smSize?: SpacerSize;

	@property({ type: String, reflect: true, attribute: 'md-size' })
	mdSize?: SpacerSize;

	@property({ type: String, reflect: true, attribute: 'lg-size' })
	lgSize?: SpacerSize;

	@property({ reflect: true, converter: reflectNonDefault<Direction>('both') })
	direction: Direction = 'both';
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-spacer': NLDDSpacer;
	}
}
