/**
 * Nederlandse Digitale Dienst Avatar Group Component (Lit + TypeScript)
 *
 * Shows several avatars as one group: they overlap, and each one gets a ring in
 * the surface color so they stay apart where they meet. The ring uses the same
 * mechanism as the badge, so on a colored surface you hand the color over
 * through `--context-background-color`.
 *
 * Slot `nldd-avatar` elements, not bare `img`. An avatar already knows what to
 * do with a dead image, when to fall back to initials, and how to show its name
 * as a tooltip; a loose image would have to reproduce all of that and cannot do
 * the last one. Set `decorative` when the names already stand beside the group
 * as text; otherwise give every avatar a name, because the group itself
 * describes nobody.
 *
 * The size applies to the whole group: it is imposed on the avatars, a slotted
 * `img` included. That keeps the row on one line whatever a consumer hands over.
 * Avatars that are links or buttons need size 32 or larger: they overlap, so
 * each keeps only part of its width as a target (WCAG 2.5.8).
 *
 * On sm the list behind the button is a bottom sheet with a title bar, which
 * names the group (its `accessible-label`) and closes it.
 *
 * The row never overflows its container. Where there is no room for every
 * avatar, the group shows as many as fit and puts the rest behind the "+N"
 * button, as `max` does; `max` is then the most it shows, not a fixed count.
 *
 * @element nldd-avatar-group
 * @related nldd-avatar, nldd-identity
 *
 * @attr {string} size - Diameter of each avatar in px (spacer-aligned: 16, 20, 24, 28, 32, 40, 44, 48, 56, 64, 80, 96); default 40
 * @attr {number} max - Shows at most this many avatars; the rest go behind a "+N" button that opens them as a list of names. A longer number is set smaller, and where it no longer fits the disc the button shows an ellipsis with the count in a tooltip (a number shows from size 24 with one digit, 40 with two, 56 with three and 80 with four)
 * @attr {string} accessible-label - Describes the group as a whole (e.g. "Editors"); without a label the group is not a landmark of its own and the avatars speak for themselves
 *
 * @slot - One or more `nldd-avatar` elements
 */

import { LitElement, supportsAdoptingStyleSheets } from 'lit';
import { property, state } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { avatarGroupStyles } from './avatar-group.styles.js';
import { avatarGroupTemplate } from './avatar-group.template.js';
import '../avatar/avatar.js';
import '../icon/icon.js';
import '../../layout/popover/popover.js';
import '../../layout/container/container.js';
import '../../layout/page/page.js';
import '../../navigation/top-title-bar/top-title-bar.js';
import '../../lists-and-tables/list/list.js';
import '../../lists-and-tables/list-item/list-item.js';
import '../../lists-and-tables/cells/cell/cell.js';
import '../../lists-and-tables/cells/text-cell/text-cell.js';
import '../../lists-and-tables/cells/spacer-cell/spacer-cell.js';
import { withTranslations } from '../../../utilities/with-translations.js';
import { nlddAvatarGroupTranslations } from './avatar-group.i18n.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { afterParse } from '../../../utilities/after-parse.js';
import { LayoutPass, sharedResizeObserver } from '../../../utilities/layout-pass.js';

/** The smallest size at which a count of one, two, three and four digits fits. */
const MIN_SIZE_FOR_COUNT = [24, 40, 56, 80];

/** The share of a disc the next one covers; matches --_avatar-group-overlap-size. */
const OVERLAP = 0.2;

/**
 * Every group in one pass: all of them read their width, then all of them
 * decide how many avatars fit. A group that read its width as it rendered
 * would read a layout the previous group had just made dirty.
 */
function fitGroups(groups: NLDDAvatarGroup[]): void {
	const live = groups.filter((group) => group.isConnected);
	const widths = live.map((group) => group.getBoundingClientRect().width);
	live.forEach((group, i) => group._measureFit(widths[i]));
}

/** The groups that rendered in the same tick. */
const fitPass = new LayoutPass<NLDDAvatarGroup>(fitGroups);

/** One observer for every group. */
const groupObserver = sharedResizeObserver<NLDDAvatarGroup>(fitGroups);

@customElement('nldd-avatar-group')
export class NLDDAvatarGroup extends withTranslations(LitElement, nlddAvatarGroupTranslations) {
	static override styles = avatarGroupStyles;

	@property({ reflect: true, converter: reflectNonDefault<string>('40') })
	size = '40';

