import { describe, it, expect } from 'vitest';

/* A file of its own, so nothing has defined nldd-list yet: the autoloader can
   load the row before the list. */
describe('nldd-list-item – loaded before nldd-list', () => {
	it('upgrades without errors and takes the appearance once the list arrives', async () => {
		const errors: unknown[] = [];
		const onError = (event: ErrorEvent) => errors.push(event.error);
		window.addEventListener('error', onError);
		const wrap = document.createElement('div');
		wrap.innerHTML = `
			<nldd-list appearance="box-tinted">
				<nldd-list-item><nldd-list-item slot="children"></nldd-list-item></nldd-list-item>
				<nldd-list-item></nldd-list-item>
			</nldd-list>`;
		document.body.append(wrap);
		try {
			await import('./list-item.js');
			await new Promise((r) => setTimeout(r));
			expect(customElements.get('nldd-list')).toBeUndefined();

			await import('../list/list.js');
			const list = wrap.querySelector('nldd-list')! as HTMLElement & { updateComplete: Promise<boolean> };
			await list.updateComplete;
			await new Promise((r) => setTimeout(r));
			expect(errors).toEqual([]);
			for (const row of wrap.querySelectorAll('nldd-list-item')) {
				expect(row.classList.contains("is-boxed"), row.parentElement!.localName).toBe(true);
			}
		} finally {
			window.removeEventListener('error', onError);
			wrap.remove();
		}
	});
});
