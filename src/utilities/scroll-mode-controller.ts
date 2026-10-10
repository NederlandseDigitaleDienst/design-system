import type { ReactiveController, ReactiveControllerHost } from 'lit';

export type ScrollMode = 'nested' | 'root';

/** Bubbling + composed event a horizontal split view fires when it collapses to
 *  (or expands out of) a single visible column. nldd-app-view listens for it to
 *  derive the document-vs-nested scroll mode. */
export const SINGLE_COLUMN_CHANGE_EVENT = 'nldd-single-column-change';

export interface SingleColumnChangeDetail {
	singleColumn: boolean;
}

/** A layout layer that reflects the upstream-derived scroll mode. */
export interface ScrollModeConsumer {
	/**
	 * Apply the derived scroll mode. app-view passes the mode it derived so the
	 * consumer applies it directly; called with no argument (resize / no-app-view)
	 * it re-reads the inherited `--context-scroll-mode` instead.
	 */
	readScrollMode(mode?: ScrollMode): void;
}

/** nldd-app-view — derives the mode and pushes re-reads to its registered layers. */
export interface ScrollModeProvider {
	registerScrollConsumer(consumer: ScrollModeConsumer): void;
	unregisterScrollConsumer(consumer: ScrollModeConsumer): void;
}

const PROVIDER_SELECTOR = 'nldd-app-view, nldd-sheet, nldd-modal-dialog';

/** Nearest ancestor app-view (light-DOM `closest`; slotted layers stay in the
 *  consumer's light tree so this reaches across the slot boundaries), or null
 *  when a layer is used stand-alone (e.g. a bare page in the docs).
 *
 *  An overlay ends the search: a sheet or a modal dialog is its own scroll
 *  container and its own top edge, so a page inside one owns its scroller
 *  whatever the app around it does. Without this the app-view would push its
 *  root mode straight through the overlay and the page's sticky header would
 *  stick against the document, over the content of the overlay. The overlays
 *  reset --context-scroll-mode as well, which is what the stand-alone read
 *  below then finds. */
export function findScrollModeProvider(host: Element): ScrollModeProvider | null {
	const el = host.closest?.(PROVIDER_SELECTOR);
	return el && 'registerScrollConsumer' in el ? (el as unknown as ScrollModeProvider) : null;
}

/**
 * Hands `adopt` the provider above `host` once it is defined, when it was not
 * yet at the moment `host` connected.
 *
 * Custom elements upgrade in the order their modules are defined, and an app
 * does not control that: importing nldd-sidebar-section defines nldd-page, and
 * a route that loads before its shell defines the page before the app-view. The
 * provider is then in the DOM but has no `registerScrollConsumer` yet, so
 * findScrollModeProvider returns null and the layer starts out stand-alone.
 * This lets it register as soon as the provider is defined. Nothing happens
 * when the host has left the DOM by then, or sits under another provider.
 */
export function whenScrollModeProviderDefined(host: Element, adopt: (provider: ScrollModeProvider) => void): void {
	const el = host.closest?.(PROVIDER_SELECTOR);
	if (!el || 'registerScrollConsumer' in el) return;
	void customElements.whenDefined(el.localName).then(() => {
		if (!host.isConnected) return;
		const provider = findScrollModeProvider(host);
		if (provider && (provider as unknown) === el) adopt(provider);
	});
}

/**
 * Reads the inherited `--context-scroll-mode` and reflects it to the host's
 * `[data-scroll]` attribute so CSS can branch.
 *
 * In root-scroll mode the DOCUMENT scrolls (see nldd-app-view): every layout
 * layer between the document and an nldd-page — app-view, the split views and
 * their panes — must flow (overflow: visible) instead of clipping, so the page's
 * sticky header/footer can stick against the document. Rather than duplicate the
 * read-and-reflect logic in each of those components, they share this controller.
 *
 * The mode is derived upstream by nldd-app-view. When an app-view is present the
 * host registers as a consumer and app-view pushes an authoritative re-read on
 * every change (a bare `--context-scroll-mode` update would otherwise not reach
 * the resize-polling layers in time — rAF runs before ResizeObserver). Without
 * an app-view (a stand-alone page), it falls back to re-reading on window resize
 * so a manual/media-query override still works. `nldd-page` keeps its own inline
 * logic because it also has to re-wire scroll listeners.
 */
export class ScrollModeController implements ReactiveController, ScrollModeConsumer {
	mode: ScrollMode = 'nested';

	private _host: ReactiveControllerHost & HTMLElement;
	private _onChange?: (mode: ScrollMode) => void;
	private _raf = 0;
	private _provider: ScrollModeProvider | null = null;

	constructor(host: ReactiveControllerHost & HTMLElement, onChange?: (mode: ScrollMode) => void) {
		this._host = host;
		this._onChange = onChange;
		host.addController(this);
	}

	hostConnected(): void {
		this._provider = findScrollModeProvider(this._host);
		if (this._provider) {
			// Push-driven: the app-view pushes the authoritative mode on register
			// and on every change. We deliberately do NOT self-read the var here —
			// a getComputedStyle read while a freshly (re)mounted host settles can
			// be stale (the inherited var not yet propagated), which stuck a layer
			// re-mounted on navigation in the wrong mode until a resize.
			this._provider.registerScrollConsumer(this);
		} else {
			// Stand-alone (no app-view, e.g. docs): the mode comes from the
			// inherited var; re-read on resize since it can flip at a media-query
			// breakpoint.
			window.addEventListener('resize', this._onResize, { passive: true });
			this.read();
			whenScrollModeProviderDefined(this._host, this._adopt);
		}
	}

	/** Switches from stand-alone to push once a provider that was not yet
	 *  defined at connect is. */
	private _adopt = (provider: ScrollModeProvider): void => {
		if (this._provider) return;
		window.removeEventListener('resize', this._onResize);
		this._provider = provider;
		provider.registerScrollConsumer(this);
	};

	hostDisconnected(): void {
		if (this._provider) {
			this._provider.unregisterScrollConsumer(this);
			this._provider = null;
		} else {
			window.removeEventListener('resize', this._onResize);
		}
		if (this._raf) cancelAnimationFrame(this._raf);
	}

	/**
	 * ScrollModeConsumer — nldd-app-view pushes the mode it derived. When a mode is
	 * passed it is applied directly; this is race-free, whereas re-reading
	 * `getComputedStyle` during a synchronous push can return a stale value for a
	 * deeply-nested host (the var may not have propagated through an ancestor's
	 * pending re-render yet). With no argument (resize / no app-view) the inherited
	 * var is re-read instead.
	 */
	readScrollMode(mode?: ScrollMode): void {
		const next = mode ?? this._readVar();
		if (next === this.mode) return;
		this.mode = next;
		this._host.dataset.scroll = next;
		this._onChange?.(next);
	}

	private _readVar(): ScrollMode {
		const raw = getComputedStyle(this._host).getPropertyValue('--context-scroll-mode').trim();
		return raw === 'root' ? 'root' : 'nested';
	}

	private _onResize = (): void => {
		if (this._raf) return;
		this._raf = requestAnimationFrame(() => {
			this._raf = 0;
			this.read();
		});
	};

	/** Re-read the inherited `--context-scroll-mode` (used on connect + resize). */
	read(): void {
		this.readScrollMode();
	}
}
