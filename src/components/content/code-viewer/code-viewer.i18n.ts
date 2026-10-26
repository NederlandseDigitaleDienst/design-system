export const nlddCodeViewerTranslations = {
	'components.code-viewer.region-label': 'Code',
	'components.code-viewer.copy-action': 'Kopieer',
	'components.code-viewer.copy-success-text': 'Gekopieerd',
	'components.code-viewer.copy-failure-text': 'Kopiëren mislukt',
	// What a screen reader hears before a diff. {added} and {removed} are line
	// counts, {addedNoun} and {removedNoun} the singular or plural noun below.
	'components.code-viewer.diff-summary-text': '{added} {addedNoun} toegevoegd, {removed} {removedNoun} verwijderd',
	'components.code-viewer.line-singular-lowercase': 'regel',
	'components.code-viewer.line-plural-lowercase': 'regels',
	// Before each changed line of a diff. {number} is its line number: the new
	// one for an added line, the old one for a removed line.
	'components.code-viewer.added-line-label': 'Toegevoegd, regel {number}',
	'components.code-viewer.removed-line-label': 'Verwijderd, regel {number}',
};

export type NLDDCodeViewerTranslations = typeof nlddCodeViewerTranslations;
