import { css } from 'lit';

/**
 * Reset for slotted (light-DOM) content in shadow-DOM components.
 *
 * Slotted nodes live in the consumer's document, so document-level CSS —
 * Tailwind Preflight, Bootstrap Reboot, a bespoke host reset — beats a
 * component's `::slotted()` rules for any *normal* declaration, regardless of
 * specificity. That bleeds host styling into our components and breaks visual
 * consistency across consumers.
 *
 * `all: revert !important` closes that gap: an *important* declaration from the
 * shadow tree beats document declarations (even important ones), and `revert`
 * rolls each property back to its user-agent default — a stable, host-independent
 * baseline. Properties a host might weaponise (`display: none`,
 * `pointer-events: none`, stray margins/decoration) fall back to UA defaults.
 *
 * Usage — place at the START of a `::slotted()` rule, then declare the
 * properties the component owns, each `!important` so it wins over the revert:
 *
 * ```ts
 * css`
 *   ::slotted(:not([slot])) {
 *     ${slottedReset}
 *     ${inheritedTextReset}
 *     color: var(--semantics-content-color) !important;
 *     font: var(--_title-font) !important;
 *   }
 * `
 * ```
 *
 * NOTE: `revert` does NOT isolate *inherited* properties — they still flow in
 * from the host via the chain `body → host → :host → slot`. For slotted text,
 * add {@link inheritedTextReset} to seal the inherited typography that `font`
 * does not cover.
 */
export const slottedReset = css`
	all: revert !important;
`;

/**
 * Inherited typography that the `font` shorthand does NOT cover and that a host
 * can otherwise leak into our text — directly (`a { text-decoration }`) or via
 * inheritance (`body { letter-spacing }`). Used in two places:
 *
 * - inside `::slotted(…)` to lock the consumer's slotted text (pair with
 *   {@link slottedReset}), and
 * - inside `:host`, as a guard block right after the `--_*` vars, to lock the
 *   component's OWN shadow text against host inheritance (no `all: revert` there).
 *
 * `text-align` is locked to `start` (logical, RTL-safe) — a host cannot center or
 * justify our text. A component that needs a different alignment sets it
 * explicitly on its own element, which overrides this inherited default.
 */
export const inheritedTextReset = css`
	text-align: start !important;
	letter-spacing: normal !important;
	word-spacing: normal !important;
	text-transform: none !important;
`;
