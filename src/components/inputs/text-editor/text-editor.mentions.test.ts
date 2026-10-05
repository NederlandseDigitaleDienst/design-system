import { describe, it, expect, vi } from 'vitest';
import { EditorState } from '@codemirror/state';
import { ensureSyntaxTree } from '@codemirror/language';
import { markdown } from '@codemirror/lang-markdown';
import { typeaheadQueryAt } from './text-editor.mentions.js';

/** A parsed state with the caret where `|` sits in the fixture. */
function at(fixture: string): { state: EditorState; pos: number } {
	const pos = fixture.indexOf('|');
	const doc = fixture.slice(0, pos) + fixture.slice(pos + 1);
	const state = EditorState.create({ doc, extensions: [markdown()] });
	// The editor parses incrementally; a unit test has to ask for the whole tree
	// so the code guard sees the nodes it will see at runtime.
	ensureSyntaxTree(state, doc.length, 5000);
	return { state, pos };
}

describe('mention trigger', () => {
	it('opent aan het begin van een regel', () => {
		const { state, pos } = at('@sam|');
		expect(typeaheadQueryAt(state, pos, ['@'])).toEqual({ from: 0, to: 4, query: 'sam', trigger: '@' });
	});

	it('opent na een spatie', () => {
		const { state, pos } = at('stuur naar @sam|');
		expect(typeaheadQueryAt(state, pos, ['@'])).toEqual({ from: 11, to: 15, query: 'sam', trigger: '@' });
	});

	it('opent aan het begin van een volgende regel', () => {
		const { state, pos } = at('hallo\n@sam|');
		expect(typeaheadQueryAt(state, pos, ['@'])?.query).toBe('sam');
	});

	it('opent op een kale @, zodat de lijst verschijnt zodra je hem typt', () => {
		const { state, pos } = at('stuur naar @|');
		expect(typeaheadQueryAt(state, pos, ['@'])).toEqual({ from: 11, to: 12, query: '', trigger: '@' });
	});

	// #199: an @ inside a word is a character, not a trigger. An e-mail address
	// is the case that bit: the list opened as soon as the domain matched a name.
	it('opent niet middenin een woord', () => {
		const { state, pos } = at('stuur naar piet@sam|');
		expect(typeaheadQueryAt(state, pos, ['@'])).toBeNull();
	});

	it('opent niet in een e-mailadres met een punt', () => {
		const { state, pos } = at('mail piet@sam.nl|');
		expect(typeaheadQueryAt(state, pos, ['@'])).toBeNull();
	});

	it('opent niet in inline code', () => {
		const { state, pos } = at('gebruik `@sam|` hier');
		expect(typeaheadQueryAt(state, pos, ['@'])).toBeNull();
	});

	it('opent niet in een fenced code block', () => {
		const { state, pos } = at('```\n@sam|\n```');
		expect(typeaheadQueryAt(state, pos, ['@'])).toBeNull();
	});

	it('opent niet in een ingesprongen code block', () => {
		const { state, pos } = at('tekst\n\n    @sam|');
		expect(typeaheadQueryAt(state, pos, ['@'])).toBeNull();
	});

	it('kijkt alleen naar de tekst vóór de caret', () => {
		const { state, pos } = at('stuur naar @sa|m');
		expect(typeaheadQueryAt(state, pos, ['@'])).toEqual({ from: 11, to: 14, query: 'sa', trigger: '@' });
	});
});

// #200: a consumer's own lists open on their own trigger, with the same rules.
describe('other triggers', () => {
	it('opent op een eigen trigger en zegt welke', () => {
		const { state, pos } = at('kanaal #alg|');
		expect(typeaheadQueryAt(state, pos, ['@', '#'])).toEqual({ from: 7, to: 11, query: 'alg', trigger: '#' });
	});

	it('negeert een teken dat geen trigger is', () => {
		const { state, pos } = at('kanaal #alg|');
		expect(typeaheadQueryAt(state, pos, ['@'])).toBeNull();
	});

	it('een letter, cijfer of spatie kan geen trigger zijn', () => {
		const { state, pos } = at('tekst asam|');
		expect(typeaheadQueryAt(state, pos, ['a', ' ', '1'])).toBeNull();
	});

	it('een trigger die in een tekenklasse iets betekent wordt letterlijk genomen', () => {
		const { state, pos } = at('zie ]x| en ^y en -z');
		expect(typeaheadQueryAt(state, pos, [']', '^', '-'])).toEqual({ from: 4, to: 6, query: 'x', trigger: ']' });
	});
});

// #262: what may follow a trigger. Accents and a `+` belong to every list; a
// space ends the query unless a list asks for one.
describe('wat er na een trigger mag staan', () => {
	const NAME = '[\\p{L}\\p{M}\\p{N}_.+-]*(?: [\\p{L}\\p{M}\\p{N}_.+-]+)?';

	it('neemt een naam met accenten heel mee', () => {
		const { state, pos } = at('@józef|');
		expect(typeaheadQueryAt(state, pos, ['@'])?.query).toBe('józef');
	});

	it('neemt een accent als los teken (e plus combining acute) mee', () => {
		const { state, pos } = at('@rene\u0301|');
		expect(typeaheadQueryAt(state, pos, ['@'])?.query).toBe('rene\u0301');
	});

	it('stopt standaard bij een spatie', () => {
		const { state, pos } = at('@sam jansen|');
		expect(typeaheadQueryAt(state, pos, ['@'])).toBeNull();
	});

	it('laat één binnenspatie toe als de lijst dat zegt', () => {
		const { state, pos } = at('@sam jansen|');
		expect(typeaheadQueryAt(state, pos, [{ trigger: '@', query: NAME }])?.query).toBe('sam jansen');
	});

	it('sluit na een spatie aan het eind, ook met een binnenspatie', () => {
		const { state, pos } = at('@sam |');
		expect(typeaheadQueryAt(state, pos, [{ trigger: '@', query: NAME }])).toBeNull();
	});

	it('neemt standaard een + mee, voor :+1: en voor @sam+anna', () => {
		const emoji = at(':+1|');
		expect(typeaheadQueryAt(emoji.state, emoji.pos, [':'])?.query).toBe('+1');
		const names = at('@sam+anna|');
		expect(typeaheadQueryAt(names.state, names.pos, ['@'])?.query).toBe('sam+anna');
	});

	it('geeft elke trigger zijn eigen query', () => {
		const { state, pos } = at('@sam jansen|');
		expect(typeaheadQueryAt(state, pos, ['#', { trigger: '@', query: NAME }])).toEqual({ from: 0, to: 11, query: 'sam jansen', trigger: '@' });
	});

	it('neemt de trigger die het dichtst bij de cursor staat', () => {
		const { state, pos } = at('@sam jansen #alg|');
		expect(typeaheadQueryAt(state, pos, [{ trigger: '@', query: NAME }, '#'])?.trigger).toBe('#');
	});

	it('valt bij een ongeldige expressie terug op de standaard', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const { state, pos } = at('@józef|');
		expect(typeaheadQueryAt(state, pos, [{ trigger: '@', query: '[' }])?.query).toBe('józef');
		warn.mockRestore();
	});
});
