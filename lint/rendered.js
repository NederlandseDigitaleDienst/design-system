/**
 * `nldd lint --url`: the same rules, on a page as it runs.
 *
 * A running page is HTML that the browser built. This opens the page, writes
 * down the document it finds there, and hands that to the linter as it would a
 * file from `dist`. So there is one set of rules and one kind of finding,
 * wherever the markup came from.
 *
 * It sees what the source cannot show: text that an expression fills in, a
 * value a variable passes on, markup that another file or another language
 * puts together. Run with the linter of a newer version, it is the worklist of
 * an upgrade for everything the source scan had to leave undecided.
 */

import { resolve } from 'node:path';
import { launchBrowser, openSettled, walkPages } from './browser.js';
import { compileForBrowser } from './rule-compiler.js';
import { lintProject } from './session.js';

/**
 * A framework can set a property where the markup would have an attribute, and
 * the document does not show a property. Where a rule asks whether an attribute
 * is there, a property that is set counts, as it does in the dev checks. Only
 * there: a default a component holds in a property is not something the app wrote.
 * @returns {string[]} property names, in camelCase
 */
export function countingProperties(data) {
	const names = new Set();
	for (const rule of data.rules) {
		let compiled;
		try {
			compiled = compileForBrowser(rule, data.classes);
		} catch {
			continue;
		}
		for (const name of compiled?.properties ?? []) names.add(name);
	}
	return [...names];
}

/**
 * Runs in the page. Writes the document as HTML with one tag per line, so a
 * finding has a line to point at, and notes per line which component of the
 * app rendered the element where a dev build of React or Vue keeps that.
 * Self-contained: nothing from this file is in scope there.
 *
 * Scripts and stylesheets are left out. A dev server puts the design system's
 * own styles in the page, and the app's styles are read from its source.
 */
export function snapshotInPage({ properties }) {
	const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
	const LEFT_OUT = new Set(['script', 'style', 'noscript', 'template']);
	const escapeText = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	const escapeValue = (value) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
	const kebab = (name) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

	const renderedBy = (element) => {
		const names = [];
		const fiberKey = Object.keys(element).find((key) => key.startsWith('__reactFiber$'));
		for (let owner = fiberKey ? element[fiberKey]?._debugOwner : null; owner && names.length < 3; owner = owner._debugOwner ?? owner.owner) {
			const type = owner.type ?? owner.elementType;
			const name = owner.name ?? type?.displayName ?? type?.name;
			if (typeof name === 'string' && name && !names.includes(name)) names.push(name);
		}
		const vue = element.__vueParentComponent?.type;
		if (vue) names.push(vue.__file ?? vue.__name ?? vue.name ?? '');
		return names.filter(Boolean).join(' < ');
	};

	// A component keeps its own state in `--_*` variables on its host and on its
	// children, in the style attribute. Those are not the app's. An app that sets
	// one itself wrote that in its source, where the linter reads it.
	const ownStyle = (element) =>
		[...element.style]
			.filter((property) => !property.startsWith('--_'))
			.map((property) => `${property}: ${element.style.getPropertyValue(property)}${element.style.getPropertyPriority(property) ? ' !important' : ''}`)
			.join('; ');

	const defaults = new Map();
	const defaultsOf = (tag) => {
		if (!defaults.has(tag)) {
			const fresh = document.createElement(tag);
			defaults.set(tag, Object.fromEntries(properties.map((property) => [property, fresh[property]])));
		}
		return defaults.get(tag);
	};

	const shadowRoots = [];
	const write = (start, doctype) => {
		const lines = doctype ? ['<!doctype html>'] : [];
		const owners = {};
		const walk = (node, depth) => {
			const indent = '\t'.repeat(Math.min(depth, 40));
			if (node.nodeType === Node.TEXT_NODE) {
				const text = node.data.replace(/\s+/g, ' ').trim();
				if (text) lines.push(indent + escapeText(text));
				return;
			}
			if (node.nodeType !== Node.ELEMENT_NODE || LEFT_OUT.has(node.localName)) return;
			const ours = node.localName.startsWith('nldd-');
			const attributes = [...node.attributes]
				.map(({ name, value }) => [name, name === 'style' ? ownStyle(node) : value])
				.filter(([name, value]) => name !== 'style' || value !== '')
				.map(([name, value]) => (value === '' ? name : `${name}="${escapeValue(value)}"`));
			if (ours) {
				for (const property of properties) {
					const name = kebab(property);
					if (node.hasAttribute(name)) continue;
					const value = node[property];
					// What every element of this kind starts with is the component's default, not something set here.
					if (value === defaultsOf(node.localName)[property]) continue;
					if (typeof value === 'string' && value !== '') attributes.push(`${name}="${escapeValue(value)}"`);
					else if (typeof value === 'number') attributes.push(`${name}="${value}"`);
					else if (value === true) attributes.push(name);
				}
			}
			lines.push(`${indent}<${node.localName}${attributes.length > 0 ? ` ${attributes.join(' ')}` : ''}>`);
			if (ours) {
				const owner = renderedBy(node);
				if (owner) owners[lines.length] = owner;
			}
			// A component of the app with a shadow root of its own: its markup is the
			// app's too, and is written as a document of its own. What a design system
			// component renders inside itself is not.
			if (node.shadowRoot && !ours) shadowRoots.push(node);
			if (VOID.has(node.localName)) return;
			for (const child of node.childNodes) walk(child, depth + 1);
			lines.push(`${indent}</${node.localName}>`);
		};
		for (const node of start) walk(node, 0);
		return { html: `${lines.join('\n')}\n`, owners };
	};

	const documents = [{ name: '', ...write([document.documentElement], true) }];
	for (let index = 0; index < shadowRoots.length; index++) {
		const host = shadowRoots[index];
		documents.push({ name: host.localName, ...write([...host.shadowRoot.childNodes], false) });
	}
	const links = [...document.querySelectorAll('a[href]')].map((link) => link.href);
	return { documents, links };
}

