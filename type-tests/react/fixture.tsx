// Compiled by tsc in CI. Generating the declarations only proves a file was
// written; this proves a React consumer can use the tags, that attributes are
// typed from the components, and that a boolean only takes true or nothing.

import { useRef } from 'react';
import type { NLDDDropdown } from '@nldd/design-system/dropdown';

export function Fixture({ busy }: { busy: boolean }) {
	const dropdown = useRef<NLDDDropdown>(null);
	return (
		<>
			<nldd-button text="Opslaan" appearance="primary" disabled={busy || undefined} />
			{/* @ts-expect-error React 18 writes false as the text "false", which reads as on. */}
			<nldd-button text="Opslaan" disabled={busy} />
			{/* @ts-expect-error An appearance that does not exist. */}
			<nldd-button text="Opslaan" appearance="tertiary" />
			<nldd-dropdown ref={dropdown} accessible-label="Land" size="sm">
				<select>
					<option value="nl">Nederland</option>
				</select>
			</nldd-dropdown>
			<nldd-list accessible-label="Aanvragen">
				<nldd-list-item button expandable>
					<nldd-text-cell text="Aanvraag A-1042" />
				</nldd-list-item>
			</nldd-list>
		</>
	);
}
