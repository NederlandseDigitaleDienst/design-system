import type { ReactiveController, ReactiveControllerHost } from 'lit';

// A browser cannot tell whether files can be dragged onto the page. A device
// whose primary pointer cannot hover has no mouse or trackpad, and is taken to
// have none to drag them with. An approximation: an iPad drags files from its
// Files app without one. nldd-file-field hides its drop hint on the same query.
// Not about dragging within the page, which nldd-column-board does by touch too.
const NO_FILE_DRAG_QUERY = '(hover: none)';

/** Whether files can be dragged onto the page on this device, so a hint for it is worth showing. */
export function fileDragAndDropAvailable(): boolean {
	return typeof matchMedia !== 'function' || !matchMedia(NO_FILE_DRAG_QUERY).matches;
}

/**
 * Renders the host again when dragging files becomes available or unavailable,
 * such as when a trackpad is attached to a tablet, so a drop hint in its
 * accessible name follows the visible one. Pass `onChange` for work that a
 * render does not redo.
 */
export class FileDragAndDropAvailabilityController implements ReactiveController {
	private _query = typeof matchMedia === 'function' ? matchMedia(NO_FILE_DRAG_QUERY) : null;
	private _onChange: () => void;

	constructor(host: ReactiveControllerHost, onChange?: () => void) {
		this._onChange = onChange ?? (() => host.requestUpdate());
		host.addController(this);
	}

	private _handleChange = () => this._onChange();

	hostConnected(): void {
		this._query?.addEventListener('change', this._handleChange);
	}

	hostDisconnected(): void {
		this._query?.removeEventListener('change', this._handleChange);
	}
}
