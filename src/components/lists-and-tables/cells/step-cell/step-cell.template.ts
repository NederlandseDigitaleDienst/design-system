import { html, nothing, type TemplateResult } from 'lit';
import type { NLDDStepCell } from './step-cell.js';

export function stepCellTemplate(component: NLDDStepCell): TemplateResult {
	// No dot means no point where a fill could change over, so the row draws one
	// line from edge to edge instead of two halves. `only` says the track runs
	// neither above nor below, which here leaves nothing to draw.
	if (component.level === 'none') {
		return html`
			<div class="step-cell">
				${component.position === 'only' ? nothing : html`<div class="step-cell__full-line"></div>`}
			</div>
		`;
	}

	// Where you stand in the series decides which halves are drawn; `line` decides
	// how they are filled, and draws a half the position left out when it names
	// one as covered.
	const hasTop = component.position === 'between' || component.position === 'last';
	const hasBottom = component.position === 'between' || component.position === 'first';
	const showTopLine = hasTop || component.line === 'top' || component.line === 'both';
	const showBottomLine = hasBottom || component.line === 'bottom' || component.line === 'both';
	const marker = !component.showsContent
		? nothing
		: component.icon
			? html`<nldd-icon class="step-cell__icon" icon=${component.icon}></nldd-icon>`
			: component.text
				? html`<span class="step-cell__text">${component.text}</span>`
				: nothing;
	// The attributes are the shorthand for the common cases; the slot is there for
	// anything else.
	const content = component.showsContent
		? html`${marker}<slot></slot>`
		: marker;

	return html`
		<div class="step-cell">
			${showTopLine ? html`<div class="step-cell__top-line"></div>` : nothing}
			<div class="step-cell__marker">${content}</div>
			${showBottomLine ? html`<div class="step-cell__bottom-line"></div>` : nothing}
		</div>
	`;
}
