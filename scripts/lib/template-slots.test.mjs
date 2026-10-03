import { test } from 'node:test';
import assert from 'node:assert/strict';
import { templateSlots } from './template-slots.js';

test('leest een benoemd slot', () => {
	assert.deepEqual([...templateSlots('<slot name="header"></slot>')], ['header']);
});

// This is how nldd-top-navigation-bar writes its slots, and a pattern that
// expects the name right after the tag name reads straight past them.
test('leest een slot dat over meerdere regels loopt', () => {
	const source = '<slot\n\tname="global"\n\t@slotchange=${component._onGlobalSlotChange}\n></slot>';
	assert.deepEqual([...templateSlots(source)], ['global']);
});

test('leest een naam die niet het eerste attribuut is', () => {
	assert.deepEqual([...templateSlots('<slot class="x" name="footer"></slot>')], ['footer']);
});

// The > of the arrow function is not the end of the tag.
test('leest een naam die na een binding met een > erin staat', () => {
	const source = '<slot @slotchange=${() => component._sync()} name="footer"></slot>';
	assert.deepEqual([...templateSlots(source)], ['footer']);
});

test('leest een binding met geneste accolades als één geheel', () => {
	const source = '<slot @slotchange=${(e) => { if (e.target) { sync(); } }} name="header"></slot>';
	assert.deepEqual([...templateSlots(source)], ['header']);
});

test('leest een slot in een geneste template', () => {
	const source = '${show ? html`<div><slot name="start"></slot></div>` : nothing}';
	assert.deepEqual([...templateSlots(source)], ['start']);
});

test('slaat het default slot over', () => {
	assert.deepEqual([...templateSlots('<slot></slot><slot @slotchange=${x}></slot>')], []);
});

test('slaat een naam over die bij het renderen wordt opgebouwd', () => {
	assert.deepEqual([...templateSlots('<slot name="pane-${n}"></slot>')], []);
});

test('slaat een slot in een comment over', () => {
	const source = '/* <slot name="a"></slot> */\n// <slot name="b"></slot>\n<!-- <slot name="c"></slot> -->';
	assert.deepEqual([...templateSlots(source)], []);
});

test('leest de slots van meerdere templates in één bestand', () => {
	const source = '<slot name="start"></slot>\n<slot name="end"></slot>\n<slot name="start"></slot>';
	assert.deepEqual([...templateSlots(source)], ['start', 'end']);
});
