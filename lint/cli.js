#!/usr/bin/env node
/**
 * The `nldd` command. One bin, so `npx @nldd/design-system lint` runs it too.
 *
 * This file stays small: most of a run is Node starting and compiling, so the
 * compile cache goes first, before anything else is loaded. Node 18 and 20 go on
 * without it.
 */

import module from 'node:module';

module.enableCompileCache?.();
await import('./main.js');
