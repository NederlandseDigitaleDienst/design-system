import { describe, it, expect, afterEach, vi } from 'vitest';
import '../components/index.js';
import data from '../../lint/data.generated.json';
import { devRules } from './dev-rules.generated.js';
import { checkElementTranslationKeys, createFoucCheck, createGlobalSheetCheck, createRegistrationCheck, findMissingSheets, findRoots, findUndefined, findViolations, lacksFoucGuard, settleDelay, stateRulesOf } from './dev-checks.js';
import textCss from '../components/content/text/text.css?inline';
import titleCss from '../components/content/title/title.css?inline';
import linkCss from '../components/navigation/link/link.css?inline';
import variablesCss from '../assets/styles/variables.css?inline';
import { loadingTags } from './loading-tags.js';
import foucCss from '../assets/styles/fouc.css?inline';

const patterns = import.meta.glob('../patterns/**/*.html', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

describe('rules in the browser', () => {
	let root: HTMLElement;

	const mount = async (markup: string) => {
		root = document.createElement('div');
		root.innerHTML = markup;
		document.body.append(root);
		await new Promise((resolve) => setTimeout(resolve, 20));
	};

	afterEach(() => root?.remove());

	// Every rule the browser runs, as lint/rule-compiler.js decides.
	for (const rule of devRules) {
		const examples = data.rules.find((each) => each.id === rule.id)?.examples;
		if (!examples) continue;

		it(`${rule.id} agrees with its examples`, async () => {
			for (const example of examples.passed) {
				await mount(example);
				expect(findViolations(root, [rule]), example).toEqual([]);
				root.remove();
			}
			for (const example of examples.failed) {
				await mount(example.replace(/<\/?(html|body)>/g, ''));
				// The document, not root: a notification moves itself to its area.
				expect(findViolations(document, [rule]).length, example).toBeGreaterThan(0);
				root.remove();
			}
		});
	}

	it('finds nothing in the patterns', async () => {
		for (const [file, markup] of Object.entries(patterns)) {
			await mount(markup);
			const found = findViolations(root).map(({ rule }) => `${file}: ${rule.id}`);
			expect(found).toEqual([]);
			root.remove();
		}
	});

	it('looks inside an app component, and not inside our own', async () => {
		await mount('<div id="app-component"></div><nldd-button text="Bewaar"></nldd-button>');
		const shadow = root.querySelector('#app-component')!.attachShadow({ mode: 'open' });
		shadow.innerHTML = '<nldd-icon-button icon="plus"></nldd-icon-button>';
		await new Promise((resolve) => setTimeout(resolve, 20));

		expect(findViolations(root)).toEqual([]);
		const roots = findRoots(root);
		expect(roots).toEqual([root, shadow]);
		expect(roots.flatMap((each) => findViolations(each)).map(({ rule }) => rule.id)).toEqual(['icon-button-needs-name']);
	});

	it('reports an icon that does not exist on the component that renders it', async () => {
		await mount('<nldd-button text="Bewaar" start-icon="bestaat-niet"></nldd-button>');
		await (root.firstElementChild as HTMLElement & { updateComplete: Promise<boolean> }).updateComplete;
		await new Promise((resolve) => setTimeout(resolve, 20));
		expect(findViolations(root).map(({ rule }) => rule.id)).toContain('icon-not-found');
	});

	it('keeps an unknown icon reported next to a valid one', async () => {
		await mount('<nldd-button text="Bewaar" start-icon="bestaat-niet" end-icon="plus"></nldd-button>');
		await (root.firstElementChild as HTMLElement & { updateComplete: Promise<boolean> }).updateComplete;
		await new Promise((resolve) => setTimeout(resolve, 20));
		expect(findViolations(root).map(({ rule }) => rule.id)).toContain('icon-not-found');
	});

	it('forgets an icon that was fixed', async () => {
		await mount('<nldd-button text="Bewaar" start-icon="bestaat-niet"></nldd-button>');
		const button = root.firstElementChild as HTMLElement & { startIcon: string; updateComplete: Promise<boolean> };
		await button.updateComplete;
		await new Promise((resolve) => setTimeout(resolve, 20));
		button.startIcon = 'plus';
		await button.updateComplete;
		await new Promise((resolve) => setTimeout(resolve, 20));
		expect(findViolations(root).map(({ rule }) => rule.id)).not.toContain('icon-not-found');
	});

	it('finds the second control in a labeled field, which the field does not name', async () => {
		await mount('<nldd-form-field label="Naam"><nldd-text-field></nldd-text-field><nldd-number-field></nldd-number-field></nldd-form-field>');
		expect(findViolations(root).map(({ rule }) => rule.id)).toEqual(['number-field-needs-name']);
	});

	it('survives an icon in a detached link', async () => {
		await mount('<a href="/a"><nldd-icon icon="plus"></nldd-icon></a>');
		const link = root.firstElementChild!;
		const icon = link.firstElementChild as HTMLElement & { icon: string; updateComplete: Promise<boolean> };
		link.remove();
		icon.icon = 'bestaat-niet';
		await expect(icon.updateComplete).resolves.toBeDefined();
	});

	it('takes a consumer element that says it is an input for an input', async () => {
		class MyInput extends HTMLElement {
			static isFormInput = true;
		}
		customElements.define('my-dev-checks-input', MyInput);
		await mount('<nldd-form-field label="Naam"><my-dev-checks-input></my-dev-checks-input></nldd-form-field>');
		expect(findViolations(root).map(({ rule }) => rule.id)).not.toContain('form-field-needs-input');
	});

	it('sees a value set as a property, as a framework does', async () => {
		await mount('<nldd-icon-button icon="plus"></nldd-icon-button>');
		const rule = devRules.filter(({ id }) => id === 'icon-button-needs-name');
		expect(findViolations(root, rule)).toHaveLength(1);
		const button = root.firstElementChild as HTMLElement & { accessibleLabel: string; updateComplete: Promise<boolean> };
		button.accessibleLabel = 'Sluit';
		await button.updateComplete;
		expect(findViolations(root, rule)).toEqual([]);
	});
});

describe('unregistered elements', () => {
	it('finds an nldd-* element no module defines, and leaves other tags alone', () => {
		const root = document.createElement('div');
		root.innerHTML = '<nldd-button text="Opslaan"></nldd-button><nldd-not-imported></nldd-not-imported><other-library-element></other-library-element>';
		expect(findUndefined([root]).map((element) => element.localName)).toEqual(['nldd-not-imported']);
	});

	it('waits for a module the autoloader is still loading', () => {
		vi.useFakeTimers();
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const element = document.createElement('nldd-slow-to-load');
		document.body.append(element);
		loadingTags.add('nldd-slow-to-load');
		try {
			const check = createRegistrationCheck();
			check();
			vi.advanceTimersByTime(5000);
			check();
			expect(warn).not.toHaveBeenCalled();
			loadingTags.delete('nldd-slow-to-load');
			check();
			expect(warn).toHaveBeenCalledOnce();
		} finally {
			loadingTags.delete('nldd-slow-to-load');
			element.remove();
			warn.mockRestore();
			vi.useRealTimers();
		}
	});
});

describe('FOUC guard', () => {
	let root: HTMLElement | undefined;
	let style: HTMLStyleElement | undefined;

	afterEach(() => {
		root?.remove();
		style?.remove();
	});

	const mount = (markup: string) => {
		root = document.createElement('div');
		root.innerHTML = markup;
		document.body.append(root);
	};

	it('says nothing on a page without components', () => {
		mount('<p>Mijn Dienst</p>');
		expect(lacksFoucGuard(root)).toBe(false);
	});

	it('finds a page with components and no guard', () => {
		mount('<nldd-button text="Bewaar"></nldd-button>');
		expect(lacksFoucGuard(root)).toBe(true);
	});

	it('finds the guard once fouc.css is loaded', () => {
		style = document.createElement('style');
		style.textContent = foucCss;
		document.head.append(style);
		mount('<nldd-button text="Bewaar"></nldd-button>');
		expect(lacksFoucGuard(root)).toBe(false);
	});
});

describe('when the checks run', () => {
	it('re-checks every rule that reads a :state(), also in its assert', () => {
		const ids = stateRulesOf(devRules).map((rule) => rule.id);
		const inAssert = devRules.filter((rule) => rule.assert?.includes(':state(') && !rule.context.includes(':state('));
		expect(inAssert.length).toBeGreaterThan(0);
		for (const rule of inAssert) expect(ids).toContain(rule.id);
		expect(ids.every((id) => JSON.stringify(devRules.find((rule) => rule.id === id)).includes(':state('))).toBe(true);
	});

	it('waits for a page to settle, but not longer than a second', () => {
		expect(settleDelay(0)).toBe(300);
		expect(settleDelay(999)).toBe(300);
		expect(settleDelay(1000)).toBe(0);
	});

	it('checks the FOUC guard once, when the first component appears', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const check = createFoucCheck();
		const root = document.createElement('div');
		document.body.append(root);
		const foucWarnings = () => warn.mock.calls.filter(([message]) => String(message).includes('fouc.css')).length;
		// Earlier tests may leave components in the body; then the first call already counts.
		const empty = ![...document.body.querySelectorAll('*')].some((element) => element.localName.startsWith('nldd-'));
		try {
			check();
			if (empty) expect(foucWarnings()).toBe(0);
			root.innerHTML = '<nldd-button text="Bewaar"></nldd-button>';
			check();
			check();
			expect(foucWarnings()).toBe(1);
		} finally {
			root.remove();
			warn.mockRestore();
		}
	});
});

