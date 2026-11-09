import { describe, it, expect, beforeEach } from 'vitest';
import { getInputModality, isKeyboardMode, isMouseMode, isPointerMode, isTouchMode, _resetInputModalityForTesting } from './input-modality.js';

function dispatchPointerDown(pointerType: 'mouse' | 'pen' | 'touch'): void {
	document.dispatchEvent(new PointerEvent('pointerdown', { pointerType }));
}

describe('input-modality', () => {
	beforeEach(() => {
		_resetInputModalityForTesting();
		getInputModality(); // re-register listeners
	});

	it('defaults to mouse', () => {
		expect(getInputModality()).toBe('mouse');
		expect(isMouseMode()).toBe(true);
		expect(isPointerMode()).toBe(true);
		expect(isTouchMode()).toBe(false);
		expect(isKeyboardMode()).toBe(false);
	});

	// The listeners used to be registered on the first question, so someone who
	// tabbed straight into a freshly loaded page had already pressed Tab by the
	// time a component asked — and the first control swallowed its focus ring.
	it('registreert een toets die vóór de eerste vraag valt', () => {
		_resetInputModalityForTesting();
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
		expect(isKeyboardMode()).toBe(true);
	});

	it('ziet een toets die een component tegenhoudt', () => {
		const el = document.createElement('div');
		document.body.append(el);
		el.addEventListener('keydown', (e) => e.stopPropagation());
		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		el.remove();
		expect(isKeyboardMode()).toBe(true);
	});

	it('switches to keyboard after Tab keydown', () => {
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
		expect(getInputModality()).toBe('keyboard');
		expect(isKeyboardMode()).toBe(true);
		expect(isPointerMode()).toBe(false);
	});

	it('switches to keyboard after ArrowDown keydown', () => {
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
		expect(isKeyboardMode()).toBe(true);
	});

	it('switches to keyboard after Enter keydown', () => {
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
		expect(isKeyboardMode()).toBe(true);
	});

	it('switches to mouse after pointerdown with pointerType "mouse"', () => {
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
		expect(isKeyboardMode()).toBe(true);
		dispatchPointerDown('mouse');
		expect(isMouseMode()).toBe(true);
		expect(isPointerMode()).toBe(true);
		expect(isTouchMode()).toBe(false);
	});

	it('switches to touch after pointerdown with pointerType "touch"', () => {
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
		expect(isKeyboardMode()).toBe(true);
		dispatchPointerDown('touch');
		expect(isTouchMode()).toBe(true);
		expect(isPointerMode()).toBe(true);
		expect(isMouseMode()).toBe(false);
	});

	it('treats pen pointerdown as mouse (same hover/focus semantics)', () => {
		dispatchPointerDown('pen');
		expect(isMouseMode()).toBe(true);
		expect(isTouchMode()).toBe(false);
	});

	it('does not switch to keyboard for unrelated keys', () => {
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
		expect(isPointerMode()).toBe(true);
	});
});
