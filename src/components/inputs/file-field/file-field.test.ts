import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import { loadTokens } from '../../../test-tokens.js';
import type { NLDDFileField } from './file-field.js';
import './file-field.js';

/** Puts a FileList on the inner input, the way a real pick would, and fires the
 *  change the component listens for. `input.files` is settable from script; only
 *  a *selection* the user did not make is refused. */
function choose(el: NLDDFileField, ...files: File[]): void {
	const input = el.shadowRoot!.querySelector('input')!;
	const transfer = new DataTransfer();
	for (const file of files) transfer.items.add(file);
	input.files = transfer.files;
	input.dispatchEvent(new Event('change', { bubbles: true }));
}

const txt = (name: string) => new File(['x'], name, { type: 'text/plain' });
const pdf = (name: string) => new File(['x'], name, { type: 'application/pdf' });
const png = (name: string) => new File(['x'], name, { type: 'image/png' });

const browseText = (el: NLDDFileField) => el.shadowRoot!.querySelector('.file-field__browse')!.textContent!.replace(/\s+/g, ' ').trim();
const fullName = (el: NLDDFileField) => el.shadowRoot!.querySelector('.file-field__full-name')!.textContent;
const valueText = (el: NLDDFileField) => el.shadowRoot!.querySelector('.file-field__value')!.textContent!.replace(/\s+/g, ' ').trim();

function transfer(...files: File[]): DataTransfer {
	const data = new DataTransfer();
	for (const file of files) data.items.add(file);
	return data;
}

function drag(target: EventTarget, type: string, data: DataTransfer): DragEvent {
	const event = new DragEvent(type, { bubbles: true, composed: true, cancelable: true, dataTransfer: data });
	target.dispatchEvent(event);
	return event;
}

