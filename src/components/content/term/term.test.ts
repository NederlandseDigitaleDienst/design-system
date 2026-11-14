import { describe, it, expect, afterEach, beforeAll, afterAll } from 'vitest';
import { fixture, cleanup, waitForUpdate, reduceMotion } from '../../../test-utils.js';
import './term.js';
import type { NLDDTerm } from './term.js';
import type { NLDDPopover } from '../../layout/popover/popover.js';

let restoreMotion: () => Promise<void>;
beforeAll(async () => { restoreMotion = await reduceMotion(); });
afterAll(async () => { await restoreMotion(); });

function triggerOf(term: NLDDTerm): HTMLElement {
	return term.shadowRoot!.querySelector<HTMLElement>('.term')!;
}

describe('nldd-term with definition', () => {
	let el: NLDDTerm;
	let trigger: HTMLElement;
	let popover: NLDDPopover;

	async function setup(markup = '<nldd-term definition="Degene die het doel vaststelt.">\n\tverwerkings&shy;verantwoordelijke\n</nldd-term>'): Promise<void> {
		el = await fixture<NLDDTerm>(markup);
		await waitForUpdate(el);
		trigger = triggerOf(el);
		popover = el.shadowRoot!.querySelector('nldd-popover')!;
		if (popover) await waitForUpdate(popover);
	}

	afterEach(() => {
		if (popover?.matches(':popover-open')) popover.hidePopover();
		if (el) cleanup(el);
	});

	it('rendert zonder fouten', async () => {
		await setup();
		expect(el.shadowRoot).not.toBeNull();
	});

	it('shows the term without the whitespace around it', async () => {
		await setup();
		// The underline would run into a space left in the span.
		expect(trigger.textContent).toBe('verwerkings\u00ADverantwoordelijke');
	});

	it('is a button that names its popover', async () => {
		await setup();
		expect(trigger.getAttribute('role')).toBe('button');
		expect(trigger.tabIndex).toBe(0);
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
		// The soft hyphen breaks the word in the sentence, not in the name.
		expect(popover.getAttribute('aria-label')).toBe('verwerkingsverantwoordelijke');
		expect(popover.textContent).toContain('Degene die het doel vaststelt.');
	});

	it('shows a source under the definition, as a link with source-href', async () => {
		await setup('<nldd-term definition="Degene die het doel vaststelt." source="Artikel 4 AVG" source-href="https://example.org">verwerkingsverantwoordelijke</nldd-term>');
		const link = popover.querySelector('nldd-link');
		expect(link?.getAttribute('href')).toBe('https://example.org');
		expect(link?.textContent).toBe('Artikel 4 AVG');
		expect(popover.textContent).toContain('Bron:');
	});

	it('shows a source without a link, and none without source', async () => {
		await setup('<nldd-term definition="Degene die het doel vaststelt." source="Begrippenkader">verwerkingsverantwoordelijke</nldd-term>');
		expect(popover.querySelector('nldd-link')).toBe(null);
		expect(popover.textContent).toContain('Begrippenkader');
		cleanup(el);
		await setup();
		expect(popover.textContent).not.toContain('Bron:');
	});

	it('opens on a click', async () => {
		await setup();
		trigger.click();
		await waitForUpdate(popover);
		expect(popover.matches(':popover-open')).toBe(true);
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		expect(popover.anchorElement).toBe(trigger);
	});

	it('opens on Enter and on Space', async () => {
		await setup();
		trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
		await waitForUpdate(popover);
		expect(popover.matches(':popover-open')).toBe(true);
		popover.hidePopover();
		await waitForUpdate(popover);
		const down = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
		trigger.dispatchEvent(down);
		// Space does not scroll, and acts when the key comes up.
		expect(down.defaultPrevented).toBe(true);
		expect(popover.matches(':popover-open')).toBe(false);
		trigger.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true, cancelable: true }));
		await waitForUpdate(popover);
		expect(popover.matches(':popover-open')).toBe(true);
	});
});

describe('nldd-term with popovertarget', () => {
	let wrapper: HTMLElement;
	let popover: NLDDPopover;
	let first: NLDDTerm;
	let second: NLDDTerm;

	const MARKUP = '<div>'
		+ '<p>De <nldd-term popovertarget="vv" definition="Genegeerd">verwerkingsverantwoordelijke</nldd-term> bepaalt.</p>'
		+ '<p>Ook hier: <nldd-term popovertarget="vv">verwerkingsverantwoordelijke</nldd-term>.</p>'
		+ '<nldd-popover id="vv" accessible-label="Verwerkingsverantwoordelijke"><p>Degene die het doel vaststelt.</p></nldd-popover>'
		+ '</div>';

	async function setup(markup = MARKUP): Promise<void> {
		wrapper = await fixture(markup);
		[first, second] = Array.from(wrapper.querySelectorAll('nldd-term'));
		await waitForUpdate(first);
		if (second) await waitForUpdate(second);
		popover = wrapper.querySelector('nldd-popover')!;
	}

	afterEach(() => {
		if (popover?.matches(':popover-open')) popover.hidePopover();
		if (wrapper) cleanup(wrapper);
	});

	it('opens the popover it names, and no popover of its own', async () => {
		await setup();
		expect(first.shadowRoot!.querySelector('nldd-popover')).toBe(null);
		triggerOf(first).click();
		await waitForUpdate(popover);
		expect(popover.matches(':popover-open')).toBe(true);
		expect(popover.anchorElement).toBe(triggerOf(first));
		expect(triggerOf(first).getAttribute('aria-expanded')).toBe('true');
	});

	it('moves a shared popover to the term that was clicked', async () => {
		await setup();
		triggerOf(first).click();
		await waitForUpdate(popover);
		triggerOf(second).click();
		await waitForUpdate(popover);
		// The toggle events arrive a task later.
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(popover.matches(':popover-open')).toBe(true);
		expect(popover.anchorElement).toBe(triggerOf(second));
		expect(triggerOf(second).getAttribute('aria-expanded')).toBe('true');
		// The first term can still open it, and says it is closed.
		expect(triggerOf(first).getAttribute('aria-expanded')).toBe('false');
	});

	it('says so when the popover is not there', async () => {
		await setup('<div><nldd-term popovertarget="nergens">verwerkingsverantwoordelijke</nldd-term></div>');
		expect(first.matches(':state(no-popover-target)')).toBe(true);
	});
});
