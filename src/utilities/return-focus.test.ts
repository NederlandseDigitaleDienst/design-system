import { describe, it, expect, afterEach, vi } from 'vitest';
import { returnFocus } from './return-focus.js';

function setUp() {
	const root = document.createElement('div');
	root.innerHTML = `
		<button id="target">Trigger</button>
		<input id="elsewhere" aria-label="Veld">
		<div id="overlay"><button id="inside">Binnen</button></div>
	`;
	document.body.append(root);
	const get = <T extends HTMLElement>(id: string) => root.querySelector<T>(`#${id}`)!;
	return { root, target: get('target'), elsewhere: get('elsewhere'), overlay: get('overlay'), inside: get('inside') };
}

const pointer = () => document.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'mouse' }));
const keyboard = () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

describe('returnFocus', () => {
	let root: HTMLElement | undefined;
	afterEach(() => root?.remove());

	it('geeft de focus terug met een gewone focus() na het toetsenbord', () => {
		const els = setUp(); root = els.root;
		els.inside.focus();
		keyboard();
		const focus = vi.spyOn(els.target, 'focus');
		returnFocus(els.target, els.overlay);
		expect(focus).toHaveBeenCalledWith();
		expect(document.activeElement).toBe(els.target);
	});

	it('geeft de focus terug zonder ring na een aanwijzer', () => {
		const els = setUp(); root = els.root;
		els.inside.focus();
		pointer();
		const focus = vi.spyOn(els.target, 'focus');
		returnFocus(els.target, els.overlay);
		expect(focus).toHaveBeenCalledWith({ focusVisible: false });
		expect(document.activeElement).toBe(els.target);
	});

	it('geeft de focus terug als niets hem heeft', () => {
		const els = setUp(); root = els.root;
		pointer();
		returnFocus(els.target, els.overlay);
		expect(document.activeElement).toBe(els.target);
	});

	it('laat focus staan die de gebruiker ergens anders heen bracht', () => {
		const els = setUp(); root = els.root;
		els.elsewhere.focus();
		pointer();
		returnFocus(els.target, els.overlay);
		expect(document.activeElement).toBe(els.elsewhere);
	});

	it('laat een target zonder ring met rust na een aanwijzer', () => {
		// Nothing to clear, so no blur: that would fire blur and focus events for nothing.
		const els = setUp(); root = els.root;
		pointer();
		els.target.focus({ focusVisible: false } as FocusOptions);
		expect(els.target.matches(':focus-visible')).toBe(false);
		const blur = vi.spyOn(els.target, 'blur');
		returnFocus(els.target, els.overlay);
		expect(blur).not.toHaveBeenCalled();
		expect(document.activeElement).toBe(els.target);
	});

	it('doet niets zonder target of met body', () => {
		const els = setUp(); root = els.root;
		els.inside.focus();
		returnFocus(null, els.overlay);
		returnFocus(document.body, els.overlay);
		expect(document.activeElement).toBe(els.inside);
	});
});
