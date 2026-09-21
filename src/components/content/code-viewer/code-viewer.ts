/**
 * Nederlandse Digitale Dienst Code Viewer Component (Lit + TypeScript)
 *
 * A read-only block of code/text built on a non-editable CodeMirror 6 view.
 * Visually pairs with nldd-code-editor (same engine, same token palette).
 *
 * Whitespace is preserved; long lines scroll horizontally by default. Set
 * `wrap` to break long lines onto the next visual line.
 *
 * ## Syntax highlighting
 * Set `language` to one of the supported grammars (yaml, json, javascript,
 * typescript, css, html, xml, bash, markdown, rust, gherkin, toml, sql,
 * python) to highlight the content. Without `language` the content renders
 * plain. Grammars are loaded lazily on first use, so a page that never sets
 * `language` ships zero grammar code.
 *
 * ### Theming
 * Token colors are the `--components-code-viewer-token-*` custom properties
 * (shared with the editor via the CodeMirror highlight style). Override them
 * per-instance to swap the theme.
 *
 * @element nldd-code-viewer
 *
 * @attr {'box-tinted'|'box-base'|'simple'} variant - Visual style. The two `box` values are a framed card with rounded corners, padding, fill, and a 1px border ring, and differ in which surface they fill with; `box-tinted` is the default. `simple` drops the entire frame — use when embedding inside a parent surface.
 * @attr {string} language - Grammar to highlight with. Empty disables highlighting.
 * @attr {boolean} no-copy - Hide the copy-to-clipboard button (shown by default).
 * @attr {boolean} wrap - Wrap long lines instead of horizontal scroll
 * @attr {object} translations - Override translation keys (e.g. the copy button
 *   labels and the scroll-region label); unset keys fall back to Dutch.
 *
 * @slot - Default slot for the code/text content (also the copy source)
 */
import { customElement, property, state } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { EditorView } from '@codemirror/view';
import { Compartment, EditorState, type Extension } from '@codemirror/state';
import { NLDDCodeMirrorElement } from '../../../utilities/codemirror/codemirror-element.js';
import { nlddCodeMirrorTheme } from '../../../utilities/codemirror/theme.js';
import { loadLanguage } from '../../../utilities/codemirror/languages.js';
import { codeViewerStyles } from './code-viewer.styles.js';
import { codeViewerTemplate } from './code-viewer.template.js';
import { nlddCodeViewerTranslations } from './code-viewer.i18n.js';
import type { NLDDCodeViewerTranslations } from './code-viewer.i18n.js';
import { onColorSchemeChange, forceScrollLayerRepaint } from '../../../utilities/color-scheme-repaint.js';
import '../../actions/icon-button/icon-button.js';
import '../tooltip/tooltip.js';

export type CodeViewerCopyState = 'idle' | 'success' | 'failure';

const COPY_FEEDBACK_DURATION_MS = 2000;

/* navigator.clipboard is undefined off a secure context (not https/localhost),
 * so the copy button would be a permanent dead button that only ever flashes
 * "Kopiëren mislukt". Feature-detect and hide it when it genuinely can't work. */
function isClipboardAvailable(): boolean {
	return typeof window !== 'undefined'
		&& window.isSecureContext === true
		&& typeof navigator !== 'undefined'
		&& typeof navigator.clipboard?.writeText === 'function';
}

export type CodeViewerVariant = 'box-tinted' | 'box-base' | 'simple';

@customElement('nldd-code-viewer')
export class NLDDCodeViewer extends NLDDCodeMirrorElement {
	static override styles = codeViewerStyles;

	/** Visual style. The `box` values are a framed card and name the surface they
	 *  fill with; `simple` drops the frame. */
	@property({ reflect: true, converter: reflectNonDefault<CodeViewerVariant>('box-tinted') })
	variant: CodeViewerVariant = 'box-tinted';

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	language = '';

	/** Hide the copy-to-clipboard button (shown by default). */
	@property({ type: Boolean, reflect: true, attribute: 'no-copy' })
	noCopy = false;

	@property({ type: Boolean, reflect: true })
	wrap = false;

	/* Reflects when the copy button is suppressed because the Clipboard API is
	 * unavailable (non-secure context), so the CSS can drop the reserved actions
	 * space just like it does for no-copy. Internal — not a public API. */
	@property({ type: Boolean, reflect: true, attribute: 'copy-unavailable' })
	_copyUnavailable = false;

	/** Override one or more translation keys. Unspecified keys fall back to Dutch. */
	@property({ type: Object })
	translations: Partial<NLDDCodeViewerTranslations> = {};

	@state()
	_isScrollable = false;

	@state()
	_copyState: CodeViewerCopyState = 'idle';

	private _languageCompartment = new Compartment();
	private _wrapCompartment = new Compartment();
	private _languagePending: Promise<void> = Promise.resolve();
	private _unsubscribeScheme?: () => void;
	private _resizeObserver?: ResizeObserver;
	private _mutationObserver?: MutationObserver;
	private _scrollableRaf?: number;
	private _copyResetTimer?: ReturnType<typeof setTimeout>;

