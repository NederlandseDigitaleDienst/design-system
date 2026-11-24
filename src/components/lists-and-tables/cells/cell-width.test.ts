import { describe, it, expect, afterEach } from 'vitest';
import '../../../assets/styles/variables.css';
import { fixture, cleanup } from '../../../test-utils.js';
import './text-cell/text-cell.js';
import './title-cell/title-cell.js';
import './description-cell/description-cell.js';
import '../table/table.js';
import { hyphenateBodyText, wrapBodyText } from '../../../assets/styles/text-wrap.js';
import { wrapOf, wrapOfSets } from '../../../assets/styles/text-wrap.fixtures.js';

const URL_TEXT = 'https://mijndienst.example.nl/aanvragen/A-1042/documenten/besluit';

/** A cell of each kind, with `attrs` and the given text. */
const CELLS: Record<string, (text: string, attrs?: string) => string> = {
	'nldd-text-cell': (text, attrs = '') => `<nldd-text-cell ${attrs} text="${text}"></nldd-text-cell>`,
	'nldd-title-cell': (text, attrs = '') => `<nldd-title-cell ${attrs} text="${text}"></nldd-title-cell>`,
	'nldd-description-cell': (text, attrs = '') =>
		`<nldd-description-cell ${attrs}><p slot="title">Status</p><p slot="description">${text}</p></nldd-description-cell>`,
};

/** The element that holds the main text of a cell. */
function textOf(cell: Element): Element {
	if (cell.localName === 'nldd-description-cell') return cell.querySelector('[slot="description"]')!;
	return cell.shadowRoot!.querySelector('.text-cell__text, .title-cell__title')!;
}

async function row(width: number, cells: string): Promise<HTMLElement> {
	const el = await fixture<HTMLElement>(`<div style="display: flex; width: ${width}px">${cells}</div>`);
	await Promise.all([...el.children].map((c) => (c as HTMLElement & { updateComplete?: Promise<unknown> }).updateComplete));
	return el;
}

const widthOf = (el: Element) => el.getBoundingClientRect().width;

describe.each(Object.keys(CELLS))('%s – width and breaking', (tag) => {
	const cell = CELLS[tag];
	let el: HTMLElement;

	afterEach(() => cleanup(el));

	it('keeps a full cell at 160px beside a long fit-content value', async () => {
		el = await row(300, cell('Bestand') + cell(URL_TEXT, 'width="fit-content" min-width="0"'));
		expect(widthOf(el.children[0])).toBeGreaterThanOrEqual(160);
	});

	it('breaks a long value in a fit-content cell with min-width="0" inside the row', async () => {
		el = await row(300, cell('Bestand') + cell(URL_TEXT, 'width="fit-content" min-width="0"'));
		const value = el.children[1];
		expect(el.scrollWidth).toBeLessThanOrEqual(300);
		expect(textOf(value).scrollWidth).toBeLessThanOrEqual(Math.ceil(widthOf(value)));
	});

	it('lets the row run wider than three full cells of 160px fit', async () => {
		el = await row(400, cell('Een') + cell('Twee') + cell('Drie'));
		for (const child of el.children) expect(widthOf(child)).toBeGreaterThanOrEqual(160);
	});

	it('never makes a fit-content cell narrower than its longest word', async () => {
		el = await row(40, cell('In behandeling', 'width="fit-content"'));
		const text = textOf(el.children[0]);
		expect(text.scrollWidth).toBeLessThanOrEqual(Math.ceil(widthOf(el.children[0])));
		expect(widthOf(el.children[0])).toBeGreaterThan(40);
	});

	it('keeps the text on one line with min-width="max-content"', async () => {
		el = await row(80, cell('In behandeling', 'width="fit-content" min-width="max-content"'));
		const text = textOf(el.children[0]) as HTMLElement;
		const lineHeight = parseFloat(getComputedStyle(text).lineHeight);
		expect(text.getBoundingClientRect().height).toBeLessThan(lineHeight * 1.5);
	});

	it('lets min-width win over the floor', async () => {
		el = await row(300, cell('Bestand', 'min-width="40px"') + cell(URL_TEXT, 'width="fit-content" min-width="max-content"'));
		expect(widthOf(el.children[0])).toBeLessThan(160);
	});

	it('lowers the floor to a max-width below 160px', async () => {
		el = await row(600, cell('Bestand', 'max-width="120px"') + cell(URL_TEXT, 'width="fit-content" min-width="max-content"'));
		expect(widthOf(el.children[0])).toBeLessThanOrEqual(120);
	});

	it('drops the floor in a table, where the columns set the width', async () => {
		el = await fixture<HTMLElement>(`
			<nldd-table columns="80px 1fr" accessible-label="Aanvragen">
				<nldd-table-row>${cell('Omgevingsvergunning')}${cell('Dakisolatie')}</nldd-table-row>
			</nldd-table>`);
		await new Promise((r) => requestAnimationFrame(r));
		const first = el.querySelector(tag)!;
		expect(widthOf(first)).toBeLessThanOrEqual(80);
	});

	it('breaks text with wrapBodyText', async () => {
		el = await row(300, cell('Aanvraag A-1042'));
		expect(wrapOf(textOf(el.children[0]))).toEqual(wrapOfSets(wrapBodyText));
	});

	it('hyphenates with hyphens', async () => {
		el = await row(300, cell('Aanvraag A-1042', 'hyphens'));
		expect(wrapOf(textOf(el.children[0]))).toEqual(wrapOfSets(wrapBodyText, hyphenateBodyText));
	});
});
