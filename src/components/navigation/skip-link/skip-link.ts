/**
 * Nederlandse Digitale Dienst Skip Link Component (Lit + TypeScript)
 *
 * Accessibility pattern that lets keyboard users skip past content. Wraps
 * content in a default slot.
 *
 * Not only for the header of a page. Any block with many stops that someone
 * on a keyboard often wants to get past can have one: a set of filters, a long
 * toolbar, a table of contents. Keep it to blocks like that; a skip link before
 * every section is one more stop on the way, not one less.
 *
 * Without href it moves focus to the first rendered element after the skip
 * link, so the next Tab lands on the first link or button in it. An element
 * that is not rendered, such as a `<noscript>`, a `<script>` or anything
 * hidden, is passed over. Make sure a rendered element follows the component,
 * otherwise the skip link has no effect.
 *
 * With an `href` that points at an id on the same page, the link scrolls to
 * that element and moves focus to it too. The target needs no `tabindex` of
 * its own. An href to another page is left to the browser.
 *
 * The component cannot know what it skips, so its default text only says
 * "Sla over". Name it with `text`: "Sla navigatie over", "Sla filters over".
 *
 * @element nldd-skip-link
 * @attr {string} text - Text of the skip link. Name what is skipped. Falls back to the i18n default.
 * @attr {string} href - Optional external target id. Without href it jumps to the first rendered element after the skip link.
 *
 * @slot - Content that can be skipped
 */

import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { skipLinkStyles } from './skip-link.styles.js';
import { template } from './skip-link.template.js';
import { withTranslations } from '../../../utilities/with-translations.js';
import { nlddSkipLinkTranslations } from './skip-link.i18n.js';
import { focusTemporarily, hashTarget, samePageHash } from '../../../utilities/focus-target.js';
import { reportRule } from '../../../utilities/report-rule.js';

@customElement('nldd-skip-link')
export class NLDDSkipLink extends withTranslations(LitElement, nlddSkipLinkTranslations) {
	static override styles = skipLinkStyles;

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	text = '';

	@property({ type: String })
	href = '';

	get _text(): string {
		return this.text || this._t('components.skip-link.action');
	}

	_handleClick = (): void => {
		const next = this._target();
		if (!next) {
			if (import.meta.env?.DEV) {
				reportRule('skip-link-no-target', this);
			}
			return;
		}
		this._focus(next);
	};

	/**
	 * With an href the browser scrolls to the target and updates the URL, and
	 * this moves focus there as well. Left to the browser, WebKit keeps focus
	 * on the link, so the next Tab starts from the top again.
	 */
	_handleLinkClick = (event?: MouseEvent): void => {
		const hash = samePageHash(this.href);
		if (!hash) return;
		// A click that opens the link elsewhere (middle button, or with a
		// modifier held) leaves this page where it is, focus included.
		if (event && (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return;
		const target = hashTarget(hash, this);
		if (!target) return;
		// After the navigation the click is about to cause, not before it.
		clearTimeout(this._focusTimer);
		this._focusTimer = setTimeout(() => this._focus(target));
	};

	private _focusTimer?: ReturnType<typeof setTimeout>;
	private _restoreTarget?: () => void;

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		clearTimeout(this._focusTimer);
	}

	/** Focuses the target with a temporary tab stop; see focusTemporarily. */
	private _focus(target: HTMLElement): void {
		// A second run before the target has blurred would read the temporary 0
		// as the original and put that back for good. Settle the first one first.
		this._restoreTarget?.();
		this._restoreTarget = focusTemporarily(target) ?? undefined;
		if (!this._restoreTarget && import.meta.env?.DEV) {
			reportRule('skip-link-target-not-focusable', target);
		}
	}

	/**
	 * The first following sibling that is rendered. `focus()` does nothing on
	 * an element without a box, and a `<noscript>` or a hidden element sitting
	 * between the skip link and the content left the button dead.
	 */
	private _target(): HTMLElement | null {
		let next = this.nextElementSibling;
		while (next) {
			const rendered = this._rendered(next);
			if (rendered) return rendered;
			next = next.nextElementSibling;
		}
		return null;
	}

	/**
	 * The element itself when it has a box and can take focus. A `display:
	 * contents` wrapper has no box, yet its children are on screen, so the
	 * first rendered one of those stands in for it. An element that is
	 * `visibility: hidden` or inert does have a box and still refuses focus.
	 */
	private _rendered(el: Element): HTMLElement | null {
		if (!(el instanceof HTMLElement)) return null;
		if (el.getClientRects().length > 0) {
			const reachable = getComputedStyle(el).visibility !== 'hidden' && !el.closest('[inert]');
			return reachable ? el : null;
		}
		if (getComputedStyle(el).display !== 'contents') return null;
		for (const child of el.children) {
			const rendered = this._rendered(child);
			if (rendered) return rendered;
		}
		return null;
	}

	override render() {
		return template(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-skip-link': NLDDSkipLink;
	}
}
