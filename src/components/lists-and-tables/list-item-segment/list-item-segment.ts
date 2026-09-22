import { LitElement } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { isPointerMode } from '../../../utilities/input-modality.js';
import { listItemSegmentStyles } from './list-item-segment.styles.js';
import { template, type ListItemSegmentControl } from './list-item-segment.template.js';
import type { NLDDList } from '../list/list.js';

export type ListItemSegmentWidth = 'fit-content' | 'full';

/**
 * A segment inside an `nldd-list-item`: it groups a run of cells
 * and makes just that run clickable. Use it when a row needs more than one
 * segment — a tree row whose chevron expands while the label toggles a checkbox,
 * or a row that navigates with a separate button beside it.
 *
 * Put it in the row where its cells would go: the item has one flat slot, and a
 * segment takes the place of the cells it covers. Where the divider
 * starts or stops is marked on the cells themselves (`divider-start` /
 * `divider-end`), not by the slot a segment sits in.
 *
 * A row is EITHER row-level interactive (`href` / `button` / `checkbox` on the
 * `nldd-list-item`) OR segmented (one or more of these). Both at once nests
 * a control inside a control, which is invalid HTML; the item DEV-warns.
 *
 * Unlike the row-wide action this does not bleed outward: a segment sits
 * between siblings, so an outward inset would overlap them. It owns its inline
 * padding and never drops below the row's control size, so an icon-only one still
 * meets the WCAG 2.5.8 target size — do not add spacer cells inside it for room
 * or hit area, that doubles the space.
 *
 * In a `type="listbox"` list the segment renders as a plain container (no
 * control, not focusable) and DEV-warns: an `option` may not contain
 * interactive descendants. The cells render unchanged, so nothing shifts.
 *
 * @element nldd-list-item-segment
 *
 * @attr {boolean} button - Renders the segment as a `<button>`. Last of the three: `href` and `checkbox` both win over it.
 * @attr {string} href - Renders the segment as an `<a>` with this URL. Wins over `checkbox` and `button`.
 * @attr {string} target - Link target forwarded to the `<a>`; only applies with `href`
 * @attr {string} rel - Link rel forwarded to the `<a>`, only with `href`; with target '_blank', 'noopener noreferrer' is added to whatever you set
 * @attr {boolean} checkbox - Makes the segment a `role="checkbox"` control. Wins over `button`, loses to `href`.
 * @attr {boolean} checked - Checked state of a `checkbox` segment; it toggles on activation
 * @attr {boolean} expanded - Disclosure state, reflected as `aria-expanded` on the control, and painted: the segment stays lit a step above hover for as long as what it opened is on screen, so a menu reads as hanging off this row rather than floating over the list. Set it on the segment that opens something (a tree row's chevron, a menu). Leave it off entirely when the segment discloses nothing — an absent attribute emits no aria-expanded.
 * @attr {boolean} disclosure - Marks the segment as the row's disclosure control: `aria-expanded` comes from the parent item's `expanded`, so the state lives in one place. A slotted `nldd-icon-cell` rotates a quarter turn while the row is open
 * @attr {boolean} current - Marks the segment as the current page (`aria-current="page"`). The row it sits in paints itself as the current row from it, so on a segmented row this is the only place it has to be set.
 * @attr {boolean} disabled - Switches the segment off: a `button` or `checkbox` segment stops responding and dims, a `href` segment gets `aria-disabled` and its click is blocked (a link cannot be disabled natively). The arrow keys skip a row whose only segment is off.
 * @attr {'fit-content'|'full'} width - `full` lets the segment grow to fill the row (default: 'fit-content')
 * @attr {string} accessible-label - Accessible name for the control. Set it when the segment holds only an icon, or when the cell text does not describe the action.
 *
 * @slot - The cells that belong to this segment
 *
 * @fires change - On a `checkbox` segment after it toggles; detail: { checked: boolean }
 */
@customElement('nldd-list-item-segment')
export class NLDDListItemSegment extends LitElement {
	static override styles = [listItemSegmentStyles];

	@property({ type: Boolean, reflect: true })
	button = false;

	@property({ reflect: true })
	href?: string;

	@property({ reflect: true })
	target?: string;

	@property({ reflect: true })
	rel?: string;

	@property({ type: Boolean, reflect: true })
	checkbox = false;

	@property({ type: Boolean, reflect: true })
	checked = false;

	/** Undefined (attribute absent) means "discloses nothing" — no aria-expanded is emitted. */
	@property({ type: Boolean, reflect: true })
	expanded?: boolean;

	/**
	 * Marks this segment as the row's disclosure control: it takes `aria-expanded`
	 * from the parent item's `expanded` instead of its own. Use it on a tree row's
	 * chevron, so the open/closed state is written once — on the row, where it also
	 * drives the children group — rather than kept in step in two places.
	 *
	 * A slotted `nldd-icon-cell` turns a quarter with that state, so a chevron
	 * points down while the row is open without any consumer CSS.
	 */
	@property({ type: Boolean, reflect: true })
	disclosure = false;

	@property({ type: Boolean, reflect: true })
	current = false;

	@property({ type: Boolean, reflect: true })
	disabled = false;

	@property({ reflect: true, converter: reflectNonDefault<ListItemSegmentWidth>('fit-content') })
	width: ListItemSegmentWidth = 'fit-content';

	@property({ attribute: 'accessible-label' })
	accessibleLabel = '';

	/** Set by the parent nldd-list-item, mirroring its list's type. */
	@state()
	_parentType = 'list';

	/** Set by the parent row when the list runs roving-tabindex navigation:
	 *  true makes this segment a tab stop within the current row, false keeps it
	 *  out of the tab order. Undefined leaves the native control alone. */
	@state()
	_tabbable?: boolean;

