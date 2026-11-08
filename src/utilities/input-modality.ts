export type InputModality = 'keyboard' | 'mouse' | 'touch';

let modality: InputModality = 'mouse';
let initialized = false;
let controller: AbortController | null = null;

function init(): void {
	if (initialized) return;
	initialized = true;
	controller = new AbortController();
	const { signal } = controller;

	// Capture, so a key or press a component stops (Escape in nldd-popover)
	// still counts.
	document.addEventListener('keydown', (e: KeyboardEvent) => {
		if (['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' ', 'Escape'].includes(e.key)) {
			modality = 'keyboard';
		}
	}, { signal, capture: true });

	// pointerdown carries `pointerType` ('mouse' | 'pen' | 'touch'). Use it so
	// we can distinguish touch from mouse in one listener. Pen is grouped with
	// mouse: stylus users generally expect the same hover/focus semantics.
	document.addEventListener('pointerdown', (e: PointerEvent) => {
		modality = e.pointerType === 'touch' ? 'touch' : 'mouse';
	}, { signal, capture: true });
}

export function getInputModality(): InputModality {
	init();
	return modality;
}

// At import, not on the first question: the listeners have to be in place
// before the first key press. Initialising lazily meant that someone who tabs
// straight into the page had already pressed Tab by the time a component asked,
// so the modality still read 'mouse' and the first control swallowed its focus
// ring.
if (typeof document !== 'undefined') init();

export function isKeyboardMode(): boolean {
	return getInputModality() === 'keyboard';
}

/** True for mouse OR touch — any non-keyboard input. */
export function isPointerMode(): boolean {
	const m = getInputModality();
	return m === 'mouse' || m === 'touch';
}

export function isMouseMode(): boolean {
	return getInputModality() === 'mouse';
}

export function isTouchMode(): boolean {
	return getInputModality() === 'touch';
}

/** @internal Reset state for testing only. Re-registers straight away, the way
 *  importing the module does, so a test sees the same starting position as a
 *  freshly loaded page. */
export function _resetInputModalityForTesting(): void {
	controller?.abort();
	controller = null;
	modality = 'mouse';
	initialized = false;
	if (typeof document !== 'undefined') init();
}
