import { html, nothing, TemplateResult } from 'lit';
import type { NLDDCodeViewer } from './code-viewer.js';

export function codeViewerTemplate(component: NLDDCodeViewer): TemplateResult {
	const copyState = component._copyState;
	const tooltipText = copyState === 'success'
		? component._t('components.code-viewer.copy-success-text')
		: copyState === 'failure'
			? component._t('components.code-viewer.copy-failure-text')
			: component._t('components.code-viewer.copy-action');
	// Reuse tooltipText as the icon-button's accessible-label so a keyboard
	// user re-focusing mid-feedback hears the state ("Gekopieerd") instead of
	// the static "Kopieer".
	const buttonLabel = tooltipText;
	// Live-region payload announces "Gekopieerd" / "Kopiëren mislukt"; empty
	// when idle so re-clicks re-announce.
	const liveRegionText = copyState === 'success'
		? component._t('components.code-viewer.copy-success-text')
		: copyState === 'failure'
			? component._t('components.code-viewer.copy-failure-text')
			: '';
	// CodeMirror (read-only) mounts into and owns .code-viewer__codemirror; the
	// hidden <slot> stays the declarative content source and the copy source.
	// Render the copy button only when it can actually work (not no-copy, and a
	// secure context with a Clipboard API); otherwise it'd be a dead button.
	const summary = component._diffSummary;
	return html`<div class="code-viewer">${summary ? html`<div class="code-viewer__diff-summary">${summary}</div>` : nothing}<div class="code-viewer__codemirror"></div><slot @slotchange=${component._onSlotChange}></slot>${!component._canCopy ? nothing : html`
		<div class="code-viewer__actions">
			<div class="code-viewer__copy-button">
				<nldd-tooltip
					text=${tooltipText}
					placement="left"
					?open=${copyState !== 'idle'}
					@nldd-tooltip-dismiss=${component._onCopyDismiss}
				>
					<nldd-icon-button
						icon=${copyState === 'success' ? 'check-mark' : 'copy'}
						accessible-label=${buttonLabel}
						tooltip-timing="never"
						size="md"
						@click=${component._onCopyClick}
						@focusout=${component._onCopyBlur}
					></nldd-icon-button>
				</nldd-tooltip>
			</div>
			<div class="code-viewer__live-region"
				role="status"
				aria-live="polite"
			>${liveRegionText}</div>
		</div>
	`}</div>`;
}
