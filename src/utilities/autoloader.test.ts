import { describe, it, expect, afterEach } from 'vitest';
import manifest from '../../custom-elements.json';
import { loaders } from './autoloader.generated.js';
import { discover, stopAutoloader } from './autoloader.js';
import { until } from '../test-utils.js';

const tags = manifest.modules.flatMap((module) =>
	(module.declarations ?? []).flatMap((declaration) =>
		'customElement' in declaration && declaration.customElement && 'tagName' in declaration ? [declaration.tagName as string] : []));

describe('autoloader', () => {
	let host: HTMLElement | undefined;

	afterEach(() => {
		host?.remove();
		host = undefined;
	});

	it('has a loader for every tag in the manifest, and none more', () => {
		expect(Object.keys(loaders).sort()).toEqual([...tags].sort());
	});

	it('loads the module of an element that is not defined yet', async () => {
		expect(customElements.get('nldd-badge')).toBeUndefined();
		host = document.createElement('div');
		host.innerHTML = '<nldd-badge number="3"></nldd-badge>';
		await discover(host);
		expect(customElements.get('nldd-badge')).toBeDefined();
	});

	it('loads what is added to the page later, as a fragment swap does', async () => {
		expect(customElements.get('nldd-spacer')).toBeUndefined();
		host = document.createElement('div');
		document.body.append(host);
		host.innerHTML = '<section><nldd-spacer size="16"></nldd-spacer></section>';
		await until(() => customElements.get('nldd-spacer') !== undefined);
		expect(host.querySelector('nldd-spacer')!.matches(':defined')).toBe(true);
	});

	it('leaves a tag alone that no module defines', async () => {
		host = document.createElement('div');
		host.innerHTML = '<nldd-not-a-component></nldd-not-a-component>';
		await expect(discover(host)).resolves.toBeUndefined();
		stopAutoloader();
	});
});
