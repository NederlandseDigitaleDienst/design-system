import { html, nothing, TemplateResult } from 'lit';
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';
import type { NLDDTitle } from './title.js';

// SAFETY: the only tags unsafeStatic ever sees. A heading-level outside the map
// renders a <p>, so no tag name is derived from input.
const HEADING_TAGS: Record<number, ReturnType<typeof unsafeStatic>> = {
	1: unsafeStatic('h1'),
	2: unsafeStatic('h2'),
	3: unsafeStatic('h3'),
	4: unsafeStatic('h4'),
	5: unsafeStatic('h5'),
	6: unsafeStatic('h6'),
};

function renderText(component: NLDDTitle) {
	if (!component.text || component._hasDefaultSlotted) return nothing;
	const tag = component.headingLevel ? HEADING_TAGS[component.headingLevel] : undefined;
	return tag
		? staticHtml`<${tag} class="title__text">${component.text}</${tag}>`
		: html`<p class="title__text">${component.text}</p>`;
}

export function titleTemplate(component: NLDDTitle): TemplateResult {
	return html`
		<div class="title">
			<div class="title__title-group">
				${component.overline && !component._hasOverlineSlotted ? html`<p class="title__overline">${component.overline}</p>` : nothing}
				<slot name="overline" @slotchange=${component._onSlotChange}></slot>
				${renderText(component)}
				<slot @slotchange=${component._onSlotChange}></slot>
				${component.supportingText && !component._hasSupportingTextSlotted ? html`<p class="title__supporting-text">${component.supportingText}</p>` : nothing}
				<slot name="supporting-text" @slotchange=${component._onSlotChange}></slot>
			</div>
			<div class="title__end">
				<slot name="end"></slot>
			</div>
		</div>
	`;
}
