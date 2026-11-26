import { afterEach, describe, expect, it } from 'vitest';
import { LayoutPass, sharedResizeObserver } from './layout-pass.js';

const microtask = () => new Promise((done) => queueMicrotask(() => done(undefined)));
const frames = async (n = 3) => {
	for (let i = 0; i < n; i++) await new Promise((done) => requestAnimationFrame(() => done(undefined)));
};

describe('LayoutPass', () => {
	it('runs every host that asked in one pass, once each, in order', async () => {
		const runs: string[][] = [];
		const pass = new LayoutPass<string>((hosts) => runs.push(hosts));
		pass.schedule('a');
		pass.schedule('b');
		pass.schedule('a');
		expect(runs).toEqual([]);
		await microtask();
		expect(runs).toEqual([['a', 'b']]);
	});

	it('leaves out a host that was cancelled', async () => {
		const runs: string[][] = [];
		const pass = new LayoutPass<string>((hosts) => runs.push(hosts));
		pass.schedule('a');
		pass.schedule('b');
		pass.cancel('a');
		await microtask();
		expect(runs).toEqual([['b']]);
	});

	it('runs at once on flush, and not again after', async () => {
		const runs: string[][] = [];
		const pass = new LayoutPass<string>((hosts) => runs.push(hosts));
		pass.schedule('a');
		pass.flush();
		expect(runs).toEqual([['a']]);
		await microtask();
		expect(runs).toEqual([['a']]);
	});

	it('takes a host that asks during the run into the next pass', async () => {
		const runs: string[][] = [];
		const pass = new LayoutPass<string>((hosts) => {
			runs.push(hosts);
			if (runs.length === 1) pass.schedule('c');
		});
		pass.schedule('a');
		await microtask();
		await microtask();
		expect(runs).toEqual([['a'], ['c']]);
	});
});

type Host = { id: string };
const hosts = new Map<string, Host>();
const host = (id: string): Host => hosts.get(id) ?? hosts.set(id, { id }).get(id)!;

describe('sharedResizeObserver', () => {
	const boxes: HTMLElement[] = [];
	const box = (width = 100) => {
		const el = document.createElement('div');
		el.style.width = `${width}px`;
		el.style.height = '10px';
		document.body.append(el);
		boxes.push(el);
		return el;
	};
	afterEach(() => boxes.splice(0).forEach((el) => el.remove()));

	it('reports each host once, however many of its targets changed', async () => {
		const runs: string[][] = [];
		const observer = sharedResizeObserver<Host>((hosts) => runs.push(hosts.map((h) => h.id)));
		observer.observe(box(), host('a'));
		observer.observe(box(), host('a'));
		observer.observe(box(), host('b'));
		await frames();
		expect(runs).toEqual([['a', 'b']]);
	});

	it('stops reporting a host after unobserveAll', async () => {
		const runs: string[][] = [];
		const observer = sharedResizeObserver<Host>((hosts) => runs.push(hosts.map((h) => h.id)));
		const el = box();
		observer.observe(el, host('a'));
		await frames();
		observer.unobserveAll(host('a'));
		el.style.width = '200px';
		await frames();
		expect(runs).toEqual([['a']]);
	});

	it('reports every host of a shared target, and keeps the others when one leaves', async () => {
		const runs: string[][] = [];
		const observer = sharedResizeObserver<Host>((hosts) => runs.push(hosts.map((h) => h.id)));
		const el = box();
		observer.observe(el, host('a'));
		observer.observe(el, host('b'));
		await frames();
		expect(runs).toEqual([['a', 'b']]);
		observer.unobserveAll(host('a'));
		el.style.width = '200px';
		await frames();
		expect(runs).toEqual([['a', 'b'], ['b']]);
	});

	it('gives a host that joins an observed target a first report of its own', async () => {
		const runs: string[][] = [];
		const observer = sharedResizeObserver<Host>((hosts) => runs.push(hosts.map((h) => h.id)));
		const el = box();
		observer.observe(el, host('a'));
		await frames();
		observer.observe(el, host('b'));
		await frames();
		expect(runs).toEqual([['a'], ['a', 'b']]);
	});

	it('leaves out a host that is no longer in the page', async () => {
		const runs: Element[][] = [];
		const observer = sharedResizeObserver<Element>((hosts) => runs.push(hosts));
		const gone = box();
		const here = box();
		observer.observe(box(), gone);
		observer.observe(box(), here);
		gone.remove();
		await frames();
		expect(runs).toEqual([[here]]);
	});

	it('hands a host the entries of its targets, with their sizes', async () => {
		const seen: Array<{ id: string; widths: number[] }> = [];
		const observer = sharedResizeObserver<Host>((hosts, entriesOf) => {
			for (const h of hosts) seen.push({ id: h.id, widths: entriesOf(h).map((e) => e.contentRect.width) });
		});
		const a = host('a');
		observer.observe(box(100), a);
		observer.observe(box(50), a);
		await frames();
		const first = seen.find((s) => s.id === 'a');
		expect(first?.widths.slice().sort((x, y) => x - y)).toEqual([50, 100]);
	});

	it('stops reporting one target after unobserve, and keeps the rest', async () => {
		const runs: string[][] = [];
		const observer = sharedResizeObserver<Host>((hosts) => runs.push(hosts.map((h) => h.id)));
		const a = host('a');
		const t1 = box();
		const t2 = box();
		observer.observe(t1, a);
		observer.observe(t2, a);
		await frames();
		expect(runs).toEqual([['a']]);
		observer.unobserve(t1, a);
		t1.style.width = '200px';
		await frames();
		expect(runs).toEqual([['a']]);
		t2.style.width = '200px';
		await frames();
		expect(runs).toEqual([['a'], ['a']]);
	});
});
