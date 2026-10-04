import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './text-editor.js';
import { mentionToken, unescapeMentionLabel, decodeMentionId } from './text-editor.mentions.js';
import { isSafeHref } from './text-editor.links.js';

type TextEditorEl = HTMLElement & { value: string; updateComplete: Promise<boolean> };

async function withValue(markdown: string): Promise<TextEditorEl> {
	const el = await fixture<TextEditorEl>('<nldd-text-editor accessible-label="Tekst"></nldd-text-editor>');
	el.value = markdown;
	await el.updateComplete;
	await waitForUpdate(el);
	return el;
}

describe('nldd-text-editor', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('rendert zonder fouten', async () => {
		el = await fixture('<nldd-text-editor accessible-label="Tekst"></nldd-text-editor>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('mount een CodeMirror editor', async () => {
		el = await fixture('<nldd-text-editor accessible-label="Tekst"></nldd-text-editor>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.cm-editor')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('.cm-content')).not.toBeNull();
	});

	it('toont de markdown-inhoud', async () => {
		const el2 = await withValue('Hallo **wereld**');
		expect(el2.shadowRoot!.querySelector('.cm-content')!.textContent).toContain('Hallo');
		cleanup(el2);
	});

	it('synct de value-property naar de editor', async () => {
		el = await fixture('<nldd-text-editor accessible-label="Tekst"></nldd-text-editor>');
		await waitForUpdate(el);
		(el as TextEditorEl).value = 'nieuwe tekst';
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.cm-content')!.textContent).toContain('nieuwe tekst');
	});

	it('rendert hybride decoraties (kop, vet, marker-dim)', async () => {
		const el2 = await withValue('# Kop\n\nEen **vet** woord.');
		const sr = el2.shadowRoot!;
		expect(sr.querySelector('.cm-md-h1')).not.toBeNull();
		expect(sr.querySelector('.cm-md-strong')).not.toBeNull();
		// The ** markers are kept but dimmed.
		expect(sr.querySelector('.cm-md-mark')).not.toBeNull();
		cleanup(el2);
	});

	it('rendert inline code en links', async () => {
		const el2 = await withValue('Tekst met `code` en [link](https://example.org).');
		const sr = el2.shadowRoot!;
		expect(sr.querySelector('.cm-md-code')).not.toBeNull();
		expect(sr.querySelector('.cm-md-link')).not.toBeNull();
		cleanup(el2);
	});

	it('toont een bullet alleen bij "- " (met spatie), niet bij een los streepje', async () => {
		const withSpace = await withValue('- item');
		expect(withSpace.shadowRoot!.querySelector('.cm-md-bullet')).not.toBeNull();
		cleanup(withSpace);

		const noSpace = await withValue('-');
		expect(noSpace.shadowRoot!.querySelector('.cm-md-bullet')).toBeNull();
		cleanup(noSpace);
	});

	it('focus() verlegt de focus naar de interne editor', async () => {
		const el2 = await withValue('tekst');
		(el2 as unknown as { focus(): void }).focus();
		const content = el2.shadowRoot!.querySelector('.cm-content');
		expect(el2.shadowRoot!.activeElement).toBe(content);
		cleanup(el2);
	});

	it('default appearance simple en font sans', async () => {
		el = await fixture('<nldd-text-editor accessible-label="Tekst"></nldd-text-editor>');
		await waitForUpdate(el);
		const te = el as unknown as { appearance: string };
		expect(te.appearance).toBe('simple');
		expect(el.hasAttribute('appearance')).toBe(false);
		expect(el.hasAttribute('font')).toBe(false);
	});

	it('wrap staat standaard aan', async () => {
		el = await fixture('<nldd-text-editor accessible-label="Tekst"></nldd-text-editor>');
		await waitForUpdate(el);
		expect((el as HTMLElement & { wrap: boolean }).wrap).toBe(true);
	});

	it('disabled maakt de content niet-bewerkbaar', async () => {
		el = await fixture('<nldd-text-editor disabled accessible-label="Tekst"></nldd-text-editor>');
		await waitForUpdate(el);
		const content = el.shadowRoot!.querySelector('.cm-content') as HTMLElement;
		expect(content.getAttribute('contenteditable')).toBe('false');
	});

	it('emits input event en synct value bij typen', async () => {
		const el2 = await fixture<TextEditorEl>('<nldd-text-editor accessible-label="Tekst"></nldd-text-editor>');
		await waitForUpdate(el2);
		let received: string | undefined;
		el2.addEventListener('input', ((e: CustomEvent) => { received = e.detail.value; }) as EventListener);
		const content = el2.shadowRoot!.querySelector('.cm-content') as HTMLElement;
		content.focus();
		document.execCommand('insertText', false, 'hoi');
		await waitForUpdate(el2);
		expect(received).toBe('hoi');
		expect(el2.value).toBe('hoi');
		cleanup(el2);
	});

	it('formResetCallback restores the initial value', async () => {
		const el2 = await fixture<HTMLElement & { formResetCallback: () => void; value: string }>(
			'<nldd-text-editor accessible-label="Tekst" value="start"></nldd-text-editor>',
		);
		await waitForUpdate(el2);
		el2.value = 'gewijzigd';
		await waitForUpdate(el2);
		expect(el2.value).toBe('gewijzigd');
		el2.formResetCallback();
		await waitForUpdate(el2);
		expect(el2.value).toBe('start');
		cleanup(el2);
	});

	it('formStateRestoreCallback applies a string state', async () => {
		const el2 = await fixture<HTMLElement & { formStateRestoreCallback: (s: unknown) => void; value: string }>(
			'<nldd-text-editor accessible-label="Tekst"></nldd-text-editor>',
		);
		await waitForUpdate(el2);
		el2.formStateRestoreCallback('hersteld');
		await waitForUpdate(el2);
		expect(el2.value).toBe('hersteld');
		cleanup(el2);
	});


	/* ============================================================
	   Headless command / state API
	   ============================================================ */

	it('toggleBold wraps and unwraps the selection', async () => {
		const el2 = await withValue('woord');
		const api = el2 as unknown as { view: { dispatch(spec: unknown): void }; toggleBold(): void };
		api.view.dispatch({ selection: { anchor: 0, head: 5 } });
		api.toggleBold();
		await waitForUpdate(el2);
		expect(el2.value).toBe('**woord**');
		api.toggleBold();
		await waitForUpdate(el2);
		expect(el2.value).toBe('woord');
		cleanup(el2);
	});

	it('toggleHeading sets and toggles a heading prefix', async () => {
		const el2 = await withValue('Titel');
		const api = el2 as unknown as { view: { dispatch(spec: unknown): void }; toggleHeading(l: number): void };
		api.view.dispatch({ selection: { anchor: 0 } });
		api.toggleHeading(2);
		await waitForUpdate(el2);
		expect(el2.value).toBe('## Titel');
		api.toggleHeading(2);
		await waitForUpdate(el2);
		expect(el2.value).toBe('Titel');
		cleanup(el2);
	});

	it('toggleBulletList prefixes the line', async () => {
		const el2 = await withValue('punt');
		const api = el2 as unknown as { view: { dispatch(spec: unknown): void }; toggleBulletList(): void };
		api.view.dispatch({ selection: { anchor: 0 } });
		api.toggleBulletList();
		await waitForUpdate(el2);
		expect(el2.value).toBe('- punt');
		cleanup(el2);
	});

	it('one outdent exactly reverses one indent on a nested list item', async () => {
		const el2 = await withValue('- foo\n- bar');
		const api = el2 as unknown as { view: { dispatch(spec: unknown): void }; indent(): void; outdent(): void };
		api.view.dispatch({ selection: { anchor: el2.value.indexOf('bar') } });
		api.indent();
		await waitForUpdate(el2);
		expect(el2.value).toBe('- foo\n  - bar');
		// A single outdent must return it to column 0, not leave a partial indent.
		api.view.dispatch({ selection: { anchor: el2.value.indexOf('bar') } });
		api.outdent();
		await waitForUpdate(el2);
		expect(el2.value).toBe('- foo\n- bar');
		cleanup(el2);
	});

	it('getState reports the active formats at the selection', async () => {
		const el2 = await withValue('**vet**');
		const api = el2 as unknown as { view: { dispatch(spec: unknown): void }; getState(): { active: { bold: boolean; italic: boolean } } };
		api.view.dispatch({ selection: { anchor: 3 } });
		const state = api.getState();
		expect(state.active.bold).toBe(true);
		expect(state.active.italic).toBe(false);
		cleanup(el2);
	});

	it('emits nldd-text-editor-state when the selection lands on other formatting', async () => {
		// The caret starts in the paragraph, so moving into the heading changes the
		// state a toolbar shows.
		const el2 = await withValue('gewoon\n\n# Kop');
		let detail: { active: { heading: number } } | undefined;
		el2.addEventListener('nldd-text-editor-state', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
		const view = (el2 as unknown as { view: { dispatch(spec: unknown): void } }).view;
		view.dispatch({ selection: { anchor: 11 } });
		await waitForUpdate(el2);
		expect(detail?.active.heading).toBe(1);
		view.dispatch({ selection: { anchor: 2 } });
		await waitForUpdate(el2);
		expect(detail?.active.heading).toBe(0);
		cleanup(el2);
	});

	it('stays quiet while the state is the same', async () => {
		const el2 = await withValue('een gewone zin');
		const view = (el2 as unknown as { view: { dispatch(spec: unknown): void } }).view;
		view.dispatch({ selection: { anchor: 2 } });
		await waitForUpdate(el2);
		let events = 0;
		el2.addEventListener('nldd-text-editor-state', () => { events++; });
		// Moving within one paragraph leaves every toolbar toggle where it was.
		view.dispatch({ selection: { anchor: 5 } });
		view.dispatch({ selection: { anchor: 9 } });
		await waitForUpdate(el2);
		expect(events).toBe(0);
		cleanup(el2);
	});

	it('runCommand dispatches by name', async () => {
		const el2 = await withValue('tekst');
		const api = el2 as unknown as { view: { dispatch(spec: unknown): void }; runCommand(name: string, payload?: unknown): void };
		api.view.dispatch({ selection: { anchor: 0, head: 5 } });
		api.runCommand('italic');
		await waitForUpdate(el2);
		expect(el2.value).toBe('*tekst*');
		cleanup(el2);
	});

	it('setList sets and switches list types', async () => {
		const el2 = await withValue('punt');
		const api = el2 as unknown as { view: { dispatch(spec: unknown): void }; setList(t: string): void };
		api.view.dispatch({ selection: { anchor: 0 } });
		api.setList('bullet');
		await waitForUpdate(el2);
		expect(el2.value).toBe('- punt');
		api.setList('ordered');
		await waitForUpdate(el2);
		expect(el2.value).toBe('1. punt');
		api.setList('none');
		await waitForUpdate(el2);
		expect(el2.value).toBe('punt');
		cleanup(el2);
	});

	it('setList none strips only the marker, no blank lines inserted', async () => {
		const el2 = await withValue('- een\n- twee\n- drie');
		const api = el2 as unknown as { view: { state: { doc: { toString(): string } }; dispatch(s: unknown): void }; setList(t: string): void };
		const pos = api.view.state.doc.toString().indexOf('twee');
		api.view.dispatch({ selection: { anchor: pos } });
		api.setList('none');
		await waitForUpdate(el2);
		// Just removes the marker, like deleting it by hand — no surrounding blank
		// lines. The toolbar reads "no list" from the (now marker-less) line.
		expect(el2.value).toBe('- een\ntwee\n- drie');
		cleanup(el2);
	});

	it('setList none verwijdert ook de inspring van een genest item', async () => {
		const el2 = await withValue('- ouder\n  - kind');
		const api = el2 as unknown as { view: { state: { doc: { toString(): string } }; dispatch(s: unknown): void }; setList(t: string): void };
		const pos = api.view.state.doc.toString().indexOf('kind');
		api.view.dispatch({ selection: { anchor: pos } });
		api.setList('none');
		await waitForUpdate(el2);
		// The child loses its marker AND its indent — bare text can't be list-indented.
		expect(el2.value).toBe('- ouder\nkind');
		cleanup(el2);
	});

	it('setHeading sets a level without toggling off', async () => {
		const el2 = await withValue('Titel');
		const api = el2 as unknown as { view: { dispatch(spec: unknown): void }; setHeading(l: number): void };
		api.view.dispatch({ selection: { anchor: 0 } });
		api.setHeading(2);
		await waitForUpdate(el2);
		expect(el2.value).toBe('## Titel');
		api.setHeading(2);
		await waitForUpdate(el2);
		expect(el2.value).toBe('## Titel');
		api.setHeading(0);
		await waitForUpdate(el2);
		expect(el2.value).toBe('Titel');
		cleanup(el2);
	});

	it('toggleLink unwraps a link the caret is in', async () => {
		const el2 = await withValue('Zie [site](https://example.org) hier.');
		const api = el2 as unknown as { view: { dispatch(spec: unknown): void }; toggleLink(): void };
		api.view.dispatch({ selection: { anchor: el2.value.indexOf('site') + 1 } });
		api.toggleLink();
		await waitForUpdate(el2);
		expect(el2.value).toBe('Zie site hier.');
		cleanup(el2);
	});

	it('getState detecteert een blockquote met de caret aan het regeleinde', async () => {
		const el2 = await withValue('> Een citaat');
		const api = el2 as unknown as { view: { dispatch(spec: unknown): void }; getState(): { active: { quote: boolean } } };
		api.view.dispatch({ selection: { anchor: el2.value.length } });
		expect(api.getState().active.quote).toBe(true);
		cleanup(el2);
	});

	it('getState detecteert een blockquote op een lazy-continuation-regel (geen >)', async () => {
		// The second line has no '>' but is part of the quote (a lazy continuation),
		// so the quote button should still light up there.
		const el2 = await withValue('> Eerste regel\nTweede regel zonder marker');
		const api = el2 as unknown as {
			view: { dispatch(spec: unknown): void; state: { doc: { line(n: number): { from: number } } } };
			getState(): { active: { quote: boolean } };
		};
		api.view.dispatch({ selection: { anchor: api.view.state.doc.line(2).from + 3 } });
		expect(api.getState().active.quote).toBe(true);
		cleanup(el2);
	});

	it('getState detecteert een codeblok op de fence- en inhoudsregels', async () => {
		const el2 = await withValue('```\nconst x = 1;\n```');
		const api = el2 as unknown as {
			view: { dispatch(spec: unknown): void; state: { doc: { line(n: number): { from: number } } } };
			getState(): { active: { codeBlock: boolean } };
		};
		api.view.dispatch({ selection: { anchor: api.view.state.doc.line(2).from + 2 } }); // content
		expect(api.getState().active.codeBlock).toBe(true);
		api.view.dispatch({ selection: { anchor: api.view.state.doc.line(1).from } }); // opening fence
		expect(api.getState().active.codeBlock).toBe(true);
		cleanup(el2);
	});

	it('getState reports the ordered-list type', async () => {
		const el2 = await withValue('1. een');
		const api = el2 as unknown as { view: { dispatch(spec: unknown): void }; getState(): { active: { orderedList: boolean; bulletList: boolean } } };
		api.view.dispatch({ selection: { anchor: 3 } });
		const active = api.getState().active;
		expect(active.orderedList).toBe(true);
		expect(active.bulletList).toBe(false);
		cleanup(el2);
	});

	it('clearHistory leegt de undo-stack maar laat het document staan', async () => {
		const el2 = await withValue('hello');
		const api = el2 as unknown as {
			view: { dispatch(spec: unknown): void };
			getState(): { canUndo: boolean };
			clearHistory(): void;
			value: string;
		};
		// A user-like edit so history has something to undo.
		api.view.dispatch({ changes: { from: 5, insert: ' world' } });
		await waitForUpdate(el2);
		expect(api.getState().canUndo).toBe(true);

		api.clearHistory();
		await waitForUpdate(el2);
		expect(api.getState().canUndo).toBe(false);
		expect(api.value).toBe('hello world');
		cleanup(el2);
	});

	it('getSelection geeft clean offsets, de quote en empty', async () => {
		const el2 = await withValue('hello world');
		const api = el2 as unknown as {
			view: { dispatch(s: unknown): void };
			getSelection(): { start: number; end: number; quote: string; empty: boolean; rect: DOMRect | null };
		};
		api.view.dispatch({ selection: { anchor: 0, head: 5 } });
		const sel = api.getSelection();
		expect(sel.start).toBe(0);
		expect(sel.end).toBe(5);
		expect(sel.quote).toBe('hello');
		expect(sel.empty).toBe(false);
		// The selection carries a viewport rect so a consumer can anchor a popover
		// to the selected text rather than to its own button.
		expect(sel.rect).toBeInstanceOf(DOMRect);
		api.view.dispatch({ selection: { anchor: 3 } });
		expect(api.getSelection().empty).toBe(true);
		cleanup(el2);
	});

	it('getAnnotations geeft de mee-geschoven annotaties met een verse quote', async () => {
		const el2 = await fixture<TextEditorEl & { annotatable: boolean; annotations: unknown[] }>(
			'<nldd-text-editor accessible-label="Tekst" annotatable></nldd-text-editor>',
		);
		el2.value = 'hello world';
		el2.annotations = [{ id: 'n1', start: 6, end: 11, quote: 'world' }];
		await el2.updateComplete;
		await waitForUpdate(el2);
		const api = el2 as unknown as {
			view: { dispatch(s: unknown): void };
			getAnnotations(): { id: string; start: number; end: number; quote: string }[];
		};
		expect(api.getAnnotations()).toEqual([{ id: 'n1', start: 6, end: 11, quote: 'world' }]);
		// Insert before the annotation → its clean offsets shift right, quote unchanged.
		api.view.dispatch({ changes: { from: 0, insert: 'Xy ' } });
		await waitForUpdate(el2);
		expect(api.getAnnotations()).toEqual([{ id: 'n1', start: 9, end: 14, quote: 'world' }]);
		cleanup(el2);
	});

	it('undo van een edit herstelt de annotatie-extent', async () => {
		const el2 = await fixture<TextEditorEl & { annotatable: boolean; annotations: unknown[] }>(
			'<nldd-text-editor accessible-label="Tekst" annotatable></nldd-text-editor>',
		);
		el2.value = 'hello world foo';
		el2.annotations = [{ id: 'n1', start: 6, end: 11, quote: 'world' }];
		await el2.updateComplete;
		await waitForUpdate(el2);
		const sr = el2.shadowRoot!;
		const tintText = () => sr.querySelector('.cm-annotation')?.textContent ?? '';
		expect(tintText()).toContain('world');
		const api = el2 as unknown as {
			view: { dispatch(s: unknown): void };
			undo(): void;
			clearHistory(): void;
			getAnnotations(): { id: string; start: number; end: number; quote: string }[];
		};
		// The loaded content is not undoable in the app; clear history so the edit is
		// the sole step and undo reverts just it (matching a real article session).
		api.clearHistory();
		api.view.dispatch({ changes: { from: 0, insert: 'Xy ' }, userEvent: 'input.type' });
		await waitForUpdate(el2);
		expect(api.getAnnotations()).toEqual([{ id: 'n1', start: 9, end: 14, quote: 'world' }]);
		api.undo();
		await waitForUpdate(el2);
		// The tint snaps back to its own text — not vanished, not swallowing the doc.
		expect(tintText()).toContain('world');
		expect(tintText()).not.toContain('foo');
		expect(api.getAnnotations()).toEqual([{ id: 'n1', start: 6, end: 11, quote: 'world' }]);
		cleanup(el2);
	});

	// Regression: an undo can revert the document out from under the annotation
	// field (history reverts the text while non-historized sentinels linger and the
	// field keeps its pre-revert offsets). buildAll then used to emit decoration
	// ranges past the document end and CodeMirror threw "Position N out of range for
	// changeset of length M" diffing them. buildAll now clamps to the clean length.
	it('crasht niet als undo het document losraakt van de annotatie-offsets', async () => {
		const el2 = await fixture<TextEditorEl & { annotatable: boolean; annotations: unknown[] }>(
			'<nldd-text-editor accessible-label="Tekst" annotatable></nldd-text-editor>',
		);
		el2.value = 'hello world foo';
		el2.annotations = [{ id: 'n1', start: 6, end: 11, quote: 'world' }];
		await el2.updateComplete;
		await waitForUpdate(el2);
		const api = el2 as unknown as {
			view: { dispatch(s: unknown): void };
			undo(): void;
			getAnnotations(): { id: string; start: number; end: number; quote: string }[];
		};
		// No clearHistory: the synchronous edit merges with the initial content, so a
		// single undo reverts the text and drives the doc to just its sentinels — the
		// exact desync that used to throw. The editor must survive it.
		api.view.dispatch({ changes: { from: 0, insert: 'Xy ' }, userEvent: 'input.type' });
		await waitForUpdate(el2);
		api.undo();
		await waitForUpdate(el2);
		expect(api.getAnnotations().length).toBeLessThanOrEqual(1);
		cleanup(el2);
	});

	it('klik op de annotatie-badge emit annotation-click met de id(s)', async () => {
		const el2 = await fixture<TextEditorEl & { annotatable: boolean; annotations: unknown[] }>(
			'<nldd-text-editor accessible-label="Tekst" annotatable></nldd-text-editor>',
		);
		el2.value = 'hello world';
		el2.annotations = [{ id: 'n1', start: 6, end: 11, quote: 'world' }];
		await el2.updateComplete;
		await waitForUpdate(el2);
		const badge = el2.shadowRoot!.querySelector('.cm-annotation-badge') as HTMLElement | null;
		expect(badge).not.toBeNull();
		let detail: { ids: string[]; rect: DOMRect } | null = null;
		el2.addEventListener('nldd-text-editor-annotation-click', (e) => {
			detail = (e as CustomEvent<{ ids: string[]; rect: DOMRect }>).detail;
		});
		badge!.click();
		expect(detail!.ids).toEqual(['n1']);
		// The badge's viewport rect rides along so a consumer can anchor its note UI.
		expect(typeof detail!.rect.top).toBe('number');
		expect(typeof detail!.rect.left).toBe('number');
		cleanup(el2);
	});

	it('indent nestelt onder een vorig item en maakt van een los item geen codeblok', async () => {
		type IndentApi = {
			view: { dispatch(s: unknown): void; state: { doc: { line(n: number): { text: string; from: number } } } };
			indent(): void;
		};
		// A standalone first item has no parent, so indenting must not add 4 spaces
		// (which markdown would read as an indented code block).
		const standalone = await withValue('Tekst.\n\n- Los item');
		const a1 = standalone as unknown as IndentApi;
		a1.view.dispatch({ selection: { anchor: a1.view.state.doc.line(3).from + 2 } });
		a1.indent();
		a1.indent();
		expect(a1.view.state.doc.line(3).text).toBe('- Los item');
		cleanup(standalone);
		// An item with a sibling above nests one level, and no deeper.
		const nested = await withValue('- a\n- b');
		const a2 = nested as unknown as IndentApi;
		a2.view.dispatch({ selection: { anchor: a2.view.state.doc.line(2).from + 2 } });
		a2.indent();
		expect(a2.view.state.doc.line(2).text).toBe('  - b');
		a2.view.dispatch({ selection: { anchor: a2.view.state.doc.line(2).from + 4 } });
		a2.indent();
		expect(a2.view.state.doc.line(2).text).toBe('  - b');
		cleanup(nested);
	});

	it('getState meldt canIndent/canOutdent (drijft de indent-knoppen)', async () => {
		const el2 = await withValue('- a\n- b');
		const api = el2 as unknown as {
			view: { dispatch(s: unknown): void; state: { doc: { line(n: number): { from: number } } } };
			getState(): { canIndent: boolean; canOutdent: boolean };
			indent(): void;
		};
		// First item: no parent to nest under, not nested.
		api.view.dispatch({ selection: { anchor: api.view.state.doc.line(1).from + 2 } });
		expect(api.getState().canIndent).toBe(false);
		expect(api.getState().canOutdent).toBe(false);
		// Second item: can nest under the first, not nested yet.
		api.view.dispatch({ selection: { anchor: api.view.state.doc.line(2).from + 2 } });
		expect(api.getState().canIndent).toBe(true);
		expect(api.getState().canOutdent).toBe(false);
		// Once nested: no deeper parent, but it can be outdented.
		api.indent();
		api.view.dispatch({ selection: { anchor: api.view.state.doc.line(2).from + 4 } });
		expect(api.getState().canIndent).toBe(false);
		expect(api.getState().canOutdent).toBe(true);
		cleanup(el2);
	});


	/* ============================================================
	   @-mentions
	   ============================================================ */

	it('klapt een @-mention volledig weg tot een chip', async () => {
		const el2 = await withValue('Hoi [@Anouk](user:1), kijk even.');
		const chip = el2.shadowRoot!.querySelector('.cm-md-mention-token');
		expect(chip).not.toBeNull();
		// the @ is the 'at' icon, followed by the name; raw syntax is replaced
		expect(chip!.querySelector('.cm-md-mention-token-icon')).not.toBeNull();
		expect(chip!.textContent).toContain('Anouk');
		expect(el2.shadowRoot!.querySelector('.cm-content')!.textContent).not.toContain('(user:1)');
		cleanup(el2);
	});

	it('een gewone link is geen mention-chip', async () => {
		const el2 = await withValue('Zie [site](https://example.org).');
		const sr = el2.shadowRoot!;
		expect(sr.querySelector('.cm-md-link')).not.toBeNull();
		expect(sr.querySelector('.cm-md-mention-token')).toBeNull();
		cleanup(el2);
	});

	it('toont een open-link badge na een echte link, niet na een mention', async () => {
		const el2 = await withValue('Zie [site](https://example.org) en [@Anouk](user:1).');
		const badges = el2.shadowRoot!.querySelectorAll('.cm-link-badge');
		expect(badges.length).toBe(1); // the mention owns its own click, so it's skipped
		expect(badges[0].getAttribute('href')).toBe('https://example.org');
		expect(badges[0].getAttribute('target')).toBe('_blank');
		cleanup(el2);
	});

	it('geeft de open-link badge een Nederlands aria-label met de bestemming', async () => {
		const el2 = await withValue('Zie [site](https://example.org).');
		const badge = el2.shadowRoot!.querySelector('.cm-link-badge');
		expect(badge!.getAttribute('aria-label')).toBe('Open link in nieuw tabblad: https://example.org');
		cleanup(el2);
	});

	it('overschrijft het aria-label van de open-link badge via translations', async () => {
		const el2 = await fixture<TextEditorEl>('<nldd-text-editor accessible-label="Tekst"></nldd-text-editor>');
		(el2 as unknown as { translations: Record<string, string> }).translations = {
			'components.text-editor.open-in-new-tab-label': 'Open in new tab: {url}',
		};
		el2.value = 'Zie [site](https://example.org).';
		await el2.updateComplete;
		await waitForUpdate(el2);
		const badge = el2.shadowRoot!.querySelector('.cm-link-badge');
		expect(badge!.getAttribute('aria-label')).toBe('Open in new tab: https://example.org');
		cleanup(el2);
	});

	it('toont de open-link badge ook na een reference-style link', async () => {
		const el2 = await withValue('Zie [site][ref] hier.\n\n[ref]: https://example.org');
		const badges = el2.shadowRoot!.querySelectorAll('.cm-link-badge');
		expect(badges.length).toBe(1); // only the [site][ref] link, not the definition
		expect(badges[0].getAttribute('href')).toBe('https://example.org');
		cleanup(el2);
	});

	it('toont de open-link badge ook na een kale (plat geplakte) URL', async () => {
		const el2 = await withValue('Zie https://regelrecht.rijks.app hier.');
		const badges = el2.shadowRoot!.querySelectorAll('.cm-link-badge');
		expect(badges.length).toBe(1);
		expect(badges[0].getAttribute('href')).toBe('https://regelrecht.rijks.app');
		expect(badges[0].getAttribute('target')).toBe('_blank');
		cleanup(el2);
	});

	it('geeft scheme-loze autolinks een scheme (www → https, e-mail → mailto)', async () => {
		const el2 = await withValue('Zie www.rijksoverheid.nl of info@rijksoverheid.nl.');
		const hrefs = [...el2.shadowRoot!.querySelectorAll('.cm-link-badge')].map((b) => b.getAttribute('href'));
		expect(hrefs).toEqual(['https://www.rijksoverheid.nl', 'mailto:info@rijksoverheid.nl']);
		cleanup(el2);
	});

	it('badge de kale URL niet dubbel als hij ook de bestemming van een markdown-link is', async () => {
		const el2 = await withValue('[Site](https://example.org) en kaal https://example.com');
		const hrefs = [...el2.shadowRoot!.querySelectorAll('.cm-link-badge')].map((b) => b.getAttribute('href'));
		expect(hrefs).toEqual(['https://example.org', 'https://example.com']); // link once, bare once — no double
		cleanup(el2);
	});

	it('badge geen image-bron (![alt](url) is geen te-openen link)', async () => {
		const el2 = await withValue('![vlinder](https://example.org/img.png) tekst');
		expect(el2.shadowRoot!.querySelectorAll('.cm-link-badge').length).toBe(0);
		cleanup(el2);
	});

	it('kleurt een kale URL als link (cm-md-autolink), niet als grijs adres (cm-md-url)', async () => {
		const el2 = await withValue('kaal https://regelrecht.rijks.app en [md](https://example.com)');
		const sr = el2.shadowRoot!;
		// The bare URL reads as link text (its own autolink class, colored like a link);
		// only the markdown link's address stays the gray cm-md-url.
		const autolinks = [...sr.querySelectorAll('.cm-md-autolink')].map((s) => s.textContent);
		const greyUrls = [...sr.querySelectorAll('.cm-md-url')].map((s) => s.textContent);
		expect(autolinks).toEqual(['https://regelrecht.rijks.app']);
		expect(greyUrls).toEqual(['https://example.com']); // the markdown link's address only, not the bare URL
		cleanup(el2);
	});

	it('rendert geen klikbare badge voor een javascript:- of data:-link (XSS-guard)', async () => {
		const el2 = await withValue('[safe](https://example.org) [rel](/p) [js](javascript:x) [d](data:x)');
		const hrefs = [...el2.shadowRoot!.querySelectorAll('.cm-link-badge')].map((b) => b.getAttribute('href'));
		expect(hrefs).toEqual(['https://example.org', '/p']); // only safe schemes become a real link
		cleanup(el2);
	});

	it('mentionToken bouwt een markdown-link met user-id', () => {
		expect(mentionToken({ id: '42', text: 'Anouk' })).toBe('[@Anouk](user:42)');
	});

	it('verwijdert een mention in twee stappen (backspace selecteert, dan verwijdert)', async () => {
		const el2 = await withValue('Hoi [@Anouk](user:1) daar.');
		const view = (el2 as unknown as { view: { state: { doc: { toString(): string } }; dispatch(s: unknown): void; contentDOM: HTMLElement } }).view;
		const token = '[@Anouk](user:1)';
		const to = view.state.doc.toString().indexOf(token) + token.length;
		view.dispatch({ selection: { anchor: to } });
		const backspace = () => view.contentDOM.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }));
		backspace();
		await waitForUpdate(el2);
		// First press selects the whole token (shown as selected), without deleting.
		expect(el2.value).toContain(token);
		expect(el2.shadowRoot!.querySelector('.cm-md-mention-token[data-selected]')).not.toBeNull();
		backspace();
		await waitForUpdate(el2);
		// Second press removes it.
		expect(el2.value).not.toContain(token);
		cleanup(el2);
	});

	it('markeert een mention als geselecteerd wanneer de selectie het token dekt', async () => {
		const el2 = await withValue('Hoi [@Anouk](user:1).');
		const view = (el2 as unknown as { view: { state: { doc: { toString(): string } }; dispatch(spec: unknown): void } }).view;
		const text = view.state.doc.toString();
		const from = text.indexOf('[@Anouk');
		const to = text.indexOf(')', text.indexOf('(user:1')) + 1;
		view.dispatch({ selection: { anchor: from, head: to } });
		await waitForUpdate(el2);
		expect(el2.shadowRoot!.querySelector('.cm-md-mention-token[data-selected]')).not.toBeNull();
		cleanup(el2);
	});


	/* ============================================================
	   Annotations
	   ============================================================ */

	async function withAnnotations(markdown: string, list: unknown[]): Promise<TextEditorEl> {
		const el2 = await withValue(markdown);
		(el2 as unknown as { annotatable: boolean }).annotatable = true;
		(el2 as unknown as { annotations: unknown[] }).annotations = list;
		await el2.updateComplete;
		await waitForUpdate(el2);
		return el2;
	}

	it('rendert geen annotaties zonder het annotatable-attribuut', async () => {
		const el2 = await withValue('Een zin met tekst.');
		(el2 as unknown as { annotations: unknown[] }).annotations = [{ id: 'a1', start: 4, end: 7, quote: 'zin' }];
		await el2.updateComplete;
		await waitForUpdate(el2);
		expect(el2.shadowRoot!.querySelector('.cm-annotation')).toBeNull();
		(el2 as unknown as { annotatable: boolean }).annotatable = true;
		await el2.updateComplete;
		await waitForUpdate(el2);
		expect(el2.shadowRoot!.querySelector('.cm-annotation')).not.toBeNull();
		cleanup(el2);
	});

	it('rendert een annotatie als dashed-underline + badge met telling 1', async () => {
		const el2 = await withAnnotations('Een zin met tekst.', [{ id: 'a1', start: 4, end: 7, quote: 'zin' }]);
		const sr = el2.shadowRoot!;
		expect(sr.querySelector('.cm-annotation')).not.toBeNull();
		const badge = sr.querySelector('.cm-annotation-badge');
		expect(badge).not.toBeNull();
		expect(badge!.textContent).toBe('1');
		// The nub lives inside the tinted block (one cohesive element).
		expect(badge!.closest('.cm-annotation')).not.toBeNull();
		cleanup(el2);
	});

	it('geeft de annotatie-badge een Nederlands aria-label (enkelvoud) met de quote', async () => {
		const el2 = await withAnnotations('Een zin met tekst.', [{ id: 'a1', start: 4, end: 7, quote: 'zin' }]);
		const badge = el2.shadowRoot!.querySelector('.cm-annotation-badge');
		expect(badge!.getAttribute('aria-label')).toBe("1 annotatie op 'zin'");
		cleanup(el2);
	});

	it('gebruikt het meervoud in het aria-label bij meerdere annotaties', async () => {
		const el2 = await withAnnotations('Een zin met tekst hier.', [
			{ id: 'a1', start: 4, end: 12 },
			{ id: 'a2', start: 8, end: 17 },
		]);
		const badge = el2.shadowRoot!.querySelector('.cm-annotation-badge');
		expect(badge!.getAttribute('aria-label')).toBe("2 annotaties op 'zin met tekst'");
		cleanup(el2);
	});

	it('overschrijft het aria-label van de annotatie-badge via translations', async () => {
		const el2 = await withValue('Een zin met tekst.');
		(el2 as unknown as { translations: Record<string, string> }).translations = {
			'components.text-editor.annotation-count-label': '{count} {noun} on {quote}',
			'components.text-editor.annotation-singular-lowercase': 'annotation',
		};
		(el2 as unknown as { annotatable: boolean }).annotatable = true;
		(el2 as unknown as { annotations: unknown[] }).annotations = [{ id: 'a1', start: 4, end: 7, quote: 'zin' }];
		await el2.updateComplete;
		await waitForUpdate(el2);
		const badge = el2.shadowRoot!.querySelector('.cm-annotation-badge');
		expect(badge!.getAttribute('aria-label')).toBe('1 annotation on zin');
		cleanup(el2);
	});

	it('merget overlappende annotaties tot een badge met telling', async () => {
		const el2 = await withAnnotations('Een zin met tekst hier.', [
			{ id: 'a1', start: 4, end: 12 },
			{ id: 'a2', start: 8, end: 17 },
		]);
		const badges = el2.shadowRoot!.querySelectorAll('.cm-annotation-badge');
		expect(badges.length).toBe(1);
		expect(badges[0].textContent).toBe('2');
		cleanup(el2);
	});

	it('houdt twee aangrenzende maar losse annotaties gescheiden (twee badges)', async () => {
		// [0,3] and [3,6] merely touch at offset 3 — they do NOT overlap, so they must
		// stay two tints and two badges (each counting 1), not merge into one badge of 2.
		const el2 = await withAnnotations('abcdef', [
			{ id: 'a1', start: 0, end: 3 },
			{ id: 'a2', start: 3, end: 6 },
		]);
		const sr = el2.shadowRoot!;
		expect(sr.querySelectorAll('.cm-annotation').length).toBe(2);
		const badges = sr.querySelectorAll('.cm-annotation-badge');
		expect(badges.length).toBe(2);
		expect(badges[0].textContent).toBe('1');
		expect(badges[1].textContent).toBe('1');
		cleanup(el2);
	});

	it('herstelt geknipte annotaties bij een plak met CRLF-regeleindes', async () => {
		// A cut→paste re-attaches the carried annotations by comparing the cut buffer to
		// the pasted text. A Windows/other-app clipboard returns CRLF where the buffer
		// holds LF; line-ending normalization must let it still match and re-attach.
		const el2 = await withAnnotations('regel1\nregel2', [{ id: 'a1', start: 0, end: 13, quote: 'regel1\nregel2' }]);
		const sr = el2.shadowRoot!;
		expect(sr.querySelector('.cm-annotation')).not.toBeNull();
		const api = el2 as unknown as {
			view: { dispatch(s: unknown): void; state: { doc: { length: number } }; contentDOM: HTMLElement };
			cut(): Promise<void>;
		};
		// Select the whole annotated range and cut it (buffer holds LF text + the anns,
		// document is emptied). clipboard.writeText is best-effort and swallowed.
		api.view.dispatch({ selection: { anchor: 0, head: api.view.state.doc.length } });
		await api.cut();
		await waitForUpdate(el2);
		expect(sr.querySelector('.cm-annotation')).toBeNull(); // gone after the cut
		// Paste back a CRLF version of the same text via the native paste path.
		const data = new DataTransfer();
		data.setData('text/plain', 'regel1\r\nregel2');
		api.view.contentDOM.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
		await waitForUpdate(el2);
		// CRLF normalized to LF matched the buffer, so the annotation traveled with it.
		expect(sr.querySelector('.cm-annotation')).not.toBeNull();
		cleanup(el2);
	});

	it('mapt annotatie-ankers mee door bewerkingen heen', async () => {
		const el2 = await withAnnotations('xy tekst hier.', [{ id: 'a1', start: 3, end: 8, quote: 'tekst' }]);
		const view = (el2 as unknown as { view: { dispatch(spec: unknown): void } }).view;
		view.dispatch({ changes: { from: 0, insert: 'AB' } });
		await waitForUpdate(el2);
		// Still anchored (shifted right by the insertion), so it keeps rendering.
		expect(el2.shadowRoot!.querySelector('.cm-annotation')).not.toBeNull();
		cleanup(el2);
	});

	it('behoudt een annotatie als de lijst-marker via setList wordt verwijderd', async () => {
		// The annotated word sits after the "- " marker. setList('none') must touch
		// only the marker, not rewrite the whole line (which would collapse the anchor).
		const el2 = await withAnnotations('- Een actiepunt hier.', [{ id: 'a1', start: 6, end: 15, quote: 'actiepunt' }]);
		const sr = el2.shadowRoot!;
		expect(sr.querySelector('.cm-annotation')).not.toBeNull();
		const api = el2 as unknown as {
			view: { dispatch(s: unknown): void; state: { doc: { toString(): string } } };
			setList(t: string): void;
		};
		api.view.dispatch({ selection: { anchor: 8 } });
		api.setList('none');
		await waitForUpdate(el2);
		// Check the clean value (the document carries annotation sentinels).
		expect((el2 as unknown as { value: string }).value.startsWith('Een actiepunt')).toBe(true); // marker stripped
		expect(sr.querySelector('.cm-annotation')).not.toBeNull(); // annotation survived
		cleanup(el2);
	});

	// fix 8 (shared base): focusFromPoint is a no-op on a read-only view. A direct
	// call on a readonly text-editor must not move the caret — the guard early-
	// returns on state.readOnly before dispatching any selection change.
	it('focusFromPoint does not move the caret on a read-only view', async () => {
		const el2 = await fixture<TextEditorEl & { focusFromPoint(x: number, y: number): void }>(
			'<nldd-text-editor readonly accessible-label="Tekst"></nldd-text-editor>',
		);
		el2.value = 'Eerste regel\nTweede regel\nDerde regel';
		await el2.updateComplete;
		await waitForUpdate(el2);
		const view = (el2 as unknown as { view: { state: { selection: { main: { head: number } } } } }).view;
		const before = view.state.selection.main.head;
		el2.focusFromPoint(40, 40);
		await waitForUpdate(el2);
		expect(view.state.selection.main.head).toBe(before);
		cleanup(el2);
	});

	it('command API and Backspace do not mutate a read-only editor', async () => {
		const el2 = await fixture<TextEditorEl & { toggleBold(): void; toggleBulletList(): void; toggleQuote(): void }>(
			'<nldd-text-editor readonly accessible-label="Tekst"></nldd-text-editor>',
		);
		el2.value = '- Een\n- Twee';
		await el2.updateComplete;
		await waitForUpdate(el2);
		const original = el2.value;
		const view = (el2 as unknown as { view: { state: { doc: { length: number } }; dispatch(s: unknown): void; contentDOM: HTMLElement } }).view;
		// Select everything so the formatting commands have a range to act on.
		view.dispatch({ selection: { anchor: 0, head: view.state.doc.length } });
		el2.toggleBold();
		el2.toggleBulletList();
		el2.toggleQuote();
		await waitForUpdate(el2);
		expect(el2.value).toBe(original); // command API cannot mutate a read-only editor
		// The Prec.highest Backspace binding (clear list marker) is inert too.
		view.dispatch({ selection: { anchor: 2 } });
		view.contentDOM.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }));
		await waitForUpdate(el2);
		expect(el2.value).toBe(original);
		cleanup(el2);
	});
});

