import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import { loadTokens } from '../../../test-tokens.js';
import { readDrop } from './file-field.drop.js';
import type { NLDDFileField } from './file-field.js';
import './file-field.js';

/* A DataTransfer with folders in it cannot be made in a test, so these are
 * entries of the shape a browser hands out: a folder reader that gives its
 * entries in batches, as Chrome does in batches of 100. */

type FakeEntry = FileSystemEntry & { children?: FakeEntry[]; content?: File };

function file(path: string, type = 'text/html'): FakeEntry {
	const name = path.split('/').pop()!;
	const content = new File(['x'], name, { type });
	return {
		isFile: true,
		isDirectory: false,
		name,
		fullPath: `/${path}`,
		content,
		file: (resolve: (file: File) => void) => resolve(content),
	} as unknown as FakeEntry;
}

function folder(path: string, children: FakeEntry[], batch = 2): FakeEntry {
	return {
		isFile: false,
		isDirectory: true,
		name: path.split('/').pop()!,
		fullPath: `/${path}`,
		children,
		createReader: () => {
			let at = 0;
			return {
				readEntries: (resolve: (entries: FakeEntry[]) => void) => {
					resolve(children.slice(at, at + batch));
					at += batch;
				},
			};
		},
	} as unknown as FakeEntry;
}

/** What a drop of these entries looks like to the field. */
function fakeTransfer(...entries: FakeEntry[]): DataTransfer {
	return {
		types: ['Files'],
		items: entries.map((entry) => ({
			kind: 'file',
			type: entry.isFile ? entry.content!.type : '',
			webkitGetAsEntry: () => entry,
		})),
		// A dropped folder shows up in `files` as an entry without a type.
		files: entries.map((entry) => entry.content ?? new File([], entry.name, { type: '' })),
	} as unknown as DataTransfer;
}

function drop(target: EventTarget, data: DataTransfer): void {
	const event = new DragEvent('drop', { bubbles: true, composed: true, cancelable: true });
	Object.defineProperty(event, 'dataTransfer', { value: data });
	target.dispatchEvent(event);
}

const site = () => folder('site', [
	file('site/index.html'),
	file('site/over.html'),
	folder('site/css', [file('site/css/main.css', 'text/css')]),
]);

describe('readDrop', () => {
	it('reads folders down to their files, with the path from the dropped folder', async () => {
		const dropped = await readDrop(fakeTransfer(site(), file('los.html')));
		expect(dropped.map(({ path }) => path)).toEqual(['site/index.html', 'site/over.html', 'site/css/main.css', 'los.html']);
		expect(dropped.every(({ file: f }) => f instanceof File)).toBe(true);
	});

	it('yields nothing for an empty folder', async () => {
		expect(await readDrop(fakeTransfer(folder('leeg', [])))).toEqual([]);
	});
});

