/**
 * The lockfile of a manifest, and what its package manager runs to rewrite it.
 */

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

const isBerry = (directory) => existsSync(join(directory, '.yarnrc.yml'));

/**
 * The lockfile a manifest's directory falls under, and what its package manager
 * runs to rewrite only that, or to install what it lists as well. Neither runs a
 * script of a dependency.
 */
const LOCKFILES = [
	['package-lock.json', () => ({ lockfile: ['npm', ['install', '--package-lock-only', '--ignore-scripts', '--no-audit', '--no-fund']], full: ['npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund']] })],
	['pnpm-lock.yaml', () => ({ lockfile: ['pnpm', ['install', '--lockfile-only', '--ignore-scripts']], full: ['pnpm', ['install', '--ignore-scripts']] })],
	['yarn.lock', (directory) => (isBerry(directory) ? { lockfile: ['yarn', ['install', '--mode', 'update-lockfile']], full: ['yarn', ['install', '--mode', 'skip-build']] } : { lockfile: ['yarn', ['install', '--ignore-scripts']], full: ['yarn', ['install', '--ignore-scripts']] })],
	['bun.lock', () => ({ lockfile: ['bun', ['install', '--lockfile-only']], full: ['bun', ['install', '--ignore-scripts']] })],
	['bun.lockb', () => ({ lockfile: ['bun', ['install', '--lockfile-only']], full: ['bun', ['install', '--ignore-scripts']] })],
];

/** @param {'lockfile' | 'full'} [mode] */
export function lockfileCommand(directory, root, mode = 'lockfile') {
	for (let at = directory; ; at = dirname(at)) {
		for (const [name, commands] of LOCKFILES) {
			if (existsSync(join(at, name))) return { directory: at, lockfile: name, command: commands(at)[mode] };
		}
		if (at === root || dirname(at) === at) return undefined;
	}
}

/** Runs a command and says how it went, in one line: a failed install is something to report, not to stop on. */
export function runQuietly(command, args, cwd) {
	try {
		return { ok: true, output: execFileSync(command, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 }) };
	} catch (error) {
		return { ok: false, error: String(error.stderr || error.message).trim().split('\n').slice(-1)[0] };
	}
}