	/* The copy button only renders when the user hasn't opted out (no-copy) AND
	 * the Clipboard API can actually work here (secure context). Off https the
	 * button would be dead, so we hide it rather than flash a failure. */
	public get _canCopy(): boolean {
		return !this.noCopy && isClipboardAvailable();
	}

	protected getEditorParent(): HTMLElement | null | undefined {
		return this.shadowRoot?.querySelector('.code-viewer') as HTMLElement | null;
	}

	protected buildExtensions(): Extension[] {
		return [
			nlddCodeMirrorTheme,
			EditorView.editable.of(false),
			EditorState.readOnly.of(true),
			// CodeMirror puts role="textbox" on .cm-content regardless of the editable
			// facet, so a display-only block would be announced as an editable field.
			// Override it: this is readable content, not an input. aria-multiline and
			// aria-readonly belong to textbox and are invalid on document, so drop them
			// too. null only works because updateAttrs() compares with == and so never
			// writes a null value; Attrs is typed string-only, hence the cast.
			EditorView.contentAttributes.of({
				role: 'document',
				'aria-multiline': null,
				'aria-readonly': null,
			} as unknown as Record<string, string>),
			this._wrapCompartment.of(this.wrap ? EditorView.lineWrapping : []),
			this._languageCompartment.of([]),
		];
	}

	override render() {
		return codeViewerTemplate(this);
	}

	/* The viewer's content is non-editable, so the base focus() (which targets
	 * the .cm-content contenteditable) would land on an element that isn't the
	 * keyboard-tab target or the labeled region. Focus the scroller instead —
	 * the same .cm-scroller[role=region] a keyboard user tabs to and the SR
	 * announces — but only when it's actually scrollable (focusable); otherwise
	 * there's nothing to focus, so no-op. */
	override focus(options?: FocusOptions): void {
		const scroller = this.view?.scrollDOM;
		if (this._isScrollable && scroller) scroller.focus(options);
	}

	/* The viewer's source of truth is its slot, not the CodeMirror view. On a
	 * detach/reattach re-mount from the live slotted text so changed content
	 * (swapped while detached) shows, rather than the doc captured on disconnect. */
	protected override getRemountDoc(): string {
		return this._getRawText();
	}

	override connectedCallback(): void {
		super.connectedCallback();
		/* CodeMirror's scroller caches off-screen tiles; light-dark() colors
		 * don't reliably repaint on a color-scheme flip, so drop the layer on
		 * each scheme change to repaint clean. */
		this._unsubscribeScheme = onColorSchemeChange(() => this._repaint());
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this._unsubscribeScheme?.();
		this._unsubscribeScheme = undefined;
		this._resizeObserver?.disconnect();
		this._resizeObserver = undefined;
		this._mutationObserver?.disconnect();
		this._mutationObserver = undefined;
		if (this._scrollableRaf !== undefined) {
			cancelAnimationFrame(this._scrollableRaf);
			this._scrollableRaf = undefined;
		}
		clearTimeout(this._copyResetTimer);
		this._copyResetTimer = undefined;
	}

	override firstUpdated(): void {
		// Suppress the copy button up front where the Clipboard API can't work, so
		// the reserved actions space is dropped on the first paint too.
		this._copyUnavailable = !this.noCopy && !isClipboardAvailable();
		this.mountEditor(this._getRawText());
		this.onEditorMounted();
	}

	/* slotchange fires when the slot's assigned nodes change, but a framework that
	 * patches an existing text node in place ({{ reactiveString }}) mutates its
	 * characterData without swapping the node, so no slotchange fires and the view
	 * goes stale. Watch the host's light-DOM subtree for character-data (and
	 * childList) mutations and re-read on any of them. */
	private _observeSlotText(): void {
		this._mutationObserver?.disconnect();
		this._mutationObserver = new MutationObserver(() => this._onSlotChange());
		this._mutationObserver.observe(this, {
			characterData: true,
			subtree: true,
			childList: true,
		});
	}

	/* Runs on the initial mount and on every re-mount after a detach/reattach
	 * (e.g. Vue <KeepAlive>), so the scroll observer and language survive the
	 * view being rebuilt. */
	protected override onEditorMounted(): void {
		const scroller = this.view?.scrollDOM;
		if (scroller) {
			this._resizeObserver?.disconnect();
			this._resizeObserver = new ResizeObserver((entries) => {
				// forceScrollLayerRepaint (color-scheme flip) toggles display:none →
				// reflow on the scroller, so it briefly reports width 0. Recomputing
				// then would flip _isScrollable false and strip the scroll region's
				// tabindex/role/aria-label until the next resize, leaving an
				// overflowing block unreachable. Ignore those transient 0-width ticks.
				if (entries.every((e) => e.contentRect.width === 0)) return;
				this._scheduleUpdateScrollable();
			});
			this._resizeObserver.observe(scroller);
		}
		// (Re)establish the light-DOM text observer here too, so in-place text
		// mutations are still caught after a detach/reattach re-mount (which runs
		// onEditorMounted again, not firstUpdated).
		this._observeSlotText();
		if (this.language) this._applyLanguage();
		this._updateScrollable();
	}

