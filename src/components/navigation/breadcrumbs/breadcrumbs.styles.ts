import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';
import { wrapUiText } from '../../../assets/styles/text-wrap.js';

/* The chevron separator rendered after each breadcrumb item; the item host
   defines --_breadcrumbs-item-separator-vertical-offset. */
const separatorStyles = css`
	/* Inline, not inline-block: Chrome breaks a line before an atomic inline even
	   after a word joiner. The icon is out of flow, in the padding. */
	.breadcrumbs__separator {
		position: relative;
		padding-inline-start: calc(var(--primitives-space-4) + var(--primitives-space-16));
		--context-content-color: var(--semantics-content-secondary-color);
		color: var(--semantics-content-secondary-color);
	}

	.breadcrumbs__separator nldd-icon {
		position: absolute;
		inset-inline-start: var(--primitives-space-4);
		top: calc(50% + var(--_breadcrumbs-item-separator-vertical-offset));
		width: var(--primitives-space-16);
		height: var(--primitives-space-16);
		translate: 0 -50%;
	}
`;

export const breadcrumbsStyles = css`
	:host {
		box-sizing: border-box;
	}
	:host {
		${inheritedTextReset}
		display: block;
	}

	:host([hidden]) {
		display: none;
	}

	.breadcrumbs__items {
		font: var(--primitives-font-body-md-regular-snug);
	}
`;

export const breadcrumbsItemStyles = css`
	:host {
		/* Small downward offset so the chevron-right-small icon sits closer
		   to the text's optical centerline (the icon's bbox renders slightly
		   above the visual baseline). */
		--_breadcrumbs-item-separator-vertical-offset: 0.05em;

		${inheritedTextReset}
		display: inline;
	}

	:host([hidden]) {
		display: none;
	}

	.breadcrumbs__item {
		${wrapUiText}
		--context-content-color: var(--semantics-content-color);
		color: var(--semantics-content-color);
		font: var(--primitives-font-body-md-regular-tight);
	}

	.breadcrumbs__item-link {
		--context-content-color: var(--context-link-color);
		color: var(--context-link-color);
		text-decoration: underline;
	}

	.breadcrumbs__item-link:hover {
		--context-content-color: var(--context-link-is-hovered-color);
		color: var(--context-link-is-hovered-color);
	}

	.breadcrumbs__item-link:active {
		--context-content-color: var(--context-link-is-active-color);
		color: var(--context-link-is-active-color);
	}

	.breadcrumbs__item-link:focus-visible {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		border-radius: var(--primitives-corner-radius-xs);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}

	${separatorStyles}

	:host(:last-of-type) .breadcrumbs__separator {
		display: none;
	}
`;
