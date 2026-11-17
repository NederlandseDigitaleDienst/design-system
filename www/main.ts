/**
 * What only the landing page runs. The components are not imported here: every
 * page gets an entry of its own with the ones its markup uses (see
 * www/build/pages.js), so a new component on the page needs no import.
 */
import { iconRegistry } from '../src/components/content/icon/icon-registry.ts';
import { applyPreferences, getPreference, setPreference } from './client/preferences.ts';

/**
 * The icon count in the page comes from the registry, so it never falls behind.
 * The number in the HTML is what a reader without script gets.
 */
for (const el of document.querySelectorAll<HTMLElement>('[data-icon-count]')) {
	// The text is in the element in its slot: a heading of a title, a span of a text.
	const text = el.dataset.iconCount!.replace('{n}', String(iconRegistry.size));
	const holder = el.querySelector(':scope > :is(h1, h2, h3, h4, h5, h6, p, span)');
	if (holder) holder.textContent = text;
}

/**
 * The swatch picker in "Eén overheid" sets the theme of the whole page, so
 * the visitor sees the system change colour around them. Lintblauw is the
 * default and has no theme of its own. The title names the chosen colour,
 * since there is no hover on a phone and several of them look alike.
 */
const themePicker = document.querySelector('#thema-keuze');
const showTheme = (value: string): void => {
	const name = themePicker?.querySelector(`nldd-swatch-picker-item[value="${value}"]`)?.getAttribute('text');
	const heading = document.querySelector('#thema-titel > h3');
	if (name && heading) heading.textContent = `Thema: ${name}`;
};
themePicker?.addEventListener('change', (event) => {
	const value = (event as CustomEvent<{ value: string }>).detail.value;
	setPreference('theme', value === 'lintblauw' ? '' : value);
	showTheme(value);
});

/** Light, dark or the system setting, for the whole page. */
const schemePicker = document.querySelector('#kleurmodus');
schemePicker?.addEventListener('change', (event) => {
	const { selected, value } = (event as CustomEvent<{ selected: boolean; value: string }>).detail;
	if (selected) setPreference('scheme', value === 'systeem' ? '' : value);
});

/**
 * Both choices travel along to the other pages, so a component can be seen in
 * the chosen color. Back here, the pickers show what was chosen.
 */
applyPreferences();
const chosenTheme = getPreference('theme');
if (chosenTheme) {
	themePicker?.setAttribute('value', chosenTheme);
	showTheme(chosenTheme);
}
const chosenScheme = getPreference('scheme');
if (chosenScheme) {
	for (const button of schemePicker?.querySelectorAll('nldd-toggle-button') ?? []) {
		button.toggleAttribute('selected', button.getAttribute('value') === chosenScheme);
	}
}

/**
 * The switch draws the safe triangle that keeps a submenu open while the
 * pointer travels to it. Only a mouse has that travel, so the container around
 * the switch has hide-on="touch". The debug property is internal to nldd-menu;
 * this page shows it on purpose.
 */
const triangle = document.querySelector<HTMLElement>('#veilige-driehoek');
triangle?.addEventListener('change', (event) => {
	const { checked } = (event as CustomEvent<{ checked: boolean }>).detail;
	const menus = triangle.closest('nldd-card')?.querySelectorAll('nldd-menu') ?? [];
	for (const menu of menus) (menu as HTMLElement & { debugSafeTriangle: boolean }).debugSafeTriangle = checked;
});

/** The framework switch in "Eén techniek" shows the same form in each framework. */
document.querySelector('#framework')?.addEventListener('change', (event) => {
	const { value } = (event as CustomEvent<{ value: string }>).detail;
	for (const viewer of document.querySelectorAll<HTMLElement>('nldd-code-viewer[data-framework]')) {
		viewer.hidden = viewer.dataset.framework !== value;
	}
});

/** The start date in the example form opens on today, in local time. */
const today = new Date();
const pad = (n: number): string => String(n).padStart(2, '0');
document.querySelector('#startdatum')?.setAttribute(
	'value',
	`${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`,
);