	override updated(changed: Map<string, unknown>): void {
		// Keep the button-suppression flag current when no-copy toggles at runtime.
		if (changed.has('noCopy')) {
			this._copyUnavailable = !this.noCopy && !isClipboardAvailable();
		}
		if (!this.view) return;
		if (changed.has('language')) this._applyLanguage();
		if (changed.has('wrap')) {
			this.reconfigure(this._wrapCompartment, this.wrap ? EditorView.lineWrapping : []);
			this._updateScrollable();
		}
		// variant/background/no-copy change the block's padding (→ clientWidth), so
		// the scrollable state can go stale until the ResizeObserver happens to
		// fire. Recompute directly. (_copyUnavailable mirrors no-copy's own effect
		// on padding, so treat it the same.)
		if (
			changed.has('variant')
			|| changed.has('noCopy')
			|| changed.has('_copyUnavailable')
		) {
			this._updateScrollable();
		}
	}

	_onSlotChange(): void {
		this.setDoc(this._getRawText());
		this._updateScrollable();
	}

	public _t(key: keyof NLDDCodeViewerTranslations): string {
		return this.translations[key] ?? nlddCodeViewerTranslations[key];
	}

	/* Lazy grammar loading is async; surface the in-flight load through
	 * updateComplete so consumers (and tests) can await el.updateComplete and
	 * see the final highlighted output. */
	override async getUpdateComplete(): Promise<boolean> {
		const result = await super.getUpdateComplete();
		await this._languagePending;
		return result;
	}

	private _applyLanguage(): void {
		this._languagePending = this._runLanguage();
	}

	private async _runLanguage(): Promise<void> {
		const lang = this.language;
		if (!lang) {
			this.reconfigure(this._languageCompartment, []);
			return;
		}
		const pending = loadLanguage(lang);
		if (!pending) {
			this.reconfigure(this._languageCompartment, []);
			return;
		}
		try {
			const support = await pending;
			// The attribute may have changed while the grammar was loading.
			if (this.language === lang) {
				this.reconfigure(this._languageCompartment, support);
				this._updateScrollable();
			}
		} catch {
			this.reconfigure(this._languageCompartment, []);
		}
	}

	/* rAF-debounce the recompute so a burst of ResizeObserver ticks (e.g. from a
	 * wrap/theme change) collapses into one measure on the next frame, after
	 * layout has settled. */
	private _scheduleUpdateScrollable(): void {
		if (this._scrollableRaf !== undefined) return;
		this._scrollableRaf = requestAnimationFrame(() => {
			this._scrollableRaf = undefined;
			this._updateScrollable();
		});
	}

	/* The horizontally-scrollable region is CodeMirror's scroller. Mark it
	 * focusable + labeled when content overflows so keyboard and screen-reader
	 * users can reach and announce it (WCAG 2.1.1). */
	private _updateScrollable(): void {
		const scroller = this.view?.scrollDOM;
		if (!scroller) return;
		// A 0-width measure (mid display:none reflow, or before first layout) is never a
		// trustworthy overflow signal — `scrollWidth > 0` against it would wrongly mark a
		// hidden viewer scrollable. Bail; a later ResizeObserver/slot tick re-measures
		// once the width is real.
		if (scroller.clientWidth === 0) return;
		const scrollable = !this.wrap && scroller.scrollWidth > scroller.clientWidth;
		this._isScrollable = scrollable;
		if (scrollable) {
			scroller.setAttribute('tabindex', '0');
			scroller.setAttribute('role', 'region');
			scroller.setAttribute('aria-label', this._t('components.code-viewer.region-label'));
		} else {
			scroller.removeAttribute('tabindex');
			scroller.removeAttribute('role');
			scroller.removeAttribute('aria-label');
		}
	}

	/* Read the raw slot text — what the user would have typed — not the
	 * rendered (tokenised) CodeMirror DOM. Also the document source. */
	private _getRawText(): string {
		const slot = this.shadowRoot?.querySelector('slot');
		if (!slot) return '';
		return slot.assignedNodes({ flatten: true })
			.map((n) => n.textContent ?? '')
			.join('');
	}

	public async _onCopyClick(): Promise<void> {
		try {
			if (!isClipboardAvailable()) throw new Error('Clipboard API unavailable');
			await navigator.clipboard.writeText(this._getRawText());
			this._copyState = 'success';
		} catch {
			this._copyState = 'failure';
		}
		clearTimeout(this._copyResetTimer);
		this._copyResetTimer = setTimeout(() => {
			this._copyState = 'idle';
		}, COPY_FEEDBACK_DURATION_MS);
	}

	/** Escape on the open feedback tooltip dismisses it early (WCAG 1.4.13). */
	public _onCopyDismiss(): void {
		clearTimeout(this._copyResetTimer);
		this._copyState = 'idle';
	}

	private _repaint(): void {
		const scroller = this.view?.scrollDOM;
		if (scroller) forceScrollLayerRepaint(scroller);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-code-viewer': NLDDCodeViewer;
	}
}
