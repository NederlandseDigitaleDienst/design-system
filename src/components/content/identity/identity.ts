/**
 * Nederlandse Digitale Dienst Identity Component (Lit + TypeScript)
 *
 * An editorial line that shows authors or editors: optional avatar or avatars,
 * a name line and supporting text (a role or a date, for instance). Every part
 * is optional.
 *
 * The name line and the supporting text come in as an attribute or as a slot.
 * Use the slots for richer content, such as a `<time datetime="…">` for a
 * machine-readable date or a link to the author's profile. Slotted content
 * replaces the matching attribute: the attribute is the slot's fallback.
 *
 * One avatar you slot as it is, and identity gives it its size. For more than
 * one, slot an `nldd-avatar-group`: that overlaps them and draws the ring in the
 * surface color. Identity does not build that group itself, because the avatars
 * are the consumer's light DOM and a group can only style what arrives as its
 * own child. Set the avatars to decorative (or an `img` to `alt=""`) when the
 * names already stand in the text.
 *
 * On narrow widths (an sm container, 640px and under) with more than one avatar
 * the row of avatars moves above the names, so the text keeps the full width.
 * With one avatar the identity stays on a single line.
 *
 * For a single avatar you can also hand over `avatar-src` (with an optional
 * `avatar-srcset`) as an attribute instead of slotting; its size is fixed at
 * 40px. Slotted avatars take precedence over `avatar-src`.
 *
 * @element nldd-identity
 *
 * @attr {string} text - Name line (e.g. "Jan Jansen and Piet Pietersen"); the fallback when the text slot is empty
 * @attr {string} supporting-text - Supporting text under the name line (a role or a date, for instance); the fallback when the supporting-text slot is empty
 * @attr {string} avatar-src - Source of a single avatar (an alternative to the avatars slot); ignored as soon as the avatars slot is filled
 * @attr {string} avatar-srcset - Responsive source set for the avatar-src image
 * @attr {string} avatar-alt - Alt text for the avatar-src image; empty means decorative
 *
 * @slot avatars - One avatar (`nldd-avatar` or `img`), or an `nldd-avatar-group` for more
 * @slot text - Name line as rich content (a link to the author's profile, for instance)
 * @slot supporting-text - Supporting text as rich content (a time element, for instance)
 */
import { LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { identityStyles } from './identity.styles.js';
import { identityTemplate } from './identity.template.js';
import '../avatar/avatar.js';
import '../avatar-group/avatar-group.js';

@customElement('nldd-identity')
export class NLDDIdentity extends LitElement {
	static override styles = identityStyles;

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	text = '';

	@property({ reflect: true, attribute: 'supporting-text', converter: reflectNonDefault<string>('') })
	supportingText = '';

	@property({ type: String, attribute: 'avatar-src' })
	avatarSrc = '';

	@property({ type: String, attribute: 'avatar-srcset' })
	avatarSrcset = '';

	@property({ type: String, attribute: 'avatar-alt' })
	avatarAlt = '';

	@state()
	_hasSlottedAvatars = false;

	/** Number of slotted avatars. Drives the responsive layout: with two or
	 *  more avatars, a small-container identity stacks the avatars above the
	 *  names (see the `data-multiple-avatars` hook in the template/styles).
	 *  A slotted group counts as the avatars it holds, not as one element. */
	@state()
	_avatarCount = 0;

	@state()
	_hasSlottedText = false;

	@state()
	_hasSlottedSupportingText = false;

	/** Tracks slot content so the text / supporting-text attribute fallbacks
	 *  only render when their slot is empty. Bound per slot in the template via
	 *  @slotchange, so Lit owns the listener lifecycle (it survives a
	 *  move-and-reinsert) — no manual connect/disconnect bookkeeping. slotchange
	 *  also fires for the initial assignment, so the first render is covered. */
	_onSlotChange = (e: Event): void => {
		const slot = e.target as HTMLSlotElement;
		const count = slot.assignedElements().length;
		if (slot.name === 'avatars') {
			this._avatarCount = slot.assignedElements()
				.reduce((total, el) => total + (el.localName === 'nldd-avatar-group' ? el.children.length : 1), 0);
			this._hasSlottedAvatars = count > 0;
		}
		else if (slot.name === 'text') this._hasSlottedText = count > 0;
		else if (slot.name === 'supporting-text') this._hasSlottedSupportingText = count > 0;
	};

	override render() {
		return identityTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-identity': NLDDIdentity;
	}
}
