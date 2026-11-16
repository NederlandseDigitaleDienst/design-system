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
				<p>
					${component._t('components.term.source-capitalize')}:
					${component.sourceHref
						? html`<nldd-link href=${component.sourceHref}>${component.source}</nldd-link>`
						: component.source}
				</p>
			</nldd-text>
		`
		: nothing;
	const definition = html`
		<nldd-text text="${component.definition}"></nldd-text>
		${source}
	`;
	// On sm the popover is a bottom sheet over the sentence, so it names the
	// term itself: as a title that goes into the bar once a long definition
	// scrolls, with a button to close it.
	const content = component._isSm
		? html`
			<nldd-page sticky-header>
				<nldd-top-title-bar
					slot="header"
					text=${component._termText}
					dismiss-text=${component._t('components.term.sheet-dismiss-action')}
					collapse-anchor="term-title"
				></nldd-top-title-bar>
				<nldd-container padding="16">
					<nldd-title
						id="term-title"
						size="display-4"
						text=${component._termText}
					></nldd-title>
					<nldd-spacer size="8"></nldd-spacer>
					${definition}
				</nldd-container>
			</nldd-page>
		`
		: html`<nldd-container padding="16">${definition}</nldd-container>`;
	const ownPopover = component.definition && !component.popovertarget
		? html`
			<nldd-popover
				accessible-label=${component._termText || nothing}
			>${content}</nldd-popover>
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
			@blur=${() => component._handleBlur()}
		>${component._termDisplay}</span>
		<slot
			hidden
			@slotchange=${() => component._handleSlotChange()}
		></slot>
		${ownPopover}
	`;
}
