import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { translate } from './translations.js';

type Constructor<T = object> = abstract new (...args: any[]) => T;

/** The members withTranslations adds to a component. */
export interface WithTranslations<T extends Record<string, string>> {
	/** Override translation keys; unset keys fall back to the defaults (Dutch). */
	translations: Partial<T>;
	/** @internal */
	_t(key: keyof T, vars?: Record<string, string | number>): string;
}

/**
 * Mixin that adds i18n to a LitElement component: a `translations` property for
 * overriding defaults, and a `_t()` method for lookups.
 *
 * Generic over its base, so it keeps that base's type. It composes on a plain
 * LitElement, or on a richer base such as a form-associated one, and in either
 * position in a mixin chain: the base's own members stay visible on the result.
 *
 * @example
 * ```ts
 * import { withTranslations } from '../../../utilities/with-translations.js';
 * import { myDefaults } from './my-component.i18n.js';
 *
 * class MyComponent extends withTranslations(LitElement, myDefaults) {
 *   render() {
 *     return html`${this._t('my-key')}`;
 *   }
 * }
 * ```
 *
 * @mixin withTranslations
 * @attr {object} translations - Override translation keys; unset keys fall back to Dutch
 */
export function withTranslations<
	T extends Record<string, string>,
	TBase extends Constructor<LitElement> = typeof LitElement,
>(Base: TBase, defaults: T): TBase & Constructor<WithTranslations<T>> {
	abstract class TranslationsMixin extends Base {
		@property({ type: Object })
		translations: Partial<T> = {};

		/** @internal */
		_t(key: keyof T, vars?: Record<string, string | number>): string {
			return translate(this.translations, defaults, key, vars);
		}
	}

	return TranslationsMixin as TBase & Constructor<WithTranslations<T>>;
}