	/** Set by the parent nldd-list-item on a `disclosure` segment: the row's own
	 *  expanded state, which this segment announces. */
	@state()
	_rowExpanded?: boolean;

	@query('.list-item-segment')
	private _control?: HTMLElement;

	override connectedCallback() {
		super.connectedCallback();
		this.addEventListener('focusin', this._handleFocusIn);
		this.addEventListener('focusout', this._handleFocusOut);
		this.addEventListener('click', this._handleClick);
		// The release is watched on the window rather than here: a button let go
		// outside the segment fires nowhere near it, and the press feedback would
		// stay on.
		this.addEventListener('pointerdown', this._onPointerDown);
		this.addEventListener('mousedown', this._onMouseDown);
	}

	override disconnectedCallback() {
		super.disconnectedCallback();
		this.removeEventListener('focusin', this._handleFocusIn);
		this.removeEventListener('focusout', this._handleFocusOut);
		this.removeEventListener('click', this._handleClick);
		this.removeEventListener('pointerdown', this._onPointerDown);
		this.removeEventListener('mousedown', this._onMouseDown);
		this._clearPressed();
	}

	override firstUpdated() {
		const list = this.closest<NLDDList>('nldd-list');
		if (list) this._applyParentType(list.type);
	}

	/** Called by the parent nldd-list-item so a runtime type switch tracks. */
	_applyParentType(type: string) {
		this._parentType = type;
		if (import.meta.env?.DEV && type === 'listbox' && this._wantsControl) {
			console.warn('nldd-list-item-segment: rendered as a plain container because the parent nldd-list is type="listbox". An `option` may not contain interactive descendants — move the segment out of the listbox, or drive selection from the option itself.');
		}
	}

	/** Whether the consumer asked for an interactive segment at all. */
	private get _wantsControl(): boolean {
		return Boolean(this.href) || this.button || this.checkbox;
	}

	get _controlType(): ListItemSegmentControl {
		if (this._parentType === 'listbox' || !this._wantsControl) return 'plain';
		if (this.href) return 'link';
		if (this.checkbox) return 'checkbox';
		return 'button';
	}

	private _handleClick = (e: Event) => {
		// A disabled <button> never gets here, but a link does: there is no such
		// thing as a disabled <a>, so the segment stops the navigation itself.
		if (this.disabled) {
			e.preventDefault();
			e.stopPropagation();
			return;
		}
		// Safari and Firefox on Mac don't focus buttons on click. Force focus so
		// the :focus-visible styling below stays reliable.
		this._control?.focus();
		if (this._controlType !== 'checkbox') return;
		if (!e.composedPath().includes(this._control as EventTarget)) return;
		this.checked = !this.checked;
		this.dispatchEvent(new CustomEvent('change', {
			detail: { checked: this.checked },
			bubbles: true,
			composed: true,
		}));
	};

	private _handleFocusIn = () => {
		// Safari treats the programmatic focus above as focus-visible. Mark
		// pointer-originated focus so the CSS can suppress the ring; if JS fails
		// the class is never set and the ring shows — accessible by default.
		this._control?.classList.toggle('is-pointer-focus', isPointerMode());
	};

	private _handleFocusOut = () => {
		this._control?.classList.remove('is-pointer-focus');
	};

	/**
	 * Safari moves focus to the body on mousedown and only puts it on a button
	 * when the mouse comes up, so a row whose paint follows the focus in it
	 * flickers back to its resting state for as long as you hold the button
	 * down. Preventing the default stops that hand-off; we set the focus
	 * ourselves in the pointerdown above, and the click still fires.
	 */
	private _onMouseDown = (e: MouseEvent) => {
		if (e.button > 0 || this.disabled) return;
		e.preventDefault();
	};

	private _onPointerDown = (e: PointerEvent) => {
		if (e.button > 0 || this.disabled) return;
		this._control?.classList.add('is-pressed');
		window.addEventListener('pointerup', this._clearPressed);
		window.addEventListener('pointercancel', this._clearPressed);
		// Safari does not focus a <button> on click, so a row whose paint follows
		// the focus in it (see nldd-list-item's current rules) would stay unlit
		// there while every other browser lights up. Focusing on the press makes
		// the three browsers agree; the ring stays hidden because this is a
		// pointer focus, which .is-pointer-focus already marks.
		this._control?.focus({ preventScroll: true });
	};

	private _clearPressed = () => {
		window.removeEventListener('pointerup', this._clearPressed);
		window.removeEventListener('pointercancel', this._clearPressed);
		this._control?.classList.remove('is-pressed');
	};

	/** Delegates focus to the inner control so consumers needn't reach into shadow DOM. */
	override focus(options?: FocusOptions): void {
		this._control?.focus(options);
	}

	/** The open state has to reach the styles, and it lives in a property (the
	 *  row's, for a disclosure segment) that CSS cannot see. A host class is the
	 *  hook — the same mechanism nldd-list already uses for .is-boxed / .is-first. */
	override updated() {
		const expanded = this.disclosure ? this._rowExpanded : this.expanded;
		this.classList.toggle('is-expanded', expanded === true);
	}

	override render() {
		if (import.meta.env?.DEV && this.disclosure && this.expanded !== undefined) {
			console.warn('nldd-list-item-segment: `disclosure` takes aria-expanded from the row, so the `expanded` on this action is ignored. Drop one of the two.');
		}
		return template(
			this._controlType,
			this.href,
			this.target,
			this.rel,
			this.checked,
			this.disclosure ? this._rowExpanded : this.expanded,
			this.current,
			this.disabled,
			this.accessibleLabel,
			this._tabbable === undefined ? undefined : (this._tabbable ? '0' : '-1'),
		);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-list-item-segment': NLDDListItemSegment;
	}
}
