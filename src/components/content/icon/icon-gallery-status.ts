// Icons added or redrawn in the most recent icon batch. The IconGallery story
// renders a "New" or "Updated" tag on these tiles, so consumers browsing the
// gallery spot what changed without reading the changelog.
//
// Both sets are derived from git history rather than kept by hand, and they are
// recomputed (not extended) with every batch, from a date you pick: the day of
// the oldest batch that should still read as new. Everything still uncommitted
// counts as new too, being by definition the batch you are adding right now.
//
// Three to four weeks back is the measure, not a number of batches. How much
// arrives in those weeks varies, and a busy fortnight that fills the gallery
// with "new" is the honest answer: that much of it is new. Shortening the
// window because a batch was large takes the label away from icons that are
// days old, which is what the label is for. A date rather than a rolling window
// so the sets only move when someone recomputes them.
//
//   git log --since=2026-09-09T00:00 --reverse --find-renames --name-status --format= \
//     -- src/components/content/icon/icons
//
// Read those events oldest first and chain renames forward to today's filename.
// An icon born inside the window is new, under whatever name it ended up with;
// an icon that was only changed or renamed inside the window is updated; a name
// that no longer exists drops out of both sets. New wins when both apply.
//
// Do not use `git log --follow` for this: on files this small its rename
// detection links unrelated icons (it reads pause-filled as a descendant of
// caret-down), which quietly moves new icons into the updated set.

export const NEW_ICONS = new Set([
	'erlenmeyer-flask',
	'erlenmeyer-flask-light',
	'file-markdown',
	'file-odf',
	'file-odg',
	'file-odp',
	'file-ods',
	'file-odt',
	'file-pdf',
	'microscope',
	'power-plug-socket',
	'share-network',
]);

export const UPDATED_ICONS = new Set<string>();
