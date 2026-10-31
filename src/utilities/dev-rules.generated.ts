// Generated from src/rules/ by scripts/generate-lint-data.js. Do not edit.
import type { DevRule } from './dev-checks.js';

export const devRules: DevRule[] = [
	{
		"id": "avatar-group-holds-avatars",
		"message": "nldd-avatar-group sizes, stacks and rings its avatars, and only an nldd-avatar carries the name that the tooltip and the overflow list read.",
		"context": "nldd-avatar-group",
		"report": ":has(> :not(nldd-avatar))"
	},
	{
		"id": "bar-split-view-children-need-slot",
		"message": "Every child of nldd-bar-split-view needs a `slot`, or it does not render.",
		"context": "nldd-bar-split-view",
		"report": ":has(> :not([slot]))"
	},
	{
		"id": "button-group-at-most-three",
		"message": "nldd-button-group holds three buttons at most; the rest are hidden.",
		"context": "nldd-button-group",
		"count": {
			"of": "*",
			"max": 3
		}
	},
	{
		"id": "button-needs-name",
		"message": "nldd-button needs `text` or `accessible-label`, otherwise it has no accessible name.",
		"context": "nldd-button",
		"assert": "[text]:not([text=\"\"]), [accessible-label]:not([accessible-label=\"\"]), :has(> [slot=\"text\"])"
	},
	{
		"id": "card-link-needs-name",
		"message": "A card that is a link or button needs `accessible-label`: the control has no text of its own.",
		"context": "nldd-card:is([href]:not([href=\"\"]), [button])",
		"assert": "[accessible-label]:not([accessible-label=\"\"])"
	},
	{
		"id": "form-action-in-button-group",
		"message": "Put the action in a nldd-button-group, also when there is only one.",
		"context": "nldd-form-actions",
		"assert": ":has(> nldd-button-group)"
	},
	{
		"id": "form-field-needs-input",
		"message": "nldd-form-field holds no form input, so the label cannot name anything or move focus into it.",
		"context": "nldd-form-field:has(> :not(nldd-form-field-help-text, nldd-validation-list))",
		"assert": ":has(:is(nldd-checkbox, nldd-checkbox-field, nldd-code-editor, nldd-combo-box, nldd-date-field, nldd-date-picker, nldd-dropdown, nldd-file-field, nldd-multi-line-text-field, nldd-number-field, nldd-password-field, nldd-radio-button, nldd-radio-button-field, nldd-radio-button-group, nldd-search-field, nldd-segmented-control, nldd-slider, nldd-stepper, nldd-switch, nldd-switch-field, nldd-text-editor, nldd-text-field, nldd-time-field, nldd-time-picker, nldd-toggle-button, nldd-toggle-button-group, nldd-token-field))"
	},
	{
		"id": "icon-button-needs-name",
		"message": "nldd-icon-button needs `text` or `accessible-label`, otherwise it has no accessible name.",
		"context": "nldd-icon-button",
		"assert": "[text]:not([text=\"\"]), [accessible-label]:not([accessible-label=\"\"])"
	},
	{
		"id": "list-item-holds-cells",
		"message": "A row takes cells and segments. Anything else sits outside its layout.",
		"context": "nldd-list-item",
		"report": ":has(> :not([slot], :is(nldd-cell, nldd-description-cell, nldd-drag-handle-cell, nldd-icon-cell, nldd-spacer-cell, nldd-step-cell, nldd-text-cell, nldd-title-cell), nldd-list-item-segment))"
	},
	{
		"id": "list-item-needs-list",
		"message": "nldd-list-item needs a parent nldd-list, which gives the row its type and keyboard behaviour.",
		"context": "nldd-list-item",
		"assert": "nldd-list nldd-list-item"
	},
	{
		"id": "modal-dialog-needs-two-actions",
		"message": "One action leaves nothing to choose. Tell the user with an nldd-notification or an inline message, or give the dialog a real choice.",
		"context": "nldd-modal-dialog:has(> [slot=\"actions\"])",
		"count": {
			"of": "[slot=\"actions\"]",
			"min": 2
		}
	},
	{
		"id": "no-page-footer-in-section",
		"message": "nldd-page-footer has its own slot on nldd-page and sets its own width and spacing.",
		"context": ":is(nldd-simple-section, nldd-full-bleed-section, nldd-sidebar-section) nldd-page-footer"
	},
	{
		"id": "no-sheet-in-split-view",
		"message": "Render nldd-sheet at the document root: inside a pane it is clipped by that pane.",
		"context": "nldd-split-view-pane nldd-sheet"
	},
	{
		"id": "no-sticky-header-on-website",
		"message": "A website lets its header scroll away: a fixed one takes room from the content.",
		"context": "nldd-page[sticky-header]:has(nldd-top-navigation-bar)"
	},
	{
		"id": "no-toggle-button-in-button-bar",
		"message": "The bar is one surface for actions, and a selected toggle breaks it. Use nldd-toggle-button-group for a row of toggles, or nldd-segmented-control for one choice out of a few.",
		"context": "nldd-button-bar",
		"report": ":has(nldd-toggle-button)"
	},
	{
		"id": "popover-needs-name",
		"message": "nldd-popover needs `accessible-label`, or a screen reader announces it without a name.",
		"context": "nldd-popover",
		"assert": "[accessible-label]:not([accessible-label=\"\"])"
	},
	{
		"id": "tab-bar-needs-name",
		"message": "nldd-tab-bar needs `accessible-label`, so a screen reader can say what the tabs are for.",
		"context": "nldd-tab-bar",
		"assert": "[accessible-label]:not([accessible-label=\"\"])"
	},
	{
		"id": "table-needs-columns",
		"message": "nldd-table needs `columns`, a CSS grid track list, or its cells do not line up.",
		"context": "nldd-table",
		"assert": "[columns]:not([columns=\"\"])"
	},
	{
		"id": "table-needs-name",
		"message": "nldd-table needs `accessible-label`: role=\"table\" takes its name from there.",
		"context": "nldd-table",
		"assert": "[accessible-label]:not([accessible-label=\"\"])"
	},
	{
		"id": "tabs-with-href-need-navigation",
		"message": "Tabs with `href` go to another page: add `navigation`, so the bar is a nav with aria-current=\"page\" instead of a tablist, and set `current` on the tab of the page you are on.",
		"context": "nldd-tab-bar:not([navigation]):has(nldd-tab-bar-item[href]:not([href=\"\"]))"
	},
	{
		"id": "toolbar-item-needs-overflow",
		"message": "Give this item an alternative in `slot=\"overflow\"`: on a narrow screen it moves to the overflow menu, and without one it is gone.",
		"context": "nldd-toolbar-item",
		"assert": ":has(> [slot=\"overflow\"])"
	}
];
