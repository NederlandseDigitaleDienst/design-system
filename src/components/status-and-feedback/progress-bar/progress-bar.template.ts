import { html, nothing } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { classMap } from 'lit/directives/class-map.js';
import type { NLDDProgressBar, NLDDProgressBarSegmentIndicator } from './progress-bar.js';

export function segmentIndicatorTemplate(component: NLDDProgressBarSegmentIndicator) {
	const text = component._effectiveTooltip;
	// Only render the tooltip wrapper when there's actual text — avoids
	// mounting an inert nldd-tooltip element with timing="never".
	if (!text) {
		return html`
			<div class="progress-bar__segment-indicator">
				<span class="progress-bar__segment-indicator-tooltip-area"></span>
			</div>
		`;
	}
	// tabindex=0 makes the hover area keyboard-reachable so SR users can
	// land on it and have nldd-tooltip surface its text (WCAG 2.1.1).
	// role="img" exposes the element to the AT tree with its aria-label as
	// accessible name — a bare <span> + aria-label is silently ignored by
	// most screen readers (a labeled generic element has no semantic
	// role to anchor the name to). role="img" fits because the hover area
	// is a focusable visual representation of a data value, not an
	// activator (role="button" would promise an action that doesn't
	// happen). nldd-tooltip listens to focus/blur on slotted content, so
	// no extra handlers needed here.
	return html`
		<div class="progress-bar__segment-indicator">
			<nldd-tooltip
				text=${text}
				timing="instant"
			>
				<span class="progress-bar__segment-indicator-tooltip-area"
					tabindex="0"
					role="img"
					aria-label=${text}
				></span>
			</nldd-tooltip>
		</div>
	`;
}

export function progressBarTemplate(component: NLDDProgressBar, onSlotChange: () => void) {
	// Caption renders when there's a label or an inline value to show
	// (value-display="inline"). _hasCaption stays empty during indeterminate (no
	// value), so the row doesn't pop in/out on a determinate↔indeterminate flip.
	const hasCaption = component._hasCaption;
	const isExiting = component._indeterminateExiting;
	const isEntering = component._indeterminateEntering;
	// The indeterminate indicator renders while indeterminate, and during its exit-fade.
	const showIndeterminateIndicator = (component.indeterminate || isExiting) && !component._hasSegmentIndicators;
	// The internal segment-indicator renders while determinate, and during an
	// enter-shrink (otherwise it can't shrink — it would unmount immediately).
	// Its dynamic attributes (width, mode, tooltip-text, grow/shrink) are applied
	// by _syncSegmentIndicators so the slotted and internal paths share one code path.
	const showInternalSegmentIndicator = !component._hasSegmentIndicators
		&& component.value !== null && component.value > 0
		&& (!component.indeterminate || isEntering);
	// Round so aria-valuenow doesn't produce floats (some screenreaders
	// read them out literally — "49 point 999 percent").
	const ariaValueNow = component.indeterminate ? undefined : Math.round(component._totalValue);
	// Accessible name: use aria-label with the visible label text or a
	// translated fallback. aria-labelledby would be cleaner but VoiceOver on
	// Safari can't resolve IDREFs scoped to a shadow root, so we duplicate
	// the string into aria-label for cross-browser screen-reader support.
	const ariaLabel = component.text || component._t('components.progress-bar.accessible-label');
	return html`
		${hasCaption ? html`
			<div class="progress-bar__caption">
				<span class="progress-bar__text">${component.text}</span>
				${component.valueDisplay === 'inline' && component._displayValue ? html`<span class="progress-bar__supporting-text">${component._displayValue}</span>` : nothing}
			</div>
		` : nothing}
		<div class="progress-bar__track"
			role="progressbar"
			aria-label=${ariaLabel}
			aria-valuemin="0"
			aria-valuemax=${component.max}
			aria-valuenow=${ifDefined(ariaValueNow)}
			aria-valuetext=${component._ariaValueText}
		>
			${showInternalSegmentIndicator ? html`
				<nldd-progress-bar-segment-indicator
					.value=${component.value!}
					color=${component.color}
				></nldd-progress-bar-segment-indicator>
			` : nothing}
			<slot @slotchange=${onSlotChange}></slot>
			${showIndeterminateIndicator ? html`
				<div class=${classMap({
					'progress-bar__indeterminate-indicator': true,
					'is-fading-out': isExiting && !component.indeterminate,
					'is-fading-in': isEntering && component.indeterminate,
				})}></div>
			` : nothing}
		</div>
	`;
}
