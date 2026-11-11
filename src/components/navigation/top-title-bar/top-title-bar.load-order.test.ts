import { describe, it, expect } from 'vitest';

/* A file of its own, so nothing has defined nldd-page yet: the autoloader can
   load the bar before the page around it. */
describe('nldd-top-title-bar – loaded before nldd-page', () => {
	it('upgrades without errors and listens to the page once it arrives', async () => {
		const errors: unknown[] = [];
		const onError = (event: ErrorEvent) => errors.push(event.error);
		window.addEventListener('error', onError);
		const wrap = document.createElement('div');
		wrap.innerHTML = `
			<nldd-page>
				<nldd-top-title-bar slot="header" text="Titel" collapse-anchor="anchor"></nldd-top-title-bar>
				<h1 id="anchor">Titel</h1>
			</nldd-page>`;
		document.body.append(wrap);
		try {
			await import('./top-title-bar.js');
			const bar = wrap.querySelector('nldd-top-title-bar')! as HTMLElement & { updateComplete: Promise<boolean>; _activeScrollTarget: EventTarget | null };
			await bar.updateComplete;
			expect(customElements.get('nldd-page')).toBeUndefined();
			expect(bar._activeScrollTarget).toBeFalsy();

			await import('../../layout/page/page.js');
			await new Promise((r) => setTimeout(r));
			expect(errors).toEqual([]);
			expect(bar._activeScrollTarget).toBeTruthy();
		} finally {
			window.removeEventListener('error', onError);
			wrap.remove();
		}
	});
});
