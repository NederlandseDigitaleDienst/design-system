export const nlddTextEditorTranslations = {
	// Accessible label on the "open link in new tab" badge that follows a real link.
	// {url} is the link's destination.
	'components.text-editor.open-in-new-tab-label': 'Open link in nieuw tabblad: {url}',
	// Accessible label on an annotation's count badge. {count} is the number of
	// annotations on the range, {noun} is the singular/plural noun below, and {quote}
	// is the (truncated) annotated text.
	'components.text-editor.annotation-count-label': "{count} {noun} op '{quote}'",
	// The noun used in annotation-count-label: singular for one annotation, plural for more.
	'components.text-editor.annotation-singular-lowercase': 'annotatie',
	'components.text-editor.annotation-plural-lowercase': 'annotaties',
	// Shown where a typeahead list would be when it has no candidates. The first
	// while nothing has been typed after the trigger, the second for a query
	// without matches. A list's own emptyText overrides both.
	'components.text-editor.typeahead-start-typing-text': 'Typ om te zoeken',
	'components.text-editor.typeahead-no-results-text': 'Niets gevonden',
};

export type NLDDTextEditorTranslations = typeof nlddTextEditorTranslations;
