import { html, nothing, TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import type { NLDDSlider } from './slider.js';
import '../../content/icon/icon.js';

function thumbInput(component: NLDDSlider, thumb: 'value' | 'start' | 'end', value: number): TemplateResult {
	return html`
		<input class="slider__input slider__input--${thumb}"
			type="range"
			min=${component.min}
			max=${component.max}
			step=${component.step}
			.value=${String(value)}
			aria-label=${component._label(thumb) ?? nothing}
			aria-valuetext=${component._format(value)}
			aria-invalid=${component.invalid ? 'true' : nothing}
			?disabled=${component.disabled}
			@input=${(event: Event) => component._handleInput(event, thumb)}
			@change=${component._handleChange}
		>
	`;
}

function tooltip(thumb: 'value' | 'start' | 'end' | 'both', text: string): TemplateResult {
	return html`
		<span class="slider__tooltip slider__tooltip--${thumb}"
			aria-hidden="true"
		>
			${text}
		</span>
	`;
}

/** Bars of equal width over the track; a bar whose middle lies within the
 *  chosen value or range is colored. */
function histogram(component: NLDDSlider, start: number, end: number): TemplateResult {
	const counts = component.histogram;
	const highest = Math.max(...counts, 1);
	const from = component._fraction(start);
	const to = component._fraction(end);
	return html`
		<span class="slider__histogram"
			aria-hidden="true"
		>
			${counts.map((count, index) => {
				const place = (index + 0.5) / counts.length;
				return html`
					<span class=${classMap({ 'slider__histogram-bar': true, 'is-selected': place >= from - 1e-9 && place <= to + 1e-9 })}
						style=${styleMap({ '--_slider-histogram-bar-height': String(count / highest) })}
					></span>
				`;
			})}
		</span>
	`;
}

export function sliderTemplate(component: NLDDSlider): TemplateResult {
	const range = component.range;
	const start = range ? component._start : component.min;
	const end = range ? component._end : component._value;
	// The thumb that sits on top when both are on one value: the start one at the
	// far end, so it can still be pulled back, and the end one otherwise.
	const startOnTop = range && start === end && start > (component.min + component.max) / 2;
	const tooltips = component.tooltipTiming !== 'never';

	return html`
		<div class="slider">
			${component.startIcon ? html`
				<span class="slider__start-icon">
					<nldd-icon icon=${component.startIcon}></nldd-icon>
				</span>
			` : nothing}
			<div class=${classMap({ 'slider__control': true, 'has-histogram': component.histogram.length > 0, 'is-active': component._active, 'is-start-on-top': startOnTop, 'is-stacked': range && start === end })}
				style=${styleMap({
					'--_slider-start': String(component._fraction(start)),
					'--_slider-end': String(component._fraction(end)),
				})}
				@pointerdown=${component._handlePointerDown}
			>
				${component.histogram.length ? histogram(component, start, end) : nothing}
				<span class="slider__track"></span>
				<span class="slider__fill"></span>
				${range ? html`
					${thumbInput(component, 'start', start)}
					${thumbInput(component, 'end', end)}
					${tooltips ? html`
						${tooltip('start', component._format(start))}
						${tooltip('end', component._format(end))}
						${tooltip('both', `${component._format(start)} – ${component._format(end)}`)}
					` : nothing}
				` : html`
					${thumbInput(component, 'value', end)}
					${tooltips ? tooltip('value', component._format(end)) : nothing}
				`}
			</div>
			${component.endIcon ? html`
				<span class="slider__end-icon">
					<nldd-icon icon=${component.endIcon}></nldd-icon>
				</span>
			` : nothing}
		</div>
	`;
}
