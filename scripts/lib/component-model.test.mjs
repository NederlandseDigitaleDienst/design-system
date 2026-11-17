import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { attributeTypeText, componentModel, iconCatalog, isBooleanAttribute, loadComponentModel, toPascal } from './component-model.js';

/** A small manifest: an element with an own and an inherited attribute, an anonymous one, a mixin. */
const manifest = {
	modules: [
		{
			path: 'src/components/actions/button-bar/button-bar.ts',
			declarations: [
				{
					kind: 'class',
					name: 'NLDDButtonBar',
					customElement: true,
					tagName: 'nldd-button-bar',
					attributes: [
						{ name: 'size', type: { text: "'sm' | 'md'" } },
						{ name: 'size', type: { text: 'string' } },
						{ name: 'reorder-handle', type: { text: 'boolean' }, inheritedFrom: { name: 'ReorderHandleMixin' } },
						{ name: 'translations', type: { text: 'Partial<T>' }, description: 'From the manifest', inheritedFrom: { name: 'withTranslations' } },
					],
				},
				{ kind: 'class', name: 'anonymous_0', customElement: true, tagName: 'nldd-button-bar-divider' },
				{ kind: 'mixin', name: 'ReorderHandleMixin' },
			],
		},
		{
			path: 'src/components/media/lqip-encoder/lqip-encoder.ts',
			declarations: [{ kind: 'class', name: 'NLDDLqipEncoder', customElement: true, tagName: 'nldd-lqip-encoder' }],
		},
	],
};

const mixinDocs = new Map([
	['ReorderHandleMixin', new Map([['reorder-handle', { name: 'reorder-handle', type: '', description: 'The grip of its row' }]])],
	['withTranslations', new Map([['translations', { name: 'translations', type: 'object', description: 'From the mixin' }]])],
]);

describe('componentModel', () => {
	const elements = componentModel(manifest, { mixinDocs });
	const bar = elements.find((element) => element.tag === 'nldd-button-bar');

	it('has one element per custom element, sorted by tag', () => {
		assert.deepEqual(elements.map((element) => element.tag), ['nldd-button-bar', 'nldd-button-bar-divider', 'nldd-lqip-encoder']);
	});

	it('knows where an element comes from', () => {
		assert.equal(bar.subpath, 'button-bar');
		assert.equal(bar.className, 'NLDDButtonBar');
		assert.equal(elements[1].anonymous, true);
		assert.equal(elements[2].internal, true);
	});

	it('keeps one attribute per name, the first', () => {
		assert.deepEqual(bar.attributes.map((attribute) => attribute.name), ['size', 'reorder-handle', 'translations']);
		assert.equal(bar.attributes[0].type.text, "'sm' | 'md'");
	});

	it('fills in a missing description from the mixin, and keeps one the manifest has', () => {
		assert.equal(bar.attributes[1].description, 'The grip of its row');
		assert.equal(bar.attributes[2].description, 'From the manifest');
	});

	it('shows the type the mixin documents, else the manifest type without undefined', () => {
		assert.equal(attributeTypeText(bar.attributes[2]), 'object');
		assert.equal(attributeTypeText(bar.attributes[1]), 'boolean');
		assert.equal(attributeTypeText({ type: { text: 'string | undefined' } }), 'string');
		assert.equal(attributeTypeText({ type: { text: 'X' }, expandedType: { text: "'a' | 'b' | undefined" } }), "'a' | 'b'");
	});
});

describe('helpers', () => {
	it('names and types', () => {
		assert.equal(toPascal('nldd-button-bar-divider'), 'NlddButtonBarDivider');
		assert.equal(isBooleanAttribute({ type: { text: 'boolean | undefined' } }), true);
		assert.equal(isBooleanAttribute({ type: { text: 'boolean | string' } }), false);
	});
});

describe('the model of this repository', () => {
	const elements = loadComponentModel();

	it('gives every element the attributes its mixins bring in', () => {
		const field = elements.find((element) => element.tag === 'nldd-text-field');
		const names = field.attributes.map((attribute) => attribute.name);
		assert.ok(names.includes('accessible-description'));
		assert.ok(field.attributes.find((attribute) => attribute.name === 'accessible-description').inheritedFrom);
	});

	it('has no attribute named after an internal field', () => {
		const leaked = elements.flatMap((element) => element.attributes.filter((attribute) => attribute.name.startsWith('_')).map((attribute) => `${element.tag} ${attribute.name}`));
		assert.deepEqual(leaked, []);
	});

	it('lists the icons and their aliases', () => {
		const { names, aliases } = iconCatalog();
		assert.ok(names.includes('chevron-down-small'));
		assert.ok(aliases.length > 0);
		assert.deepEqual(names, [...names].sort());
	});
});
