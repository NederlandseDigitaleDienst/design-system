/* Only the components this page uses, so it does not wait for the hundred
   others. Add an import when the page gets a new one. */
import '../src/components/actions/button/button.ts';
import '../src/components/actions/button-group/button-group.ts';
import '../src/components/actions/menu/menu-item.ts';
import '../src/components/actions/menu/menu.ts';
import '../src/components/content/avatar-group/avatar-group.ts';
import '../src/components/content/avatar/avatar.ts';
import '../src/components/content/code-viewer/code-viewer.ts';
import '../src/components/content/icon/icon.ts';
import { iconRegistry } from '../src/components/content/icon/icon-registry.ts';
import '../src/components/content/identity/identity.ts';
import '../src/components/content/rich-text/rich-text.ts';
import '../src/components/content/tag/tag.ts';
import '../src/components/content/text/text.ts';
import '../src/components/content/title/title.ts';
import '../src/components/forms/form-field/form-field.ts';
import '../src/components/inputs/checkbox-field/checkbox-field.ts';
import '../src/components/inputs/date-field/date-field.ts';
import '../src/components/inputs/dropdown/dropdown.ts';
import '../src/components/inputs/number-field/number-field.ts';
import '../src/components/inputs/radio-button-field/radio-button-field.ts';
import '../src/components/inputs/radio-button-group/radio-button-group.ts';
import '../src/components/inputs/segmented-control/segmented-control.ts';
import '../src/components/inputs/slider/slider.ts';
import '../src/components/inputs/swatch-picker/swatch-picker.ts';
import '../src/components/inputs/switch-field/switch-field.ts';
import '../src/components/inputs/text-field/text-field.ts';
import '../src/components/inputs/time-field/time-field.ts';
import '../src/components/inputs/toggle-button-group/toggle-button-group.ts';
import '../src/components/inputs/toggle-button/toggle-button.ts';
import '../src/components/inputs/token-field/token-field.ts';
import '../src/components/layout/card/card.ts';
import '../src/components/layout/container/container.ts';
import '../src/components/layout/page-footer/page-footer.ts';
import '../src/components/layout/page-sections/hero/hero.ts';
import '../src/components/layout/page-sections/one-half-one-half-section/one-half-one-half-section.ts';
import '../src/components/layout/page-sections/one-third-two-thirds-section/one-third-two-thirds-section.ts';
import '../src/components/layout/page-sections/simple-section/simple-section.ts';
import '../src/components/layout/page/page.ts';
import '../src/components/layout/shell/shell.ts';
import '../src/components/layout/spacer/spacer.ts';
import '../src/components/lists-and-tables/cells/cell/cell.ts';
import '../src/components/lists-and-tables/cells/icon-cell/icon-cell.ts';
import '../src/components/lists-and-tables/cells/spacer-cell/spacer-cell.ts';
import '../src/components/lists-and-tables/cells/step-cell/step-cell.ts';
import '../src/components/lists-and-tables/cells/title-cell/title-cell.ts';
import '../src/components/lists-and-tables/list-item/list-item.ts';
import '../src/components/lists-and-tables/list/list.ts';
import '../src/components/navigation/skip-link/skip-link.ts';
import '../src/components/navigation/top-navigation-bar/top-navigation-bar.ts';
import '../src/components/status-and-feedback/badge/badge.ts';
import '../src/components/status-and-feedback/banner/banner.ts';
import '../src/components/status-and-feedback/inline-dialog/inline-dialog.ts';
import '../src/components/status-and-feedback/progress-bar/progress-bar.ts';
import '../src/components/status-and-feedback/progress-circle/progress-circle.ts';
import '../src/components/status-and-feedback/step-bar/step-bar.ts';

const root = document.documentElement;

/** The icon count in the page comes from the registry, so it never falls behind. */
for (const title of document.querySelectorAll<HTMLElement>('[data-icon-count]')) {
	title.setAttribute('text', title.dataset.iconCount!.replace('{n}', String(iconRegistry.size)));
}

/**
 * The swatch picker in "Eén overheid" sets the theme of the whole page, so
 * the visitor sees the system change colour around them. Lintblauw is the
 * default and has no theme of its own. The title names the chosen colour,
 * since there is no hover on a phone and several of them look alike.
 */
const themePicker = document.querySelector('#thema-keuze');
themePicker?.addEventListener('change', (event) => {
	const value = (event as CustomEvent<{ value: string }>).detail.value;
	if (value === 'lintblauw') root.removeAttribute('data-nldd-theme');
	else root.setAttribute('data-nldd-theme', value);
	const name = themePicker.querySelector(`nldd-swatch-picker-item[value="${value}"]`)?.getAttribute('text');
	if (name) document.querySelector('#thema-titel')?.setAttribute('text', `Thema: ${name}`);
});

/** Light, dark or the system setting, for the whole page. */
document.querySelector('#kleurmodus')?.addEventListener('change', (event) => {
	const { selected, value } = (event as CustomEvent<{ selected: boolean; value: string }>).detail;
	if (!selected) return;
	if (value === 'systeem') root.removeAttribute('data-scheme');
	else root.setAttribute('data-scheme', value);
});

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
