/**
 * Reflects a string property only when it has a value.
 *
 * A rule in src/rules/ reads attributes, in the browser too, so what it names has
 * to reflect. A plain `reflect: true` writes an unset string as `x=""`, and other
 * code reads that attribute as set: nldd-form-field leaves a label alone then.
 */
export const reflectWhenSet = {
	toAttribute: (value: string | undefined) => value || null,
};
