import { describe, it, expect, afterEach, vi } from 'vitest';
import { waitForUpdate } from '../../test-utils.js';
import markup from './page-structure.html?raw';
import header from './page-structure.header.html?raw';
import headerHome from './page-structure.header-home.html?raw';
import headerLogin from './page-structure.header-login.html?raw';
import headerAccount from './page-structure.header-account.html?raw';
import headerStatus from './page-structure.header-status.html?raw';
import footer from './page-structure.footer.html?raw';
import footerHome from './page-structure.footer-home.html?raw';
import { expectBreadcrumbsInFooter, expectLegalBar, expectSoundHeadings, expectTopBar } from '../page-checks.js';
import '../../components/index.js';

describe('patroon: paginaopbouw', () => {
	let root: HTMLElement;

	const mount = async () => {
		root = document.createElement('div');
		root.innerHTML = markup;
		document.body.append(root);
		for (const el of root.querySelectorAll('nldd-title, nldd-page, nldd-page-footer')) await waitForUpdate(el as HTMLElement);
	};

	afterEach(() => {
		root?.remove();
	});

	it('heeft de shell als buitenste schil, met één pagina erin', async () => {
		await mount();
		expect(root.children.length).toBe(1);
		expect(root.firstElementChild!.tagName).toBe('NLDD-SHELL');
		expect(root.querySelectorAll('nldd-shell > nldd-page').length).toBe(1);
	});

	it('zet de paginaheader en de paginafooter in hun slot, met de secties ertussen', async () => {
		await mount();
		const written = new DOMParser().parseFromString(markup, 'text/html');
		const parts = [...written.querySelector('nldd-page')!.children].map((child) => child.getAttribute('slot') ?? child.tagName.toLowerCase());
		expect(parts[0]).toBe('header');
		expect(parts[parts.length - 1]).toBe('footer');
		expect(parts.slice(1, -1).every((part) => part.endsWith('-section'))).toBe(true);
		expectTopBar(root, 'Aanvragen');
		expectBreadcrumbsInFooter(root);
		expectLegalBar(root);
	});

	it('maakt een vlak met background, niet met eigen CSS', () => {
		const written = new DOMParser().parseFromString(markup, 'text/html');
		expect(written.querySelector('nldd-page > [background="tinted"]')).not.toBeNull();
		expect(written.querySelector('[style]')).toBeNull();
		expect(written.querySelector('style')).toBeNull();
	});

	it('heeft één h1 en slaat geen kopniveau over', async () => {
		await mount();
		expectSoundHeadings(root);
	});
});

