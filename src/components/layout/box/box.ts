/**
 * Nederlandse Digitale Dienst Box Component (Lit + TypeScript)
 *
 * Use a box to visually group related components in a distinct, contained region.
 * Boxes draw attention to a set of controls or content that belong together,
 * helping users understand their relationship at a glance.
 *
 * @element nldd-box
 * @attr {'tinted'|'base'|'accent-tinted'|'critical'} background - Which surface this box draws, named as it is on nldd-shell, nldd-page, nldd-split-view-pane and nldd-card. It starts tinted where a card starts base: a box is there to stand out from the page, a card to sit on it.
 *   - `tinted` (default): a box on a plain page background.
 *   - `base`: a box on an already-tinted parent (the border ring gets +2
 *   palette steps so it still reads against a card-on-card).
 *   - `accent-tinted`: a tint of the theme's accent, with the contrast of
 *   `tinted`, for a box that belongs to the service rather than to the page.
 *   - `critical`: a region whose actions are destructive or irreversible (a
 *   "danger zone"), tinted and outlined in critical. It carries no ARIA of its
 *   own: unlike nldd-banner this is not an announcement but a permanent part of
 *   the page, so the heading and the button labels have to name the danger —
 *   color is a reinforcement, never the only signal (WCAG 1.4.1).
 * The box draws the surface and nothing else: it has no padding of its own, the
 * same way nldd-card has none. Put an nldd-container inside it and let that set
 * the inset, so one component owns spacing wherever it is used.
 *
 * @slot - Place components inside the box, usually wrapped in an nldd-container
 * that carries the padding
 */
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { boxStyles } from './box.styles.js';
import { boxTemplate } from './box.template.js';

export type BoxBackground = 'tinted' | 'base' | 'accent-tinted' | 'critical';

@customElement('nldd-box')
export class NLDDBox extends LitElement {
	static override styles = boxStyles;

	@property({ reflect: true, converter: reflectNonDefault<BoxBackground>('tinted') })
	background: BoxBackground = 'tinted';

	override render() {
		return boxTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-box': NLDDBox;
	}
}