describe('nldd-file-field – folders', () => {
	let el: NLDDFileField;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const settle = () => new Promise((resolve) => setTimeout(resolve, 50));

	it('takes a dropped folder with multiple, and gives the files with their paths', async () => {
		el = await fixture<NLDDFileField>('<nldd-file-field accessible-label="Site" multiple></nldd-file-field>');
		await waitForUpdate(el);
		let detail: { files: File[]; paths: string[] } | undefined;
		el.addEventListener('change', (e) => { detail = (e as CustomEvent).detail; });
		drop(el, fakeTransfer(site()));
		await settle();
		await waitForUpdate(el);
		expect(detail?.paths).toEqual(['site/index.html', 'site/over.html', 'site/css/main.css']);
		expect(detail?.files.map((f) => f.name)).toEqual(['index.html', 'over.html', 'main.css']);
		expect(el.paths).toEqual(detail?.paths);
		expect(el.shadowRoot!.textContent).toContain('site (3 bestanden)');
	});

	it('still refuses a folder without multiple', async () => {
		el = await fixture<NLDDFileField>('<nldd-file-field accessible-label="Bijlage"></nldd-file-field>');
		await waitForUpdate(el);
		drop(el, fakeTransfer(site()));
		await settle();
		await waitForUpdate(el);
		expect(el.files).toEqual([]);
		expect(el.shadowRoot!.querySelector('.file-field__text > .is-active')!.textContent).toBe('Sleep bestand, geen map');
	});

	it('says so when a dropped folder is empty, or cannot be read', async () => {
		el = await fixture<NLDDFileField>('<nldd-file-field accessible-label="Site" multiple></nldd-file-field>');
		await waitForUpdate(el);
		drop(el, fakeTransfer(folder('leeg', [])));
		await settle();
		await waitForUpdate(el);
		expect(el.files).toEqual([]);
		expect(el.shadowRoot!.querySelector('.file-field__text > .is-active')!.textContent).toBe('Map is leeg');
		const broken = folder('kapot', [file('kapot/index.html')]);
		(broken as unknown as { createReader: () => unknown }).createReader = () => ({
			readEntries: (_resolve: unknown, reject: (error: Error) => void) => reject(new Error('NotReadableError')),
		});
		drop(el, fakeTransfer(broken));
		await settle();
		await waitForUpdate(el);
		expect(el.files).toEqual([]);
		expect(el.shadowRoot!.querySelector('.file-field__text > .is-active')!.textContent).toBe('Map niet te lezen');
	});

	it('shows an empty folder in place of what was chosen, then what was chosen again', async () => {
		el = await fixture<NLDDFileField>('<nldd-file-field accessible-label="Site" multiple></nldd-file-field>');
		await waitForUpdate(el);
		drop(el, fakeTransfer(site()));
		await settle();
		await waitForUpdate(el);
		const shown = () => {
			const active = el.shadowRoot!.querySelector('.file-field__chosen-area > .is-active .is-active')!;
			return (active.querySelector('.file-field__full-name') ?? active).textContent!.trim();
		};
		expect(shown()).toBe('site (3 bestanden)');
		drop(el, fakeTransfer(folder('leeg', [])));
		await settle();
		await waitForUpdate(el);
		// The message takes the whole row, so the name has only itself to make room for.
		expect(shown()).toBe('Map is leeg');
		await new Promise((resolve) => setTimeout(resolve, 4050));
		await waitForUpdate(el);
		expect(shown()).toBe('site (3 bestanden)');
	});

	it('ignores a folder that finishes reading after the field was cleared', async () => {
		el = await fixture<NLDDFileField>('<nldd-file-field accessible-label="Site" multiple></nldd-file-field>');
		await waitForUpdate(el);
		let finish!: () => void;
		const slow = folder('traag', [file('traag/index.html')]);
		(slow as unknown as { createReader: () => unknown }).createReader = () => {
			let done = false;
			return {
				readEntries: (resolve: (entries: FakeEntry[]) => void) => {
					if (done) return resolve([]);
					done = true;
					finish = () => resolve(slow.children!);
				},
			};
		};
		drop(el, fakeTransfer(slow));
		await settle();
		el._handleClear();
		finish();
		await settle();
		await waitForUpdate(el);
		expect(el.files).toEqual([]);
	});

	it('cuts the name of a folder before its number, and drops the word in a narrow field', async () => {
		el = await fixture<NLDDFileField>('<nldd-file-field accessible-label="Site" multiple style="width: 360px"></nldd-file-field>');
		await waitForUpdate(el);
		drop(el, fakeTransfer(folder('aanvraag-A-1042-bijlagen', [file('aanvraag-A-1042-bijlagen/index.html'), file('aanvraag-A-1042-bijlagen/over.html')])));
		await settle();
		await waitForUpdate(el);
		const root = el.shadowRoot!;
		const full = root.querySelector<HTMLElement>('.file-field__folder--full')!;
		const short = root.querySelector<HTMLElement>('.file-field__folder--short')!;
		const name = full.querySelector<HTMLElement>('.file-field__folder-name')!;
		const count = full.querySelector<HTMLElement>('.file-field__folder-rest')!;
		expect([full.checkVisibility(), short.checkVisibility()]).toEqual([true, false]);
		expect(name.scrollWidth).toBeGreaterThan(name.clientWidth);
		expect(count.scrollWidth).toBe(count.clientWidth);
		expect(count.textContent).toBe(' (2 bestanden)');
		el.style.width = '300px';
		expect([full.checkVisibility(), short.checkVisibility()]).toEqual([false, true]);
		expect(short.textContent).toBe('aanvraag-A-1042-bijlagen (2)');
		expect(root.querySelector('.file-field__full-name')!.textContent).toBe('aanvraag-A-1042-bijlagen (2 bestanden)');
	});

	it('names a folder with one file as a folder, as its paths have it', async () => {
		el = await fixture<NLDDFileField>('<nldd-file-field accessible-label="Site" multiple></nldd-file-field>');
		await waitForUpdate(el);
		drop(el, fakeTransfer(folder('site', [file('site/index.html')])));
		await settle();
		await waitForUpdate(el);
		expect(el.paths).toEqual(['site/index.html']);
		expect(el.shadowRoot!.querySelector('.file-field__folder--full')!.textContent).toBe('site (1 bestand)');
		expect(el.shadowRoot!.querySelector('.file-field__file-icon')!.getAttribute('icon')).toBe('folder');
	});

	it('shows it is reading a folder that takes a while, until it is read or something else is done', async () => {
		el = await fixture<NLDDFileField>('<nldd-file-field accessible-label="Site" multiple></nldd-file-field>');
		await waitForUpdate(el);
		const slowFolder = () => {
			let finish!: () => void;
			const slow = folder('traag', [file('traag/index.html')]);
			(slow as unknown as { createReader: () => unknown }).createReader = () => {
				let done = false;
				return {
					readEntries: (resolve: (entries: FakeEntry[]) => void) => {
						if (done) return resolve([]);
						done = true;
						finish = () => resolve(slow.children!);
					},
				};
			};
			return { slow, finish: () => finish() };
		};
		const indicator = () => el.shadowRoot!.querySelector('nldd-activity-indicator');
		const busy = () => el.shadowRoot!.querySelector('.file-field')!.getAttribute('aria-busy');

		const first = slowFolder();
		drop(el, fakeTransfer(first.slow));
		await settle();
		await waitForUpdate(el);
		// Most folders are read sooner, so nothing shows at first.
		expect(indicator()).toBeNull();
		await new Promise((resolve) => setTimeout(resolve, 1000));
		await waitForUpdate(el);
		expect(indicator()!.getAttribute('size')).toBe('24');
		expect(indicator()!.hasAttribute('show-text')).toBe(false);
		expect(busy()).toBe('true');
		first.finish();
		await settle();
		await waitForUpdate(el);
		expect(indicator()).toBeNull();
		expect(busy()).toBeNull();
		expect(el.paths).toEqual(['traag/index.html']);

		const second = slowFolder();
		drop(el, fakeTransfer(second.slow));
		await new Promise((resolve) => setTimeout(resolve, 1050));
		await waitForUpdate(el);
		// The folder read replaces what was chosen, so the field shows empty.
		expect(indicator()!.getAttribute('size')).toBe('24');
		expect(el.shadowRoot!.querySelector('.file-field__chosen-area')).toBeNull();
		el._handleClear();
		await waitForUpdate(el);
		expect(indicator()).toBeNull();
		expect(busy()).toBeNull();
	});

	it('refuses a folder whose files accept rules out, as a whole', async () => {
		el = await fixture<NLDDFileField>('<nldd-file-field accessible-label="Site" multiple accept=".html"></nldd-file-field>');
		await waitForUpdate(el);
		drop(el, fakeTransfer(site()));
		await settle();
		await waitForUpdate(el);
		expect(el.files).toEqual([]);
	});

	it('submits a file from a folder with its path as its name', async () => {
		const form = await fixture<HTMLFormElement>('<form><nldd-file-field name="site" accessible-label="Site" multiple></nldd-file-field></form>');
		el = form.querySelector('nldd-file-field')!;
		await waitForUpdate(el);
		drop(el, fakeTransfer(site()));
		await settle();
		const names = (new FormData(form).getAll('site') as File[]).map((f) => f.name);
		expect(names).toEqual(['site/index.html', 'site/over.html', 'site/css/main.css']);
		cleanup(form);
	});
});

