/**
 * Nederlandse Digitale Dienst Term Component (Lit + TypeScript)
 *
 * A term in running text with an explanation behind it, such as a legal term
 * from a glossary. The term stays part of the sentence, marked with a dotted
 * underline, and opens its definition in a popover on a click, a tap, Enter
 * or Space. On sm the popover is a bottom sheet.
 *
 * The term is the control: it carries the button role and its expanded state,
 * so a term injected into content needs no ARIA of your own. Focus moves into
 * the popover when it opens, so its content is read, and returns to the term
 * when it closes.
 *
 * A short definition goes in `definition`, as text:
 *
 *     <p>De <nldd-term definition="Degene die het doel van en de middelen
 *         voor de verwerking vaststelt.">verwerkingsverantwoordelijke</nldd-term>
 *         bepaalt of een DPIA nodig is.</p>
 *
 * A definition with more paragraphs, a link or a source is an nldd-popover of
 * your own, outside the sentence, that `popovertarget` points at. Every term
 * for the same concept can point at the same popover: it opens against the
 * term you clicked. Markup in the term itself would break: a `<p>` inside a
 * `<p>` closes the paragraph, and the definition would fall out of the term.
 *
 *     <p>De <nldd-term popovertarget="verwerkingsverantwoordelijke">
 *         verwerkingsverantwoordelijke</nldd-term> bepaalt of een DPIA nodig is.</p>
 *     <nldd-popover id="verwerkingsverantwoordelijke"
 *         accessible-label="Verwerkingsverantwoordelijke">…</nldd-popover>
 *
 * @element nldd-term
 * @attr {string} definition - The definition, as plain text. The term shows it in a popover of its own, named after the term. Ignored when `popovertarget` is set.
 * @attr {string} popovertarget - ID of an nldd-popover with the definition, looked up in the tree of this term. Positioned against the term when it opens, so it needs no `anchor`, and it can be shared by every term for the same concept. Wins over `definition`.
 *
 * @slot - The term, as plain text. Whitespace around it is dropped, so the underline ends where the word does. It also names the popover that `definition` opens.
 */

import { LitElement } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { popoverTargetOf } from '../../../utilities/popover-target.js';
import { setState } from '../../../utilities/element-state.js';
import { termStyles } from './term.styles.js';
import { termTemplate } from './term.template.js';
import type { NLDDPopover } from '../../layout/popover/popover.js';
import '../../layout/popover/popover.js';
import '../../layout/container/container.js';
import '../text/text.js';

@customElement('nldd-term')
export class NLDDTerm extends LitElement {
	static override styles = termStyles;

	@property({ type: String, reflect: true })
	definition = '';

	@property({ type: String, reflect: true })
	popovertarget = '';

	/** The term as it shows: the slotted text without the whitespace around
	 *  it, which the underline would otherwise run into. */
	@state()
	_termDisplay = '';

	/** The term as a name, for the popover `definition` opens. */
	@state()
	_termText = '';

	@query('.term')
	private _triggerEl!: HTMLElement | null;

	@query('nldd-popover')
	private _ownPopoverEl!: NLDDPopover | null;

	/** Whether the popover was open for this term when the pointer went down:
	 *  the browser closes it on that pointerdown, before the click, and the
	 *  click must not open it again. */
	private _wasOpenOnPointerdown = false;
	/** The shared popover this term listens to, to keep its expanded state. */
	private _sharedOverlay: NLDDPopover | null = null;

	override connectedCallback(): void {
		super.connectedCallback();
		if (this.hasUpdated) this._listenToSharedOverlay();
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this._setSharedOverlay(null);
	}

	override firstUpdated(): void {
		this._triggerEl?.setAttribute('aria-expanded', 'false');
	}

	override updated(): void {
		const own = this._ownPopoverEl;
		if (own && own.anchorElement !== this._triggerEl) own.anchorElement = this._triggerEl;
		this._listenToSharedOverlay();
	}

	/** The popover this term opens: the one `popovertarget` names, or its own. */
	private _overlay(): NLDDPopover | null {
		if (this.popovertarget) {
			const target = popoverTargetOf(this, this.popovertarget, null);
			return target?.matches('nldd-popover') ? target as NLDDPopover : null;
		}
		return this._ownPopoverEl;
	}

	/** A term rendered before its popover finds it on its next update or click. */
	private _listenToSharedOverlay(): void {
		const overlay = this.popovertarget ? this._overlay() : null;
		this._setSharedOverlay(overlay);
		setState(this, 'no-popover-target', Boolean(this.popovertarget) && !overlay);
	}

	private _setSharedOverlay(overlay: NLDDPopover | null): void {
		if (overlay === this._sharedOverlay) return;
		this._sharedOverlay?.removeEventListener('toggle', this._handleSharedToggle);
		this._sharedOverlay = overlay;
		overlay?.addEventListener('toggle', this._handleSharedToggle);
	}

	/** The popover takes `aria-expanded` off the term it leaves. This term can
	 *  still open it, so it says it is closed instead. Runs after the
	 *  popover's own listener, which was there first. */
	private _handleSharedToggle = (): void => {
		const trigger = this._triggerEl;
		if (trigger && !trigger.hasAttribute('aria-expanded')) trigger.setAttribute('aria-expanded', 'false');
	};

	_handleSlotChange(event: Event): void {
		const slot = event.target as HTMLSlotElement;
		const text = slot.assignedNodes({ flatten: true })
			.map((node) => node.textContent ?? '')
			.join('')
			.replace(/\s+/g, ' ')
			.trim();
		this._termDisplay = text;
		// A soft hyphen breaks a long word in the sentence, not in the name.
		this._termText = text.replace(/­/g, '');
	}

	_handlePointerdown(): void {
		const overlay = this._overlay();
		this._wasOpenOnPointerdown = Boolean(overlay?.matches(':popover-open') && overlay.anchorElement === this._triggerEl);
	}

	_handleClick(event: MouseEvent): void {
		this._listenToSharedOverlay();
		const overlay = this._overlay();
		const trigger = this._triggerEl;
		// A keyboard click has no pointerdown before it, so a snapshot left
		// from a gesture that ended without a click must not count.
		const wasOpen = event.detail > 0 && this._wasOpenOnPointerdown;
		this._wasOpenOnPointerdown = false;
		if (!overlay || !trigger) return;
		// A shared popover may be open against another term.
		if (overlay.anchorElement !== trigger) {
			if (overlay.matches(':popover-open')) overlay.hidePopover();
			overlay.anchorElement = trigger;
		}
		if (!wasOpen && !overlay.matches(':popover-open')) overlay.show();
	}

	/** As a native button: Enter acts on the key going down, Space on the key
	 *  coming up, and Space does not scroll the page. */
	_handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Enter') {
			event.preventDefault();
			this._triggerEl?.click();
		} else if (event.key === ' ') {
			event.preventDefault();
		}
	}

	_handleKeyup(event: KeyboardEvent): void {
		if (event.key !== ' ') return;
		event.preventDefault();
		this._triggerEl?.click();
	}

	override focus(options?: FocusOptions): void {
		this._triggerEl?.focus(options);
	}

	override render() {
		return termTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-term': NLDDTerm;
	}
}