describe('nldd-file-field', () => {
	let el: NLDDFileField;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture<NLDDFileField>('<nldd-file-field></nldd-file-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('is one button over the surface reading as one sentence before a file is chosen', async () => {
		el = await fixture<NLDDFileField>('<nldd-file-field accessible-label="Bijlage"></nldd-file-field>');
		await waitForUpdate(el);
		expect(browseText(el)).toBe('Bestand kiezen of sleep het hierheen');
		expect(el.shadowRoot!.querySelector('.file-field__browse')!.getAttribute('aria-label')).toBe('Bestand kiezen, Bijlage');
		expect(el.shadowRoot!.querySelector('nldd-icon-button')).toBeNull();
		const click = vi.spyOn(el.shadowRoot!.querySelector('input')!, 'click').mockImplementation(() => {});
		el.shadowRoot!.querySelector<HTMLElement>('.file-field__browse')!.click();
		expect(click).toHaveBeenCalledOnce();
	});

	it('shows the file name after one file is chosen', async () => {
		el = await fixture<NLDDFileField>('<nldd-file-field></nldd-file-field>');
		await waitForUpdate(el);
		choose(el, txt('rapport.pdf'));
		await waitForUpdate(el);
		expect(fullName(el)).toBe('rapport.pdf');
		expect(el.shadowRoot!.querySelector('.file-field__name')!.getAttribute('aria-hidden')).toBe('true');
		expect(el.files.map((f) => f.name)).toEqual(['rapport.pdf']);
	});

	it('summarizes two or more files as a count instead of listing them', async () => {
		el = await fixture<NLDDFileField>('<nldd-file-field multiple></nldd-file-field>');
		await waitForUpdate(el);
		choose(el, txt('a.txt'), txt('b.txt'), txt('c.txt'));
		await waitForUpdate(el);
		expect(valueText(el)).toBe('3 bestanden');
		expect(el.shadowRoot!.querySelector('.file-field__file-icon')!.getAttribute('icon')).toBe('file-on-file');
	});

	it('names the button after the multiple attribute', async () => {
		el = await fixture<NLDDFileField>('<nldd-file-field multiple></nldd-file-field>');
		await waitForUpdate(el);
		expect(browseText(el)).toBe('Bestanden kiezen of sleep ze hierheen');
	});

	it('fires change with the chosen files', async () => {
		el = await fixture<NLDDFileField>('<nldd-file-field></nldd-file-field>');
		await waitForUpdate(el);
		const listener = vi.fn();
		el.addEventListener('change', listener);
		choose(el, txt('rapport.pdf'));
		expect(listener).toHaveBeenCalledOnce();
		expect(listener.mock.calls[0][0].detail.files.map((f: File) => f.name)).toEqual(['rapport.pdf']);
	});

	it('clears the input as well as the list, so the same file can be chosen again', async () => {
		el = await fixture<NLDDFileField>('<nldd-file-field></nldd-file-field>');
		await waitForUpdate(el);
		choose(el, txt('rapport.pdf'));
		await waitForUpdate(el);

		el.shadowRoot!.querySelector('nldd-icon-button')!.dispatchEvent(new Event('click'));
		await waitForUpdate(el);

		expect(el.files).toEqual([]);
		expect(el.shadowRoot!.querySelector('input')!.files!.length).toBe(0);
		expect(browseText(el)).toBe('Bestand kiezen of sleep het hierheen');
	});

	it('is invalid while required and empty, and valid once a file is chosen', async () => {
		el = await fixture<NLDDFileField>('<nldd-file-field required></nldd-file-field>');
		await waitForUpdate(el);
		expect(el.internals.validity.valueMissing).toBe(true);

		choose(el, txt('rapport.pdf'));
		await waitForUpdate(el);
		expect(el.internals.validity.valueMissing).toBe(false);
	});

	it('submits nothing without a name', async () => {
		el = await fixture<NLDDFileField>('<nldd-file-field></nldd-file-field>');
		await waitForUpdate(el);
		choose(el, txt('rapport.pdf'));
		expect(el.formValue()).toBeNull();
	});

	it('submits a single file as itself and several as FormData', async () => {
		el = await fixture<NLDDFileField>('<nldd-file-field multiple name="bijlage"></nldd-file-field>');
		await waitForUpdate(el);

		choose(el, txt('a.txt'));
		expect(el.formValue()).toBeInstanceOf(File);

		choose(el, txt('a.txt'), txt('b.txt'));
		const value = el.formValue();
		expect(value).toBeInstanceOf(FormData);
		expect((value as FormData).getAll('bijlage')).toHaveLength(2);
	});

	it('takes an override for a translation key', async () => {
		el = await fixture<NLDDFileField>('<nldd-file-field></nldd-file-field>');
		el.translations = { 'components.file-field.drop-hint-text': 'or drag it here' };
		await waitForUpdate(el);
		expect(browseText(el)).toBe('Bestand kiezen or drag it here');
	});

	it('shows the icon of the format', async () => {
		el = await fixture<NLDDFileField>('<nldd-file-field></nldd-file-field>');
		await waitForUpdate(el);
		choose(el, new File(['x'], 'foto.JPEG', { type: 'image/jpeg' }));
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.file-field__file-icon')!.getAttribute('icon')).toBe('file-jpg');
		choose(el, txt('notities.xyz'));
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.file-field__file-icon')!.getAttribute('icon')).toBe('file');
	});

	it('keeps the validation icon inside the button while empty, so a press on it opens the dialog too', async () => {
		el = await fixture<NLDDFileField>('<nldd-file-field invalid></nldd-file-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.file-field__browse .file-field__validation-icon-area')).not.toBeNull();
	});

	it('trades the choose button for a change button once a file is chosen', async () => {
		el = await fixture<NLDDFileField>('<nldd-file-field accessible-label="Bijlage"></nldd-file-field>');
		await waitForUpdate(el);
		choose(el, txt('rapport.pdf'));
		await waitForUpdate(el);
		const buttons = el.shadowRoot!.querySelectorAll('nldd-button');
		expect(buttons.length).toBe(1);
		expect(buttons[0].getAttribute('text')).toBe('Wijzigen');
		expect(buttons[0].getAttribute('accessible-label')).toBe('Wijzigen, Bijlage');
	});

	describe('drag and drop', () => {
		it('takes a dropped file the way it takes a chosen one', async () => {
			el = await fixture<NLDDFileField>('<nldd-file-field name="bijlage"></nldd-file-field>');
			await waitForUpdate(el);
			const listener = vi.fn();
			el.addEventListener('change', listener);
			const drop = drag(el, 'drop', transfer(pdf('rapport.pdf')));
			await waitForUpdate(el);
			expect(drop.defaultPrevented).toBe(true);
			expect(listener).toHaveBeenCalledOnce();
			expect(el.files.map((f) => f.name)).toEqual(['rapport.pdf']);
			expect(el.shadowRoot!.querySelector('input')!.files!.length).toBe(1);
			expect(el.formValue()).toBeInstanceOf(File);
		});

		it('refuses a drop that accept rules out, keeps the previous file and says why', async () => {
			el = await fixture<NLDDFileField>('<nldd-file-field accept=".pdf"></nldd-file-field>');
			await waitForUpdate(el);
			choose(el, pdf('rapport.pdf'));
			const listener = vi.fn();
			el.addEventListener('change', listener);
			drag(el, 'drop', transfer(png('foto.png')));
			await waitForUpdate(el);
			expect(listener).not.toHaveBeenCalled();
			expect(el.files.map((f) => f.name)).toEqual(['rapport.pdf']);
			expect(valueText(el)).toBe('Het bestand moet een PDF zijn');
			expect(el.shadowRoot!.querySelector('[role="status"]')!.textContent).toBe('Het bestand moet een PDF zijn');

			el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
			await waitForUpdate(el);
			expect(fullName(el)).toBe('rapport.pdf');
		});

		it('names the types accept takes, and says each file with multiple', async () => {
			el = await fixture<NLDDFileField>('<nldd-file-field multiple accept=".png,.jpg,image/webp"></nldd-file-field>');
			await waitForUpdate(el);
			drag(el, 'drop', transfer(pdf('rapport.pdf')));
			await waitForUpdate(el);
			expect(browseText(el)).toBe('Elk bestand moet een PNG, JPG of WEBP zijn');
		});

		it('refuses more than one file without multiple', async () => {
			el = await fixture<NLDDFileField>('<nldd-file-field></nldd-file-field>');
			await waitForUpdate(el);
			drag(el, 'drop', transfer(txt('a.txt'), txt('b.txt')));
			await waitForUpdate(el);
			expect(el.files).toEqual([]);
			expect(valueText(el)).toBe('Sleep één bestand');
		});

		it('matches accept on MIME wildcards and extensions', async () => {
			el = await fixture<NLDDFileField>('<nldd-file-field multiple accept="image/*,.pdf"></nldd-file-field>');
			await waitForUpdate(el);
			drag(el, 'drop', transfer(png('foto.png'), pdf('rapport.pdf')));
			await waitForUpdate(el);
			expect(el.files).toHaveLength(2);
		});

		it('takes the drag over itself, and refuses already when the type rules it out', async () => {
			el = await fixture<NLDDFileField>('<nldd-file-field accept=".pdf"></nldd-file-field>');
			await waitForUpdate(el);
			const over = drag(el, 'dragover', transfer(pdf('rapport.pdf')));
			await waitForUpdate(el);
			expect(over.defaultPrevented).toBe(true);
			expect(el.shadowRoot!.querySelector('.file-field')!.classList.contains('is-drag-over')).toBe(true);
			expect(valueText(el)).toBe('Zet het bestand hier neer');

			drag(el, 'dragover', transfer(png('foto.png')));
			await waitForUpdate(el);
			expect(el.shadowRoot!.querySelector('.file-field')!.classList.contains('is-drag-rejected')).toBe(true);
			expect(valueText(el)).toBe('Het bestand moet een PDF zijn');
		});

		it('marks itself while files are dragged elsewhere on the page, and keeps them from opening there', async () => {
			el = await fixture<NLDDFileField>('<nldd-file-field></nldd-file-field>');
			await waitForUpdate(el);
			const over = drag(document.body, 'dragover', transfer(pdf('rapport.pdf')));
			await waitForUpdate(el);
			expect(el.shadowRoot!.querySelector('.file-field')!.classList.contains('is-drag-page')).toBe(true);
			expect(browseText(el)).toBe('Sleep het bestand hierheen');
			expect(over.defaultPrevented).toBe(true);

			const drop = drag(document.body, 'drop', transfer(pdf('rapport.pdf')));
			await waitForUpdate(el);
			expect(drop.defaultPrevented).toBe(true);
			expect(el.shadowRoot!.querySelector('.file-field')!.classList.contains('is-drag-page')).toBe(false);
		});

		it('says a drop replaces the chosen file, without the buttons, while files are dragged', async () => {
			el = await fixture<NLDDFileField>('<nldd-file-field></nldd-file-field>');
			await waitForUpdate(el);
			choose(el, pdf('rapport.pdf'));
			await waitForUpdate(el);
			const replaceText = () => el.shadowRoot!.querySelector('.file-field__replace')!.textContent!.trim();
			drag(document.body, 'dragover', transfer(pdf('nieuw.pdf')));
			await waitForUpdate(el);
			expect(replaceText()).toBe('Sleep hierheen om te vervangen');
			expect(el.shadowRoot!.querySelector('.file-field__actions')).toBeNull();
			drag(el, 'dragover', transfer(pdf('nieuw.pdf')));
			await waitForUpdate(el);
			expect(replaceText()).toBe('Zet hier neer om te vervangen');
			drag(el, 'drop', transfer(pdf('nieuw.pdf')));
			await waitForUpdate(el);
			expect(fullName(el)).toBe('nieuw.pdf');
			expect(el.shadowRoot!.querySelector('.file-field__actions')).not.toBeNull();
		});

		it('leaves a drop alone that an editable field takes', async () => {
			el = await fixture<NLDDFileField>('<nldd-file-field></nldd-file-field>');
			await waitForUpdate(el);
			const area = document.createElement('textarea');
			document.body.append(area);
			const drop = drag(area, 'drop', transfer(pdf('rapport.pdf')));
			expect(drop.defaultPrevented).toBe(false);
			area.remove();
		});

		it('takes no drop when disabled', async () => {
			el = await fixture<NLDDFileField>('<nldd-file-field disabled></nldd-file-field>');
			await waitForUpdate(el);
			drag(el, 'drop', transfer(pdf('rapport.pdf')));
			await waitForUpdate(el);
			expect(el.files).toEqual([]);
		});
	});

	describe('a long name', () => {
		let unloadTokens: () => void;
		beforeEach(() => {
			unloadTokens = loadTokens();
		});
		afterEach(() => unloadTokens());

		const long = 'Screenshot 2026-10-27 at 15.42.11.png';
		const shown = (el: NLDDFileField) => el.shadowRoot!.querySelector('.file-field__name')!.textContent!.trim();
		const tooltip = (el: NLDDFileField) => el.shadowRoot!.querySelector('nldd-tooltip')!;

		it('is cut in the middle to the width it has, with the whole name in a tooltip', async () => {
			el = await fixture<NLDDFileField>('<nldd-file-field style="width: 280px"></nldd-file-field>');
			await waitForUpdate(el);
			choose(el, txt(long));
			await vi.waitFor(() => expect(shown(el)).toContain('…'));
			const [start, end] = shown(el).split('…');
			expect(long.startsWith(start)).toBe(true);
			expect(long.endsWith(end)).toBe(true);
			expect(end.endsWith('.png')).toBe(true);
			expect(Math.abs(start.length - (end.length - 4))).toBeLessThanOrEqual(2);
			expect(tooltip(el).getAttribute('text')).toBe(long);
			expect(tooltip(el).getAttribute('timing')).toBe('delay');
			expect(fullName(el)).toBe(long);
		});

		it('stays whole without a tooltip where it fits', async () => {
			el = await fixture<NLDDFileField>('<nldd-file-field style="width: 400px"></nldd-file-field>');
			await waitForUpdate(el);
			choose(el, txt('rapport.pdf'));
			await waitForUpdate(el);
			await new Promise((resolve) => setTimeout(resolve, 50));
			expect(tooltip(el).getAttribute('timing')).toBe('never');
			expect(shown(el)).toBe('rapport.pdf');
		});
	});
});
