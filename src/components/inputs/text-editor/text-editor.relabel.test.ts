import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import { setTranslations } from '../../../utilities/translations.js';
import enUS from '../../../translations/en-US.js';
import './text-editor.js';

type El = HTMLElement & { value: string; annotations: unknown[]; updateComplete: Promise<boolean> };

/* setTranslations() at runtime re-renders every component. The labels the editor
 * draws inside its document are CodeMirror widgets, not Lit output, so they have
 * to follow on their own. */
describe('nldd-text-editor – a language switch reaches the labels in the document', () => {
	let el: El;

	afterEach(() => {
		setTranslations({});
		if (el) cleanup(el);
	});

	const label = (selector: string) => el.shadowRoot!.querySelector(selector)!.getAttribute('aria-label');

	it('relabels a link badge and an annotation badge', async () => {
		el = await fixture<El>('<nldd-text-editor accessible-label="Notitie" annotatable></nldd-text-editor>');
		el.value = 'abc def https://example.org';
		el.annotations = [{ id: 'a1', start: 4, end: 7, quote: 'def' }];
		await el.updateComplete;
		await waitForUpdate(el);
		const dutchLink = label('.cm-link-badge');
		const dutchAnnotation = label('.cm-annotation-badge');

		setTranslations(enUS);
		await waitForUpdate(el);

		expect(label('.cm-link-badge')).not.toBe(dutchLink);
		expect(label('.cm-link-badge')).toContain('Open link in a new tab');
		expect(label('.cm-annotation-badge')).not.toBe(dutchAnnotation);
		expect(label('.cm-annotation-badge')).toContain('annotation');
	});
});
