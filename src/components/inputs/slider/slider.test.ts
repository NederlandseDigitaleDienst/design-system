import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import { loadTokens } from '../../../test-tokens.js';
import type { NLDDSlider } from './slider.js';
import './slider.js';

const inputs = (el: NLDDSlider) => Array.from(el.shadowRoot!.querySelectorAll<HTMLInputElement>('.slider__input'));

/** Moves a native input the way a drag or a key does. */
function slide(input: HTMLInputElement, value: number, commit = true): void {
	input.value = String(value);
	input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
	if (commit) input.dispatchEvent(new Event('change', { bubbles: true }));
}

describe('nldd-slider', () => {
	let el: NLDDSlider;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture<NLDDSlider>('<nldd-slider accessible-label="Volume"></nldd-slider>');
		expect(el.shadowRoot).not.toBeNull();
		expect(inputs(el)).toHaveLength(1);
	});

	it('starts in the middle, and names its native slider', async () => {
		el = await fixture<NLDDSlider>('<nldd-slider accessible-label="Volume" min="0" max="10"></nldd-slider>');
		const [input] = inputs(el);
		expect(input.type).toBe('range');
		expect(input.value).toBe('5');
		expect(input.getAttribute('aria-label')).toBe('Volume');
	});

	it('snaps a value to its step and keeps it within min and max', async () => {
		el = await fixture<NLDDSlider>('<nldd-slider min="0" max="1" step="0.1" value="0.34"></nldd-slider>');
		expect(el._value).toBe(0.3);
		el.value = 5;
		await waitForUpdate(el);
		expect(el._value).toBe(1);
	});

	it('says the value the Dutch way, or as formatValue writes it', async () => {
		el = await fixture<NLDDSlider>('<nldd-slider min="0" max="2000" value="1200"></nldd-slider>');
		expect(inputs(el)[0].getAttribute('aria-valuetext')).toBe('1.200');
		expect(el.shadowRoot!.querySelector('.slider__tooltip--value')!.textContent!.trim()).toBe('1.200');
		el.formatValue = (value) => `€ ${value}`;
		await waitForUpdate(el);
		expect(inputs(el)[0].getAttribute('aria-valuetext')).toBe('€ 1200');
	});

	it('fires input while it moves and change when it is let go, once each', async () => {
		el = await fixture<NLDDSlider>('<nldd-slider></nldd-slider>');
		const seen: string[] = [];
		el.addEventListener('input', (event) => seen.push(`input ${(event as CustomEvent).detail.value}`));
		el.addEventListener('change', (event) => seen.push(`change ${(event as CustomEvent).detail.value}`));
		slide(inputs(el)[0], 70);
		expect(seen).toEqual(['input 70', 'change 70']);
	});

	it('submits its value under name, and resets with its form', async () => {
		const form = document.createElement('form');
		document.body.append(form);
		el = await fixture<NLDDSlider>('<nldd-slider name="volume" value="30"></nldd-slider>');
		form.append(el);
		await waitForUpdate(el);
		slide(inputs(el)[0], 80);
		expect(new FormData(form).get('volume')).toBe('80');
		form.reset();
		await waitForUpdate(el);
		expect(new FormData(form).get('volume')).toBe('30');
		form.remove();
	});

	it('keeps its value when a restored state is not a number', async () => {
		el = await fixture<NLDDSlider>('<nldd-slider name="volume" value="30"></nldd-slider>');
		el.formStateRestoreCallback('kapot');
		await waitForUpdate(el);
		expect(el._value).toBe(30);
		el.formStateRestoreCallback('70');
		await waitForUpdate(el);
		expect(el._value).toBe(70);
	});

	it('moves focus to its thumb', async () => {
		el = await fixture<NLDDSlider>('<nldd-slider></nldd-slider>');
		el.focus();
		expect(el.shadowRoot!.activeElement).toBe(inputs(el)[0]);
	});

	it('shows no tooltip with tooltip-timing="never", and still says the value', async () => {
		el = await fixture<NLDDSlider>('<nldd-slider tooltip-timing="never" value="30"></nldd-slider>');
		expect(el.shadowRoot!.querySelectorAll('.slider__tooltip')).toHaveLength(0);
		expect(inputs(el)[0].getAttribute('aria-valuetext')).toBe('30');
	});

	it('draws a histogram from a comma-separated attribute, coloring the bars within the value', async () => {
		el = await fixture<NLDDSlider>('<nldd-slider histogram="1, 4, 2, 8" min="0" max="100" value="50"></nldd-slider>');
		const bars = Array.from(el.shadowRoot!.querySelectorAll<HTMLElement>('.slider__histogram-bar'));
		expect(el.histogram).toEqual([1, 4, 2, 8]);
		expect(bars.map((bar) => bar.style.getPropertyValue('--_slider-histogram-bar-height'))).toEqual(['0.125', '0.5', '0.25', '1']);
		expect(bars.map((bar) => bar.classList.contains('is-selected'))).toEqual([true, true, false, false]);
		expect(el.shadowRoot!.querySelector('.slider__histogram')!.getAttribute('aria-hidden')).toBe('true');
	});

	it('colors the bars between the thumbs of a range', async () => {
		el = await fixture<NLDDSlider>('<nldd-slider range histogram="1,1,1,1,1" min="0" max="100" start-value="20" end-value="60"></nldd-slider>');
		const bars = Array.from(el.shadowRoot!.querySelectorAll('.slider__histogram-bar'));
		expect(bars.map((bar) => bar.classList.contains('is-selected'))).toEqual([false, true, true, false, false]);
	});

	it('presses its thumb on the full control height, drawn smaller and flush with the edges', async () => {
		const unloadTokens = loadTokens();
		el = await fixture<NLDDSlider>('<nldd-slider value="0" style="width: 400px"></nldd-slider>');
		const control = el.shadowRoot!.querySelector<HTMLElement>('.slider__control')!;
		const input = inputs(el)[0];
		const style = getComputedStyle(control);
		const hit = parseFloat(style.getPropertyValue('--_slider-thumb-hit-size'));
		const drawn = parseFloat(style.getPropertyValue('--_slider-thumb-size'));
		expect(hit).toBe(control.getBoundingClientRect().height);
		expect(input.getBoundingClientRect().left).toBe(control.getBoundingClientRect().left - (hit - drawn) / 2);
		unloadTokens();
	});

	describe('range', () => {
		it('has a thumb for each end, named after the slider', async () => {
			el = await fixture<NLDDSlider>('<nldd-slider range accessible-label="Prijs" min="0" max="100" start-value="20" end-value="80"></nldd-slider>');
			const [start, end] = inputs(el);
			expect([start.value, end.value]).toEqual(['20', '80']);
			expect([start.getAttribute('aria-label'), end.getAttribute('aria-label')]).toEqual(['Prijs, minimum', 'Prijs, maximum']);
		});

		it('keeps the thumbs from passing each other', async () => {
			el = await fixture<NLDDSlider>('<nldd-slider range start-value="20" end-value="60"></nldd-slider>');
			const [start, end] = inputs(el);
			slide(start, 90);
			expect(el._start).toBe(60);
			expect(start.value).toBe('60');
			slide(end, 10);
			expect(el._end).toBe(60);
		});

		it('fires both ends in its events, and submits both under name', async () => {
			const form = document.createElement('form');
			document.body.append(form);
			el = await fixture<NLDDSlider>('<nldd-slider range name="prijs" start-value="20" end-value="60"></nldd-slider>');
			form.append(el);
			await waitForUpdate(el);
			let detail: unknown;
			el.addEventListener('change', (event) => {
				detail = (event as CustomEvent).detail;
			});
			slide(inputs(el)[1], 70);
			expect(detail).toEqual({ startValue: 20, endValue: 70 });
			expect(new FormData(form).getAll('prijs')).toEqual(['20', '70']);
			form.remove();
		});

		it('moves the nearer thumb to a press on the track', async () => {
			const unloadTokens = loadTokens();
			el = await fixture<NLDDSlider>('<nldd-slider range min="0" max="100" start-value="20" end-value="80" style="width: 400px"></nldd-slider>');
			await waitForUpdate(el);
			const control = el.shadowRoot!.querySelector<HTMLElement>('.slider__control')!;
			const rect = control.getBoundingClientRect();
			const thumb = parseFloat(getComputedStyle(control).getPropertyValue('--_slider-thumb-size'));
			const at = (value: number) => rect.left + thumb / 2 + (rect.width - thumb) * value / 100;
			const press = (x: number, type: string, target: EventTarget = control) => target.dispatchEvent(new PointerEvent(type, { bubbles: true, composed: true, clientX: x, clientY: rect.top + rect.height / 2, button: 0 }));
			press(at(70), 'pointerdown');
			press(at(70), 'pointerup', window);
			expect([el._start, el._end]).toEqual([20, 70]);
			press(at(30), 'pointerdown');
			press(at(40), 'pointermove', window);
			press(at(40), 'pointerup', window);
			expect([el._start, el._end]).toEqual([40, 70]);
			unloadTokens();
		});

		it('lets the first move pick one of two stacked thumbs', async () => {
			const unloadTokens = loadTokens();
			for (const [to, moved] of [[30, 'start'], [70, 'end']] as const) {
				el = await fixture<NLDDSlider>('<nldd-slider range min="0" max="100" start-value="50" end-value="50" style="width: 400px"></nldd-slider>');
				await waitForUpdate(el);
				const control = el.shadowRoot!.querySelector<HTMLElement>('.slider__control')!;
				const rect = control.getBoundingClientRect();
				const thumb = parseFloat(getComputedStyle(control).getPropertyValue('--_slider-thumb-size'));
				const at = (value: number) => rect.left + thumb / 2 + (rect.width - thumb) * value / 100;
				const press = (x: number, type: string, target: EventTarget = control) => target.dispatchEvent(new PointerEvent(type, { bubbles: true, composed: true, clientX: x, clientY: rect.top + rect.height / 2, button: 0 }));
				expect(control.classList.contains('is-stacked')).toBe(true);
				press(at(50) + 3, 'pointerdown');
				expect([el._start, el._end]).toEqual([50, 50]);
				press(at(to), 'pointermove', window);
				press(at(to), 'pointerup', window);
				expect(moved === 'start' ? [el._start, el._end] : [el._end, el._start]).toEqual([to, 50]);
				expect(el.shadowRoot!.activeElement).toBe(el.shadowRoot!.querySelector(`.slider__input--${moved}`));
				cleanup(el);
			}
			unloadTokens();
		});

		it('joins the two tooltips where they would overlap', async () => {
			const unloadTokens = loadTokens();
			el = await fixture<NLDDSlider>('<nldd-slider range min="0" max="2000" start-value="200" end-value="1800" style="width: 400px"></nldd-slider>');
			await waitForUpdate(el);
			const slider = el.shadowRoot!.querySelector('.slider')!;
			expect(slider.classList.contains('is-merged')).toBe(false);
			el.startValue = 1750;
			await waitForUpdate(el);
			expect(slider.classList.contains('is-merged')).toBe(true);
			expect(el.shadowRoot!.querySelector('.slider__tooltip--both')!.textContent!.trim()).toBe('1.750 – 1.800');
			unloadTokens();
		});
	});

	it('lets go of the window when it is taken out mid-press', async () => {
		const unloadTokens = loadTokens();
		el = await fixture<NLDDSlider>('<nldd-slider range min="0" max="100" start-value="20" end-value="80" style="width: 400px"></nldd-slider>');
		const control = el.shadowRoot!.querySelector<HTMLElement>('.slider__control')!;
		const rect = control.getBoundingClientRect();
		const removed: string[] = [];
		const remove = window.removeEventListener.bind(window);
		window.removeEventListener = ((type: string, ...rest: [EventListenerOrEventListenerObject, (boolean | EventListenerOptions)?]) => {
			removed.push(type);
			remove(type, ...rest);
		}) as typeof window.removeEventListener;
		control.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, clientX: rect.left + 200, clientY: rect.top + rect.height / 2, button: 0 }));
		const input = vi.fn();
		el.addEventListener('input', input);
		const wrapper = el.parentElement!;
		el.remove();
		window.removeEventListener = remove;
		expect(removed).toEqual(expect.arrayContaining(['pointermove', 'pointerup', 'pointercancel', 'resize']));
		window.dispatchEvent(new PointerEvent('pointermove', { clientX: rect.left + 300 }));
		expect(input).not.toHaveBeenCalled();
		wrapper.append(el);
		unloadTokens();
	});

	it('lays its tooltips out again when it changes size', async () => {
		const unloadTokens = loadTokens();
		el = await fixture<NLDDSlider>('<nldd-slider range min="0" max="100" start-value="40" end-value="60" style="width: 600px"></nldd-slider>');
		await waitForUpdate(el);
		const slider = el.shadowRoot!.querySelector('.slider')!;
		expect(slider.classList.contains('is-merged')).toBe(false);
		el.style.width = '120px';
		await new Promise(requestAnimationFrame);
		await new Promise(requestAnimationFrame);
		expect(slider.classList.contains('is-merged')).toBe(true);
		unloadTokens();
	});
});
