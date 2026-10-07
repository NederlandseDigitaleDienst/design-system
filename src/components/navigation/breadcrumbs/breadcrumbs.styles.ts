import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

/* The chevron separator rendered after each breadcrumb item; the item host
   defines --_breadcrumbs-item-separator-vertical-offset. */
const separatorStyles = css`
	.breadcrumbs__separator {
		display: inline-flex;
		position: relative;
		top: var(--_breadcrumbs-item-separator-vertical-offset);
		margin-inline: var(--primitives-space-2);
		color: var(--semantics-content-secondary-color);
		width: var(--primitives-space-16);
		height: var(--primitives-space-16);
		flex-shrink: 0;
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

	.breadcrumbs {
		display: flex;
	}

	.breadcrumbs__items {
		display: flex;
		flex-wrap: wrap;
		row-gap: var(--primitives-space-4);
	}
`;

export const breadcrumbsItemStyles = css`
	:host {
		/* Small downward offset so the chevron-right-small icon sits closer
		   to the text's optical centerline (the icon's bbox renders slightly
		   above the visual baseline). */
		--_breadcrumbs-item-separator-vertical-offset: 0.05em;

		${inheritedTextReset}
		display: inline-flex;
		align-items: center;
	}

	:host([hidden]) {
		display: none;
	}

	.breadcrumbs__item {
		display: inline-flex;
		align-items: center;
		color: var(--semantics-content-color);
		font: var(--primitives-font-body-md-regular-tight);
	}

	.breadcrumbs__item-link {
		color: var(--semantics-links-color);
		text-decoration: underline;
	}

	.breadcrumbs__item-link:hover {
		color: var(--semantics-links-is-hovered-color);
	}

	.breadcrumbs__item-link:active {
		color: var(--semantics-links-is-active-color);
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
