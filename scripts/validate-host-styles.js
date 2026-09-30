#!/usr/bin/env node

/**
 * Host Styles Validation Script
 *
 * Outer-document rules that match a shadow host (e.g. a consumer's universal
 * reset like `* { margin: 0; padding: 0; border: 0 }`) beat every normal
 * `:host` declaration, regardless of specificity (CSS Scoping: for normal
 * declarations the outer encapsulation context wins). Only `!important`
 * declarations inside the shadow tree win from the outer context.
 *
 * This script therefore flags margin, padding and border declarations with a
 * non-zero value directly on a top-level `:host` selector that lack
 * `!important`. The preferred fix is moving the visual framework to a wrapper
 * element inside the shadow root; `!important` on the host is the fallback
 * for declarations that cannot move inward (subgrid participants, negative
 * margins).
 *
 * It also flags a component that stays visible with `hidden` set: a display
 * on the host without `:host([hidden])`, or a host rule that beats it. See
 * lib/hidden-attribute.js.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { hiddenAttributeViolations } from './lib/hidden-attribute.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const COMPONENTS_DIR = path.join(ROOT_DIR, 'src/components');

// Properties a consumer reset realistically zeroes. border-radius and
// friends are excluded: no common reset touches them.
const VULNERABLE_PROPERTY_PATTERN =
  /^(margin|padding)(-[\w-]+)?$|^border(-(top|right|bottom|left|inline|block|width|style|color)[\w-]*)?$/;

// Values that match what a reset would set anyway, so losing them is harmless.
const HARMLESS_VALUE_PATTERN = /^(0|0px|none|initial|unset|revert)$/;

function findStyleFiles(dir, suffix = '.styles.ts') {
  const files = [];

  function walk(currentDir) {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith(suffix)) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

/**
 * True when every compound in the selector list targets the host itself
 * (`:host` or `:host(...)`), with no descendant part — those are the only
 * selectors whose declarations an outer-document rule can override.
 */
function isHostSelector(selector) {
  return splitSelectorList(selector)
    .every((part) => /^:host(\((?:[^()]|\([^()]*\))*\))?$/.test(part));
}

/**
 * Splits a selector list on top-level commas only. A plain split(',') would
 * cut `:host(:is(a, b))` in half, fail the host test on both halves, and
 * silently skip that rule's violations.
 */
