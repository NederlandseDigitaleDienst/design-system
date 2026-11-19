// A component that is moved in the DOM disconnects and connects again, without
// a first update and without a slotchange. Whatever `disconnectedCallback` takes
// down has to come back from `connectedCallback`, or the component goes quiet:
// it stops following its children, its menu or its own size.
//
// This test counts the observers and listeners that are live before a move and
// reports the ones that are gone after it. A component that sets something up
// in `firstUpdated` or from a slotchange belongs in CASES.
import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from './test-utils.js';
import './components/forms/form-field/form-field.js';
import './components/inputs/text-field/text-field.js';
import './components/status-and-feedback/banner/banner.js';
import './components/status-and-feedback/status-bar/status-bar.js';
import './components/actions/menu/menu.js';
import './components/actions/menu/menu-item.js';
import './components/inputs/combo-box/combo-box.js';
import './components/inputs/token-field/token-field.js';
import './components/layout/container/container.js';
import './components/layout/page/page.js';
import './components/lists-and-tables/list/list.js';
import './components/lists-and-tables/list-item/list-item.js';
import './components/lists-and-tables/table/table.js';
import './components/navigation/document-tab-bar/document-tab-bar.js';
import './components/navigation/menu-bar/menu-bar.js';
import './components/status-and-feedback/progress-bar/progress-bar.js';
import './components/status-and-feedback/progress-circle/progress-circle.js';
import './components/layout/collection/collection.js';
import './components/layout/kanban/kanban.js';
import './components/layout/kanban/kanban-column.js';
import './components/content/code-viewer/code-viewer.js';

const describeNode = (node: unknown): string => {
	if (node === window) return 'window';
	if (node === document) return 'document';
	if (node instanceof ShadowRoot) return `shadow(${node.host.localName})`;
	if (node instanceof Element) {
		const host = (node.getRootNode() as ShadowRoot).host;
		const name = node.localName + (node.className && typeof node.className === 'string' ? `.${node.className.split(' ')[0]}` : '');
		return host ? `${host.localName}>>${name}` : name;
	}
	return String(node);
};

// kind -> observer instance -> targets
const observers = new Map<object, { kind: string; targets: Set<Node> }>();
for (const [kind, ctor] of [['mutation', MutationObserver], ['resize', ResizeObserver], ['intersection', IntersectionObserver]] as const) {
	const proto = ctor.prototype as unknown as { observe(target: Node, options?: unknown): void; disconnect(): void; unobserve?(target: Node): void };
	const { observe, disconnect, unobserve } = proto;
	proto.observe = function (target: Node, options?: unknown) {
		const entry = observers.get(this) ?? { kind, targets: new Set<Node>() };
		entry.targets.add(target);
		observers.set(this, entry);
		return observe.call(this, target, options);
	};
	proto.disconnect = function () {
		observers.get(this)?.targets.clear();
		return disconnect.call(this);
	};
	if (unobserve) {
		proto.unobserve = function (target: Node) {
			observers.get(this)?.targets.delete(target);
			return unobserve.call(this, target);
		};
	}
}

const listeners = new Map<EventTarget, Map<string, Set<unknown>>>();
const add = EventTarget.prototype.addEventListener;
const remove = EventTarget.prototype.removeEventListener;
const captureOf = (options: unknown) => (typeof options === 'boolean' ? options : Boolean((options as { capture?: boolean } | undefined)?.capture));
EventTarget.prototype.addEventListener = function (type: string, listener: unknown, options?: unknown) {
	const once = typeof options === 'object' && options !== null && (options as { once?: boolean }).once;
	if (listener && !once) {
		const key = `${type}${captureOf(options) ? ' (capture)' : ''}`;
		const perTarget = listeners.get(this) ?? new Map<string, Set<unknown>>();
		const set = perTarget.get(key) ?? new Set();
		set.add(listener);
		perTarget.set(key, set);
		listeners.set(this, perTarget);
	}
	return add.call(this, type, listener as EventListener, options as AddEventListenerOptions);
};
EventTarget.prototype.removeEventListener = function (type: string, listener: unknown, options?: unknown) {
	listeners.get(this)?.get(`${type}${captureOf(options) ? ' (capture)' : ''}`)?.delete(listener);
	return remove.call(this, type, listener as EventListener, options as EventListenerOptions);
};

