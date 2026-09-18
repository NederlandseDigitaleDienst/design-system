import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkMarkup, parseAttrs, scanTags, isFrameworkAttr } from './skill-markup.js';

/** A small stand-in for the real API map, so a test states its own world. */
function api(entries) {
	return new Map(
		Object.entries(entries).map(([tag, spec]) => [
			tag,
			{ attrs: new Set(spec.attrs ?? []), slots: new Set(spec.slots ?? []) },
		]),
	);
}

const PAGE = api({
	'nldd-page': { attrs: ['sticky-header', 'tinted'], slots: ['header', 'footer'] },
	'nldd-title': { attrs: ['size', 'color'] },
	'nldd-container': { attrs: ['padding', 'gap'] },
	'nldd-icon': { attrs: ['name', 'size'] },
});

test('vindt een onbekend component', () => {
	const problems = checkMarkup('<nldd-verzonnen></nldd-verzonnen>', { api: PAGE });
	assert.equal(problems.length, 1);
	assert.match(problems[0].message, /onbekend component <nldd-verzonnen>/);
});

test('vindt een onbekend attribuut', () => {
	const problems = checkMarkup('<nldd-title verzonnen>x</nldd-title>', { api: PAGE });
	assert.equal(problems.length, 1);
	assert.match(problems[0].message, /geen attribuut "verzonnen"/);
});

test('laat een bestaand attribuut staan', () => {
	assert.deepEqual(checkMarkup('<nldd-title size="1">x</nldd-title>', { api: PAGE }), []);
});

// The reason this script exists: the author wrote <nldd-title level="1" text="…">
// from memory while the component has size and color.
test('vangt het uit-het-hoofd verzonnen attribuut dat dit script motiveerde', () => {
	const problems = checkMarkup('<nldd-title level="1" text="Titel"></nldd-title>', { api: PAGE });
	assert.equal(problems.length, 2);
});

test('vindt een slot die de ouder niet heeft', () => {
	const source = '<nldd-page>\n<nldd-container slot="zijkant"></nldd-container>\n</nldd-page>';
	const problems = checkMarkup(source, { api: PAGE });
	assert.equal(problems.length, 1);
	assert.match(problems[0].message, /slot="zijkant"> bestaat niet op <nldd-page>/);
});

test('laat een slot staan die de ouder wel heeft', () => {
	const source = '<nldd-page>\n<nldd-container slot="header"></nldd-container>\n</nldd-page>';
	assert.deepEqual(checkMarkup(source, { api: PAGE }), []);
});

// nldd-bar-split-view documents "@slot * - Any other unique slot name creates a
// bar panel", so every name is valid there. Without this the split-view example
// in examples/patterns.md was reported.
test('laat elke slotnaam staan bij een component met @slot *', () => {
	const wildcard = api({
		'nldd-bar-split-view': { attrs: [], slots: ['main', '*'] },
		'nldd-split-view-pane': { attrs: ['has-content'] },
	});
	const source =
		'<nldd-bar-split-view>\n<nldd-split-view-pane slot="primary-bar-md"></nldd-split-view-pane>\n</nldd-bar-split-view>';
	assert.deepEqual(checkMarkup(source, { api: wildcard }), []);
});

// The split views document above/below/only as "responsive visibility per
// child": documented on the container, set on the child.
test('laat een attribuut staan dat de ouder documenteert voor zijn kinderen', () => {
	const responsive = api({
		'nldd-bar-split-view': { attrs: ['above', 'below', 'only'], slots: ['*'] },
		'nldd-split-view-pane': { attrs: ['has-content'] },
	});
	const source =
		'<nldd-bar-split-view>\n<nldd-split-view-pane only="md"></nldd-split-view-pane>\n</nldd-bar-split-view>';
	assert.deepEqual(checkMarkup(source, { api: responsive }), []);
});

test('vindt een onbekende icoonnaam', () => {
	const problems = checkMarkup('<nldd-icon name="bestaat-niet"></nldd-icon>', {
		api: PAGE,
		iconNames: new Set(['settings', 'logout']),
	});
	assert.equal(problems.length, 1);
	assert.match(problems[0].message, /onbekende icoonnaam "bestaat-niet"/);
});