	@property({ type: Number, reflect: true })
	max: number | undefined = undefined;

	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	/** The avatars past `max`, as slotted. The list behind the button shows a
	 *  copy of each (see _copyOf). */
	@state()
	_overflow: Element[] = [];

	/** Whether the list behind the button has been opened. Until then it holds
	 *  no rows: a group of a hundred would otherwise render a hundred rows,
	 *  each with a copy of an avatar, that nobody may ever look at. Stays true,
	 *  so the list is there at once the next time and while it closes. */
	@state()
	_overflowOpened = false;

	/** How many avatars are slotted. Kept in state so the generated rules can be
	 *  written after every render: slotchange can beat the first render, and
	 *  then the style element they go in does not exist yet. */
	@state()
	_total = 0;

	/** How many avatars fit the width the group has, or undefined when they all
	 *  do. Measured, so it works as a second `max` that the container sets. */
	@state()
	_fitMax: number | undefined = undefined;

	/** The trigger and its popover have to agree on an id, and two groups on a
	 *  page must not open each other's list. */
	private readonly _id = Math.random().toString(36).slice(2, 9);

	get _popoverId(): string {
		return `avatar-group-overflow-${this._id}`;
	}

	get _triggerId(): string {
		return `avatar-group-trigger-${this._id}`;
	}

	/** The lower of `max` and what fits the width. */
	get _effectiveMax(): number | undefined {
		const max = typeof this.max === 'number' && this.max > 0 ? this.max : undefined;
		if (this._fitMax === undefined) return max;
		return max === undefined ? this._fitMax : Math.min(max, this._fitMax);
	}

	/** Every disc after the first adds its diameter less the overlap. */
	private _rowWidth(discs: number): number {
		const size = Number(this.size);
		return discs * size * (1 - OVERLAP) + size * OVERLAP;
	}

	/** @internal Decides how many avatars fit `width`; reads nothing. */
	_measureFit(width: number): void {
		// A hidden group measures 0; keep what it had until it shows again.
		if (width === 0) return;
		const total = this._assigned.length;
		if (this._rowWidth(total) <= width + 0.5) {
			this._fitMax = undefined;
			return;
		}
		// Room for the overflow button too, and always at least one avatar.
		const discs = Math.floor((width + 0.5 - this._rowWidth(0)) / (Number(this.size) * (1 - OVERLAP)));
		this._fitMax = Math.max(1, discs - 1);
	}

	override connectedCallback(): void {
		super.connectedCallback();
		groupObserver.observe(this, this);
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		groupObserver.unobserveAll(this);
		fitPass.cancel(this);
	}

	/** Whether the overflow count fits its disc, centered and clear of the
	 *  avatar that overlaps it. Where it does not, the button shows an ellipsis. */
	get _overflowCountFits(): boolean {
		const digits = String(this._overflow.length).length;
		const minSize = MIN_SIZE_FOR_COUNT[digits - 1];
		return minSize !== undefined && Number(this.size) >= minSize;
	}

	/** Not guaranteed: a decorative avatar beside a name in the text carries
	 *  none, and then the row simply has no name to show. */
	_nameOf(el: Element): string {
		return el.getAttribute('name') || '';
	}

	/** The copies in the list, with the markup each was made from. */
	private _copies = new WeakMap<Element, { source: string; copy: Element }>();

	/** A copy of a hidden avatar for its row in the list. A copy, because the
	 *  original is the consumer's light DOM and is already assigned to the
	 *  slot: a node can only be in one place. Made again only when the
	 *  original changed since. */
	_copyOf(node: Element): Element {
		const source = node.outerHTML;
		const cached = this._copies.get(node);
		if (cached?.source === source) return cached.copy;
		const avatar = node.cloneNode(true) as Element;
		// The copy is a picture beside its own name, so it says nothing on
		// its own; the row's text is the accessible content. It also gets a
		// row-sized diameter: outside the group nothing constrains it, and
		// an avatar without a size fills its container, which in a cell is
		// nothing at all. Big enough to read the initials, small enough to
		// keep the row a row.
		avatar.setAttribute('decorative', '');
		avatar.setAttribute('tooltip-timing', 'never');
		avatar.setAttribute('size', '32');
		avatar.removeAttribute('slot');
		this._copies.set(node, { source, copy: avatar });
		return avatar;
	}

	_onOverflowToggle = (e: Event): void => {
		if ((e as ToggleEvent).newState === 'open') this._overflowOpened = true;
	};

	/** The avatars as slotted, kept so a change to `max` can recompute without
	 *  waiting for a slotchange that will not come. */
	private _assigned: Element[] = [];

