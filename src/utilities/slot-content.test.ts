import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../test-utils.js';
import { hasSlotContent } from './slot-content.js';
import '../components/actions/button/button.js';
import '../components/actions/icon-button/icon-button.js';
import '../components/actions/menu/menu-item.js';
import '../components/inputs/toggle-button/toggle-button.js';
import '../components/inputs/segmented-control/segmented-control.js';
import '../components/content/tag/tag.js';
import '../components/content/token/token.js';
import '../components/navigation/link/link.js';
import '../components/navigation/tab-bar/tab-bar.js';
import '../components/navigation/breadcrumbs/breadcrumbs.js';
import '../components/layout/page-footer/page-footer.js';
import '../components/status-and-feedback/step-bar/step-bar.js';
import '../components/lists-and-tables/cells/icon-cell/icon-cell.js';

describe('hasSlotContent', () => {
	let el: HTMLElement;
	afterEach(() => cleanup(el));

	const slotOf = async (inner: string) => {
		el = await fixture('<div></div>');
		el.attachShadow({ mode: 'open' }).innerHTML = '<slot></slot>';
		el.innerHTML = inner;
		return el.shadowRoot!.querySelector('slot')!;
	};

	it('telt een element en tekst, geen witruimte', async () => {
		expect(hasSlotContent(await slotOf('<img alt="">'))).toBe(true);
		cleanup(el);
		expect(hasSlotContent(await slotOf('Tekst'))).toBe(true);
		cleanup(el);
		expect(hasSlotContent(await slotOf('\n\t  '))).toBe(false);
	});
});

// Every component that takes both an attribute and a slot for the same thing
// lets the slot win, and shows the attribute while the slot is empty.
describe('slot wint van het attribuut', () => {
	let el: HTMLElement;
	afterEach(() => cleanup(el));

	const settle = async () => {
		await waitForUpdate(el);
		await waitForUpdate(el);
	};

	const TEXT = [
		['nldd-token', ''],
		['nldd-tag', ''],
		['nldd-link', 'href="#"'],
		['nldd-breadcrumbs-item', 'href="#"'],
		['nldd-page-footer-legal-bar-item', 'href="#"'],
		['nldd-step-bar-item', ''],
	];

	for (const [tag, attrs] of TEXT) {
		it(`${tag}: tekst in het slot wint, witruimte niet`, async () => {
			el = await fixture(`<${tag} ${attrs} text="Attribuut">Slot</${tag}>`);
			await settle();
			expect(el.shadowRoot!.textContent).not.toContain('Attribuut');
			cleanup(el);
			el = await fixture(`<${tag} ${attrs} text="Attribuut">
			</${tag}>`);
			await settle();
			expect(el.shadowRoot!.textContent).toContain('Attribuut');
		});
	}

	const ICON = [
		['nldd-button', 'start-icon', 'start-icon', 'text="Opslaan"'],
		['nldd-button', 'end-icon', 'end-icon', 'text="Opslaan"'],
		['nldd-icon-button', 'icon', 'icon', 'text="Opslaan"'],
		['nldd-menu-item', 'icon', 'icon', 'text="Opslaan"'],
		['nldd-toggle-button', 'icon', 'icon', 'text="Opslaan"'],
		['nldd-segmented-control-item', 'icon', 'icon', 'text="Opslaan"'],
		['nldd-tag', 'icon', 'icon', 'text="Opslaan"'],
		['nldd-link', 'start-icon', 'start-icon', 'href="#" text="Opslaan"'],
		['nldd-link', 'end-icon', 'end-icon', 'href="#" text="Opslaan"'],
		['nldd-tab-bar-item', 'icon', 'icon', 'text="Opslaan"'],
	];

	for (const [tag, attr, slot, attrs] of ICON) {
		it(`${tag}: een icoon in slot="${slot}" wint van ${attr}`, async () => {
			el = await fixture(`<${tag} ${attrs} ${attr}="star"><img slot="${slot}" alt=""></${tag}>`);
			await settle();
			const shown = el.shadowRoot!.querySelector<HTMLSlotElement>(`slot[name="${slot}"]`)!.assignedNodes({ flatten: true });
			expect(shown).toEqual([el.querySelector('img')]);
		});
	}

	it('nldd-icon-cell: inhoud in het slot wint, witruimte niet', async () => {
		el = await fixture('<nldd-icon-cell icon="star"><img alt=""></nldd-icon-cell>');
		await settle();
		expect(el.shadowRoot!.querySelector('nldd-icon')).toBeNull();
		cleanup(el);
		el = await fixture(`<nldd-icon-cell icon="star">
		</nldd-icon-cell>`);
		await settle();
		expect(el.shadowRoot!.querySelector('nldd-icon')).not.toBeNull();
	});
});
