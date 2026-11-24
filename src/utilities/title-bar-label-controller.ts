import type { ReactiveController, ReactiveControllerHost } from 'lit';

/** A title bar names the overlay closest around it, not one further out. */
const OVERLAYS = 'nldd-sheet, nldd-window, nldd-modal-dialog, nldd-popover';

/** Whether `bar` sits in a hidden element inside `host`: a page that is not the step in view. */
function inHiddenStep(bar: Element, host: Element): boolean {
	for (let el = bar.parentElement; el && el !== host; el = el.parentElement) {
		if (el.hasAttribute('hidden')) return true;
	}
	return false;
}

/**
 * Reads the accessible name an overlay can take from its own title bar.
 *
 * A sheet or a window almost always holds an nldd-page with an
 * nldd-top-title-bar in its header, and the text of that bar is what the
 * overlay is called. aria-labelledby cannot point at it, because the h1 lives
 * in the shadow root of the bar, so the overlay copies the text and keeps
 * watching it.
 *
 * With more pages in the overlay, steps of each other (see nldd-page), the bar
 * of the page in view names it, so a hidden page's bar is passed over.
 *
 * The attribute is read rather than the property: it is there before the bar
 * is defined, and the bar reflects `text`, so a property set later arrives as
 * an attribute change too.
 */
export class TitleBarLabelController implements ReactiveController {
	/** The text of the overlay's own title bar, or '' when it has none. */
	text = '';

	private _observer: MutationObserver | null = null;

	constructor(private readonly _host: ReactiveControllerHost & HTMLElement) {
		_host.addController(this);
	}

	hostConnected(): void {
		this._read();
		this._observer = new MutationObserver((records) => {
			const relevant = records.some((record) =>
				record.type === 'childList'
				|| record.attributeName === 'hidden'
				|| (record.target as Element).localName === 'nldd-top-title-bar');
			if (relevant) this._read();
		});
		this._observer.observe(this._host, {
			subtree: true,
			childList: true,
			attributes: true,
			attributeFilter: ['text', 'hidden'],
		});
	}

	hostDisconnected(): void {
		this._observer?.disconnect();
		this._observer = null;
	}

	private _read(): void {
		const bar = [...this._host.querySelectorAll('nldd-top-title-bar')]
			.find((el) => el.closest(OVERLAYS) === this._host && !inHiddenStep(el, this._host));
		const text = bar?.getAttribute('text')?.trim() ?? '';
		if (text === this.text) return;
		this.text = text;
		this._host.requestUpdate();
	}
}
