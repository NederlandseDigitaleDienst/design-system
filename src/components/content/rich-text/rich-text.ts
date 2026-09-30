/**
 * Nederlandse Digitale Dienst Rich Text Component (Lit + TypeScript)
 *
 * A container for rich text content that automatically applies responsive
 * typography. Uses no shadow DOM so styles apply to all nested elements.
 * Import nldd-rich-text.css globally in your application.
 *
 * ## Direct children
 * The rich text lays out its direct children in a grid: the vertical rhythm
 * between headings, paragraphs and lists, and the width zones below, apply to
 * those children only. A single wrapper `div` without `class`, `style`, `role`
 * or `data-width`, as a markdown renderer or a component root produces it, is
 * passed through with `display: contents`, so its children count as direct.
 * Any other wrapper becomes a single grid item, and the paragraphs inside it
 * lose their spacing.
 *
 * ## Width zones
 * Children are placed in three zones: text (headings, paragraphs, lists,
 * blockquote, div/section) reads at the `main` size; media and tables (img,
 * figure, video, iframe, table) get the `wide` accent; everything else, code
 * blocks and every component, gets the full `full` span with
 * `justify-self: start`, so the room is available without being forced.
 * Overridable per child with `data-width="main" | "wide" | "full"`. In the
 * left-aligned layout, wide and full read as a bleed to the right; with
 * `centered` they are symmetrical.
 *
 * @element nldd-rich-text
 *
 * @attr {string} color - 'content' (the default) takes the system's own content
 *   colors, each element its own. 'inherit' lets all text follow the color of
 *   the surface instead (for colored areas such as the filled categories).
 *   Links stay underlined as an affordance; secondary text (figcaption) gets
 *   the same color at a lowered opacity. Known v1 gaps: inline code, mark,
 *   tables and hr keep their own surfaces.
 * @attr {string} spacing - Spacing between elements: 'flat' | 'tight' | 'snug' (default) | 'loose'
 * @attr {boolean} centered - Centers the main column inside the container; without it, content is left-aligned
 * @attr {object} translations - Override translation keys; unset keys fall back to Dutch
 * @attr {boolean} hyphens - Opt-in automatic hyphenation for running text (p,
 *   li, dd). Needs a correct `lang` on the page (`lang="nl"` on `<html>`, for
 *   instance): without language information the browser does not hyphenate. An
 *   `overflow-wrap: break-word` safety net on p/li is always on, independent of
 *   this attribute, so long URLs and compounds break neatly instead of
 *   overflowing even without a dictionary.
 */
import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { nlddRichTextTranslations } from './rich-text.i18n.js';
import type { NLDDRichTextTranslations } from './rich-text.i18n.js';

type Spacing = 'flat' | 'tight' | 'snug' | 'loose';

const MANAGED_LABEL_ATTR = 'data-nldd-managed-label';

@customElement('nldd-rich-text')
export class NLDDRichText extends LitElement {
	@property({ reflect: true, converter: reflectNonDefault<'content' | 'inherit'>('content') })
	color: 'content' | 'inherit' = 'content';

	@property({ reflect: true, converter: reflectNonDefault<Spacing>('snug') })
	spacing: Spacing = 'snug';

	@property({ type: Boolean, reflect: true })
	centered = false;

	@property({ type: Object })
	translations: Partial<NLDDRichTextTranslations> = {};

	@property({ type: Boolean, reflect: true })
	hyphens = false;

	public _t(key: keyof NLDDRichTextTranslations): string {
		return this.translations[key] ?? nlddRichTextTranslations[key];
	}

	private _mutationObserver?: MutationObserver;
	private _resizeObserver?: ResizeObserver;

	override createRenderRoot() {
		return this;
	}

	override connectedCallback(): void {
		super.connectedCallback();
		/* Tables overflow horizontally on narrow viewports (overflow-x: auto
		 * below 641px). Keyboard users need them focusable to scroll —
		 * WCAG 2.1.1. Observe the host's size (catches container/viewport
		 * resizes; per-table ResizeObserver misses container-query display
		 * flips on tables) and the light-DOM subtree (catches added/removed
		 * tables). Both trigger a re-evaluation of every table's overflow. */
		this._resizeObserver = new ResizeObserver(() => this._syncTables());
		this._resizeObserver.observe(this);
		this._mutationObserver = new MutationObserver(() => this._syncTables());
		this._mutationObserver.observe(this, { childList: true, subtree: true });
		this._syncTables();
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this._mutationObserver?.disconnect();
		this._mutationObserver = undefined;
		this._resizeObserver?.disconnect();
		this._resizeObserver = undefined;
	}

	private _syncTables(): void {
		for (const table of this.querySelectorAll('table')) {
			if (table.scrollWidth > table.clientWidth) {
				if (table.getAttribute('tabindex') !== '0') {
					table.setAttribute('tabindex', '0');
					// Focusable region needs an accessible name. A <caption>
					// already names the table natively, so only fall back to
					// a generic translated label when neither caption nor
					// existing aria-label/labelledby is present. Mark managed
					// labels so we can clean them up later without touching
					// consumer-set ones. (aria-label takes precedence over
					// caption, so adding it when caption exists would risk
					// silent divergence if the caption updates.)
					if (
						!table.hasAttribute('aria-label')
						&& !table.hasAttribute('aria-labelledby')
						&& !table.querySelector('caption')
					) {
						table.setAttribute('aria-label', this._t('components.rich-text.table-scroll-label'));
						table.setAttribute(MANAGED_LABEL_ATTR, '');
					}
				}
			} else if (table.getAttribute('tabindex') === '0') {
				table.removeAttribute('tabindex');
				if (table.hasAttribute(MANAGED_LABEL_ATTR)) {
					table.removeAttribute('aria-label');
					table.removeAttribute(MANAGED_LABEL_ATTR);
				}
			}
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-rich-text': NLDDRichText;
	}
}