	override willUpdate(changed: Map<string, unknown>): void {
		if (changed.has('max') || changed.has('_fitMax') || changed.has('size')) this._recompute();
	}

	private _slotPending = false;

	/** While the parser adds the avatars, a slotchange comes for every one of
	 *  them, and each would walk them all: the slot is read once the parse is
	 *  done (see afterParse). */
	_onSlotChange = (e: Event): void => {
		const slot = e.target as HTMLSlotElement;
		if (this._slotPending) return;
		const run = () => {
			this._slotPending = false;
			this._assigned = slot.assignedElements();
			this._recompute();
			// The copies in the list are checked against their originals again.
			if (this._overflowOpened) this.requestUpdate();
		};
		this._slotPending = afterParse(run, this.ownerDocument);
		if (!this._slotPending) run();
	};

	private _recompute(): void {
		const assigned = this._assigned;
		const max = this._effectiveMax;
		const hidden = max !== undefined && assigned.length > max
			? assigned.slice(max)
			: [];
		// The same avatars as before render nothing again.
		if (hidden.length !== this._overflow.length || hidden.some((node, i) => node !== this._overflow[i])) {
			this._overflow = hidden;
		}
		this._total = assigned.length;
	}

	/** Two things ::slotted() cannot express without knowing the count: hiding
	 *  everything past `max`, and stacking the row so the first avatar lies on
	 *  top of the second and so on down to the overflow button. Generated as a
	 *  rule rather than as attributes, because the avatars are the consumer's
	 *  light DOM and nth-child() cannot read a custom property.
	 *
	 *  A constructed sheet, not a `<style>` element: a Content Security Policy
	 *  without 'unsafe-inline' refuses the element, in a shadow root too (#455).
	 *  Every browser with the Popover API can adopt one; without it (jsdom) the
	 *  rules are left out and the row shows every avatar. */
	private _generatedRules?: CSSStyleSheet;

	private _syncGeneratedRules(): void {
		const root = this.shadowRoot;
		if (!root || !supportsAdoptingStyleSheets) return;
		this._generatedRules ??= new CSSStyleSheet();
		const sheet = this._generatedRules;
		// Again when the list was replaced since, as style hot reloading does.
		if (!root.adoptedStyleSheets.includes(sheet)) root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
		const rules = this._rulesText();
		// Replacing the sheet restyles every avatar, even with the same rules.
		if (rules === this._generatedText) return;
		this._generatedText = rules;
		sheet.replaceSync(rules);
	}

	private _generatedText = '';

	private _rulesText(): string {
		const total = this._total;
		const max = this._effectiveMax;
		const hide = this._overflow.length > 0 && max !== undefined
			? `.avatar-group ::slotted(:nth-child(n + ${max + 1})) { display: none; }`
			: '';
		// The width the row asks for is what `max` alone would show. Taken from
		// what fits instead, the group could only ever shrink.
		const requested = typeof this.max === 'number' && this.max > 0 && total > this.max
			? this.max + 1
			: total;
		const width = `:host { --_avatar-group-discs: ${requested}; }`;
		// Descending, so the leftmost avatar is the whole one and each next is
		// tucked under it — the row reads as a stack you look at from the left,
		// and the overflow button ends up at the bottom of it.
		// Only for the ones that show: every rule is matched against every
		// avatar, and a hidden avatar has nothing to stack.
		const shown = hide ? Math.min(total, max!) : total;
		const stack = Array.from({ length: shown }, (_, i) =>
			`.avatar-group ::slotted(:nth-child(${i + 1})) { z-index: ${total - i}; }`).join('\n');
		return `${width}\n${hide}\n${stack}`;
	}

	/** The popover resolves its anchor by id against the document, and an id in
	 *  a shadow root is not there. Hand it the element instead. */
	override updated(): void {
		this._syncGeneratedRules();
		// With the new rules in place. A group that is held to its container's
		// width keeps that width when the avatars change, and then the observer
		// stays silent. In one pass with the other groups; see fitGroups.
		fitPass.schedule(this, this.ownerDocument);

		const popover = this.shadowRoot?.querySelector('nldd-popover') as
			(HTMLElement & { anchorElement: Element | null }) | null;
		const trigger = this.shadowRoot?.querySelector('.avatar-group__overflow-button') ?? null;
		if (popover && popover.anchorElement !== trigger) popover.anchorElement = trigger;
	}

	override render() {
		return avatarGroupTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-avatar-group': NLDDAvatarGroup;
	}
}
