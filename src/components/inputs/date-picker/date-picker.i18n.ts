/** Index volgt Date#getUTCDay: 0 is zondag. */
export const WEEKDAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

/** Index volgt Date#getUTCMonth: 0 is januari. */
export const MONTH_KEYS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'] as const;

export const nlddDatePickerTranslations = {
	// These move the view. They do not pick a date.
	'components.date-picker.view-previous-month-action': 'Vorige maand',
	'components.date-picker.view-next-month-action': 'Volgende maand',
	'components.date-picker.view-today-action': 'Vandaag',
	'components.date-picker.choose-month-action': 'Kies een maand',
	'components.date-picker.choose-year-action': 'Kies een jaar',

	// Two forms, because the month name appears both inside a date label ("maandag
	// 29 juni 2026") and on its own in the heading above it. Which form belongs
	// where differs per language, so the translator decides that, not the styling.
	'components.date-picker.january-lowercase': 'januari',
	'components.date-picker.january-capitalize': 'Januari',
	'components.date-picker.february-lowercase': 'februari',
	'components.date-picker.february-capitalize': 'Februari',
	'components.date-picker.march-lowercase': 'maart',
	'components.date-picker.march-capitalize': 'Maart',
	'components.date-picker.april-lowercase': 'april',
	'components.date-picker.april-capitalize': 'April',
	'components.date-picker.may-lowercase': 'mei',
	'components.date-picker.may-capitalize': 'Mei',
	'components.date-picker.june-lowercase': 'juni',
	'components.date-picker.june-capitalize': 'Juni',
	'components.date-picker.july-lowercase': 'juli',
	'components.date-picker.july-capitalize': 'Juli',
	'components.date-picker.august-lowercase': 'augustus',
	'components.date-picker.august-capitalize': 'Augustus',
	'components.date-picker.september-lowercase': 'september',
	'components.date-picker.september-capitalize': 'September',
	'components.date-picker.october-lowercase': 'oktober',
	'components.date-picker.october-capitalize': 'Oktober',
	'components.date-picker.november-lowercase': 'november',
	'components.date-picker.november-capitalize': 'November',
	'components.date-picker.december-lowercase': 'december',
	'components.date-picker.december-capitalize': 'December',

	'components.date-picker.sunday-lowercase': 'zondag',
	'components.date-picker.monday-lowercase': 'maandag',
	'components.date-picker.tuesday-lowercase': 'dinsdag',
	'components.date-picker.wednesday-lowercase': 'woensdag',
	'components.date-picker.thursday-lowercase': 'donderdag',
	'components.date-picker.friday-lowercase': 'vrijdag',
	'components.date-picker.saturday-lowercase': 'zaterdag',

	'components.date-picker.sunday-short-lowercase': 'zo',
	'components.date-picker.monday-short-lowercase': 'ma',
	'components.date-picker.tuesday-short-lowercase': 'di',
	'components.date-picker.wednesday-short-lowercase': 'wo',
	'components.date-picker.thursday-short-lowercase': 'do',
	'components.date-picker.friday-short-lowercase': 'vr',
	'components.date-picker.saturday-short-lowercase': 'za',

	// The short form goes in the column heading, the full one rides along as an
	// abbr for screen readers.
	'components.date-picker.week-number-column-label': 'Weeknummer',
	'components.date-picker.week-number-column-short-lowercase-label': 'wk',
	'components.date-picker.week-number-label': 'Week {week}',

	// The full accessible name of a cell. '31' on its own tells a screen reader
	// user nothing about the month or the weekday. The weekday arrives as a
	// placeholder, so this line cannot carry the capital itself.
	'components.date-picker.date-label': '{weekday} {day} {month} {year}',

	// Additions appended to that label after a comma ("... 2026, vandaag, in de
	// periode"). They never stand alone, so always lowercase.
	'components.date-picker.today-lowercase': 'vandaag',
	'components.date-picker.unavailable-lowercase-label': 'niet beschikbaar',
	// While only the first date is fixed there is no telling whether it will be
	// the start or the end, so the label says only that a choice has been made.
	'components.date-picker.range-anchor-lowercase-label': 'gekozen, periode nog niet compleet',
	'components.date-picker.range-start-lowercase-label': 'begin van de periode',
	'components.date-picker.range-end-lowercase-label': 'einde van de periode',
	'components.date-picker.in-range-lowercase-label': 'in de periode',

	// Sentences in the live region, like components.list.drag-grabbed-text. They
	// start with a word rather than with {date}, because that placeholder resolves
	// to a lowercase letter ("maandag 20 juli 2026") and then it is not a sentence.
	'components.date-picker.date-selected-text': 'Geselecteerd: {date}.',
	// Not "begindatum": a second pick before this date runs the range backwards,
	// which makes this the end date instead.
	'components.date-picker.range-anchor-text': 'Geselecteerd: {date}. Kies nu een tweede datum, eerder of later.',
	'components.date-picker.range-selected-text': 'Geselecteerd: {start} tot en met {end}.',
	'components.date-picker.range-blocked-text': 'Die periode bevat een datum die niet beschikbaar is. Kies een andere.',
};

export type NLDDDatePickerTranslations = typeof nlddDatePickerTranslations;
