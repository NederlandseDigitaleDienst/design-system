import { html, nothing } from 'lit';
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';
import type { NLDDIdentity } from './identity.js';

const DIV = unsafeStatic('div');
const P = unsafeStatic('p');

export function identityTemplate(component: NLDDIdentity) {
	// A filled slot gets a <div> around it: the <p> of the app carries the meaning.
	const textTag = component._hasSlottedText ? DIV : P;
	const supportingTextTag = component._hasSlottedSupportingText ? DIV : P;
	const hasText = Boolean(component.text) || component._hasSlottedText;
	const hasSupportingText = Boolean(component.supportingText) || component._hasSlottedSupportingText;
	const hasAvatars = component._hasSlottedAvatars || Boolean(component.avatarSrc);
	// Single-avatar convenience: an internal avatar from avatar-src, only when
	// nothing is slotted (the slot always wins). It goes through the group like
	// any other avatar, so one and many look the same. A non-empty avatar-alt
	// labels it; an empty one marks it decorative (the name is in the text).
	const avatarImage = component.avatarSrc && !component._hasSlottedAvatars
		? html`<nldd-avatar-group>
				<nldd-avatar
					src=${component.avatarSrc}
					srcset=${component.avatarSrcset || nothing}
					name=${component.avatarAlt || nothing}
					?decorative=${!component.avatarAlt}
				></nldd-avatar>
			</nldd-avatar-group>`
		: nothing;
	return staticHtml`
		<div class="identity"
			?data-multiple-avatars=${component._avatarCount >= 2}
		>
			<div class="identity__avatars"
				?hidden=${!hasAvatars}
			>
				<slot
					name="avatars"
					@slotchange=${component._onSlotChange}
				></slot>
				${avatarImage}
			</div>
			<div class="identity__text-area"
				?hidden=${!hasText && !hasSupportingText}
			>
				<${textTag} class="identity__text"
					?hidden=${!hasText}
				><slot name="text" @slotchange=${component._onSlotChange}>${component.text}</slot></${textTag}>
				<${supportingTextTag} class="identity__supporting-text"
					?hidden=${!hasSupportingText}
				><slot name="supporting-text" @slotchange=${component._onSlotChange}>${component.supportingText}</slot></${supportingTextTag}>
			</div>
		</div>
	`;
}
