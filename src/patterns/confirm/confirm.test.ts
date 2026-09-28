import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { waitForUpdate } from '../../test-utils.js';
import markup from './confirm.html?raw';
import '../../components/index.js';

describe('patroon: onomkeerbare actie', () => {
	let root: HTMLElement;

	beforeEach(async () => {
		root = document.createElement('div');
		root.innerHTML = markup;
		document.body.append(root);
		for (const el of root.querySelectorAll('nldd-modal-dialog, nldd-title')) await waitForUpdate(el as HTMLElement);
	});

	afterEach(() => {
		root?.remove();
	});

	it('zet de actie in een kritieke zone met een eigen kop', () => {
		const box = root.querySelector('nldd-box')!;
		expect(box.getAttribute('background')).toBe('critical');
		expect(box.querySelector('nldd-title')!.shadowRoot!.querySelector('h2')).not.toBeNull();
		expect(box.querySelector('nldd-button[variant="destructive"]')).not.toBeNull();
	});

	it('noemt in de dialoog het ding dat verdwijnt', () => {
		const dialog = root.querySelector('nldd-modal-dialog')!;
		const name = dialog.shadowRoot!.querySelector('dialog')!.getAttribute('aria-label')!;
		expect(name).toContain('Dossier D-318');
	});

	it('zet de uitweg als primaire knop vóór de onomkeerbare actie', () => {
		const [first, second] = root.querySelectorAll('nldd-modal-dialog nldd-button[slot="actions"]');
		expect(first.getAttribute('variant')).toBe('primary');
		expect(second.getAttribute('variant')).toBe('destructive');
	});
});
