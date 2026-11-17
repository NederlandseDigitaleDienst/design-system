import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { InterestIntent, type InterestIntentOptions } from './interest-intent.js';
import { _resetInputModalityForTesting } from './input-modality.js';

const touch = () => document.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'touch' }));

function setup(overrides: Partial<InterestIntentOptions> = {}) {
	let open = false;
	const show = vi.fn(() => { open = true; });
	const hide = vi.fn(() => { open = false; });
	const intent = new InterestIntent({
		showDelay: () => 500,
		hideDelay: () => 300,
		isOpen: () => open,
		show,
		hide,
		...overrides,
	});
	return { intent, show, hide, isOpen: () => open };
}

beforeEach(() => {
	vi.useFakeTimers();
	_resetInputModalityForTesting();
});
afterEach(() => {
	vi.useRealTimers();
});

describe('InterestIntent', () => {
	it('shows after the pointer rests, not when it passes over', () => {
		const { intent, isOpen } = setup();
		intent.enter();
		vi.advanceTimersByTime(499);
		intent.leave();
		vi.advanceTimersByTime(1000);
		expect(isOpen()).toBe(false);
		intent.enter();
		vi.advanceTimersByTime(500);
		expect(isOpen()).toBe(true);
	});

	it('shows at once without a show delay', () => {
		const { intent, isOpen } = setup({ showDelay: () => 0 });
		intent.enter();
		expect(isOpen()).toBe(true);
	});

	it('gives the pointer the hide delay to cross onto what it shows', () => {
		const { intent, isOpen } = setup();
		intent.enter();
		vi.advanceTimersByTime(500);
		intent.leave();
		vi.advanceTimersByTime(200);
		// Onto the overlay.
		intent.enter();
		vi.advanceTimersByTime(1000);
		expect(isOpen()).toBe(true);
		intent.leave();
		vi.advanceTimersByTime(300);
		expect(isOpen()).toBe(false);
	});

	it('shows and hides at once on focus', () => {
		const { intent, isOpen } = setup();
		intent.focus();
		expect(isOpen()).toBe(true);
		intent.blur();
		expect(isOpen()).toBe(false);
	});

	it('ignores the focus a tap gives', () => {
		touch();
		const { intent, isOpen } = setup();
		intent.focus();
		expect(isOpen()).toBe(false);
	});

	it('stays while focus holds it after the pointer leaves, and the other way round', () => {
		const { intent, isOpen } = setup();
		intent.focus();
		intent.enter();
		intent.leave();
		vi.advanceTimersByTime(1000);
		expect(isOpen()).toBe(true);
		intent.enter();
		intent.blur();
		expect(isOpen()).toBe(true);
	});

	it('keeps away after Escape until the pointer and focus have both left', () => {
		const { intent, isOpen } = setup();
		intent.focus();
		intent.enter();
		intent.dismiss();
		expect(isOpen()).toBe(false);
		intent.leave();
		vi.advanceTimersByTime(1000);
		intent.enter();
		vi.advanceTimersByTime(1000);
		// Focus never left: still dismissed.
		expect(isOpen()).toBe(false);
		intent.leave();
		intent.blur();
		intent.focus();
		expect(isOpen()).toBe(true);
	});

	it('closes on activation, and a pending show with it', () => {
		const { intent, isOpen } = setup();
		intent.focus();
		intent.close();
		expect(isOpen()).toBe(false);
		intent.enter();
		intent.close();
		vi.advanceTimersByTime(1000);
		expect(isOpen()).toBe(false);
	});

	it('holds on a long press until something closes it', () => {
		const { intent, isOpen } = setup();
		intent.hold();
		expect(isOpen()).toBe(true);
		intent.dismiss();
		expect(isOpen()).toBe(false);
	});

	it('does not show what is not available', () => {
		let available = false;
		const { intent, isOpen } = setup({ available: () => available });
		intent.focus();
		expect(isOpen()).toBe(false);
		available = true;
		intent.update();
		expect(isOpen()).toBe(true);
	});

	it('forgets everything on reset, without showing or hiding', () => {
		const { intent, show, hide } = setup();
		intent.enter();
		intent.reset();
		vi.advanceTimersByTime(1000);
		expect(show).not.toHaveBeenCalled();
		expect(hide).not.toHaveBeenCalled();
	});
});
