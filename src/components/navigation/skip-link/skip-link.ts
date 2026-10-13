/**
 * Nederlandse Digitale Dienst Skip Link Component (Lit + TypeScript)
 *
 * Accessibility pattern that lets keyboard users skip past content. Wraps
 * content in a default slot. Without href it moves focus to the first rendered
 * element after the skip link, so the next Tab lands on the first link or
 * button in it. An element that is not rendered, such as a `<noscript>`, a
 * `<script>` or anything hidden, is passed over. Make sure a rendered element
 * follows the component, otherwise the skip link has no effect.
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
				console.warn(
					'<nldd-skip-link>: no rendered element follows the skip link, so it has nothing to move focus to. '
					+ 'Put the content it skips to right after it, or point `href` at the id of the target.',
				);
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
		const hash = this._samePageHash();
		if (!hash) return;
		// A click that opens the link elsewhere (middle button, or with a
		// modifier held) leaves this page where it is, focus included.
		if (event && (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return;
		let id = hash.slice(1);
		// A malformed escape throws; the raw id is then the best guess left.
		try { id = decodeURIComponent(id); } catch { /* keep the raw id */ }
		const root = this.getRootNode() as Document | ShadowRoot;
		const target = root.getElementById?.(id) ?? document.getElementById(id);
		if (!target) return;
		// After the navigation the click is about to cause, not before it.
		clearTimeout(this._focusTimer);
		this._focusTimer = setTimeout(() => this._focus(target));
	};

	/**
	 * The fragment of an href that stays on this page, or an empty string. An
	 * absolute URL to the page you are on counts too: a router or a CMS writes
	 * `/pagina#inhoud` as readily as `#inhoud`.
	 */
	private _samePageHash(): string {
		try {
			const url = new URL(this.href, location.href);
			const samePage = url.origin === location.origin
				&& url.pathname === location.pathname
				&& url.search === location.search;
			return samePage ? url.hash : '';
		} catch {
			return '';
		}
	}

	private _focusTimer?: ReturnType<typeof setTimeout>;

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		clearTimeout(this._focusTimer);
	}

	/**
	 * Focuses the target and leaves it as it was once focus moves on.
	 *
	 * The tabindex is 0 and not -1, also when the target came with a -1 of its
	 * own. WebKit skips everything inside a shadow host that has a negative
	 * tabindex, slotted content included, so with -1 on an nldd-* section the
	 * next Tab left the page instead of reaching the first link in it.
	 */
	private _focus(target: HTMLElement): void {
		const previous = target.getAttribute('tabindex');
		const restore = () => {
			if (previous === null) target.removeAttribute('tabindex');
			else target.setAttribute('tabindex', previous);
		};
		target.setAttribute('tabindex', '0');
		target.addEventListener('blur', restore, { once: true });
		target.focus();
		// Focus did not take (the target got hidden or went inert in between):
		// no blur will follow, so the tab stop would stay behind for good.
		if ((target.getRootNode() as Document | ShadowRoot).activeElement !== target) {
			target.removeEventListener('blur', restore);
			restore();
			if (import.meta.env?.DEV) {
				console.warn('<nldd-skip-link>: the target did not take focus, so the skip link did nothing. It is probably hidden or inert.', target);
			}
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