/** The rules about a name the linter does not know. On a running page a component may have written it. */
const WRITTEN_BY_COMPONENTS = ['unknown-attribute', 'unknown-slot'];

/** `/aanvragen/A-1042?tab=2` as a file name: `aanvragen/A-1042_tab=2`. */
const slugOf = (url) => {
	const { pathname, search } = new URL(url);
	const path = pathname.replace(/^\/+|\/+$/g, '').replace(/\.html?$/, '') || 'index';
	return (path + search.replace(/^\?/, '_')).replace(/[^\w./=-]/g, '_');
};

/**
 * Lints the pages of a running site. The result has the shape of lintProject's,
 * so everything that reports a lint run takes it as it is.
 *
 * A rendered document is not a file, so a finding points into what was written
 * down: `rendered/<path>.html`, at the line of the tag as the browser has it.
 *
 * @param {object} data - lint data
 * @param {object} options
 * @param {string} options.root - the project
 * @param {string} options.url - where the site runs
 * @param {string[]} [options.paths] - the pages to open; the page of `url` without
 * @param {boolean} [options.crawl] - also the pages of the same origin they link to
 * @param {number} [options.max] - at most this many pages
 * @param {string} [options.storageState] - a Playwright storage state, for a site behind a login
 * @param {string} [options.playwright] - a playwright module, instead of the project's
 * @param {object} options.config - the project's lint config
 * @param {object} options.severities - from resolveSeverities()
 */
export async function lintRendered(data, { root, url, paths = [], crawl = false, max = 40, storageState, playwright, config, severities }) {
	const { origin, pathname, search } = new URL(url);
	const properties = countingProperties(data);
	const browser = await launchBrowser({ root, module: playwright });
	const results = [];
	const failed = [];
	try {
		const context = await browser.newContext({
			viewport: { width: 1280, height: 900 },
			...(storageState ? { storageState: resolve(root, storageState) } : {}),
		});
		const { left } = await walkPages({ origin, paths: paths.length > 0 ? paths : [pathname + search], crawl, max }, async (address) => {
			let snapshot;
			try {
				const page = await openSettled(context, address);
				snapshot = await page.evaluate(snapshotInPage, { properties });
				await page.close();
			} catch (error) {
				failed.push({ url: address, error: String(error).split('\n')[0] });
				return [];
			}
			for (const { name, html, owners } of snapshot.documents) {
				const filename = resolve(root, 'rendered', `${slugOf(address)}${name ? `~${name}` : ''}.html`);
				const session = await lintProject(data, { root, config, severities, input: { filename, source: html } });
				for (const result of session.results) {
					results.push({
						...result,
						findings: result.findings
							// A hint is advice for whoever writes the source. On a running page
							// components write `style`, `id` and more, which it would take for the app's.
							.filter(({ severity }) => severity !== 'hint')
							// A component notes its state in attributes of its own, on itself and on what
							// it holds: `loaded` on an image, `slot="help"` on a help text. In the document
							// those cannot be told from one the app wrote, and what the app wrote is in its source.
							.filter(({ rule }) => !WRITTEN_BY_COMPONENTS.includes(rule))
							// No fix: the line is in what the browser built, and the source is elsewhere.
							.map(({ fix: _fix, ...finding }) => (owners[finding.line] ? { ...finding, renderedBy: owners[finding.line] } : finding)),
					});
				}
			}
			return snapshot.links;
		});
		return { results, files: results.length, unread: 0, fixed: 0, fixedFiles: 0, notUtf8: [], symlinks: [], unstable: [], partialExcludes: [], failed, left };
	} finally {
		await browser.close();
	}
}
