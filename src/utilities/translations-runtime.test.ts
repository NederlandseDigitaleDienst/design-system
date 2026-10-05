import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../test-utils.js';
import { setTranslations } from './translations.js';
import '../components/lists-and-tables/table/table.js';
import '../components/lists-and-tables/list/list.js';
import '../components/lists-and-tables/list-item/list-item.js';
import '../components/navigation/top-navigation-bar/top-navigation-bar.js';
import '../components/navigation/menu-bar/menu-bar.js';
import '../components/content/code-viewer/code-viewer.js';
import '../components/content/rich-text/rich-text.js';
import '../components/content/rich-text/rich-text.css';
import '../assets/styles/variables.css';

/* setTranslations() at runtime re-renders every component. These are the
 * texts a component puts on the page outside its own template; each has to
 * follow the switch as well. */
describe('setTranslations() at runtime reaches the texts set outside a template', () => {
	let el: HTMLElement;

	afterEach(() => {
		setTranslations({});
		if (el) cleanup(el);
	});

	const switchTo = async (texts: Record<string, string>) => {
		setTranslations(texts);
		await waitForUpdate(el);
		await new Promise((resolve) => requestAnimationFrame(resolve));
	};

	it('nldd-table: the fallback name', async () => {
		el = await fixture('<nldd-table columns="1fr"></nldd-table>');
		await switchTo({ 'components.table.accessible-label': 'Grid' });
		expect(el.getAttribute('aria-label')).toBe('Grid');
	});

	it('nldd-list: the navigation name and the arrow key description', async () => {
		el = await fixture(`
			<nldd-list type="navigation">
				<nldd-list-item text="Aanvraag A-1042" href="/a-1042"></nldd-list-item>
				<nldd-list-item text="Aanvraag A-1043" href="/a-1043"></nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(el);
		const hadDescription = el.hasAttribute('aria-description');
		await switchTo({
			'components.list.navigation-accessible-label': 'Nav',
			'components.list.arrow-navigation-description-text': 'Use the arrows.',
		});
		expect(el.getAttribute('aria-label')).toBe('Nav');
		if (hadDescription) expect(el.getAttribute('aria-description')).toBe('Use the arrows.');
	});

	it('nldd-list: leaves a name the consumer set', async () => {
		el = await fixture('<nldd-list type="navigation" aria-label="Mijn Dienst"></nldd-list>');
		await switchTo({ 'components.list.navigation-accessible-label': 'Nav' });
		expect(el.getAttribute('aria-label')).toBe('Mijn Dienst');
	});

	it('nldd-top-navigation-bar: the name of a slotted menu bar', async () => {
		el = await fixture(`
			<nldd-top-navigation-bar>
				<nldd-menu-bar slot="utility"></nldd-menu-bar>
			</nldd-top-navigation-bar>
		`);
		await waitForUpdate(el);
		await switchTo({ 'components.top-navigation-bar.utility-menu-bar-label': 'Utility' });
		expect(el.querySelector('nldd-menu-bar')!.getAttribute('accessible-label')).toBe('Utility');
	});

	it('nldd-code-viewer: the name of a scrolling region', async () => {
		el = await fixture(`<nldd-code-viewer style="width: 120px;">const aanvraag = 'A-1042 Dakisolatie in behandeling, een lange regel die scrolt';</nldd-code-viewer>`);
		await waitForUpdate(el);
		await new Promise((resolve) => setTimeout(resolve, 100));
		const scroller = el.shadowRoot!.querySelector('.cm-scroller')!;
		expect(scroller.getAttribute('role')).toBe('region');
		await switchTo({ 'components.code-viewer.region-label': 'Source' });
		expect(scroller.getAttribute('aria-label')).toBe('Source');
	});

	it('nldd-rich-text: the name of a scrolling table it labelled itself', async () => {
		el = await fixture(`
			<nldd-rich-text style="width: 120px;">
				<table><tr><td>Aanvraag A-1042 Dakisolatie in behandeling</td><td>Aanvraag A-1043 Warmtepomp afgerond</td></tr></table>
			</nldd-rich-text>
		`);
		await waitForUpdate(el);
		await new Promise((resolve) => requestAnimationFrame(resolve));
		const table = el.querySelector('table')!;
		expect(table.hasAttribute('aria-label')).toBe(true);
		await switchTo({ 'components.rich-text.table-scroll-label': 'Table that scrolls' });
		expect(table.getAttribute('aria-label')).toBe('Table that scrolls');
	});
});