// 17 components render an icon themselves through an `icon` attribute, so
// checking only nldd-icon's `name` left those unchecked.
test('controleert ook de icoonnaam in het icon-attribuut van andere componenten', () => {
	const withIcon = api({ 'nldd-banner': { attrs: ['icon', 'variant'] } });
	const problems = checkMarkup('<nldd-banner icon="bestaat-niet"></nldd-banner>', {
		api: withIcon,
		iconNames: new Set(['magnifier']),
	});
	assert.equal(problems.length, 1);
	assert.match(problems[0].message, /onbekende icoonnaam "bestaat-niet"/);
});

test('laat een bestaande icoonnaam staan', () => {
	assert.deepEqual(
		checkMarkup('<nldd-icon name="settings"></nldd-icon>', {
			api: PAGE,
			iconNames: new Set(['settings']),
		}),
		[],
	);
});

// A bound icon name comes from the app at runtime, so the doc cannot be wrong.
test('slaat een gebonden icoonnaam over', () => {
	assert.deepEqual(
		checkMarkup('<nldd-icon name="{{ icon }}"></nldd-icon>', {
			api: PAGE,
			iconNames: new Set(['settings']),
		}),
		[],
	);
});

test('accepteert een attribuut dat een mixin levert', () => {
	assert.deepEqual(
		checkMarkup('<nldd-title above="md">x</nldd-title>', {
			api: PAGE,
			mixinAttrs: new Set(['above']),
		}),
		[],
	);
});

// unmet has no property behind it: nldd-validation-list reads it off whatever
// control it targets, so it belongs to every input and to no component.
test('accepteert unmet op een control', () => {
	const inputs = api({ 'nldd-password-field': { attrs: ['name', 'masked'] } });
	const source = '<nldd-password-field name="p" unmet="breach"></nldd-password-field>';
	assert.deepEqual(checkMarkup(source, { api: inputs }), []);
});

test('negeert framework-bindingen', () => {
	for (const attr of [':text', '@close', 'v-if', '[attr.unmet]', '(click)', 'data-x', 'aria-label'])
		assert.equal(isFrameworkAttr(attr), true, attr);
	assert.equal(isFrameworkAttr('size'), false);
});

test('negeert globale HTML-attributen', () => {
	assert.deepEqual(checkMarkup('<nldd-title class="x" id="y">t</nldd-title>', { api: PAGE }), []);
});

test('geeft het juiste regelnummer', () => {
	const source = '# Kop\n\ntekst\n\n<nldd-verzonnen></nldd-verzonnen>\n';
	assert.equal(checkMarkup(source, { api: PAGE })[0].line, 5);
});

test('leest een zelfsluitende tag zonder de stack te vervuilen', () => {
	const source = '<nldd-page>\n<nldd-container />\n<nldd-container slot="header" />\n</nldd-page>';
	assert.deepEqual(checkMarkup(source, { api: PAGE }), []);
});

// A doc may show a fragment that closes a tag it never opened; that must not
// throw or clear the nesting of everything around it.
test('overleeft een sluittag zonder opening', () => {
	const source = '</nldd-page>\n<nldd-title size="2">x</nldd-title>';
	assert.deepEqual(checkMarkup(source, { api: PAGE }), []);
});

test('scant ook inline code buiten codeblokken', () => {
	const source = 'Gebruik `<nldd-title verzonnen>` hiervoor.';
	assert.equal(checkMarkup(source, { api: PAGE }).length, 1);
});

test('parseAttrs leest quoted, unquoted en booleaanse attributen', () => {
	assert.deepEqual(parseAttrs(' a="1" b=\'2\' c=3 d'), [
		{ name: 'a', value: '1' },
		{ name: 'b', value: '2' },
		{ name: 'c', value: '3' },
		{ name: 'd', value: undefined },
	]);
});

test('scanTags houdt de ouder bij', () => {
	const tags = scanTags('<nldd-page><nldd-container></nldd-container></nldd-page>');
	assert.equal(tags[0].parent, null);
	assert.equal(tags[1].parent, 'nldd-page');
});
