import { describe, it, expect, afterEach } from 'vitest';
import { waitForUpdate } from '../../test-utils.js';
import markup from './page-with-sections.html?raw';
import appShell from './page-with-sections.app-shell.html?raw';
import '../../components/index.js';

describe('patroon: pagina met secties', () => {
	let root: HTMLElement;

	afterEach(() => {
		root?.remove();
	});

	const mount = async (source: string) => {
		root = document.createElement('div');
		root.innerHTML = source;
		document.body.append(root);
		for (const el of root.querySelectorAll('nldd-title, nldd-top-title-bar, nldd-page')) await waitForUpdate(el as HTMLElement);
	};

	/** The heading levels the titles and title bars render, in document order. */
	const headingLevels = () => [...root.querySelectorAll('nldd-title, nldd-top-title-bar')]
		.map((el) => el.shadowRoot!.querySelector('h1, h2, h3, h4, h5, h6'))
		.filter((heading): heading is HTMLHeadingElement => heading !== null)
		.map((heading) => Number(heading.tagName.slice(1)));

	for (const [name, source] of [['pagina', markup], ['app-shell', appShell]]) {
		it(`heeft één h1 en slaat geen kopniveau over (${name})`, async () => {
			await mount(source);
			const levels = headingLevels();
			expect(levels.filter((level) => level === 1).length).toBe(1);
			levels.forEach((level, i) => {
				if (i > 0) expect(level - levels[i - 1]).toBeLessThanOrEqual(1);
			});
		});

		it(`zet een vlak met background en niet met eigen stijl (${name})`, () => {
			const written = new DOMParser().parseFromString(source, 'text/html');
			expect(written.querySelectorAll('[style]').length).toBe(0);
		});
	}

	it('zet de app view buitenom en de inhoud in secties', async () => {
		await mount(markup);
		expect(root.firstElementChild!.tagName).toBe('NLDD-APP-VIEW');
		const page = root.querySelector('nldd-page')!;
		const blocks = [...page.children].filter((child) => !child.hasAttribute('slot'));
		expect(blocks.every((block) => block.tagName === 'NLDD-SIMPLE-SECTION')).toBe(true);
	});

	it('houdt één main over in de app-shell, bij het paneel met de hoofdinhoud', async () => {
		await mount(appShell);
		const mains = [...root.querySelectorAll('nldd-page')].filter((page) => page.shadowRoot!.querySelector('main.page__main'));
		expect(mains.length).toBe(1);
		expect(mains[0].closest('nldd-split-view-pane')!.getAttribute('slot')).toBe('pane-1');
	});

	it('maakt van het tweede paneel een benoemde regio', async () => {
		await mount(appShell);
		const detail = root.querySelectorAll('nldd-page')[1];
		const buitenste = detail.shadowRoot!.querySelector('.page')!;
		expect(buitenste.localName).toBe('section');
		expect(buitenste.getAttribute('aria-label')).toBe('Dossier 2024-001');
	});

	it('zet in de app-shell de hoofdinhoud in het eerste paneel', async () => {
		await mount(appShell);
		const panes = [...root.querySelectorAll('nldd-split-view-pane')];
		expect(panes.map((pane) => pane.getAttribute('slot'))).toEqual(['pane-1', 'pane-2']);
		expect(panes[0].querySelector('nldd-list')).not.toBeNull();
	});
});
