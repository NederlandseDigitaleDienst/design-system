import { describe, it, expect, afterEach } from 'vitest';
import { carryContext, releaseContext } from './carried-context.js';

describe('carryContext', () => {
	const made: Element[] = [];
	const make = (html: string) => {
		const wrapper = document.createElement('div');
		wrapper.innerHTML = html;
		document.body.append(wrapper);
		made.push(wrapper);
		return wrapper;
	};
	const loose = () => {
		const el = document.createElement('div');
		document.body.append(el);
		made.push(el);
		return el;
	};

	afterEach(() => {
		made.splice(0).forEach((el) => el.remove());
	});

	it('neemt color-scheme en lang van de oorspronkelijke plek mee', () => {
		const section = make('<section lang="en" style="color-scheme: dark"><span></span></section>');
		const el = loose();
		carryContext(el, section.querySelector('span'));
		expect(getComputedStyle(el).colorScheme).toBe('dark');
		expect(el.getAttribute('lang')).toBe('en');
	});

	it('vindt lang ook buiten een shadow root', () => {
		const section = make('<section lang="fy"><div class="host"></div></section>');
		const host = section.querySelector('.host')!;
		const inner = document.createElement('span');
		host.attachShadow({ mode: 'open' }).append(inner);
		const el = loose();
		carryContext(el, inner);
		expect(el.getAttribute('lang')).toBe('fy');
	});

	it('laat een eigen lang en color-scheme van het element staan', () => {
		const section = make('<section lang="en" style="color-scheme: dark"><span></span></section>');
		const el = loose();
		el.setAttribute('lang', 'nl');
		el.style.colorScheme = 'light';
		carryContext(el, section.querySelector('span'));
		expect(el.getAttribute('lang')).toBe('nl');
		expect(el.style.colorScheme).toBe('light');
	});

	it('neemt bij de volgende keer de nieuwe omgeving over', () => {
		const section = make('<section lang="en" style="color-scheme: dark"><span></span></section>');
		const el = loose();
		carryContext(el, section.querySelector('span'));
		const inner = section.querySelector('section') as HTMLElement;
		inner.style.colorScheme = 'light';
		inner.setAttribute('lang', 'de');
		carryContext(el, section.querySelector('span'));
		expect(el.style.colorScheme).toBe('light');
		expect(el.getAttribute('lang')).toBe('de');
	});

	it('haalt bij releaseContext alleen weg wat hij zelf zette', () => {
		const section = make('<section lang="en" style="color-scheme: dark"><span></span></section>');
		const el = loose();
		carryContext(el, section.querySelector('span'));
		releaseContext(el);
		expect(el.style.colorScheme).toBe('');
		expect(el.hasAttribute('lang')).toBe(false);
	});
});
