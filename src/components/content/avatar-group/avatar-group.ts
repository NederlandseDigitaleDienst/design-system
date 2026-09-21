/**
 * Nederlandse Digitale Dienst Avatar Group Component (Lit + TypeScript)
 *
 * Shows several avatars as one group: they overlap, and each one gets a ring in
 * the surface color so they stay apart where they meet. The ring uses the same
 * mechanism as the badge, so on a colored surface you hand the color over
 * through `--context-parent-background-color`.
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
 *
 * @element nldd-avatar-group
 *
 * @attr {string} size - Diameter of each avatar in px (spacer-aligned: 16, 20, 24, 28, 32, 40, 44, 48, 56, 64, 80, 96); default 40
 * @attr {number} max - Shows at most this many avatars; the rest go behind a "+N" button that opens them as a list of names
 * @attr {string} accessible-label - Describes the group as a whole (e.g. "Editors"); without a label the group is not a landmark of its own and the avatars speak for themselves
 *
 * @slot - One or more `nldd-avatar` elements
 */

import { LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { avatarGroupStyles } from './avatar-group.styles.js';
import { avatarGroupTemplate } from './avatar-group.template.js';
import '../avatar/avatar.js';
import '../../layout/popover/popover.js';
import '../../layout/container/container.js';
import '../../lists-and-tables/list/list.js';
import '../../lists-and-tables/list-item/list-item.js';
import '../../lists-and-tables/cells/cell/cell.js';
import '../../lists-and-tables/cells/text-cell/text-cell.js';
import '../../lists-and-tables/cells/spacer-cell/spacer-cell.js';
import { withTranslations } from '../../../utilities/with-translations.js';
import { nlddAvatarGroupTranslations } from './avatar-group.i18n.js';

@customElement('nldd-avatar-group')
export class NLDDAvatarGroup extends withTranslations(LitElement, nlddAvatarGroupTranslations) {
	static override styles = avatarGroupStyles;

	@property({ type: String, reflect: true })
	size = '40';

	@property({ type: Number, reflect: true })
	max: number | undefined = undefined;

	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	/** The avatars past `max`, each as a copy plus the name it carries. Copies,
	 *  because the originals are the consumer's light DOM and are already
	 *  assigned to the slot: a node can only be in one place. */
	@state()
	_overflow: { avatar: Element; name: string }[] = [];

	/** How many avatars are slotted. Kept in state so the generated rules can be
	 *  written after every render: slotchange can beat the first render, and
	 *  then the style element they go in does not exist yet. */
	@state()
	_total = 0;

	/** The trigger and its popover have to agree on an id, and two groups on a
	 *  page must not open each other's list. */
	private readonly _id = Math.random().toString(36).slice(2, 9);

	get _popoverId(): string {
		return `avatar-group-overflow-${this._id}`;
	}

	get _triggerId(): string {
		return `avatar-group-trigger-${this._id}`;
	}

	/** Not guaranteed: a decorative avatar beside a name in the text carries
	 *  none, and then the row simply has no name to show. */
	private _nameOf(el: Element): string {
		return el.getAttribute('name') || '';
	}

	/** The avatars as slotted, kept so a change to `max` can recompute without
	 *  waiting for a slotchange that will not come. */
	private _assigned: Element[] = [];

	override willUpdate(changed: Map<string, unknown>): void {
		if (changed.has('max')) this._recompute();
	}

	_onSlotChange = (e: Event): void => {
		this._assigned = (e.target as HTMLSlotElement).assignedElements();
		this._recompute();
	};

	private _recompute(): void {
		const assigned = this._assigned;
		if (import.meta.env?.DEV) {
			const strays = assigned.filter(el => el.localName !== 'nldd-avatar');
			if (strays.length > 0) {
				console.warn(
					`[nldd-avatar-group] slot an nldd-avatar rather than <${strays[0].localName}>: `
					+ 'the group sizes, stacks and rings its avatars, and only an nldd-avatar '
					+ 'carries the name that the tooltip and the overflow list read.',
				);
			}
		}
		const { max } = this;
		const hidden = typeof max === 'number' && max > 0 && assigned.length > max
			? assigned.slice(max)
			: [];
		this._overflow = hidden.map(node => {
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
			return { avatar, name: this._nameOf(node) };
		});
		this._total = assigned.length;
	}

	/** Two things ::slotted() cannot express without knowing the count: hiding
	 *  everything past `max`, and stacking the row so the first avatar lies on
	 *  top of the second and so on down to the overflow button. Generated as a
	 *  rule rather than as attributes, because the avatars are the consumer's
	 *  light DOM and nth-child() cannot read a custom property. */
	private _syncGeneratedRules(): void {
		const sheet = this.shadowRoot?.querySelector('#generated-rules');
		if (!sheet) return;
		const total = this._total;
		const hide = this._overflow.length > 0 && typeof this.max === 'number'
			? `.avatar-group ::slotted(:nth-child(n + ${this.max + 1})) { display: none; }`
			: '';
		// Descending, so the leftmost avatar is the whole one and each next is
		// tucked under it — the row reads as a stack you look at from the left,
		// and the overflow button ends up at the bottom of it.
		const stack = Array.from({ length: total }, (_, i) =>
			`.avatar-group ::slotted(:nth-child(${i + 1})) { z-index: ${total - i}; }`).join('\n');
		sheet.textContent = `${hide}\n${stack}`;
	}

	/** The popover resolves its anchor by id against the document, and an id in
	 *  a shadow root is not there. Hand it the element instead. */
	override updated(): void {
		this._syncGeneratedRules();

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