function splitSelectorList(selector) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < selector.length; i++) {
    const ch = selector[i];
    if (ch === '(') depth += 1;
    else if (ch === ')') depth -= 1;
    else if (ch === ',' && depth === 0) {
      parts.push(selector.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(selector.slice(start).trim());
  return parts;
}

/**
 * Walks the CSS text of one lit `css` template and collects offending
 * declarations. Tracks a selector stack so nested at-rules stay transparent
 * and only declarations directly on a `:host` frame are inspected.
 */
function findViolations(cssText) {
  const violations = [];
  // Stack frames: { host: boolean } — at-rules inherit the parent frame.
  const stack = [];
  let buffer = '';

  for (let i = 0; i < cssText.length; i++) {
    const char = cssText[i];

    if (char === '{') {
      const selector = buffer.trim();
      const parent = stack[stack.length - 1];
      const isAtRule = selector.startsWith('@');
      stack.push({
        host: isAtRule ? (parent?.host ?? false) : isHostSelector(selector),
      });
      buffer = '';
    } else if (char === '}') {
      stack.pop();
      buffer = '';
    } else if (char === ';') {
      const declaration = buffer.trim();
      buffer = '';
      if (!stack[stack.length - 1]?.host) continue;

      const match = declaration.match(/^([a-z-]+)\s*:\s*([\s\S]+)$/);
      if (!match) continue;
      const [, property, rawValue] = match;
      if (!VULNERABLE_PROPERTY_PATTERN.test(property)) continue;

      const important = /!important\s*$/.test(rawValue);
      const value = rawValue.replace(/!important\s*$/, '').trim();
      if (important || HARMLESS_VALUE_PATTERN.test(value)) continue;

      const line = cssText.slice(0, i).split('\n').length;
      violations.push({ line, property, value });
    } else {
      buffer += char;
    }
  }

  return violations;
}

/**
 * Blanks everything outside the css`...` template literals (imports, export
 * statements) so JS text never pollutes the selector buffer of the CSS
 * parser. Newlines are kept for stable line numbers.
 */
function blankNonCss(source) {
  let result = '';
  let cursor = 0;
  const open = /css`/g;
  let match;

  while ((match = open.exec(source)) !== null) {
    const start = match.index + match[0].length;
    const end = source.indexOf('`', start);
    if (end === -1) break;
    result += source.slice(cursor, start).replace(/[^\n]/g, ' ');
    result += source.slice(start, end);
    cursor = end;
    open.lastIndex = end + 1;
  }

  result += source.slice(cursor).replace(/[^\n]/g, ' ');
  return result;
}

/**
 * Each css`...` template on its own, everything around it blanked. A file can
 * style more than one component, and a hidden rule in one template does
 * nothing for the host of another.
 */
function cssTemplates(source) {
  const templates = [];
  const open = /css`/g;
  let match;

  while ((match = open.exec(source)) !== null) {
    const start = match.index + match[0].length;
    const end = source.indexOf('`', start);
    if (end === -1) break;
    templates.push(source.slice(0, start).replace(/[^\n]/g, ' ') + source.slice(start, end));
    open.lastIndex = end + 1;
  }

  return templates;
}

function blankComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '));
}

function report(file, lines) {
  const relative = path.relative(ROOT_DIR, file);
  console.error(`❌ ${relative}`);
  for (const [line, message] of lines) {
    console.error(`   ${relative}:${line} — ${message}`);
  }
}

function main() {
  const files = findStyleFiles(COMPONENTS_DIR);
  const lightDomFiles = findStyleFiles(COMPONENTS_DIR, '.css');
  let resetTotal = 0;
  let hiddenTotal = 0;

  for (const file of files) {
    const source = blankComments(fs.readFileSync(file, 'utf-8'))
      .replace(/\$\{[^}]*\}/g, (expr) => expr.replace(/[^\n]/g, ' '));

    const violations = findViolations(blankNonCss(source));
    const hidden = cssTemplates(source).flatMap(hiddenAttributeViolations);
    if (violations.length === 0 && hidden.length === 0) continue;

    resetTotal += violations.length;
    hiddenTotal += hidden.length;
    report(file, [
      ...violations.map(({ line, property, value }) => [line, `\`${property}: ${value}\` on :host`]),
      ...hidden.map(({ line, message }) => [line, message]),
    ]);
  }

  for (const file of lightDomFiles) {
    const hidden = hiddenAttributeViolations(blankComments(fs.readFileSync(file, 'utf-8')));
    if (hidden.length === 0) continue;
    hiddenTotal += hidden.length;
    report(file, hidden.map(({ line, message }) => [line, message]));
  }

  if (resetTotal > 0) {
    console.error(
      `\n${resetTotal} host declaration(s) a consumer reset would override.\n` +
        'Move the visual framework to a wrapper element inside the shadow root,\n' +
        'or add `!important` when the declaration cannot move inward\n' +
        '(subgrid participants, negative margins).'
    );
  }

  if (hiddenTotal > 0) {
    console.error(
      `\n${hiddenTotal} rule(s) that keep a component visible while it has \`hidden\`.\n` +
        'Add `:host([hidden]) { display: none; }` after the last host rule that sets a display.'
    );
  }

  if (resetTotal > 0 || hiddenTotal > 0) process.exit(1);

  console.log(
    `✅ Host styles validated (${files.length + lightDomFiles.length} files): ` +
      'no reset-vulnerable declarations, and `hidden` hides every component.'
  );
}

main();
