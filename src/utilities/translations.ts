/**
 * The translation layer shared by every component.
 *
 * A component looks a text up in this order: its own `translations` property,
 * then what the app set for the whole package with `setTranslations()`, then
 * its Dutch default. The package-wide layer is what reaches a component that
 * another component builds in its shadow root, such as the activity indicator
 * in a loading button or the calendar in a date field: nobody outside can set
 * `translations` on those, but they all read this layer.
 *
 * Keys are language, not content. A text that differs per instance, such as
 * "Aan het bewaren" on one button and "Aan het laden" on another, belongs in an
 * attribute on that element.
 */

type Translations = Record<string, string>;

interface Store {
	translations: Translations;
}

// On globalThis under a registered symbol: the package entry is a bundle and
// the per-component entries are separate modules, so an app that imports both
// loads this file twice. Both copies have to read the same layer.
const STORE_KEY = Symbol.for('nldd.translations');
const store: Store = ((globalThis as Record<symbol, unknown>)[STORE_KEY] ??= { translations: {} }) as Store;

/**
 * Sets the texts for the whole package, replacing what was set before. Keys you
 * leave out fall back to Dutch. To start from the shipped English and change a
 * few texts, spread them: `setTranslations({ ...enUS, 'key': 'Mine' })`.
 *
 * Call it before the components render. Calling it again re-renders the
 * components on the page, so a language switch at runtime works too. Call it
 * when the language changes, not on every render: each call walks the page.
 * A component inside a closed shadow root is out of its reach and keeps its old
 * texts until it renders again; ask it to with `requestUpdate()`.
 */
export function setTranslations(translations: Translations): void {
	store.translations = { ...translations };
	if (import.meta.env?.DEV) warnUnknownKeys(store.translations);
	if (typeof document !== 'undefined') rerender(document);
}

/** What the app set with `setTranslations()`, for tests and debugging. */
export function getTranslations(): Readonly<Translations> {
	return store.translations;
}

/**
 * Looks a key up through the three layers and fills in `{placeholders}`. Every
 * component's `_t()` goes through here, so none of them skips the package-wide
 * layer.
 */
export function translate<T extends Translations>(
	own: Partial<T> | undefined,
	defaults: T,
	key: keyof T,
	vars?: Record<string, string | number>,
): string {
	const name = key as string;
	let text = own?.[key] ?? store.translations[name] ?? defaults[key] ?? name;
	if (vars) {
		for (const [k, v] of Object.entries(vars)) {
			text = text.split(`{${k}}`).join(String(v));
		}
	}
	return text;
}

/** Asks every nldd component on the page, also inside shadow roots, to render again. */
function rerender(root: Document | ShadowRoot | Element): void {
	for (const el of Array.from(root.querySelectorAll('*'))) {
		if (el.tagName.startsWith('NLDD-')) (el as Element & { requestUpdate?: () => void }).requestUpdate?.();
		if (el.shadowRoot) rerender(el.shadowRoot);
	}
}

/**
 * A key no component knows does nothing, silently. That is what happens to an
 * override after a key is renamed, so in DEV it says so. The full key list is
 * loaded only here, so production bundles do not carry it.
 */
function warnUnknownKeys(translations: Translations): void {
	import('../translations/nl.generated.js').then(({ nl }) => {
		const unknown = Object.keys(translations).filter((key) => !(key in nl));
		if (unknown.length) {
			console.warn(`setTranslations: no component knows ${unknown.length === 1 ? 'this key, so it does' : 'these keys, so they do'} nothing: ${unknown.join(', ')}`);
		}
	}).catch(() => {});
}
