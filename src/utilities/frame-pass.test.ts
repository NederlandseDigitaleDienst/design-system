import { describe, expect, it } from 'vitest';
import { FramePass } from './frame-pass.js';

const frame = () => new Promise((done) => requestAnimationFrame(() => done(undefined)));

describe('FramePass', () => {
	it('runs every host that asked in one frame, once each, in order', async () => {
		const runs: string[][] = [];
		const pass = new FramePass<string>((hosts) => runs.push(hosts));
		pass.schedule('a');
		pass.schedule('b');
		pass.schedule('a');
		expect(runs).toEqual([]);
		await frame();
		expect(runs).toEqual([['a', 'b']]);
	});

	it('leaves out a host that was cancelled', async () => {
		const runs: string[][] = [];
		const pass = new FramePass<string>((hosts) => runs.push(hosts));
		pass.schedule('a');
		pass.schedule('b');
		pass.cancel('a');
		await frame();
		expect(runs).toEqual([['b']]);
	});

	it('takes a host that asks during the run into the next frame', async () => {
		const runs: string[][] = [];
		const pass = new FramePass<string>((hosts) => {
			runs.push(hosts);
			if (runs.length === 1) pass.schedule('c');
		});
		pass.schedule('a');
		await frame();
		await frame();
		expect(runs).toEqual([['a'], ['c']]);
	});
});
