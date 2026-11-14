import { html, nothing, type TemplateResult } from 'lit';
import type { NLDDTerm } from './term.js';

export function termTemplate(component: NLDDTerm): TemplateResult {
	// Its own popover only for text: one that popovertarget names is the
	// consumer's, outside the sentence.
	const source = component.source
		? html`
			<nldd-spacer size="8"></nldd-spacer>
			<nldd-text
				size="sm"
				color="secondary"
			>
				${component._t('components.term.source-capitalize')}:
				${component.sourceHref
					? html`<nldd-link href=${component.sourceHref}>${component.source}</nldd-link>`
					: component.source}
			</nldd-text>
		`
		: nothing;
	const ownPopover = component.definition && !component.popovertarget
		? html`
			<nldd-popover
				accessible-label=${component._termText || nothing}
			>
				<nldd-container
					padding="16"
				>
					<nldd-text>
						${component.definition}
					</nldd-text>
					${source}
				</nldd-container>
			</nldd-popover>
		`
		: nothing;
	// A span, not a button: a button lays out as inline-block, so a term of
	// several words would not wrap with the sentence around it. The slot is
	// only read: the span shows the term without the whitespace around it,
	// which is why its content stays on the line of its tags.
	return html`
		<span class="term"
			role="button"
			tabindex="0"
			aria-haspopup="dialog"
			@pointerdown=${() => component._handlePointerdown()}
			@click=${(event: MouseEvent) => component._handleClick(event)}
			@keydown=${(event: KeyboardEvent) => component._handleKeydown(event)}
			@keyup=${(event: KeyboardEvent) => component._handleKeyup(event)}
		>${component._termDisplay}</span>
		<slot
			hidden
			@slotchange=${(event: Event) => component._handleSlotChange(event)}
		></slot>
		${ownPopover}
	`;
}
