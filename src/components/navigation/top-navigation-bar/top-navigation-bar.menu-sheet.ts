import { sanitizeUrl } from '../../../utilities/sanitize-url.js';
import { carryContext } from '../../../utilities/carried-context.js';
import type { NLDDMenuBar } from '../menu-bar/menu-bar.js';
import type { NLDDMenuBarItem } from '../menu-bar-item/menu-bar-item.js';
import type { NLDDTopNavigationBarTranslations } from './top-navigation-bar.i18n.js';

/** Minimal typed interface for nldd-sheet API. */
interface Sheet extends HTMLElement {
	show(): void;
	hide(): void;
}

/** One entry rendered as a row in the menu sheet — derived from a global
 * menu-bar-item (top level) or a submenu's menu-item (deeper levels). */
interface SheetEntry {
	text: string;
	/** Sanitized href; empty when the row is a button rather than a link. */
	href: string;
	/** Marks the row as the current one. */
	selected: boolean;
	/** The `aria-current` value of a current row, when the source names one. */
	currentType?: string;
	/** Child nldd-menu when this row drills into a deeper level, else null. */
	submenu: Element | null;
	/** Triggers the source item's action — only used for button (non-link,
	 *  non-submenu) rows. */
	activate: () => void;
}

/** One level on the sheet's drill-down stack. `container` is the element whose
 * direct children make up the level: the global nldd-menu-bar at the root, or a
 * nldd-menu submenu deeper in. */
interface SheetLevel {
	title: string;
	container: Element | null;
}

/** What the sheet needs from its bar. */
export interface MenuSheetHost extends HTMLElement {
	_t(key: keyof NLDDTopNavigationBarTranslations): string;
	/** The consumer's global nldd-menu-bar, whose items the sheet shows. */
	readonly _globalMenuBar: NLDDMenuBar | null;
}

/**
 * The menu of a narrow nldd-top-navigation-bar: a sheet from the left with the
 * items of the global menu bar as a navigation list, and a level of its own for
 * every submenu.
 *
 * It is built on the first open, from modules loaded only then, and appended
 * to document.body. The rows are read from the menu bar on every open and on
 * every step between levels, so the sheet shows what the bar holds at that
 * moment. The menu bar and its submenus are only read, never moved, so the
 * popovers they serve on a wide screen stay intact.
 */
export class TopNavigationMenuSheet {
	/** @internal Exposed for tests. */
	list: HTMLElement | null = null;
	/** @internal Exposed for tests. */
	titleBar: HTMLElement | null = null;

	private _sheet: Sheet | null = null;
	/** The last entry is the visible level. Reset to the root on every open,
	 *  so a reopened sheet starts at the top wherever you drilled to before. */
	private _stack: SheetLevel[] = [];

	constructor(private readonly _host: MenuSheetHost) {}

	private get _menuText(): string {
		return this._host._t('components.top-navigation-bar.menu-action');
	}

	/** Open the sheet at its root level. `button` is the bar's menu button,
	 *  which says `expanded` while the sheet is open. */
	async open(button: NLDDMenuBarItem | null): Promise<void> {
		if (!this._sheet) {
			try {
				await loadDependencies();
			} catch (error) {
				if (import.meta.env?.DEV) {
					console.error('nldd-top-navigation-bar: failed to load menu sheet dependencies', error);
				}
				return;
			}
			if (!this._host.isConnected) return; // disconnected during the load
			if (this._sheet) return; // a second click during the load
			this._sheet = this._create();
			this._sheet.addEventListener('open', () => { if (button) button.expanded = true; });
			this._sheet.addEventListener('close', () => { if (button) button.expanded = false; });
		}
		this._stack = [{ title: this._menuText, container: this._host._globalMenuBar }];
		this._render();
		carryContext(this._sheet, this._host);
		// After this click completes, or the backdrop would catch it.
		requestAnimationFrame(() => this._sheet?.show());
	}

	/** Take over the bar's texts after a change of translations. */
	applyTexts(): void {
		this._sheet?.setAttribute('accessible-label', this._menuText);
		this.titleBar?.setAttribute('dismiss-text', this._host._t('components.top-navigation-bar.menu-sheet-dismiss-action'));
		if (this._stack.length > 0) {
			// The root level is titled with the menu text, and so is the back
			// button that points at it.
			this._stack[0].title = this._menuText;
			this._render();
		}
	}

	remove(): void {
		this._sheet?.remove();
		this._sheet = null;
		this.list = null;
		this.titleBar = null;
		this._stack = [];
	}

	private _create(): Sheet {
		const sheet = document.createElement('nldd-sheet') as unknown as Sheet;
		sheet.setAttribute('placement', 'left');
		sheet.setAttribute('accessible-label', this._menuText);

		const page = document.createElement('nldd-page');
		page.setAttribute('sticky-header', '');

		const titleBar = document.createElement('nldd-top-title-bar');
		titleBar.setAttribute('slot', 'header');
		titleBar.setAttribute('dismiss-text', this._host._t('components.top-navigation-bar.menu-sheet-dismiss-action'));
		// nldd-sheet handles `dismiss` itself; `back` is ours. The title and the
		// back text are set per level in _render.
		titleBar.addEventListener('back', this._back);
		this.titleBar = titleBar;
		page.appendChild(titleBar);

		const section = document.createElement('nldd-simple-section');
		const list = document.createElement('nldd-list');
		// A navigation list, as the bar it stands in for is a navigation: the
		// current row then carries aria-current on its link, where `selected`
		// alone only painted it. Its name is set on every render.
		list.setAttribute('type', 'navigation');
		list.setAttribute('appearance', 'simple');
		list.setAttribute('dividers', 'never');
		this.list = list;
		section.appendChild(list);

		page.appendChild(section);
		sheet.appendChild(page);
		document.body.appendChild(sheet);
		return sheet;
	}

