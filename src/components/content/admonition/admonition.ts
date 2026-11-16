/**
 * Nederlandse Digitale Dienst Admonition Component (Lit + TypeScript)
 *
 * A note, tip or warning set apart in running text: what a `:::warning`
 * becomes in a markdown page. It is content, not feedback. It says nothing
 * when the page loads and cannot be dismissed, so a screen reader meets it in
 * reading order as a note (`role="note"`), unless the page gives it a role of
 * its own before it connects. For a notice that responds to what
 * the user does or what changes, such as an error summary, use nldd-banner,
 * which is a live region.
 *
 * The title sits in a bar tinted in the color of the variant, with the icon
 * of the variant before it. The content sits below it on the base surface,
 * inside a border of the same color, so the admonition reads as part of the
 * text and not as a message. Without `text` there is no bar, and the icon
 * stands before the content. A warning or a critical note says in its title
 * what it is: the color and the icon are not read out.
 *
 * With `collapsible` the title bar opens and closes the content, as a native
 * `details` does: the keyboard, a screen reader and find in page work as they
 * do there, and find in page opens it. It starts open; add `collapsed` to start
 * closed. Keep what you fold away short and
 * additional: see the design guidelines on expand/collapse. A collapsible
 * admonition needs `text`, and its title is the name of the button that opens
 * it, so `heading-level` does not apply there.
 *
 * A markdown renderer does not make one by itself: `:::tip` is syntax of the
 * parser, so the app maps each type to an admonition. The types of Docusaurus,
 * remark-directive and markdown-it-container map as follows: `note` to
 * `variant="neutral"`, `info` to `variant="accent"`, `tip` to
 * `variant="success" icon="idea"`, `warning` and `caution` to
 * `variant="warning"`, and `danger` to `variant="critical"`. The label of the
 * type, or the title given in the markdown, becomes `text`.
 *
 * One admonition does not hold another: an aside within an aside is a sign the
 * text wants to be written differently.
 *
 * @element nldd-admonition
 *
 * @attr {'neutral'|'accent'|'success'|'warning'|'critical'} variant - Color and default icon (default: 'neutral')
 * @attr {string} text - Title in the bar above the content. Without it there is no bar
 * @attr {1|2|3|4|5|6} heading-level - Renders the title as h1–h6; absent renders a p. Not with `collapsible`
 * @attr {string} icon - Icon override. Default per variant: neutral → info-circle-filled, accent → info-circle-filled, success → check-mark-circle-filled, warning → exclamation-triangle-filled, critical → exclamation-circle-filled
 * @attr {boolean} collapsible - The title bar opens and closes the content. Needs `text`
 * @attr {boolean} collapsed - Whether a collapsible admonition is closed
 *
 * @slot - The content: an nldd-rich-text, or an nldd-text for a single paragraph.
 *
 * @fires toggle - When the user opens or closes a collapsible admonition; read `collapsed` for the new state. Setting `collapsed` does not fire it.
 */
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { admonitionStyles } from './admonition.styles.js';
import { admonitionTemplate } from './admonition.template.js';
import '../icon/icon.js';

export type AdmonitionVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'critical';

const DEFAULT_ICONS: Record<AdmonitionVariant, string> = {
	neutral: 'info-circle-filled',
	accent: 'info-circle-filled',
	success: 'check-mark-circle-filled',
	warning: 'exclamation-triangle-filled',
	critical: 'exclamation-circle-filled',
};

@customElement('nldd-admonition')
export class NLDDAdmonition extends LitElement {
	static override styles = admonitionStyles;

	@property({ reflect: true, converter: reflectNonDefault<AdmonitionVariant>('neutral') })
	variant: AdmonitionVariant = 'neutral';

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	text = '';

	@property({ type: Number, reflect: true, attribute: 'heading-level' })
	headingLevel: 1 | 2 | 3 | 4 | 5 | 6 | null = null;

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	icon = '';

	@property({ type: Boolean, reflect: true })
	collapsible = false;

	@property({ type: Boolean, reflect: true })
	collapsed = false;

	get _resolvedIcon(): string {
		return this.icon || DEFAULT_ICONS[this.variant];
	}

	/** Collapsing needs a title to click on. */
	get _isCollapsible(): boolean {
		return this.collapsible && !!this.text;
	}

	/** The native details toggled: keep `collapsed` in step and say so. A toggle
	 *  event does not cross the shadow boundary, so the host fires its own. */
	public _onToggle = (event: Event): void => {
		const details = event.currentTarget as HTMLDetailsElement;
		if (details.open !== this.collapsed) return;
		this.collapsed = !details.open;
		this.dispatchEvent(new Event('toggle'));
	};

	override connectedCallback(): void {
		super.connectedCallback();
		if (!this.hasAttribute('role')) this.setAttribute('role', 'note');
	}

	override render() {
		return admonitionTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-admonition': NLDDAdmonition;
	}
}