describe('isSafeHref (open-link badge XSS guard)', () => {
	it('allows relative URLs and the http(s) / mailto / tel allowlist', () => {
		for (const u of ['/p', '#a', '?q=1', '//host/x', 'page.html', 'https://x.nl', 'http://x.nl', 'mailto:a@b.nl', 'tel:+31']) {
			expect(isSafeHref(u)).toBe(true);
		}
	});

	it('blocks javascript / vbscript / data, incl. control-byte and mid-scheme-whitespace bypasses', () => {
		const attacks = [
			'javascript:alert(1)', 'JAVASCRIPT:alert(1)', 'vbscript:x', 'data:text/html,x',
			String.fromCharCode(1) + 'javascript:alert(1)', // leading control byte (trim keeps it)
			String.fromCharCode(0) + 'javascript:alert(1)',
			'java' + String.fromCharCode(9) + 'script:alert(1)', // tab inside the scheme (URL parser strips it)
			'java' + String.fromCharCode(10) + 'script:alert(1)', // newline inside the scheme
		];
		for (const u of attacks) {
			expect(isSafeHref(u)).toBe(false);
		}
	});
});

describe('mention token escaping', () => {
	it('round-trips a plain candidate unchanged', () => {
		expect(mentionToken({ id: '42', text: 'Anouk' })).toBe('[@Anouk](user:42)');
		expect(unescapeMentionLabel('Anouk')).toBe('Anouk');
		expect(decodeMentionId('42')).toBe('42');
	});

	it('neutralises a crafted label and id, and decodes them back losslessly', () => {
		const label = 'X]  hack](y';
		const id = 'a) b(c';
		const token = mentionToken({ id, text: label });
		// One mention boundary and one trailing ) — the payload cannot inject a second link.
		expect(token.startsWith('[@')).toBe(true);
		expect(token.endsWith(')')).toBe(true);
		expect(token.split('](user:')).toHaveLength(2);
		const labelPart = token.slice(2, token.indexOf('](user:'));
		const idPart = token.slice(token.indexOf('](user:') + '](user:'.length, -1);
		expect(idPart).not.toContain(')'); // no ) to close the URL destination early
		expect(idPart).not.toContain('(');
		// Lossless decode back to the originals.
		expect(unescapeMentionLabel(labelPart)).toBe(label);
		expect(decodeMentionId(idPart)).toBe(id);
	});
});
