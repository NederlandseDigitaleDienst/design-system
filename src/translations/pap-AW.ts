/**
 * Concept: the texts of the package in Papiamento as written on Aruba, for
 * `setTranslations()`. Curaçao and Bonaire write Papiamentu differently; that
 * set is `pap-CW`.
 *
 * Not yet checked by a native speaker. A key that is missing here falls back
 * to Dutch, which reads better than a guess, so this set leaves out what it is
 * not sure of. Report a better wording at
 * https://github.com/NederlandseDigitaleDienst/design-system/issues
 *
 * ```js
 * import { setTranslations } from '@nldd/design-system/translations';
 * import papAW from '@nldd/design-system/translations/pap-AW';
 *
 * setTranslations(papAW);
 * ```
 */
import type { TranslationKey } from './nl.generated.js';

export const papAW: Partial<Record<TranslationKey, string>> = {
	'components.menu.empty-text': 'No tin opcion disponibel',
	'components.split-button.menu-action': 'Mas opcion',
	'components.toolbar.overflow-action': 'Mas',
	'components.code-viewer.region-label': 'Codigo',
	'components.code-viewer.copy-action': 'Copia',
	'components.token.dismiss-action': 'Kita',
	'components.date-field.default-label': 'Fecha',
	'components.date-field.default-range-label': 'Periodo',
	'components.date-field.cancel-action': 'Cancela',
	'components.date-picker.view-today-action': 'Awe',
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
	'components.date-picker.october-lowercase': 'october',
	'components.date-picker.october-capitalize': 'October',
	'components.date-picker.november-lowercase': 'november',
	'components.date-picker.november-capitalize': 'November',
	'components.date-picker.december-lowercase': 'december',
	'components.date-picker.december-capitalize': 'December',
	'components.date-picker.sunday-lowercase': 'diadomingo',
	'components.date-picker.monday-lowercase': 'dialuna',
	'components.date-picker.tuesday-lowercase': 'diamars',
	'components.date-picker.wednesday-lowercase': 'diarazon',
	'components.date-picker.thursday-lowercase': 'diahuebs',
	'components.date-picker.friday-lowercase': 'diabierna',
	'components.date-picker.saturday-lowercase': 'diasabra',
	'components.date-picker.week-number-label': 'Siman {week}',
	'components.date-picker.today-lowercase': 'awe',
	'components.search-field.search-action': 'Busca',
	'components.time-field.default-label': 'Ora',
	'components.time-field.cancel-action': 'Cancela',
	'components.time-picker.hours-label': 'Ora',
	'components.time-picker.minutes-label': 'Minuut',
	'components.token-field.dismiss-action': 'Kita',
	'components.collection.load-more-action': 'Mustra mas',
	'components.sidebar-section.sheet-dismiss-action': 'Cera',
	'components.list.items-accessible-label': 'Lista',
	'components.list.search-placeholder-label': 'Busca',
	'components.document-tab-bar.dismiss-action': 'Cera',
	'components.menu-bar.overflow-action': 'Mas opcion',
	'components.top-navigation-bar.menu-action': 'Menu',
	'components.top-navigation-bar.menu-sheet-dismiss-action': 'Cera',
	'components.activity-indicator.loading-label': 'Cargando',
	'components.banner.dismiss-action': 'Sconde',
	'components.just-in-time-education.dismiss-action': 'Sconde',
	'components.notification.dismiss-action': 'Cera',
	'components.progress-bar.total-prefix-text': 'Total',
	'components.progress-bar.loading-label': 'Cargando',
	'components.progress-circle.total-prefix-text': 'Total',
	'components.progress-circle.loading-label': 'Cargando',
};

export default papAW;
