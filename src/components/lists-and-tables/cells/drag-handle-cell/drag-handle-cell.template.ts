import { html, svg } from 'lit';

const gripMd = svg`
	<svg
		aria-hidden="true" class="drag-handle-cell__control-grip"
		width="10"
		height="22"
		viewBox="0 0 10 22"
		xmlns="http://www.w3.org/2000/svg"
	>
		<circle cx="2" cy="2"  r="2" fill="currentColor"/>
		<circle cx="8" cy="2"  r="2" fill="currentColor"/>
		<circle cx="2" cy="8"  r="2" fill="currentColor"/>
		<circle cx="8" cy="8"  r="2" fill="currentColor"/>
		<circle cx="2" cy="14" r="2" fill="currentColor"/>
		<circle cx="8" cy="14" r="2" fill="currentColor"/>
		<circle cx="2" cy="20" r="2" fill="currentColor"/>
		<circle cx="8" cy="20" r="2" fill="currentColor"/>
	</svg>
`;

const gripSm = svg`
	<svg
		aria-hidden="true" class="drag-handle-cell__control-grip"
		width="10"
		height="16"
		viewBox="0 0 10 16"
		xmlns="http://www.w3.org/2000/svg"
	>
		<circle cx="2" cy="2"  r="2" fill="currentColor"/>
		<circle cx="8" cy="2"  r="2" fill="currentColor"/>
		<circle cx="2" cy="8"  r="2" fill="currentColor"/>
		<circle cx="8" cy="8"  r="2" fill="currentColor"/>
		<circle cx="2" cy="14" r="2" fill="currentColor"/>
		<circle cx="8" cy="14" r="2" fill="currentColor"/>
	</svg>
`;

export function template(size: 'sm' | 'md', label: string) {
	return html`
		<button class="drag-handle-cell__control"
			type="button"
			aria-label=${label}
		>
			${size === 'sm' ? gripSm : gripMd}
		</button>
	`;
}
