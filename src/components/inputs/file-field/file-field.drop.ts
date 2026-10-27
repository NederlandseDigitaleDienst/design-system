/* Drag and drop for nldd-file-field: matching files against `accept`, and one
 * listener set on the window shared by every field on the page.
 *
 * The window listeners do two things. While files are dragged over the page,
 * every field shows it is a place to put them, and the field under the pointer
 * shows it will take them. And a file dropped next to a field, where nothing
 * else takes it, no longer makes the browser open it and leave the page with
 * the form half filled in. A drop that something else handles (another drop
 * zone, an editable field, a native file input) is left alone. */

/** Where a dragged file is, seen from one field. */
export type DragState = 'none' | 'page' | 'over' | 'rejected';

/** Why a drop is refused. */
export type DropRejection = 'type' | 'count';

export interface DropTarget extends HTMLElement {
	/** @internal */
	_setDrag(state: DragState, transfer: DataTransfer | null): void;
}

/* MIME types of the extensions an `accept` most often names. While a file is
 * dragged only its type is known, not its name, so this is how an extension in
 * `accept` is matched before the drop. An extension missing here is not judged
 * until the drop, when the name is there. */
const EXTENSION_TYPES: Record<string, string[]> = {
	pdf: ['application/pdf'],
	png: ['image/png'],
	jpg: ['image/jpeg'],
	jpeg: ['image/jpeg'],
	gif: ['image/gif'],
	webp: ['image/webp'],
	svg: ['image/svg+xml'],
	heic: ['image/heic'],
	tif: ['image/tiff'],
	tiff: ['image/tiff'],
	txt: ['text/plain'],
	csv: ['text/csv'],
	json: ['application/json'],
	odt: ['application/vnd.oasis.opendocument.text'],
	ods: ['application/vnd.oasis.opendocument.spreadsheet'],
	odp: ['application/vnd.oasis.opendocument.presentation'],
	docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
	xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
};

function tokens(accept: string): string[] {
	return accept.split(',').map((token) => token.trim().toLowerCase()).filter(Boolean);
}

function typeMatches(token: string, type: string): boolean {
	if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1));
	return token === type;
}

/** Whether a dropped file fits `accept`, judged on its name and its type, the
 *  way the file dialog filters. An empty `accept` takes everything. */
export function fileMatches(accept: string, file: File): boolean {
	const list = tokens(accept);
	if (list.length === 0) return true;
	const name = file.name.toLowerCase();
	const type = file.type.toLowerCase();
	return list.some((token) => (token.startsWith('.') ? name.endsWith(token) : typeMatches(token, type)));
}

/** Whether a dragged file of `type` can be ruled out against `accept` before the
 *  drop. Only a certain mismatch counts: an empty type or an extension this
 *  module has no type for leaves the answer to the drop. */
export function typeRuledOut(accept: string, type: string): boolean {
	const list = tokens(accept);
	if (list.length === 0 || !type) return false;
	const lower = type.toLowerCase();
	return list.every((token) => {
		if (!token.startsWith('.')) return !typeMatches(token, lower);
		const known = EXTENSION_TYPES[token.slice(1)];
		return known !== undefined && !known.includes(lower);
	});
}

/** Whether a drag carries files, as opposed to text or a link. */
export function carriesFiles(transfer: DataTransfer | null): boolean {
	return !!transfer && Array.from(transfer.types).includes('Files');
}

/** Whether something under the pointer takes a dropped file on its own: the
 *  browser's default for it is not to open the file, so it is not ours to stop. */
function takesDropItself(path: EventTarget[]): boolean {
	const target = path[0];
	if (!(target instanceof HTMLElement)) return false;
	return target.isContentEditable
		|| target instanceof HTMLTextAreaElement
		|| (target instanceof HTMLInputElement && target.type === 'file');
}

const targets = new Set<DropTarget>();

/* Dragover fires every few hundred milliseconds at most while the pointer is on
 * the page, even when it stands still. A drag that leaves the window or is
 * canceled sends no reliable event in every browser, so the page state ends
 * when dragover stops coming. */
const DRAG_TIMEOUT_MS = 500;
let endTimer: ReturnType<typeof setTimeout> | undefined;

function end(): void {
	clearTimeout(endTimer);
	for (const target of targets) target._setDrag('none', null);
}

function onDragOver(event: DragEvent): void {
	if (!carriesFiles(event.dataTransfer)) return;
	const path = event.composedPath();
	for (const target of targets) target._setDrag(path.includes(target) ? 'over' : 'page', event.dataTransfer);
	clearTimeout(endTimer);
	endTimer = setTimeout(end, DRAG_TIMEOUT_MS);
	if (event.defaultPrevented || takesDropItself(path)) return;
	event.preventDefault();
	event.dataTransfer!.dropEffect = 'none';
}

function onDrop(event: DragEvent): void {
	if (!carriesFiles(event.dataTransfer)) return;
	if (!event.defaultPrevented && !takesDropItself(event.composedPath())) event.preventDefault();
	end();
}

/** Registers a field with the shared window listeners, which exist while at
 *  least one field is connected. */
export function watchDrags(target: DropTarget): void {
	if (targets.size === 0) {
		window.addEventListener('dragover', onDragOver);
		window.addEventListener('drop', onDrop);
		window.addEventListener('dragend', end);
	}
	targets.add(target);
}

export function unwatchDrags(target: DropTarget): void {
	targets.delete(target);
	if (targets.size > 0) return;
	window.removeEventListener('dragover', onDragOver);
	window.removeEventListener('drop', onDrop);
	window.removeEventListener('dragend', end);
	clearTimeout(endTimer);
}