/** Everything live right now that belongs to this subtree, or to window and document. */
function snapshot(root: Element): Map<string, number> {
	const mine = (node: unknown) =>
		node === window || node === document || (node instanceof Node && (root.contains(node) || root.contains((node.getRootNode() as ShadowRoot).host ?? null) || deepContains(root, node)));
	const counts = new Map<string, number>();
	const bump = (key: string) => counts.set(key, (counts.get(key) ?? 0) + 1);
	for (const { kind, targets } of observers.values()) for (const target of targets) if (mine(target)) bump(`${kind} observer on ${describeNode(target)}`);
	for (const [target, perTarget] of listeners) {
		if (!mine(target)) continue;
		for (const [key, set] of perTarget) for (let index = 0; index < set.size; index++) bump(`listener ${key} on ${describeNode(target)}`);
	}
	return counts;
}

function deepContains(root: Element, node: Node): boolean {
	let current: Node | null = node;
	while (current) {
		if (current === root) return true;
		current = current.parentNode ?? (current as ShadowRoot).host ?? null;
	}
	return false;
}

const CASES: Record<string, string> = {
	'nldd-form-field': '<nldd-form-field label="Naam"><input><nldd-validation-list><nldd-validation-item visible>Verplicht</nldd-validation-item></nldd-validation-list></nldd-form-field>',
	'nldd-banner': '<nldd-banner><span>Tekst</span></nldd-banner>',
	'nldd-status-bar': '<nldd-status-bar><span>Tekst</span></nldd-status-bar>',
	'nldd-menu-item': '<nldd-menu><nldd-menu-item text="Een"></nldd-menu-item><nldd-menu-item text="Twee"></nldd-menu-item></nldd-menu>',
	'nldd-combo-box': '<nldd-combo-box accessible-label="Kies"><nldd-menu><nldd-menu-item text="Een" value="1"></nldd-menu-item></nldd-menu></nldd-combo-box>',
	'nldd-token-field': '<nldd-token-field accessible-label="Kies"><nldd-menu><nldd-menu-item text="Een" value="1"></nldd-menu-item></nldd-menu></nldd-token-field>',
	'nldd-container': '<nldd-container><div>A</div><div>B</div></nldd-container>',
	'nldd-page': '<nldd-page><div>Inhoud</div></nldd-page>',
	'nldd-list': '<nldd-list><nldd-list-item><span>A</span></nldd-list-item><nldd-list-item><span>B</span></nldd-list-item></nldd-list>',
	'nldd-table': '<nldd-table><nldd-table-row><span>A</span></nldd-table-row></nldd-table>',
	'nldd-document-tab-bar': '<nldd-document-tab-bar><nldd-document-tab-bar-item text="Een"></nldd-document-tab-bar-item><nldd-document-tab-bar-item text="Twee"></nldd-document-tab-bar-item></nldd-document-tab-bar>',
	'nldd-menu-bar': '<nldd-menu-bar><nldd-menu-bar-item text="Een"></nldd-menu-bar-item><nldd-menu-bar-item text="Twee"></nldd-menu-bar-item></nldd-menu-bar>',
	'nldd-progress-bar': '<nldd-progress-bar value="40"><nldd-progress-bar-segment-indicator value="50"></nldd-progress-bar-segment-indicator></nldd-progress-bar>',
	'nldd-progress-circle': '<nldd-progress-circle value="40"><nldd-progress-bar-segment-indicator value="50"></nldd-progress-bar-segment-indicator></nldd-progress-circle>',
	'nldd-collection': '<nldd-collection lazy-load max-items="1"><div>A</div><div>B</div><div>C</div></nldd-collection>',
	'nldd-kanban': '<nldd-kanban><nldd-kanban-column heading="Een"><div>A</div></nldd-kanban-column><nldd-kanban-column heading="Twee"></nldd-kanban-column></nldd-kanban>',
	'nldd-code-viewer': '<nldd-code-viewer language="js">const a = 1;</nldd-code-viewer>',
};

const settle = async (el: HTMLElement) => {
	await waitForUpdate(el);
	await new Promise((resolve) => setTimeout(resolve, 150));
	await waitForUpdate(el);
};

describe('a component keeps its observers and listeners when it is moved', () => {
	let el: HTMLElement;
	afterEach(() => {
		if (el) cleanup(el);
	});

	for (const [name, markup] of Object.entries(CASES)) {
		it(name, async () => {
			el = await fixture(`<div><div id="a">${markup}</div><div id="b"></div></div>`);
			const subject = el.querySelector('#a')!.firstElementChild as HTMLElement;
			await settle(subject);
			const before = snapshot(subject);
			el.querySelector('#b')!.appendChild(subject);
			await settle(subject);
			const after = snapshot(subject);
			const lost: string[] = [];
			for (const [key, count] of before) {
				const now = after.get(key) ?? 0;
				if (now < count) lost.push(`${key} (${count} -> ${now})`);
			}
			expect(lost).toEqual([]);
		});
	}
});
