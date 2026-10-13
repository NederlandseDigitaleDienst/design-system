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
 * With an `href` that points at an id, the link scrolls to that element and
 * moves focus to it too. The target needs no `tabindex` of its own.
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
	_handleLinkClick = (): void => {
		if (!this.href.startsWith('#')) return;
		const id = decodeURIComponent(this.href.slice(1));
		const root = this.getRootNode() as Document | ShadowRoot;
		const target = root.getElementById?.(id) ?? document.getElementById(id);
		// After the navigation the click is about to cause, not before it.
		if (target) setTimeout(() => this._focus(target));
	};

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
		target.setAttribute('tabindex', '0');
		target.addEventListener('blur', () => {
			if (previous === null) target.removeAttribute('tabindex');
			else target.setAttribute('tabindex', previous);
		}, { once: true });
		target.focus();
	}

	/**
	 * The first following sibling that is rendered. `focus()` does nothing on
	 * an element without a box, and a `<noscript>` or a hidden element sitting
	 * between the skip link and the content left the button dead.
	 */
	private _target(): HTMLElement | null {
		let next = this.nextElementSibling;
		while (next) {
			if (next instanceof HTMLElement && next.getClientRects().length > 0) return next;
			next = next.nextElementSibling;
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
