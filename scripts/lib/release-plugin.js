import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

// semantic-release resolves a plugin from the directory of @semantic-release/core
// first, and from the project only when core has none. A plain import from a
// test can land on another copy than the one a release runs. This leans on
// core being a dependency of semantic-release; if that moves, the import below
// fails loudly rather than testing the wrong copy.
const fromSemanticRelease = createRequire(import.meta.resolve('semantic-release'));
const fromCore = createRequire(fromSemanticRelease.resolve('@semantic-release/core'));

/** The plugin module a release would load for this name. */
export const importReleasePlugin = (name) => import(pathToFileURL(fromCore.resolve(name)).href);
