export const nlddDateFieldTranslations = {
	// Opens the calendar, so an infinitive like other indirect actions.
	'components.date-field.to-pick-date-action': 'Datum kiezen',
	// Fallback name when a consumer gives no accessible-label and the field does
	// not sit in an nldd-form-field: without it the input is an unnamed control.
	'components.date-field.default-label': 'Datum',
	'components.date-field.default-range-label': 'Periode',
	// Closes the sheet without choosing, so imperative like other direct actions.
	'components.date-field.cancel-action': 'Annuleer',
	// Prepositions introducing the two inputs of a range, not the endpoints
	// themselves. The field label comes before them ("Periode, van"). The short
	// form is the one visible between the two dates.
	'components.date-field.range-from-lowercase-label': 'van',
	'components.date-field.range-to-lowercase-label': 'tot en met',
	'components.date-field.range-to-short-lowercase-label': 't/m',
	// Validation messages the field reports to the form. {date} is a bound in
	// the notation the field shows.
	'components.date-field.bad-input-error-text': 'Vul een datum in als dd-mm-jjjj',
	'components.date-field.range-underflow-error-text': 'Vul een datum in vanaf {date}',
	'components.date-field.range-overflow-error-text': 'Vul een datum in tot en met {date}',
	'components.date-field.range-incomplete-error-text': 'Vul ook de einddatum in',
};

export type NLDDDateFieldTranslations = typeof nlddDateFieldTranslations;
