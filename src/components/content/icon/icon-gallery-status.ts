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
//   git log --since=2026-10-29T00:00 --reverse --find-renames --name-status --format= \
//     --invert-grep --grep='^feat!: one-time code field, column board' \
//     --grep='^feat!: an AI section to close the marketing page' \
//     -- src/components/content/icon/icons
//
// The greps skip the two commits that rewrote every file without changing a
// drawing: the move from the 24 and 32 grids to 96, and the rounding to one
// decimal. Without them the whole gallery reads as updated. The move was
// squashed into #352, so the grep names that merge, which changed no drawing
// of its own. A squash merge hides a commit title the same way, so after the
// merge of the rounding, grep for the title of its merge instead. Keep a
// filter as long as its commit falls inside the window; while it is still
// uncommitted, leave it out of the "uncommitted counts as new" rule above.
//
// A filtered merge can still add an icon of its own: #358 brought
// arrow-up-circle along with the rounding. Check each filtered merge with
// `git show --name-status` and count what it added (A) as new.
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
	'arrow-up-circle',
	'business-suitcase-light',
	'checkbox-list',
	'component',
	'cookie',
	'file-csv',
	'foundation-light',
	'languages',
	'laptop',
	'laptop-mobile',
	'lightbulb-circle',
	'lightbulb-circle-filled',
	'projection-screen',
	'seal',
	'seal-filled',
	'wi-fi',
]);

export const UPDATED_ICONS = new Set([
	'business-suitcase',
	'color-chart',
	'screwdriver-wrench',
	'seal-check-mark',
	'seal-star',
	'square-arrow-up',
	'task-list',
	'wrench',
]);
