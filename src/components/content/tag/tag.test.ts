import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './tag.js';
import type { NLDDTag } from './tag.js';

describe('nldd-tag', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-tag text="Tag"></nldd-tag>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('renders text from text attribute', async () => {
		el = await fixture('<nldd-tag text="Nieuw"></nldd-tag>');
		await waitForUpdate(el);
		const text = el.shadowRoot!.querySelector('.tag__text')!;
		expect(text.textContent).toContain('Nieuw');
	});

	it('renders slotted content when text attribute is not set', async () => {
		el = await fixture('<nldd-tag><span>Concept</span></nldd-tag>');
		await waitForUpdate(el);
		const slot = el.shadowRoot!.querySelector('.tag__text slot') as HTMLSlotElement;
		expect(slot).not.toBeNull();
		const assigned = slot.assignedNodes({ flatten: true });
		expect(assigned.some(n => n.textContent === 'Concept')).toBe(true);
	});

	it('reflects color attribute', async () => {
		el = await fixture('<nldd-tag color="success" text="OK"></nldd-tag>');
		await waitForUpdate(el);
		expect(el.getAttribute('color')).toBe('success');
	});

	it('renders icon when provided', async () => {
		el = await fixture('<nldd-tag icon="check-mark" text="Done"></nldd-tag>');
		await waitForUpdate(el);
		const icon = el.shadowRoot!.querySelector('nldd-icon');
		expect(icon).not.toBeNull();
		expect(icon!.getAttribute('icon')).toBe('check-mark');
	});

	it('sets aria-label and role=img on icon-only tag with accessible-label', async () => {
		el = await fixture('<nldd-tag icon="check-mark" accessible-label="Geverifieerd"></nldd-tag>');
		await waitForUpdate(el);
		const tag = el.shadowRoot!.querySelector('.tag')!;
		expect(tag.getAttribute('aria-label')).toBe('Geverifieerd');
		expect(tag.getAttribute('role')).toBe('img');
	});

	it('does not set role=img or aria-label when visible text is present', async () => {
		el = await fixture('<nldd-tag icon="check-mark" text="Done" accessible-label="Geverifieerd"></nldd-tag>');
		await waitForUpdate(el);
		const tag = el.shadowRoot!.querySelector('.tag')!;
		expect(tag.hasAttribute('role')).toBe(false);
		expect(tag.hasAttribute('aria-label')).toBe(false);
	});


	describe('slot-based detection', () => {
		it('detecteert slotted text wanneer text property leeg is', async () => {
			el = await fixture('<nldd-tag>Concept</nldd-tag>');
			await waitForUpdate(el);
			// .tag__text renders when there is slotted text
			expect(el.shadowRoot!.querySelector('.tag__text')).not.toBeNull();
		});

		it('detecteert slotted icon via slot="icon"', async () => {
			el = await fixture(`
				<nldd-tag text="Status">
					<svg slot="icon" width="12" height="12"><circle cx="6" cy="6" r="6"/></svg>
				</nldd-tag>
			`);
			await waitForUpdate(el);
			// .tag__icon renders, with a slot[name=icon] inside it (no <nldd-icon>)
			const iconWrapper = el.shadowRoot!.querySelector('.tag__icon');
			expect(iconWrapper).not.toBeNull();
			const slot = iconWrapper!.querySelector('slot[name="icon"]') as HTMLSlotElement;
			expect(slot).not.toBeNull();
			expect(slot.assignedElements().length).toBe(1);
		});

		it('rendert alleen het icon-blok bij slotted icon zonder text', async () => {
			// Slot-only icon (no text property, no default slot content)
			el = await fixture(`
				<nldd-tag accessible-label="Status">
					<svg slot="icon" width="12" height="12"><circle cx="6" cy="6" r="6"/></svg>
				</nldd-tag>
			`);
			await waitForUpdate(el);
			expect(el.shadowRoot!.querySelector('.tag__icon')).not.toBeNull();
			expect(el.shadowRoot!.querySelector('.tag__text')).toBeNull();
		});

		it('zet role="img" en aria-label op slotted-icon-only tag', async () => {
			// Regression: iconOnly used to check component.icon (the property) only,
			// not _hasIcon. Slotted-icon-only tags therefore got no role/aria-label
			// and had no accessible name.
			el = await fixture(`
				<nldd-tag accessible-label="Status">
					<svg slot="icon" width="12" height="12"><circle cx="6" cy="6" r="6"/></svg>
				</nldd-tag>
			`);
			await waitForUpdate(el);
			const tag = el.shadowRoot!.querySelector('.tag')!;
			expect(tag.getAttribute('role')).toBe('img');
			expect(tag.getAttribute('aria-label')).toBe('Status');
		});

		it('reageert op dynamisch toegevoegde slotted content via MutationObserver', async () => {
			el = await fixture('<nldd-tag></nldd-tag>');
			await waitForUpdate(el);
			// No text block to begin with
			expect(el.shadowRoot!.querySelector('.tag__text')).toBeNull();

			// Add text dynamically
			el.appendChild(document.createTextNode('Live'));
			await new Promise(resolve => setTimeout(resolve, 0));
			await waitForUpdate(el);

			expect(el.shadowRoot!.querySelector('.tag__text')).not.toBeNull();
		});

		it('reageert op dynamisch toegevoegde slotted icon', async () => {
			el = await fixture('<nldd-tag text="Status"></nldd-tag>');
			await waitForUpdate(el);
			expect(el.shadowRoot!.querySelector('.tag__icon')).toBeNull();

			const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			svg.setAttribute('slot', 'icon');
			el.appendChild(svg);
			await new Promise(resolve => setTimeout(resolve, 0));
			await waitForUpdate(el);

			expect(el.shadowRoot!.querySelector('.tag__icon')).not.toBeNull();
		});

		it('whitespace-only text-nodes activeren _hasSlotText niet', async () => {
			el = await fixture('<nldd-tag>   \n   </nldd-tag>');
			await waitForUpdate(el);
			// Whitespace alone must not render a text block
			expect(el.shadowRoot!.querySelector('.tag__text')).toBeNull();
		});
	});


	describe('variant', () => {
		const hasText = (e: Element) => e.shadowRoot!.querySelector('.tag__text') !== null;
		const hasIcon = (e: Element) => e.shadowRoot!.querySelector('.tag__icon') !== null;

		describe('auto-detect (no explicit variant)', () => {
			it('text only → text, no icon', async () => {
				el = await fixture<NLDDTag>('<nldd-tag text="Label"></nldd-tag>');
				await waitForUpdate(el);
				expect((el as NLDDTag)._effectiveVariant).toBe('text');
				expect(hasText(el)).toBe(true);
				expect(hasIcon(el)).toBe(false);
			});

			it('icon only → icon, no text', async () => {
				el = await fixture<NLDDTag>('<nldd-tag icon="check-mark" accessible-label="OK"></nldd-tag>');
				await waitForUpdate(el);
				expect((el as NLDDTag)._effectiveVariant).toBe('icon');
				expect(hasIcon(el)).toBe(true);
				expect(hasText(el)).toBe(false);
			});

			it('icon + text → icon-and-text', async () => {
				el = await fixture<NLDDTag>('<nldd-tag icon="check-mark" text="Done"></nldd-tag>');
				await waitForUpdate(el);
				expect((el as NLDDTag)._effectiveVariant).toBe('icon-and-text');
				expect(hasIcon(el)).toBe(true);
				expect(hasText(el)).toBe(true);
			});
		});

		describe('explicit override', () => {
			it('variant="text" hides the icon even when an icon is set', async () => {
				el = await fixture<NLDDTag>('<nldd-tag variant="text" icon="check-mark" text="Done"></nldd-tag>');
				await waitForUpdate(el);
				expect(hasText(el)).toBe(true);
				expect(hasIcon(el)).toBe(false);
			});

			it('variant="icon" hides the text even when text is set', async () => {
				el = await fixture<NLDDTag>('<nldd-tag variant="icon" icon="check-mark" text="Done" accessible-label="Done"></nldd-tag>');
				await waitForUpdate(el);
				expect(hasIcon(el)).toBe(true);
				expect(hasText(el)).toBe(false);
			});

			it('variant="icon-and-text" shows both', async () => {
				el = await fixture<NLDDTag>('<nldd-tag variant="icon-and-text" icon="check-mark" text="Done"></nldd-tag>');
				await waitForUpdate(el);
				expect(hasIcon(el)).toBe(true);
				expect(hasText(el)).toBe(true);
			});
		});

		describe('variant="icon" icon-placeholder fallback', () => {
			it('renders the icon-placeholder when no icon is provided', async () => {
				el = await fixture<NLDDTag>('<nldd-tag variant="icon" text="Done" accessible-label="Done"></nldd-tag>');
				await waitForUpdate(el);
				expect(hasIcon(el)).toBe(true);
				// The placeholder lives in the icon slot's default content.
				const placeholder = el.shadowRoot!.querySelector('nldd-icon[icon="icon-placeholder"]');
				expect(placeholder).not.toBeNull();
			});

			it('uses the provided icon when one is set', async () => {
				el = await fixture<NLDDTag>('<nldd-tag variant="icon" icon="check-mark" accessible-label="OK"></nldd-tag>');
				await waitForUpdate(el);
				const icon = el.shadowRoot!.querySelector('.tag__icon nldd-icon');
				expect(icon!.getAttribute('icon')).toBe('check-mark');
			});
		});
	});
});
