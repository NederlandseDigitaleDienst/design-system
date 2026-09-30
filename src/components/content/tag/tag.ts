/**
 * Nederlandse Digitale Dienst Tag Component (Lit + TypeScript)
 *
 * A compact property that has been assigned to something: a category, a type, a
 * role, a certification. What it says changes only when someone edits the
 * content. A tag is not interactive.
 *
 * Do not use it for a state the system keeps itself, such as "Active" or
 * "Expired", because that is `nldd-badge`. If the user can remove the thing or
 * click it, it is `nldd-token`.
 *
 * @element nldd-tag
 * @attr {string} variant - What is visible: 'text' | 'icon' | 'icon-and-text'. Unset → detected from which of text/icon is present.
 * @attr {string} color - Color variant. Semantic: 'neutral' | 'accent' | 'success' | 'warning' | 'critical'. Rijkshuisstijl colors: 'lintblauw' | 'donkerblauw' | 'hemelblauw' | 'lichtblauw' | 'paars' | 'violet' | 'robijnrood' | 'roze' | 'rood' | 'oranje' | 'donkergeel' | 'geel' | 'donkerbruin' | 'bruin' | 'donkergroen' | 'groen' | 'mosgroen' | 'mintgroen'. (default: 'neutral')
 * @attr {string} size - Tag size: 'sm' | 'md' (default: 'md')
 * @attr {string} text - Tag text (alternative to the default slot)
 * @attr {string} icon - Icon before the text
 * @attr {string} accessible-label - Accessible label for screen readers. Use this on icon-only tags without visible text.
 *
 * @slot - Tag text
 * @slot icon - Custom icon before the text
 */

import { LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { tagStyles } from './tag.styles.js';
import { template } from './tag.template.js';
import './../icon/icon.js';

type Color =
	// Semantisch
	| 'neutral'
	| 'accent'
	| 'success'
	| 'warning'
	| 'critical'
	// Rijkskleuren
	| 'lintblauw'
	| 'donkerblauw'
	| 'hemelblauw'
	| 'lichtblauw'
	| 'paars'
	| 'violet'
	| 'robijnrood'
	| 'roze'
	| 'rood'
	| 'oranje'
	| 'donkergeel'
	| 'geel'
	| 'donkerbruin'
	| 'bruin'
	| 'donkergroen'
	| 'groen'
	| 'mosgroen'
	| 'mintgroen';
type Size = 'sm' | 'md';
type Variant = 'text' | 'icon' | 'icon-and-text';

@customElement('nldd-tag')
export class NLDDTag extends LitElement {
	static override styles = tagStyles;

	@property({ reflect: true, converter: reflectNonDefault<Variant | ''>('') })
	variant: Variant | '' = '';

	@property({ reflect: true, converter: reflectNonDefault<Color>('neutral') })
	color: Color = 'neutral';

	@property({ reflect: true, converter: reflectNonDefault<Size>('md') })
	size: Size = 'md';

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	text = '';

	@property({ type: String })
	icon = '';

	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	@state()
	_hasSlotText = false;

	@state()
	_hasSlotIcon = false;

	private _childObserver?: MutationObserver;

	get _hasText(): boolean {
		return !!this.text || this._hasSlotText;
	}

	get _hasIcon(): boolean {
		return !!this.icon || this._hasSlotIcon;
	}

	get _effectiveVariant(): Variant {
		if (this.variant) return this.variant;
		if (this._hasIcon && this._hasText) return 'icon-and-text';
		if (this._hasIcon) return 'icon';
		return 'text';
	}

	override connectedCallback() {
		super.connectedCallback();
		this._updateSlotState();
		this._childObserver = new MutationObserver(() => this._updateSlotState());
		// Watch direct children only: _updateSlotState iterates over
		// this.childNodes, so subtree mutations are useless and cost needless work
		// on rich slotted content. characterData would only make sense together
		// with subtree (to catch text edits in existing nodes), which is rare
		// enough to skip, and adding or removing children keeps working through
		// childList.
		this._childObserver.observe(this, { childList: true });
	}

	override disconnectedCallback() {
		super.disconnectedCallback();
		this._childObserver?.disconnect();
		this._childObserver = undefined;
	}

	private _updateSlotState() {
		let hasText = false;
		let hasIcon = false;
		for (const node of Array.from(this.childNodes)) {
			if (node.nodeType === Node.TEXT_NODE) {
				if (node.textContent?.trim()) hasText = true;
			} else if (node.nodeType === Node.ELEMENT_NODE) {
				const slotName = (node as Element).getAttribute('slot');
				if (slotName === 'icon') hasIcon = true;
				else if (!slotName) hasText = true;
			}
		}
		this._hasSlotText = hasText;
		this._hasSlotIcon = hasIcon;
	}

	override updated() {
		// An icon-only tag with no accessible-label has no accessible name —
		// the placeholder/icon is decorative (aria-hidden), so screen readers
		// announce nothing. Warn in dev so consumers add a label.
		if (import.meta.env?.DEV && this._effectiveVariant === 'icon' && !this.accessibleLabel) {
			console.warn('nldd-tag: icon-only tag without an accessible-label has no accessible name. Add accessible-label so screen readers can announce it.', this);
		}
	}

	override render() {
		return template(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-tag': NLDDTag;
	}
}