describe('patroon: paginaopbouw, de header', () => {
	let root: HTMLElement;

	const mount = async (source: string) => {
		root = document.createElement('div');
		root.innerHTML = source;
		document.body.append(root);
		for (const el of root.querySelectorAll('nldd-page, nldd-top-navigation-bar, nldd-skip-link')) await waitForUpdate(el as HTMLElement);
	};

	afterEach(() => {
		root?.remove();
	});

	it('heeft zoeken en taal in de balk, met een terugknop die de pagina erboven noemt', async () => {
		await mount(header);
		expectTopBar(root, 'Aanvragen');
	});

	it('zet een status bar als eerste in het header-slot, boven de skip link en de balk', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		try {
			await mount(headerStatus);
			const inHeader = [...root.querySelectorAll('nldd-page > [slot="header"]')].map((el) => el.tagName.toLowerCase());
			expect(inHeader).toEqual(['nldd-status-bar', 'nldd-skip-link']);
			const status = root.querySelector('nldd-status-bar')!;
			await waitForUpdate(status as HTMLElement);
			expect(status.getAttribute('text')).toMatch(/^[A-Z][^:]+: /);
			const bar = root.querySelector('nldd-top-navigation-bar')!;
			expect(status.getBoundingClientRect().bottom).toBeLessThanOrEqual(bar.getBoundingClientRect().top);
			expect(warn.mock.calls.some(([message]) => String(message).includes('below a top bar'))).toBe(false);
		} finally {
			warn.mockRestore();
		}
	});

	it('zet inloggen als link helemaal rechts, na zoeken en taal', async () => {
		await mount(headerLogin);
		expectTopBar(root, 'Aanvragen');
		const items = [...root.querySelectorAll('nldd-menu-bar[slot="utility"] > nldd-menu-bar-item')];
		expect(items.map((item) => item.getAttribute('text'))).toEqual(['Zoeken', 'NL', 'Inloggen']);
		const login = items[2];
		expect(login.getAttribute('href')).toBeTruthy();
		expect(login.hasAttribute('expandable')).toBe(false);
		expect(login.getAttribute('content-priority')).toBe('text');
	});

	it('maakt er voor wie is ingelogd een menu van, met het profiel als link en uitloggen als knop', async () => {
		await mount(headerAccount);
		expectTopBar(root, 'Aanvragen');
		const items = [...root.querySelectorAll('nldd-menu-bar[slot="utility"] > nldd-menu-bar-item')];
		expect(items.length).toBe(3);
		const account = items[2];
		expect(account.hasAttribute('expandable')).toBe(true);
		expect(account.getAttribute('href')).toBeFalsy();
		expect(account.getAttribute('text')).toBe('Mijn account');
		// Signed in, the item shows who: an avatar in the place of the icon, and
		// on a narrow screen only that, with the text as its name.
		const badge = account.querySelector(':scope > nldd-avatar[slot="icon"]')!;
		expect(badge.hasAttribute('decorative')).toBe(true);
		expect(badge.hasAttribute('icon-aligned')).toBe(true);
		expect(badge.getAttribute('color')).toBe('inherit');
		expect(account.getAttribute('content-priority')).toBe('icon');
		const menu = account.querySelector(':scope > nldd-menu')!;
		const identity = menu.querySelector(':scope > [slot="header"] nldd-identity')!;
		expect(identity.getAttribute('text')).toBeTruthy();
		expect(identity.getAttribute('supporting-text')).toMatch(/@example\.com$/);
		// The name stands beside the avatar as text, so the avatar itself stays silent.
		const avatar = identity.querySelector(':scope > nldd-avatar[slot="avatars"]')!;
		expect(avatar.getAttribute('name')).toBe(identity.getAttribute('text'));
		expect(badge.getAttribute('name')).toBe(identity.getAttribute('text'));
		expect(avatar.hasAttribute('decorative')).toBe(true);
		const rows = [...menu.children].filter((child) => !child.hasAttribute('slot'));
		expect(rows.map((row) => row.tagName.toLowerCase())).toEqual(['nldd-menu-item', 'nldd-menu-item', 'nldd-menu-divider', 'nldd-menu-item']);
		const [personal, profile, , logOut] = rows;
		expect(personal.getAttribute('href')).toBeTruthy();
		expect(profile.getAttribute('href')).toBeTruthy();
		expect(logOut.getAttribute('text')).toBe('Log uit');
		expect(logOut.getAttribute('href')).toBeFalsy();
		// One row with an icon gives the others a gap, so every row has one.
		expect([personal, profile, logOut].map((row) => row.getAttribute('icon'))).toEqual(['folder', 'profile', 'logout']);
	});

	it('heeft op de home dezelfde balk zonder terugknop', async () => {
		await mount(headerHome);
		expectTopBar(root, null);
	});

	for (const [name, source] of [['pagina', header], ['home', headerHome]]) {
		it(`zet de balk in een skip link in het header-slot (${name})`, async () => {
			await mount(source);
			const skip = root.querySelector('nldd-page > nldd-skip-link[slot="header"]')!;
			expect(skip.querySelector(':scope > nldd-top-navigation-bar')).not.toBeNull();
		});

		it(`zet de header niet vast en de balk heeft geen eigen menu (${name})`, async () => {
			await mount(source);
			const written = new DOMParser().parseFromString(source, 'text/html');
			expect(written.querySelector('nldd-page')!.hasAttribute('sticky-header')).toBe(false);
			const bar = written.querySelector('nldd-top-navigation-bar')!;
			expect([...bar.children].map((child) => child.getAttribute('slot'))).toEqual(['utility']);
		});

		it(`houdt op smal de woorden en laat de iconen vallen (${name})`, async () => {
			await mount(source);
			const items = [...root.querySelectorAll('nldd-menu-bar[slot="utility"] > nldd-menu-bar-item')];
			expect(items.length).toBe(2);
			expect(items.every((item) => item.getAttribute('content-priority') === 'text')).toBe(true);
		});
	}
});

describe('patroon: paginaopbouw, de footer', () => {
	let root: HTMLElement;

	const mount = async () => {
		root = document.createElement('div');
		root.innerHTML = footer;
		document.body.append(root);
		for (const el of root.querySelectorAll('nldd-title, nldd-page, nldd-page-footer')) await waitForUpdate(el as HTMLElement);
	};

	afterEach(() => {
		root?.remove();
	});

	it('zet de footer in het footer-slot van de pagina, niet in een sectie', async () => {
		await mount();
		expect(root.querySelector('nldd-page > nldd-page-footer[slot="footer"]')).not.toBeNull();
	});

	it('zet het kruimelpad in zijn eigen rij, eindigend op deze pagina', async () => {
		await mount();
		expectBreadcrumbsInFooter(root);
	});

	it('linkt in de juridische rij direct naar contact, toegankelijkheid en privacy', async () => {
		await mount();
		expectLegalBar(root);
	});

	it('geeft de titels in de eigen rij een kopniveau dat aansluit op de pagina', async () => {
		await mount();
		const titles = [...root.querySelectorAll('nldd-page-footer nldd-title')];
		expect(titles.length).toBeGreaterThan(1);
		expect(titles.every((title) => title.getAttribute('heading-level') === '2')).toBe(true);
		expectSoundHeadings(root);
	});

	it('zet de drie rijen in de vaste volgorde: kruimelpad, eigen inhoud, juridische rij', async () => {
		await mount();
		const rows = [...root.querySelector('nldd-page-footer')!.children].map((child) => child.getAttribute('slot') ?? 'default');
		expect(rows).toEqual(['breadcrumbs', 'default', 'legal-bar']);
	});

	it('heeft op de home geen kruimelpad, en houdt de eigen rij en de juridische rij', async () => {
		root = document.createElement('div');
		root.innerHTML = footerHome;
		document.body.append(root);
		for (const el of root.querySelectorAll('nldd-title, nldd-page, nldd-page-footer')) await waitForUpdate(el as HTMLElement);
		expect(root.querySelector('nldd-breadcrumbs')).toBeNull();
		const rows = [...root.querySelector('nldd-page-footer')!.children].map((child) => child.getAttribute('slot') ?? 'default');
		expect(rows).toEqual(['default', 'legal-bar']);
		expectLegalBar(root);
		expectSoundHeadings(root);
	});
});
