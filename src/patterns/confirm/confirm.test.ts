import { describe, it, expect, afterEach } from 'vitest';
import { waitForUpdate } from '../../test-utils.js';
import markup from './confirm.html?raw';
import emptyState from './confirm.empty-state.html?raw';
import '../../components/index.js';

describe('patroon: bevestigen', () => {
	let root: HTMLElement;

	afterEach(() => {
		root?.remove();
	});

	const mount = async (source: string) => {
		root = document.createElement('div');
		root.innerHTML = source;
		document.body.append(root);
		for (const el of root.querySelectorAll('nldd-modal-dialog, nldd-inline-dialog')) await waitForUpdate(el as HTMLElement);
	};

	it('noemt de dialoog naar de vraag', async () => {
		await mount(markup);
		const dialog = root.querySelector('nldd-modal-dialog')!;
		expect(dialog.shadowRoot!.querySelector('dialog')!.getAttribute('aria-label')).toBe('Document definitief verwijderen?');
	});

	it('zet de uitweg als primaire knop vóór de onomkeerbare actie', async () => {
		await mount(markup);
		const [first, second] = root.querySelectorAll('nldd-modal-dialog nldd-button[slot="actions"]');
		expect(first.getAttribute('variant')).toBe('primary');
		expect(second.getAttribute('variant')).toBe('destructive');
	});

	it('maakt van een lege toestand in de pagina een echte kop', async () => {
		await mount(emptyState);
		const dialog = root.querySelector('nldd-inline-dialog')!;
		expect(dialog.shadowRoot!.querySelector('h2')?.textContent).toBe('Geen resultaten');
	});
});