describe('nldd-file-field – directory', () => {
	let el: NLDDFileField;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const settle = () => new Promise((resolve) => setTimeout(resolve, 50));
	const menu = () => el.shadowRoot!.querySelector<HTMLElement>('.file-field__choose-menu');
	const item = (text: string) => [...el.shadowRoot!.querySelectorAll('nldd-menu-item')]
		.find((option) => option.getAttribute('text') === text) as HTMLElement;

	it('opens the file dialog straight away without directory', async () => {
		el = await fixture<NLDDFileField>('<nldd-file-field accessible-label="Bijlage"></nldd-file-field>');
		await waitForUpdate(el);
		const click = vi.spyOn(el.shadowRoot!.querySelector<HTMLInputElement>('.file-field__input')!, 'click').mockImplementation(() => {});
		el.shadowRoot!.querySelector<HTMLElement>('.file-field__choose-button')!.click();
		expect(click).toHaveBeenCalledOnce();
		expect(menu()).toBeNull();
	});

	it('asks for files or a folder with directory, and opens the dialog for the one chosen', async () => {
		el = await fixture<NLDDFileField>('<nldd-file-field accessible-label="Site" directory></nldd-file-field>');
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector<HTMLElement>('.file-field__choose-button')!;
		expect(button.textContent!.replace(/\s+/g, ' ')).toContain('Bestanden of map kiezen');
		expect(button.getAttribute('aria-haspopup')).toBe('menu');
		const files = vi.spyOn(el.shadowRoot!.querySelector<HTMLInputElement>('.file-field__input')!, 'click').mockImplementation(() => {});
		const folder = vi.spyOn(el.shadowRoot!.querySelector<HTMLInputElement>('.file-field__folder-input')!, 'click').mockImplementation(() => {});

		button.click();
		await settle();
		expect(menu()!.matches(':popover-open')).toBe(true);
		expect(files).not.toHaveBeenCalled();
		item('Map kiezen…').shadowRoot!.querySelector('button')!.click();
		await settle();
		expect(folder).toHaveBeenCalledOnce();
		expect(menu()!.matches(':popover-open')).toBe(false);

		button.click();
		await settle();
		item('Bestanden kiezen…').shadowRoot!.querySelector('button')!.click();
		expect(files).toHaveBeenCalledOnce();
	});

	it('opens the menu where a click lands, and under the button from the keyboard', async () => {
		el = await fixture<NLDDFileField>('<nldd-file-field accessible-label="Site" directory></nldd-file-field>');
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector<HTMLElement>('.file-field__choose-button')!;
		const box = button.getBoundingClientRect();
		const field = el.shadowRoot!.querySelector('.file-field')!.getBoundingClientRect();
		const anchored = () => (menu() as HTMLElement & { anchorElement: Element | null }).anchorElement;

		button.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1, clientX: box.left + 40, clientY: box.top + 10 }));
		await settle();
		const point = anchored() as HTMLElement;
		expect(point.classList.contains('file-field__menu-anchor')).toBe(true);
		expect(point.style.left).toBe(`${box.left + 40 - field.left}px`);
		menu()!.hidePopover();
		await new Promise((resolve) => setTimeout(resolve, 350));

		// A keyboard press is a click without a point.
		button.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));
		await settle();
		expect(anchored()).toBe(button);
	});

	it('closes the open menu on a second press on the field, without opening it again', async () => {
		el = await fixture<NLDDFileField>('<nldd-file-field accessible-label="Site" directory></nldd-file-field>');
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector<HTMLElement>('.file-field__choose-button')!;
		button.click();
		await settle();
		expect(menu()!.matches(':popover-open')).toBe(true);
		// Light dismiss closes it on pointerdown, before the click lands.
		menu()!.hidePopover();
		button.click();
		await settle();
		expect(menu()!.matches(':popover-open')).toBe(false);
	});

	it('closes the open menu on a click that light dismiss let through', async () => {
		el = await fixture<NLDDFileField>('<nldd-file-field accessible-label="Site" directory></nldd-file-field>');
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector<HTMLElement>('.file-field__choose-button')!;
		button.click();
		await settle();
		button.click();
		await settle();
		expect(menu()!.matches(':popover-open')).toBe(false);
	});

	it('opens the menu under "Wijzigen", which shows a chevron and whether it is open', async () => {
		el = await fixture<NLDDFileField>('<nldd-file-field accessible-label="Site" directory></nldd-file-field>');
		await waitForUpdate(el);
		drop(el, fakeTransfer(file('index.html')));
		await settle();
		await waitForUpdate(el);
		const change = el.shadowRoot!.querySelector<HTMLElement & { expandable: boolean; expanded: boolean }>('.file-field__edit-button-group nldd-button')!;
		expect(change.expandable).toBe(true);
		const box = change.getBoundingClientRect();
		change.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1, clientX: box.left + 5, clientY: box.top + 5 }));
		await settle();
		await waitForUpdate(el);
		expect((menu() as HTMLElement & { anchorElement: Element | null }).anchorElement).toBe(change);
		expect(change.expanded).toBe(true);
	});

	it('offers both as buttons in an area, with the drop hint under them, without a menu', async () => {
		el = await fixture<NLDDFileField>('<nldd-file-field accessible-label="Site" directory variant="area"></nldd-file-field>');
		await waitForUpdate(el);
		const root = el.shadowRoot!;
		expect(root.querySelector('.file-field__choose-button')).toBeNull();
		const [files, folder] = [...root.querySelectorAll<HTMLElement>('.file-field__choose-button-group nldd-button')];
		expect([files.getAttribute('text'), folder.getAttribute('text')]).toEqual(['Bestanden kiezen', 'Map kiezen']);
		expect([(files as HTMLElement & { size: string }).size, folder.getAttribute('start-icon')]).toEqual(['md', 'folder']);
		expect(root.querySelector('.file-field__text')!.textContent!.trim().replace(/\s+/g, ' ')).toMatch(/^of sleep ze hierheen/);
		expect([files.getAttribute('accessible-label'), folder.getAttribute('accessible-label')]).toEqual(['Bestanden kiezen, Site', 'Map kiezen, Site']);
		const pickFiles = vi.spyOn(root.querySelector<HTMLInputElement>('.file-field__input')!, 'click').mockImplementation(() => {});
		const pickFolder = vi.spyOn(root.querySelector<HTMLInputElement>('.file-field__folder-input')!, 'click').mockImplementation(() => {});
		folder.click();
		expect(pickFolder).toHaveBeenCalledOnce();
		files.click();
		expect(pickFiles).toHaveBeenCalledOnce();
		expect(menu()!.matches(':popover-open')).toBe(false);
		el.focus();
		expect(root.activeElement).toBe(files);
	});

	it('makes an area a step taller for its row of buttons, and keeps that height once chosen', async () => {
		const unloadTokens = loadTokens();
		const heights: number[][] = [];
		for (const size of ['md', 'sm']) {
			el = await fixture<NLDDFileField>(`<nldd-file-field accessible-label="Site" directory variant="area" size="${size}" style="width: 500px"></nldd-file-field>`);
			await waitForUpdate(el);
			const empty = el.getBoundingClientRect().height;
			drop(el, fakeTransfer(file('index.html')));
			await settle();
			await waitForUpdate(el);
			heights.push([empty, el.getBoundingClientRect().height]);
			cleanup(el);
		}
		unloadTokens();
		expect(heights).toEqual([[200, 200], [160, 160]]);
	});

	it('shows an icon on both options', async () => {
		el = await fixture<NLDDFileField>('<nldd-file-field accessible-label="Site" directory></nldd-file-field>');
		await waitForUpdate(el);
		expect([...el.shadowRoot!.querySelectorAll('nldd-menu-item')].map((option) => option.getAttribute('icon'))).toEqual(['files', 'folder']);
	});

	it('takes several files and a dropped folder with directory, without multiple', async () => {
		el = await fixture<NLDDFileField>('<nldd-file-field accessible-label="Site" directory></nldd-file-field>');
		await waitForUpdate(el);
		drop(el, fakeTransfer(site()));
		await settle();
		await waitForUpdate(el);
		expect(el.paths).toEqual(['site/index.html', 'site/over.html', 'site/css/main.css']);
	});
});
