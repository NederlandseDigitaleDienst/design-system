import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const formSectionStyles = css`


	/* # Host */

	:host {
		--_form-section-header-gap: var(--primitives-space-8);
		--_form-section-fields-gap: var(--semantics-forms-fields-gap);

		${inheritedTextReset}
		box-sizing: border-box;
		display: block;
	}

	:host([hidden]) {
		display: none;
	}


	/* # Block */

	/* Closer to the header than a section stands to what came before it: the
	   header belongs to what is under it, and the same distance on both sides
	   would leave it floating between the two. */
	.form-section {
		display: flex;
		flex-direction: column;
		gap: var(--_form-section-header-gap);
	}


	/* # Header */

	.form-section__header[hidden] {
		display: none;
	}


	/* # Main */

	/* A gap and not a margin: a hidden child, such as a hidden input of a
	   server-rendered formset, has no box and so takes no part in it. */
	.form-section__main {
		display: flex;
		flex-direction: column;
		gap: var(--_form-section-fields-gap);
	}
`;
