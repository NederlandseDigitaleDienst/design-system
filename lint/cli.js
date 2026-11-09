#!/usr/bin/env node
/**
 * The `nldd` command. One bin, so `npx @nldd/design-system lint` runs it too.
 *
 * This file stays small: most of a run is Node starting and compiling, so the
 * compile cache goes first, before anything else is loaded. Node 20 goes on
 * without it.
 */

import module from 'node:module';

const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 20 || (major === 20 && minor < 19)) {
	console.error('nldd needs Node 20.19 or newer.');
	process.exit(2);
}
module.enableCompileCache?.();
await import('./main.js');
