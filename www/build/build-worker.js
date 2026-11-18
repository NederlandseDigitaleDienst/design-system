/**
 * Builds the pages in a module graph of its own. A worker starts without a
 * module cache, so an edit to any helper of site.js counts, not only to
 * site.js itself.
 */

import { parentPort, workerData } from 'node:worker_threads';
import { buildPages } from './site.js';

parentPort.postMessage(buildPages({ base: workerData.base }).pages);
