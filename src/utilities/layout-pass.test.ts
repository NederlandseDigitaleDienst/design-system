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
		const observer = sharedResizeObserver<string>((hosts) => runs.push(hosts));
		observer.observe(box(), 'a');
		observer.observe(box(), 'a');
		observer.observe(box(), 'b');
		await frames();
		expect(runs).toEqual([['a', 'b']]);
	});

	it('stops reporting a host after unobserveAll', async () => {
		const runs: string[][] = [];
		const observer = sharedResizeObserver<string>((hosts) => runs.push(hosts));
		const el = box();
		observer.observe(el, 'a');
		await frames();
		observer.unobserveAll('a');
		el.style.width = '200px';
		await frames();
		expect(runs).toEqual([['a']]);
	});

	it('reports every host of a shared target, and keeps the others when one leaves', async () => {
		const runs: string[][] = [];
		const observer = sharedResizeObserver<string>((hosts) => runs.push(hosts));
		const el = box();
		observer.observe(el, 'a');
		observer.observe(el, 'b');
		await frames();
		expect(runs).toEqual([['a', 'b']]);
		observer.unobserveAll('a');
		el.style.width = '200px';
		await frames();
		expect(runs).toEqual([['a', 'b'], ['b']]);
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
});
