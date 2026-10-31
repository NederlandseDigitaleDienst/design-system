/**
 * Nederlandse Digitale Dienst Dialog Component (Lit + TypeScript)
 *
 * An inline status component for empty state, confirmations and feedback.
 * Fills the container and has no minimum width.
 *
 * @element nldd-inline-dialog
 *
 * @attr {'alert'|'success'|'loading'} variant - Semantic variant. 'alert' / 'success' force a matching icon and color; 'loading' shows an nldd-activity-indicator (a role="status" spinner announcing "Laden") in place of the icon — for an empty state that is still loading.
 * @attr {'md'|'lg'} size - Typography size: 'md' (default) keeps body-md text + body-sm supporting; 'lg' bumps both up a step.
 * @attr {string} icon - Name of the nldd-icon icon above the text; absent when not set. Ignored when variant is set.
 * @attr {string} icon-color - 'secondary' | 'accent' | 'critical' | 'warning' | 'success'. Overrides the default and variant icon color.
 * @attr {string} text - Main text (heading or paragraph, depending on heading-level)
 * @attr {string} supporting-text - Supporting text below the heading
 * @attr {1|2|3|4|5|6} heading-level - Renders text as h1–h6; absent renders a p
 * @attr {'left'|'center'} horizontal-alignment - Overrides the alignment of text, icon and actions. Unset (the default) derives it: content in the default slot means a task, which aligns left; a bare message stays centered. Left alignment also lays the actions out in a row instead of stacked full-width.
 *
 * @slot - Optional custom content between text and actions
 * @slot actions - nldd-button elements, wrapped in nldd-button-group (max 3)
 */
import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { inlineDialogStyles } from './inline-dialog.styles.js';
import { inlineDialogTemplate } from './inline-dialog.template.js';
import '../../content/icon/icon.js';
import '../../actions/button-group/button-group.js';
import '../activity-indicator/activity-indicator.js';

export type InlineDialogVariant = 'alert' | 'success' | 'loading';
export type InlineDialogSize = 'md' | 'lg';
export type InlineDialogIconColor = 'secondary' | 'accent' | 'critical' | 'warning' | 'success';
export type InlineDialogHorizontalAlignment = 'left' | 'center';

@customElement('nldd-inline-dialog')
export class NLDDInlineDialog extends LitElement {
	static override styles = inlineDialogStyles;

	@property({ reflect: true, converter: reflectNonDefault<InlineDialogVariant | ''>('') })
	variant: InlineDialogVariant | '' = '';

	@property({ reflect: true, converter: reflectNonDefault<InlineDialogSize>('md') })
	size: InlineDialogSize = 'md';

	@property({ type: String, reflect: true })
	icon = '';

	@property({ type: String, reflect: true, attribute: 'icon-color' })
	iconColor: InlineDialogIconColor | '' = '';

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	text = '';

	@property({ reflect: true, attribute: 'supporting-text', converter: reflectNonDefault<string>('') })
	supportingText = '';

	@property({ type: Number, reflect: true, attribute: 'heading-level' })
	headingLevel: 1 | 2 | 3 | 4 | 5 | 6 | null = null;

	@property({ reflect: true, attribute: 'horizontal-alignment', converter: reflectNonDefault<InlineDialogHorizontalAlignment | ''>('') })
	horizontalAlignment: InlineDialogHorizontalAlignment | '' = '';

	@state()
	_hasContent = false;

	@state()
	_hasActions = false;

	get _resolvedIconName(): string {
		if (this.variant === 'alert') return 'alert';
		if (this.variant === 'success') return 'success';
		if (this.icon) return this.icon;
		return '';
	}

	/** Anything in the default slot is a task (a form, a list) rather than a
	 *  message, and a task reads left-aligned. Derived rather than defaulted so
	 *  the empty state — the other half of this component — stays centered
	 *  without every consumer setting an attribute. */
	get _resolvedHorizontalAlignment(): InlineDialogHorizontalAlignment {
		if (this.horizontalAlignment) return this.horizontalAlignment;
		return this._hasContent ? 'left' : 'center';
	}

	override firstUpdated() {
		const contentSlot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot:not([name])');
		const actionsSlot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="actions"]');
		// Check assignedNodes (not assignedElements) so that plain text content
		// — e.g. `<nldd-inline-dialog>Some note</nldd-inline-dialog>` — is also
		// detected. Whitespace-only text nodes (formatting indentation) are
		// filtered out.
		const hasMeaningfulContent = (slot: HTMLSlotElement | undefined | null): boolean => {
			const nodes = slot?.assignedNodes({ flatten: true }) ?? [];
			return nodes.some(n =>
				n.nodeType === Node.ELEMENT_NODE
				|| (n.nodeType === Node.TEXT_NODE && (n.textContent?.trim() ?? '') !== ''),
			);
		};
		const syncContent = () => { this._hasContent = hasMeaningfulContent(contentSlot); };
		const syncActions = () => { this._hasActions = hasMeaningfulContent(actionsSlot); };
		contentSlot?.addEventListener('slotchange', syncContent);
		actionsSlot?.addEventListener('slotchange', syncActions);
		// Defer the initial sync out of the update lifecycle: setting reactive
		// state synchronously here re-enters the current update and triggers Lit's
		// change-in-update warning. A microtask runs after this update completes,
		// so the follow-up render (when a slot has content) is scheduled cleanly.
		// slotchange handles every later change; this covers the initial state.
		// SSR caveat (no SSR today): on hydration the first paint can land before this
		// microtask drains, briefly showing the empty-slot state. If SSR is adopted,
		// move this into willUpdate (or a second requestUpdate in firstUpdated).
		queueMicrotask(() => {
			syncContent();
			syncActions();
		});
	}

	override render() {
		return inlineDialogTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-inline-dialog': NLDDInlineDialog;
	}
}
