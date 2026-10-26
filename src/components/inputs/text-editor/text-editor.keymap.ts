import { keymap } from '@codemirror/view';
import { Prec, type Extension } from '@codemirror/state';
import { defaultKeymap, deleteCharBackward, deleteCharForward, historyKeymap } from '@codemirror/commands';
import {
	clearListMarkerBackward,
	indentListItems,
	outdentListItems,
	toggleInlineWrap,
	toggleLink,
} from './text-editor.commands.js';
import { selectMentionBeforeDelete } from './text-editor.mention.js';
import { leaveDeletionToBrowser } from './text-editor.spellcheck.js';

/** The editor's keys: the formatting shortcuts, the two-step mention delete, list
 *  nesting, and CodeMirror's defaults and history with Backspace and Delete taken
 *  over. */
export const textEditorKeymap: Extension = [
	// Prec.highest so this beats the markdown language's deleteMarkupBackward,
	// which would otherwise leave alignment whitespace when a non-first list
	// marker is backspaced. Falls through (returns false) off a list marker.
	Prec.highest(keymap.of([{ key: 'Backspace', run: clearListMarkerBackward }])),
	keymap.of([
		{ key: 'Mod-b', run: (view) => { toggleInlineWrap(view, '**', 'StrongEmphasis'); return true; } },
		{ key: 'Mod-i', run: (view) => { toggleInlineWrap(view, '*', 'Emphasis'); return true; } },
		{ key: 'Mod-e', run: (view) => { toggleInlineWrap(view, '`', 'InlineCode'); return true; } },
		{ key: 'Mod-k', run: (view) => { toggleLink(view); return true; } },
		// A mention deletes in two steps: the first Backspace/Delete next to it
		// selects the whole token, the second removes it.
		{ key: 'Backspace', run: (view) => selectMentionBeforeDelete(view, -1) },
		{ key: 'Delete', run: (view) => selectMentionBeforeDelete(view, 1) },
		// Cmd/Ctrl+] and +[ nest and un-nest list items. defaultKeymap binds them
		// to indentMore/indentLess, whose four-space indent turns plain text into
		// an indented code block. Consumed here in every case: off a list item
		// they do nothing, which beats a code block nobody asked for.
		{ key: 'Mod-]', run: (view) => { indentListItems(view); return true; } },
		{ key: 'Mod-[', run: (view) => { outdentListItems(view); return true; } },
		// The browser deletes where the editor has nothing to add, so the
		// spelling marks on the line stay (see leaveDeletionToBrowser).
		{ key: 'Backspace', run: (view) => !leaveDeletionToBrowser(view, 'Backspace') && deleteCharBackward(view), shift: deleteCharBackward },
		{ key: 'Delete', run: (view) => !leaveDeletionToBrowser(view, 'Delete') && deleteCharForward(view) },
		...defaultKeymap.filter((binding) => binding.key !== 'Backspace' && binding.key !== 'Delete'),
		...historyKeymap,
	]),
];
