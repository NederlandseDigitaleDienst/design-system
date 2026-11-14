export const nlddTimeFieldTranslations = {
	// Fallback name when a consumer gives no accessible-label and the field does
	// not sit in an nldd-form-field: without it the input is an unnamed control.
	'components.time-field.default-label': 'Tijd',
	// Opens the picker, so an infinitive like other indirect actions.
	'components.time-field.to-pick-time-action': 'Tijd kiezen',
	// Closes the popover and keeps the time standing in the selection. Deliberately
	// not "Opslaan": this confirms a choice, it does not save a form. A consumer
	// who puts this in a save flow can override it.
	'components.time-field.confirm-action': 'Klaar',
	// Validation messages the field reports to the form. {time} is a bound as
	// HH:mm.
	'components.time-field.bad-input-error-text': 'Een tijd als uu:mm',
	'components.time-field.range-underflow-error-text': 'Een tijd vanaf {time}',
	'components.time-field.range-overflow-error-text': 'Een tijd tot en met {time}',
};

export type NLDDTimeFieldTranslations = typeof nlddTimeFieldTranslations;
