/**
 * Concept: the texts of the package in Papiamentu as written on Curaçao and
 * Bonaire, for `setTranslations()`. Aruba writes Papiamento differently; that
 * set is `pap-AW`.
 *
 * Not yet checked by a native speaker. A key that is missing here falls back
 * to Dutch, which reads better than a guess, so this set leaves out what it is
 * not sure of. Report a better wording at
 * https://github.com/NederlandseDigitaleDienst/design-system/issues
 *
 * ```js
 * import { setTranslations } from '@nldd/design-system/translations';
 * import papCW from '@nldd/design-system/translations/pap-CW';
 *
 * setTranslations(papCW);
 * ```
 */
import type { TranslationKey } from './nl.generated.js';

export const papCW: Partial<Record<TranslationKey, string>> = {
	'components.menu.empty-text': 'No tin opshon disponibel',
	'components.split-button.menu-action': 'Mas opshon',
	'components.toolbar.overflow-action': 'Mas',
	'components.avatar-group.overflow-popover-label': 'Otro nòmber',
	'components.code-viewer.region-label': 'Kódigo',
	'components.code-viewer.copy-action': 'Kopia',
	'components.token.dismiss-action': 'Kita',
	'components.date-field.default-label': 'Fecha',
	'components.date-field.default-range-label': 'Periodo',
	'components.date-field.cancel-action': 'Kanselá',
	'components.date-picker.view-today-action': 'Awe',
	'components.date-picker.january-lowercase': 'yanüari',
	'components.date-picker.january-capitalize': 'Yanüari',
	'components.date-picker.february-lowercase': 'febrüari',
	'components.date-picker.february-capitalize': 'Febrüari',
	'components.date-picker.march-lowercase': 'mart',
	'components.date-picker.march-capitalize': 'Mart',
	'components.date-picker.april-lowercase': 'aprel',
	'components.date-picker.april-capitalize': 'Aprel',
	'components.date-picker.may-lowercase': 'mei',
	'components.date-picker.may-capitalize': 'Mei',
	'components.date-picker.june-lowercase': 'yüni',
	'components.date-picker.june-capitalize': 'Yüni',
	'components.date-picker.july-lowercase': 'yüli',
	'components.date-picker.july-capitalize': 'Yüli',
	'components.date-picker.august-lowercase': 'ougùstùs',
	'components.date-picker.august-capitalize': 'Ougùstùs',
	'components.date-picker.september-lowercase': 'sèptèmber',
	'components.date-picker.september-capitalize': 'Sèptèmber',
	'components.date-picker.october-lowercase': 'òktober',
	'components.date-picker.october-capitalize': 'Òktober',
	'components.date-picker.november-lowercase': 'novèmber',
	'components.date-picker.november-capitalize': 'Novèmber',
	'components.date-picker.december-lowercase': 'desèmber',
	'components.date-picker.december-capitalize': 'Desèmber',
	'components.date-picker.sunday-lowercase': 'djadumingu',
	'components.date-picker.monday-lowercase': 'djaluna',
	'components.date-picker.tuesday-lowercase': 'djamars',
	'components.date-picker.wednesday-lowercase': 'djárason',
	'components.date-picker.thursday-lowercase': 'djaweps',
	'components.date-picker.friday-lowercase': 'djabièrnè',
	'components.date-picker.saturday-lowercase': 'djasabra',
	'components.date-picker.week-number-label': 'Siman {week}',
	'components.date-picker.today-lowercase': 'awe',
	'components.search-field.search-action': 'Buska',
	'components.time-field.default-label': 'Ora',
	'components.time-field.cancel-action': 'Kanselá',
	'components.time-field.confirm-action': 'Kla',
	'components.time-picker.hours-label': 'Ora',
	'components.time-picker.minutes-label': 'Minüt',
	'components.token-field.dismiss-action': 'Kita',
	'components.collection.load-more-action': 'Mustra mas',
	'components.sidebar-section.sheet-dismiss-action': 'Sera',
	'components.list.items-accessible-label': 'Lista',
	'components.list.search-placeholder-label': 'Buska',
	'components.document-tab-bar.dismiss-action': 'Sera',
	'components.menu-bar.overflow-action': 'Mas opshon',
	'components.top-navigation-bar.menu-action': 'Menu',
	'components.top-navigation-bar.menu-sheet-dismiss-action': 'Sera',
	'components.activity-indicator.loading-label': 'Kargando',
	'components.banner.dismiss-action': 'Skonde',
	'components.just-in-time-education.dismiss-action': 'Skonde',
	'components.notification.dismiss-action': 'Sera',
	'components.progress-bar.total-prefix-text': 'Total',
	'components.progress-bar.loading-label': 'Kargando',
	'components.progress-circle.total-prefix-text': 'Total',
	'components.progress-circle.loading-label': 'Kargando',
};

export default papCW;