describe('global stylesheets', () => {
	let root: HTMLElement | undefined;
	const styles: HTMLStyleElement[] = [];

	afterEach(() => {
		root?.remove();
		for (const style of styles.splice(0)) style.remove();
		vi.restoreAllMocks();
	});

	const mount = (markup: string) => {
		root = document.createElement('div');
		root.innerHTML = markup;
		document.body.append(root);
		load(variablesCss);
	};
	const load = (...sheets: string[]) => {
		for (const css of sheets) {
			const style = document.createElement('style');
			style.textContent = css;
			document.head.append(style);
			styles.push(style);
		}
	};
	const page = '<nldd-text><p>Aanvraag <a href="/a">A-1042</a></p></nldd-text><nldd-title><h2>Dossier D-318</h2></nldd-title><nldd-link><a href="/d">Dossier D-319</a></nldd-link>';

	it('finds each sheet that an element needs and the page does not load', () => {
		mount(page);
		expect(findMissingSheets()).toEqual(['text', 'title', 'link']);
		load(textCss, titleCss, linkCss);
		expect(findMissingSheets()).toEqual([]);
	});

	it('needs no sheet for text in an attribute', () => {
		mount('<nldd-text text="Dakisolatie"></nldd-text><nldd-title text="Dossier D-318"></nldd-title><nldd-link href="/d" text="Dossier D-319"></nldd-link>');
		expect(findMissingSheets()).toEqual([]);
	});

	it('warns once per sheet, and names the entry point', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		mount(page);
		load(titleCss, linkCss);
		const check = createGlobalSheetCheck();
		check();
		check();
		expect(warn).toHaveBeenCalledTimes(1);
		expect(warn.mock.calls[0][0]).toContain("'@nldd/design-system/styles/text'");
	});
});

describe('translations on one element', () => {
	afterEach(() => vi.restoreAllMocks());

	it('warns once about a key the element does not read', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const known = ['components.split-button.show-options-action'];
		checkElementTranslationKeys(['components.split-button.menu-action', ...known], known);
		checkElementTranslationKeys(['components.split-button.menu-action'], known);
		expect(warn).toHaveBeenCalledTimes(1);
		expect(warn.mock.calls[0][0]).toContain('components.split-button.menu-action');
		expect(warn.mock.calls[0][0]).not.toContain('show-options-action');
	});

	it('stays quiet when every key is known', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		checkElementTranslationKeys(['components.button.link-hint-download-lowercase-label'], ['components.button.link-hint-download-lowercase-label']);
		expect(warn).not.toHaveBeenCalled();
	});
});