	/** Back button: one level up, with focus on the row that opened the level
	 *  (the APG menu pattern), not on the first one. */
	private _back = (): void => {
		if (this._stack.length <= 1) return;
		const openerText = this._stack[this._stack.length - 1].title;
		this._stack.pop();
		this._render(true, openerText);
	};

	/** Render the top of the stack: the title bar with its back button, and the
	 *  rows. With `moveFocus` after a step down or back, focus lands on the row
	 *  that opened the level going back, else on the first row. */
	private _render(moveFocus = false, focusOpenerText?: string): void {
		const { list, titleBar } = this;
		if (!list || !titleBar || this._stack.length === 0) return;

		const depth = this._stack.length;
		const level = this._stack[depth - 1];

		// Named like the menu bar it stands in for, read now so a label the site
		// set or a translation that changed since the last open is followed.
		list.setAttribute('aria-label', this._host._globalMenuBar?.getAttribute('accessible-label')
			|| this._host._t('components.top-navigation-bar.global-menu-bar-label'));

		titleBar.setAttribute('text', level.title);
		// The back button shows the previous level's title ("Menu").
		if (depth > 1) titleBar.setAttribute('back-text', this._stack[depth - 2].title);
		else titleBar.removeAttribute('back-text');

		list.replaceChildren();
		let openerItem: HTMLElement | null = null;
		for (const entry of readEntries(level.container)) {
			const listItem = document.createElement('nldd-list-item');
			const textCell = document.createElement('nldd-text-cell');
			textCell.setAttribute('text', entry.text);
			listItem.appendChild(textCell);

			if (entry.submenu) {
				// A row that opens the submenu as the next level, with a chevron.
				listItem.setAttribute('button', '');
				const chevron = document.createElement('nldd-icon-cell');
				chevron.setAttribute('icon', 'chevron-right-small');
				listItem.appendChild(chevron);
				const { text, submenu } = entry;
				listItem.addEventListener('click', () => {
					this._stack.push({ title: text, container: submenu });
					this._render(true);
				});
			} else if (entry.href) {
				listItem.setAttribute('href', entry.href);
				listItem.addEventListener('click', () => this._sheet?.hide());
			} else {
				listItem.setAttribute('button', '');
				const { activate } = entry;
				listItem.addEventListener('click', () => {
					activate();
					this._sheet?.hide();
				});
			}
			if (entry.selected) listItem.setAttribute('selected', '');
			if (entry.currentType) listItem.setAttribute('current-type', entry.currentType);
			if (focusOpenerText !== undefined && entry.text === focusOpenerText) openerItem = listItem;

			list.appendChild(listItem);
		}

		if (moveFocus) {
			// nldd-list-item delegates focus() to its inner button or link.
			requestAnimationFrame(() => {
				(openerItem ?? list.querySelector<HTMLElement>('nldd-list-item'))?.focus();
			});
		}
	}
}

async function loadDependencies(): Promise<void> {
	await Promise.all([
		import('../../layout/sheet/sheet.js'),
		import('../../layout/page/page.js'),
		import('../../layout/page-sections/simple-section/simple-section.js'),
		import('../../navigation/top-title-bar/top-title-bar.js'),
		import('../../lists-and-tables/list/list.js'),
		import('../../lists-and-tables/list-item/list-item.js'),
		import('../../lists-and-tables/cells/text-cell/text-cell.js'),
		import('../../lists-and-tables/cells/icon-cell/icon-cell.js'),
		import('../../content/icon/icon.js'),
	]);
}

/** The rows of a level, read from its container: the global menu bar's items
 *  at the root, or a submenu's menu-items (also those in a group) deeper in. */
function readEntries(container: Element | null): SheetEntry[] {
	if (!container) return [];

	if (container.tagName === 'NLDD-MENU-BAR') {
		const items = Array.from(container.querySelectorAll(':scope > nldd-menu-bar-item')) as NLDDMenuBarItem[];
		return items.map(item => ({
			text: item.text,
			href: sanitizeUrl(item.href) ?? '',
			selected: item.current,
			currentType: item.currentType,
			submenu: item.querySelector(':scope > nldd-menu'),
			activate: () => item.click(),
		}));
	}

	const items = Array.from(
		container.querySelectorAll(':scope > nldd-menu-item, :scope > nldd-menu-group > nldd-menu-item'),
	) as HTMLElement[];
	return items.map(item => ({
		text: (item as { text?: string }).text || item.getAttribute('text') || '',
		href: sanitizeUrl((item as { href?: string }).href || '') ?? '',
		selected: item.hasAttribute('selected'),
		submenu: item.querySelector(':scope > nldd-menu'),
		// A leaf menu-item's own click would call hidePopover() on its (closed)
		// menu and throw; dispatch the `select` it fires instead.
		activate: () => item.dispatchEvent(new CustomEvent('select', { bubbles: true, composed: true })),
	}));
}
