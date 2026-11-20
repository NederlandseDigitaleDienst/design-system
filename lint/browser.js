/**
 * A browser for the commands that look at a page as it runs: `nldd lint --url`
 * and `nldd compare`.
 *
 * Playwright is not a dependency of the package. A project that wants these
 * commands has it already, or installs it for the occasion, so it is resolved
 * from the project and not from where this file is installed.
 */

import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const MISSING = 'This needs Playwright with Chromium. Install it in this project (`npm install --no-save playwright && npx playwright install chromium`), or point at one with --playwright <module>.';

/**
 * @param {object} options
 * @param {string} options.root - the project, where `playwright` is looked up
 * @param {string} [options.module] - a path to a playwright module, instead of the project's
 * @returns {Promise<import('playwright').Browser>}
 */
export async function launchBrowser({ root, module }) {
	let chromium;
	try {
		const path = module ? resolve(root, module) : createRequire(join(root, 'package.json')).resolve('playwright');
		const loaded = await import(pathToFileURL(path).href);
		chromium = (loaded.default ?? loaded).chromium ?? loaded.chromium;
	} catch {
		throw new Error(MISSING);
	}
	try {
		return await chromium.launch();
	} catch (error) {
		throw new Error(`${MISSING}\n${String(error).split('\n')[0]}`);
	}
}

/**
 * Opens a page and waits until it has stopped loading and rendering: the
 * network is quiet, the fonts are in, and a framework has had its turn.
 */
export async function openSettled(context, url) {
	const page = await context.newPage();
	await page.goto(url, { waitUntil: 'networkidle' });
	await page.evaluate(() => document.fonts.ready);
	await page.waitForTimeout(400);
	return page;
}

const TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript',
	'.mjs': 'text/javascript',
	'.css': 'text/css',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.webp': 'image/webp',
	'.json': 'application/json',
	'.woff2': 'font/woff2',
	'.woff': 'font/woff',
	'.ico': 'image/x-icon',
	'.xml': 'application/xml',
	'.txt': 'text/plain',
};

/**
 * Serves a built site from a directory, on a free port of this machine only.
 * @returns {Promise<{ origin: string, close: () => void }>}
 */
export function serveDirectory(directory) {
	const root = resolve(directory);
	return new Promise((done) => {
		const server = createServer((request, response) => {
			let path = join(root, decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
			// Nothing above the directory, whatever the URL asks for.
			if (path !== root && !path.startsWith(root + sep)) {
				response.writeHead(403);
				response.end();
				return;
			}
			if (existsSync(path) && statSync(path).isDirectory()) path = join(path, 'index.html');
			if (!existsSync(path)) {
				response.writeHead(404);
				response.end();
				return;
			}
			response.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' });
			response.end(readFileSync(path));
		});
		server.listen(0, '127.0.0.1', () => done({ origin: `http://127.0.0.1:${server.address().port}`, close: () => server.close() }));
	});
}

/** Every directory with an index.html, as the path a browser asks for. */
export function pagesOf(directory, at = resolve(directory), found = []) {
	for (const name of readdirSync(at).sort()) {
		const path = join(at, name);
		if (statSync(path).isDirectory()) pagesOf(directory, path, found);
		else if (name === 'index.html') found.push(`${at.slice(resolve(directory).length).split(sep).join('/')}/`);
	}
	return found;
}

/** Whether a command line argument is a place on the web rather than on disk. */
export const isUrl = (value) => /^https?:\/\//.test(value);

/**
 * The pages a command opens: the paths that were named, and with `crawl` every
 * page of the same origin they link to, up to a maximum.
 * @param {(url: string) => Promise<string[]>} visit - opens one page, returns the links on it
 * @returns {Promise<{ visited: string[], left: number }>}
 */
export async function walkPages({ origin, paths, crawl = false, max = 40 }, visit) {
	const queue = (paths.length > 0 ? paths : ['/']).map((path) => new URL(path, origin).href);
	const visited = [];
	while (queue.length > 0 && visited.length < max) {
		const url = queue.shift();
		if (visited.includes(url)) continue;
		visited.push(url);
		const links = await visit(url);
		if (!crawl) continue;
		for (const link of links) {
			const target = new URL(link, url);
			target.hash = '';
			if (target.origin === origin && !visited.includes(target.href) && !queue.includes(target.href)) queue.push(target.href);
		}
	}
	return { visited, left: queue.length };
}
