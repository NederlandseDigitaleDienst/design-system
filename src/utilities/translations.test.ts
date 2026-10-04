import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../test-utils.js';
import { setTranslations, getTranslations, translate } from './translations.js';
import { nl } from '../translations/nl.generated.js';
import { enUS } from '../translations/en-US.js';
import { fy } from '../translations/fy.js';
import { papAW } from '../translations/pap-AW.js';
import { papCW } from '../translations/pap-CW.js';
import '../components/actions/button/button.js';
import '../components/inputs/date-field/date-field.js';

const defaults = { 'components.demo.label': 'Laden', 'components.demo.count-text': '{count} bestanden' };

describe('translate', () => {
	afterEach(() => setTranslations({}));

	it('falls back to the Dutch default', () => {
		expect(translate({}, defaults, 'components.demo.label')).toBe('Laden');
	});

	it('takes the package-wide layer over the default', () => {
		setTranslations({ 'components.demo.label': 'Loading' });
		expect(translate({}, defaults, 'components.demo.label')).toBe('Loading');
	});

	it('takes the element its own translations over the package-wide layer', () => {
		setTranslations({ 'components.demo.label': 'Loading' });
		expect(translate({ 'components.demo.label': 'Bezig' }, defaults, 'components.demo.label')).toBe('Bezig');
	});

	it('fills in every occurrence of a placeholder', () => {
		expect(translate({}, defaults, 'components.demo.count-text', { count: 3 })).toBe('3 bestanden');
	});

	it('replaces what was set before instead of merging into it', () => {
		setTranslations({ 'components.demo.label': 'Loading' });
		setTranslations({ 'components.demo.count-text': '{count} files' });
		expect(getTranslations()).toEqual({ 'components.demo.count-text': '{count} files' });
	});

	// The package entry is a bundle and every component is its own module too,
	// so an app can load this file twice. Both copies read one store.
	it('keeps the layer on globalThis, where a second copy finds it', () => {
		setTranslations({ 'components.demo.label': 'Loading' });
		const store = (globalThis as Record<symbol, { translations: Record<string, string> }>)[Symbol.for('nldd.translations')];
		expect(store.translations['components.demo.label']).toBe('Loading');
	});
});

// The point of the layer: a component another component builds in its shadow
// root has no translations of its own that anyone outside can set, but it
// reads the package-wide layer.
describe('setTranslations on components', () => {
	let el: HTMLElement;

	afterEach(() => {
		setTranslations({});
		if (el) cleanup(el);
	});

	const indicatorText = (button: HTMLElement) => {
		const indicator = button.shadowRoot!.querySelector('nldd-activity-indicator')!;
		return indicator.shadowRoot!.querySelector('.activity-indicator__text')!.textContent!.trim();
	};

	it('reaches the activity indicator inside a loading button', async () => {
		setTranslations({ 'components.activity-indicator.loading-label': 'Loading' });
		el = await fixture('<nldd-button text="Opslaan" loading></nldd-button>');
		await waitForUpdate(el);
		await waitForUpdate(el.shadowRoot!.querySelector('nldd-activity-indicator') as HTMLElement);
		expect(indicatorText(el)).toBe('Loading');
	});

	it('renders the components already on the page again', async () => {
		el = await fixture('<nldd-button text="Opslaan" loading></nldd-button>');
		const indicator = el.shadowRoot!.querySelector('nldd-activity-indicator') as HTMLElement;
		await waitForUpdate(indicator);
		expect(indicatorText(el)).toBe('Laden');

		setTranslations({ 'components.activity-indicator.loading-label': 'Loading' });
		await waitForUpdate(indicator);
		expect(indicatorText(el)).toBe('Loading');
	});

	it('lets loading-text on one button say something else', async () => {
		setTranslations({ 'components.activity-indicator.loading-label': 'Loading' });
		el = await fixture('<nldd-button text="Opslaan" loading loading-text="Aan het bewaren"></nldd-button>');
		await waitForUpdate(el);
		await waitForUpdate(el.shadowRoot!.querySelector('nldd-activity-indicator') as HTMLElement);
		expect(indicatorText(el)).toBe('Aan het bewaren');
	});

	it('reaches the calendar a date field builds', async () => {
		setTranslations({ 'components.date-picker.view-today-action': 'Today' });
		el = await fixture('<nldd-date-field></nldd-date-field>');
		await waitForUpdate(el);
		const picker = el.shadowRoot!.querySelector('nldd-date-picker') as HTMLElement & { _t(key: string): string };
		expect(picker).not.toBeNull();
		expect(picker._t('components.date-picker.view-today-action')).toBe('Today');
	});
});

describe('the translation sets', () => {
	afterEach(() => setTranslations({}));

	it('ships US English for every key a component knows, and nothing else', () => {
		expect(Object.keys(enUS).sort()).toEqual(Object.keys(nl).sort());
	});

	// The concept sets are partial on purpose: a missing key falls back to
	// Dutch. A key no component knows, though, would do nothing at all.
	it.each([['fy', fy], ['pap-AW', papAW], ['pap-CW', papCW]])('%s only uses keys a component knows', (_name, set) => {
		expect(Object.keys(set).filter((key) => !(key in nl))).toEqual([]);
	});

	it.each([['en-US', enUS], ['fy', fy], ['pap-AW', papAW], ['pap-CW', papCW]])('%s keeps the placeholders of the Dutch text', (_name, set) => {
		const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort();
		for (const [key, text] of Object.entries(set)) {
			expect(placeholders(text as string), key).toEqual(placeholders(nl[key as keyof typeof nl]));
		}
	});

	// nl.generated.ts is built from the {name}.i18n.ts files. A component whose
	// file is missing from it would be invisible to the DEV warning and to the
	// en-US type.
	it('lists every key in the i18n files of the components', async () => {
		const modules = import.meta.glob('../components/**/*.i18n.ts', { eager: true }) as Record<string, Record<string, unknown>>;
		const keys = Object.values(modules).flatMap((mod) =>
			Object.entries(mod)
				.filter(([name]) => /^nldd\w+Translations$/.test(name))
				.flatMap(([, value]) => Object.keys(value as object)),
		);
		expect(Object.keys(nl).sort()).toEqual([...new Set(keys)].sort());
	});

	it('warns in DEV about a key no component knows', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		setTranslations({ 'components.activity-indicator.loading-label': 'Loading', 'components.buton.typo-label': 'x' });
		await vi.waitFor(() => expect(warn).toHaveBeenCalled());
		expect(warn.mock.calls[0][0]).toContain('components.buton.typo-label');
		expect(warn.mock.calls[0][0]).not.toContain('activity-indicator');
		warn.mockRestore();
	});
});
